// api-dev/db.mjs — PostgreSQL connection + auto-migration
import pg from "pg";

const { Pool } = pg;

let pool = null;

export function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL?.includes("railway.app")
        ? { rejectUnauthorized: false }
        : false,
      max: 10,
      idleTimeoutMillis: 30_000,
    });
    pool.on("error", (err) => console.error("[db] pool error:", err.message));
  }
  return pool;
}

export async function query(sql, params = []) {
  return getPool().query(sql, params);
}

export async function migrate() {
  const db = getPool();

  // Core tables
  await db.query(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      page TEXT,
      ip TEXT,
      status TEXT DEFAULT 'open',
      priority TEXT DEFAULT 'normal',
      note TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      last_message_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id SERIAL PRIMARY KEY,
      session_id TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'agent')),
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS analytics_events (
      id SERIAL PRIMARY KEY,
      event TEXT NOT NULL,
      session_id TEXT,
      page TEXT,
      data JSONB DEFAULT '{}',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id SERIAL PRIMARY KEY,
      session_id TEXT,
      name TEXT,
      phone TEXT,
      email TEXT,
      message TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS canned_responses (
      id SERIAL PRIMARY KEY,
      shortcut TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS knowledge_base (
      id SERIAL PRIMARY KEY,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS chat_messages_session_idx ON chat_messages(session_id);
    CREATE INDEX IF NOT EXISTS analytics_events_created_idx ON analytics_events(created_at);
    CREATE INDEX IF NOT EXISTS analytics_events_event_idx ON analytics_events(event);
  `);

  // Safe column additions for existing deployments
  await db.query(`
    ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';
    ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
    ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS note TEXT;
  `);

  // Seed default site settings if not present
  const settingsDefaults = [
    // Hero
    ["hero_title",        "Måttbeställ din bänkskiva online"],
    ["hero_subtitle",     "Välj material, ange mått och få pris direkt. Offerten skickas till din e-post."],
    ["hero_cta",          "Beräkna & begär offert"],
    ["deal_text",         "Veckans deal: Diskho från Intra ingår vid beställning av stenskiva."],
    ["deal_visible",      "true"],
    // Colors
    ["accent_color",      "#059669"],
    ["heading_color",     "#111827"],
    ["body_color",        "#374151"],
    ["hero_brightness",   "100"],
    // Branding
    ["logo_size",         "normal"],
    // Chat widget
    ["chat_online",       "true"],
    ["chat_greeting",     "Hej! Hur kan jag hjälpa dig med din bänkskiva? 🪨"],
    ["chat_bot_name",     "Marmorskivan AI"],
    ["chat_bot_avatar",   "🪨"],
    // Navigation & SEO
    ["nav_cta_text",      "Begär offert"],
    ["seo_title",         "Marmorskivan"],
    ["seo_description",   "Måttbeställ bänkskivor av marmor, granit och kvartskomposit. Enkel kalkylator, snabb offert."],
    // Contact info
    ["contact_phone",     ""],
    ["contact_email",     "info@marmorskivan.se"],
    ["contact_address",   ""],
    ["contact_hours",     "Mån–Fre 8–17"],
    // Footer
    ["footer_company",    "Marmorskivan AB"],
    ["footer_tagline",    "Sveriges smidigaste väg till din nya bänkskiva"],
    ["footer_orgnr",      ""],
    // Calculator page
    ["calc_title",        "Beräkna din bänkskiva"],
    ["calc_subtitle",     "Ange dina mått och välj material — få pris direkt."],
    ["calc_confirm",      "Tack! Vi återkommer med en offert inom 24 timmar."],
  ];
  for (const [key, value] of settingsDefaults) {
    await db.query(
      `INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
      [key, value]
    );
  }

  // Seed default canned responses
  const cannedDefaults = [
    ["hej", "Hej! Tack för att du hör av dig. Hur kan jag hjälpa dig med din bänkskiva?"],
    ["pris", "Priset beror på material och storlek. Du kan få ett exakt pris via vår kalkylator på /app — det tar bara 2 minuter!"],
    ["ledtid", "Ledtiden är normalt 2–4 veckor för standardmaterial. Vi återkommer med exakt datum när du beställer."],
    ["matning", "Vi erbjuder professionell mätning på plats i Storstockholm. Vi bokar in ett tillfälle som passar dig."],
  ];
  for (const [shortcut, content] of cannedDefaults) {
    await db.query(
      `INSERT INTO canned_responses (shortcut, content)
       SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM canned_responses WHERE shortcut = $1)`,
      [shortcut, content]
    );
  }

  // Seed default knowledge base entries
  const kbDefaults = [
    ["Vad kostar en bänkskiva?", "Priser varierar beroende på material: Kvartskomposit 1 500–3 000 kr/m², Granit 2 000–4 000 kr/m², Marmor 2 500–5 000 kr/m². Använd kalkylatorn för exakt pris."],
    ["Hur lång är leveranstiden?", "Normalt 2–6 veckor beroende på material och om montering ingår. Standardmaterial levereras snabbare."],
    ["Erbjuder ni mätning?", "Ja, vi erbjuder professionell mätning på plats i Storstockholm. Kontakta oss för bokning."],
    ["Vilket material är bäst för kök?", "Kvartskomposit är populärt för kök — det är härdigt, lättskött och repbeständigt. Granit är naturligt vackert men kräver ibland impregnering."],
    ["Hur sköter man om marmor?", "Marmor är poröst och känsligt för syra. Torka upp spill direkt, undvik citrus och vinäger. Impregnera 1–2 gånger om året."],
  ];
  for (const [question, answer] of kbDefaults) {
    await db.query(
      `INSERT INTO knowledge_base (question, answer)
       SELECT $1, $2 WHERE NOT EXISTS (SELECT 1 FROM knowledge_base WHERE question = $1)`,
      [question, answer]
    );
  }

  console.log("✅ DB migrated");
}
