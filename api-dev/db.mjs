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
    ["agent_name",        "Kundtjänst"],
    ["agent_avatar",      "🧑‍💼"],
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
    // Priser & kalkylator
    ["Vad kostar en bänkskiva?", "Priser varierar beroende på material: Kvartskomposit 1 500–3 000 kr/m², Granit 2 000–4 000 kr/m², Marmor 2 500–5 000 kr/m², Keramik/Dekton 3 000–6 000 kr/m². I priset ingår normalt tillskärning, kantpolering och montage. Använd kalkylatorn på /app för exakt pris på dina mått."],
    ["Hur räknar ni ut priset?", "Priset baseras på stenens yta i m² × materialpris, plus bearbetningskostnader för urtag (diskho, häll, kranhål) och kantpolering. Montering och mätning tillkommer. Kalkylatorn på /app ger ett direkt estimat."],
    ["Ingår montering i priset?", "Ja, vår kalkylator inkluderar ett paketpris med sten + mätning + montage för standardjobb i Storstockholm. Exakt offert skickas efter mätningsbesök."],

    // Leverans & ledtid
    ["Hur lång är leveranstiden?", "Normalt 2–4 veckor för standardmaterial, 4–8 veckor för ovanliga eller importerade material. Vi meddelar exakt datum när du beställer. Vi levererar och monterar i Storstockholm."],
    ["Levererar ni i hela Sverige?", "Vi levererar och monterar primärt i Storstockholm. Kontakta oss för förfrågan om andra orter — vi kan hänvisa till samarbetspartners."],
    ["Kan jag spåra min beställning?", "När din beställning är bekräftad och mätning gjord håller vi dig uppdaterad via e-post. Du kan alltid höra av dig på info@marmorskivan.se med ditt ordernummer."],

    // Mätning & montage
    ["Erbjuder ni mätning?", "Ja, vi erbjuder professionell mätning på plats i Storstockholm. Mätaren tar exakta mått, noterar urtag och säkerställer att stenplattan passar perfekt. Boka via vår offertförfrågan eller ring oss."],
    ["Hur fungerar installationsprocessen?", "1. Du beräknar och skickar offertförfrågan via kalkylatorn. 2. Vi bekräftar och bokar mätningsbesök. 3. Vi tillverkar stenskivan efter exakta mått. 4. Vi levererar och monterar på plats. 5. Du godkänner resultatet."],
    ["Kan jag mäta själv?", "Du kan använda kalkylatorn för en prisuppskattning med egna mått. För beställning rekommenderar vi alltid ett professionellt mätbesök för att garantera passform."],

    // Material – Kvartskomposit
    ["Vad är kvartskomposit?", "Kvartskomposit (Silestone, Caesarstone etc.) är ett tillverkat material av ca 93% kvartsit + bindemedel. Det är mycket hårt, repbeständigt, lågporöst och lättskött. Behöver sällan impregneras. Perfekt för aktiva kök."],
    ["Vilket material är bäst för kök?", "Kvartskomposit är det populäraste valet för kök — hårt, repbeständigt och lättsköt. Granit är ett naturligt alternativ med unik ådring. Keramik/Dekton är extremt tåligt mot värme och repor. Marmor är vackrast men känsligast."],
    ["Är kvartskomposit tåligt mot värme?", "Kvartskomposit tål kortvarig värme men undvik att sätta heta kastruller direkt på ytan — det kan orsaka termisk spänning. Använd alltid grytunderlägg."],

    // Material – Marmor
    ["Hur sköter man om marmor?", "Marmor är poröst och syrakänsligt. Undvik citron, vinäger och vin. Torka upp spill direkt. Använd pH-neutralt rengöringsmedel. Impregnera ytan 1–2 gånger per år. Undvik slipmedel och stålull."],
    ["Är marmor lämpligt i kök?", "Marmor är vackert men kräver mer skötsel i kök. Det är känsligt för syra (etsning) och fläckar. Väljer du marmor i köket rekommenderar vi impregnering och försiktighet. I badrum och low-traffic-ytor fungerar det utmärkt."],
    ["Vad kostar marmor?", "Marmor kostar normalt 2 500–5 000 kr/m² beroende på sort och ursprung. Italiensk Carrara-marmor är populär och prisvärd. Exotiska sorter kan kosta mer."],

    // Material – Granit
    ["Hur sköter man om granit?", "Granit är ett av de hårdaste naturstenarterna. Tåler värme och repor väl. Täta ytan 1–2 gånger per år med stenimp regnering. Torka upp spill, speciellt olja och vin, snabbt. Rengör med milt diskmedel och vatten."],
    ["Är granit poröst?", "Granit har viss porositet beroende på sort, men avsevärt lägre än marmor. Impregnera vid installation och 1–2 ggr/år för bästa skydd mot fläckar."],

    // Material – Keramik / Dekton
    ["Vad är keramik/Dekton?", "Keramik (inklusive Dekton, Porcelanico) är ett extremt hårt, lågporöst material. Det är mycket tåligt mot värme, repor och UV-ljus. Passar utmärkt för utomhuskök. Nackdelen är att det är sprött mot hårda slag mot kanter."],
    ["Hur sköter man om keramik?", "Keramik är mycket lättsköt. Rengör med milt diskmedel och vatten. Tål värme och repor. Undvik hårda slag mot kanter då det kan flisa sig. Behöver inte impregneras."],

    // Material – Kvartsit
    ["Vad är kvartsit?", "Kvartsit är en natursten med utseende som liknar marmor men är hårdare och mer tålig. Populärt för dem som vill ha marmorns estetik med graniets hållfasthet. Impregneras 1–2 ggr/år."],

    // Tjocklek & tjockleksval
    ["Vilken tjocklek ska jag välja på bänkskivan?", "Standard är 20 mm och 30 mm. 20 mm passar de flesta kök och är prisvärt. 30 mm ger ett mer massivt, lyxigt intryck och är stabilare för större urtag. Välj 30 mm för köksöar eller om du vill ha ett premium-utseende."],
    ["Vad är skillnaden mellan 20 mm och 30 mm?", "20 mm är lättare och billigare. 30 mm ger ett tjockare, mer massivt utseende och extra stabilitet vid urtag för diskho och häll. Många väljer 30 mm för köksöar."],

    // Urtag & tillval
    ["Ingår urtag för diskho i priset?", "Urtag för diskho ingår i kalkylatorn — välj antal och monteringssätt (överlimmat/underlimmat). Priset justeras automatiskt i offerten."],
    ["Vad är skillnaden på överlimmat och underlimmat?", "Överlimmat (over-mount): kanten syns på ytan, enklare och billigare. Underlimmat (under-mount): ingen synlig kant, renare utseende men lite dyrare. Underlimmat är standard för premium-kök."],
    ["Kan ni göra urtag för induktionshäll?", "Ja, vi tillverkar urtag för alla typer av hällar — induktion, gas och elektrisk. Ange antal och monteringstyp i kalkylatorn."],

    // Kantbehandling
    ["Vilka kantalternativ finns?", "Vi erbjuder fasad (45°-fas), halvrund, rakt polerad och profilkant. Fasad är standard och ingår. Profilkanter kan tillkomma i pris. Ange önskad kant i offertförfrågan."],
    ["Vad innebär kantpolering?", "Kantpolering innebär att stenens kanter slipas och poleras för ett fint, hållbart avslut. Ingår normalt för alla synliga kanter i priset."],

    // Garanti
    ["Vad gäller er garanti?", "Vi erbjuder 10 års garanti på montering och montagearbete. Garantin täcker: rätt passform mot väggar och skåp, planlimning och underlimning utförd enligt anvisningar, samt återbesök för justering om monteringen orsakat avvikelse."],
    ["Vad täcker inte garantin?", "Garantin täcker inte: naturliga variationer i sten (ådring, porer, färgskiftningar), skador efter montering (värmechock, slag, fel kemikalier), eller problem p.g.a. felaktig underliggande stomme som vi inte installerat."],
    ["Hur gör jag ett garantiärende?", "Maila info@marmorskivan.se med ordernummer, bilder och beskrivning. Vi gör en bedömning och bokar ev. hembesök. Åtgärd utförs utan kostnad om ärendet täcks av garantin."],

    // Hållbarhet
    ["Är stenens miljövänligt?", "Natursten är ett hållbart val med lång livslängd. Vi prioriterar leverantörer med ansvarsfullt stenbrott. Kvartskomposit tillverkas på fabrik men har lång livslängd som minskar totalpåverkan. Keramik är energiintensivt att tillverka men extremt hållbart."],

    // Betalning & offert
    ["Hur fungerar offertprocessen?", "1. Beräkna via kalkylatorn och skicka offertförfrågan. 2. Vi återkommer inom 24 timmar med bekräftelse. 3. Vi bokar mätning. 4. Efter mätning skickas slutgiltig offert. 5. Vid godkännande startar produktion."],
    ["Kan jag ändra min beställning efter offert?", "Kontakta oss snarast möjligt vid önskade ändringar. Mindre justeringar kan göras fram till produktionsstart. Stora ändringar kan påverka pris och ledtid."],

    // Kontakt
    ["Hur kontaktar jag er?", "Mejla info@marmorskivan.se, chatta med oss här direkt, eller ring oss under kontorstid Mån–Fre 8–17. Vi svarar normalt inom ett par timmar på vardagar."],
    ["Har ni visningslokal?", "Kontakta oss för att boka visning av material och prover. Vi kan också skicka materialprover hem till dig vid förfrågan."],
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
