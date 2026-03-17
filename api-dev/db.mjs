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
  await db.query(`
    CREATE TABLE IF NOT EXISTS chat_sessions (
      id TEXT PRIMARY KEY,
      page TEXT,
      ip TEXT,
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

    CREATE INDEX IF NOT EXISTS chat_messages_session_idx ON chat_messages(session_id);
    CREATE INDEX IF NOT EXISTS analytics_events_created_idx ON analytics_events(created_at);
  `);

  // Seed default settings if not present
  const defaults = [
    ["hero_title",      "Måttbeställ din bänkskiva online"],
    ["hero_subtitle",   "Välj material, ange mått och få pris direkt. Offerten skickas till din e-post."],
    ["hero_cta",        "Beräkna & begär offert"],
    ["accent_color",    "#059669"],
    ["heading_color",   "#111827"],
    ["body_color",      "#374151"],
    ["logo_size",       "normal"],
    ["hero_brightness", "100"],
    ["deal_text",       "Veckans deal: Diskho från Intra ingår vid beställning av stenskiva."],
    ["deal_visible",    "true"],
  ];
  for (const [key, value] of defaults) {
    await db.query(
      `INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
      [key, value]
    );
  }

  console.log("✅ DB migrated");
}
