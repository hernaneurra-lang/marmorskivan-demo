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

    CREATE TABLE IF NOT EXISTS bookings (
      id SERIAL PRIMARY KEY,
      booking_date DATE NOT NULL,
      booking_time TEXT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT,
      message TEXT,
      session_id TEXT,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS chat_messages_session_idx ON chat_messages(session_id);
    CREATE INDEX IF NOT EXISTS analytics_events_created_idx ON analytics_events(created_at);
    CREATE INDEX IF NOT EXISTS analytics_events_event_idx ON analytics_events(event);
    CREATE INDEX IF NOT EXISTS bookings_date_idx ON bookings(booking_date);
  `);

  // Safe column additions for existing deployments
  await db.query(`
    ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';
    ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'normal';
    ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS note TEXT;
    ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'bot';
    ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS country TEXT;
    ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS country_code TEXT;
    ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS city TEXT;
    ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS region TEXT;
    ALTER TABLE chat_sessions ADD COLUMN IF NOT EXISTS tags TEXT DEFAULT '[]';
  `);
  await db.query(`
    ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS country TEXT;
    ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS city TEXT;
    ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS fp_hash TEXT;
    ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS screen TEXT;
    ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS lang TEXT;
    ALTER TABLE analytics_events ADD COLUMN IF NOT EXISTS mobile BOOLEAN;
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
    ["footer_company",    "marmorskivan.se"],
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
    ["Vad kostar en bänkskiva?", "Priset beror på material, mått, kantprofil, antal urtag och bearbetning — och påverkas av dagsaktueltt råmaterialpris. Vi skickar gärna en offert utan kostnad. Använd kalkylatorn på /app eller kontakta oss direkt på info@marmorskivan.se."],
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
    ["Vad kostar marmor?", "Priset på marmor varierar efter sort, ursprung och dagsaktueltt råmaterialpris. Carrara är ett av de mer prisvärda alternativen, exotiska sorter kan kosta betydligt mer. Skicka en offertförfrågan på info@marmorskivan.se så ger vi dig ett aktuellt pris."],

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

    // Prisdetaljer & jämförelser
    ["Vad kostar en köksö i sten?", "Priset på en köksö beror på material, mått, kantprofil, antal urtag och bearbetning. Råmaterialpriserna varierar löpande. Vi skickar gärna en offert — kontakta oss på info@marmorskivan.se eller boka mätning direkt."],
    ["Är natursten dyrare än kvartskomposit?", "Det beror på sort. Enkel granit och Carrara-marmor är ofta i samma prisklass som mid-range kvartskomposit. Exklusiva marmorsorter och kvartskomposit av märke (Silestone, Caesarstone) kan kosta mer. Vi hjälper dig jämföra alternativ inom din budget."],
    ["Kostar tjockare skivor mer?", "Ja, 30 mm kostar mer än 20 mm — mer material och tyngre bearbetning. Exakt prisdifferens beror på materialsort och aktuella råvarupriser. Begär en offert så specificerar vi."],
    ["Vad kostar ett kranhål?", "Extra hål (kranhål, tvålpump, extra kran) prissätts per hål och beror på material och placering. Ange antal och placering i offertförfrågan så inkluderar vi det."],
    ["Vad kostar kantpolering?", "Rakt polerad kant ingår normalt i standardofferten. Profilkanter (halvrund, ogee, mitrerad) är extra bearbetning vars pris varierar med material och löpmeter. Vi specificerar alltid i offerten."],
    ["Tillkommer det dolda kostnader?", "Nej, vi strävar efter transparenta priser. Eventuelltillägg som kan tillkomma: extra urtag, profilkanter, svåra monteringsförhållanden (t.ex. krokiga väggar) eller kör utanför Storstockholm. Allt specificeras i offerten innan du beställer."],

    // Material – jämförelser
    ["Vad är skillnaden mellan marmor och kvartsit?", "Marmor är kalksten och känslig för syra och fläckar. Kvartsit är en hårdare natursten med liknande lyxigt utseende men bättre tålighet. Kvartsit är ett populärt alternativ för den som vill ha marmorns estetik med bättre hållfasthet."],
    ["Vad är Dekton?", "Dekton är ett ultracompact-material från Cosentino, tillverkat av glas, porslin och kvartsit under extremt högt tryck och värme. Det är mycket tåligt mot värme, repor, UV och fläckar. Perfekt för utomhuskök och high-use-ytor. Sprött mot hårda slag mot kanter."],
    ["Vad är Silestone?", "Silestone är ett ledande märke inom kvartskomposit, tillverkat av Cosentino. Innehåller ca 94% kvarts och är känt för hög tålighet, låg porositet och brett utbud av färger och texturer."],
    ["Vad är Caesarstone?", "Caesarstone är ett israeliskt märke inom kvartskomposit, känt för hög kvalitet och modern design. Finns i hundratals färger och imiterar ofta marmor och betong på ett realistiskt sätt."],
    ["Kan jag blanda material i köket?", "Absolut! En populär kombination är kvartskomposit på arbetsbänkarna och marmor eller kvartsit på köksön. Det ger ett exklusivt resultat med god funktionalitet. Vi hjälper dig välja kombinationer som fungerar estetiskt."],
    ["Vilket material är mest lättsköt?", "Kvartskomposit och keramik/Dekton är enklast att sköta — inga impregnering, tåler de flesta rengöringsmedel. Granit kräver impregnering 1–2 ggr/år. Marmor och kvartsit kräver mest omsorg."],
    ["Vilket material håller längst?", "Alla naturstenar och kvartskomposit håller i decennier om de sköts rätt. Keramik/Dekton är i praktiken osårbara mot normalt slitage. Granit och kvartsit är extremt hårda. Marmor är mjukast men håller ändå länge med rätt skötsel."],

    // Skötsel & underhåll
    ["Hur rengör jag bänkskivan dagligen?", "Torka av med fuktad trasa och lite milt diskmedel. Skölj och torka torrt. Undvik slipmedel, stålull och starka kemikalier som acetön, blekmedel och ammoniak på natursten. Kvartskomposit och keramik tål mer men gynnas av samma skonsamma rutin."],
    ["Kan jag använda sprejrengöring på bänkskivan?", "För kvartskomposit och keramik ja, välj pH-neutrala produkter. För natursten (marmor, granit, kvartsit) — undvik sprejrengöringar med syra eller högt pH. Använd stenanpassat rengöringsmedel eller rent vatten med lite diskmedel."],
    ["Hur impregnerar jag natursten?", "Applicera stenimp regnering (t.ex. Lithofin Fleckstop eller liknande) på ren, torr yta. Låt verka 5–15 min, torka bort överskott. Låt torka helt. Upprepa 1–2 ggr/år eller vid vattendroppar slutar perla på ytan. Vi kan rekommendera produkter."],
    ["Hur tar jag bort fläckar från marmor?", "Färska fläckar: torka upp genast med papper, skölj med vatten. Gamla fläckar: applicera en pasta av bakpulver + lite vatten på fläcken, täck med plastfolie och låt verka 12–24h. Upprepa vid behov. Vid etsning (mattning) kan stenen behöva poleras — kontakta oss."],
    ["Hur tar jag bort kalkfläckar från sten?", "Kalkavlagringar (vitaktig hinna) avlägsnas med kalklösare anpassad för sten, INTE vanlig kalkborttagare med syra (skadar marmor/kvartsit). För granit och kvartsit funkar svagt ättikssyrebaserat medel. Fråga oss om produktrekommendation."],
    ["Kan man sätta heta kastruller direkt på bänkskivan?", "Undvik det på alla material. Kvartskomposit kan få termisk spänning och spricka. Marmor och granit tål värme bättre men kan ändå ta skada vid extrema temperaturer. Keramik/Dekton tål höga temperaturer men vi rekommenderar ändå grytunderlägg för att vara säker."],
    ["Kan jag skära direkt på bänkskivan?", "Undvik det. Knivar kan repa mjukare material som marmor och kvartsit. Granit och keramik är så hårda att de SLIPAR knivarna. Använd alltid skärbräda."],
    ["Hur vet jag om bänkskivan behöver impregneras?", "Droppa lite vatten på ytan. Om vattnet perlar — skyddet är intakt. Om vattnet sugs in och mörknar stenen — det är dags att impregnera."],

    // Badrum
    ["Passar sten i badrum?", "Ja, sten i badrum är både vackert och hållbart. Marmor är populärt i badrum där syrakänsligheten är mindre ett problem (inget matlagning). Granit och kvartsit fungerar utmärkt. Se till att impregnera noggrant och torka upp vatten regelbundet."],
    ["Kan man ha marmor runt dusch och badkar?", "Ja, med rätt impregnering och underhåll fungerar marmor utmärkt runt dusch och badkar. Välj en sort med tätare struktur (t.ex. Thassos eller Afyon). Fogarna måste tätas regelbundet. Undvik för starka rengöringsmedel."],
    ["Passar kvartskomposit i badrum?", "Absolut — kvartskomposit är lågporöst och passar utmärkt i badrum som kommod-skiva eller duschvägg. Det tål fukt väl och kräver minimal skötsel."],
    ["Kan ni leverera badrumsskivor?", "Ja, vi tillverkar och monterar stenarbetsbänkar och kommodoplattor för badrum. Ange dina mått i offertförfrågan eller kontakta oss direkt. Vi erbjuder mätning och montage även för badrum."],

    // Utomhus
    ["Kan man använda sten utomhus?", "Granit och keramik/Dekton lämpar sig utmärkt utomhus. De tål UV, frost och väder. Kvartskomposit bör INTE användas utomhus — UV-ljus bryter ner bindemedlet och orsakar missfärgning. Marmor utomhus kräver mycket underhåll."],
    ["Vilket material väljer jag till utomhuskök?", "Keramik/Dekton är förstaval för utomhuskök — UV-resistent, värmtåligt, frostsäkert och extremt tåligt mot fläckar. Granit är ett bra alternativ om det impregneras. Undvik kvartskomposit utomhus."],

    // Problem & reklamation
    ["Det har uppstått en spricka i bänkskivan — vad gör jag?", "Kontakta oss snarast på info@marmorskivan.se med bilder. Sprickor kan orsakas av: termisk chock (hett på kallt), slag, felaktig understöttning eller transportskada. Vi bedömer om det täcks av garanti och vad åtgärden blir."],
    ["Bänkskivan har fått ett märke/repa — kan det lagas?", "Ytliga repor i granit och marmor kan ofta poleras bort av en stenslipare. Djupare repor i kvartskomposit kan ibland fyllas med fogmassa i matchande färg. Kontakta oss så bedömer vi möjligheterna."],
    ["Färgen ser annorlunda ut mot vad jag förväntat mig?", "Natursten varierar alltid — varje platta är unik. Vi rekommenderar att du ser och godkänner det exakta materialet (eller bilder av den specifika plattan) innan produktion. Färgvariationer är naturliga och täcks inte av garanti."],
    ["Det droppar vatten under bänkskivan — vad kan det vara?", "Troligtvis kondensation eller läckage från diskho eller vattenkopplingar under skivan. Kontrollera kopplingar och tätningar. Om det är stenens fel (t.ex. otät fogning) — kontakta oss för besiktning."],
    ["Bänkskivan sitter inte plant — vad gör jag?", "Kontakta oss. Lutning kan bero på ojämna skåp eller felaktig montering. Om vi monterat skivan och problemet uppstår inom garantitiden åtgärdar vi det utan kostnad."],

    // Beställning & process
    ["Hur lång tid tar det från beställning till montage?", "Normalt 3–6 veckor: 1–3 dagar för offertbekräftelse, 1 vecka för att boka mätning, 2–4 veckor produktion, sedan montering. Vi meddelar alltid beräknat datum."],
    ["Kan jag se materialet innan jag beställer?", "Ja, vi rekommenderar det. Kontakta oss för att boka en visning eller be om prover. Du kan också be att vi visar bilder av den faktiska plattan som ska användas."],
    ["Kan ni leverera utan montering?", "Ja, vi kan leverera tillskuren sten utan montage om du har egna hantverkare. Kontakta oss för pris och villkor. Notera att garanti på montering då ej gäller."],
    ["Hur beställer jag?", "1. Använd kalkylatorn på /app för ett prisestimat. 2. Skicka offertförfrågan. 3. Vi kontaktar dig inom 24h. 4. Vi bokar mätningsbesök. 5. Du godkänner slutoffert. 6. Produktion startar. 7. Vi levererar och monterar."],
    ["Vad behöver jag ha klart innan mätningsbesöket?", "Skåpen ska vara monterade och på plats. Om diskho eller häll ska ingå — ha dem gärna på plats eller ha exakta modelluppgifter redo. Om du river befintlig bänkskiva — gör det helst innan mätning."],
    ["Kan jag ha kvar gamla bänkskivan under mätningen?", "Ja, vi kan mäta med befintlig skiva på plats. Den rivs i samband med monteringen av den nya. Informera oss så vi planerar rivning i arbetet."],

    // Tekniska frågor
    ["Hur tunna kanter kan ni göra?", "Standard minimikant är 20 mm (för 20 mm skivor) och 30 mm (för 30 mm skivor). Tunnare profiler som 'slim edge' (6–10 mm) kan göras för specifika material — fråga oss."],
    ["Kan ni göra böjda former?", "Ja, vi tillverkar böjda och organiska former med CNC-fräsning. Det kräver mer arbete och påverkar priset. Berätta om din design så ger vi prisuppgift."],
    ["Hur hanteras hörn och skarvar?", "Vi strävar efter att minimera skarvar. Hörnskarvar görs med precision och fogas med matchande epoxy/fogmassa. Vid långa bänkar kan skarvar vara nödvändiga — vi placerar dem strategiskt."],
    ["Kan ni anpassa tjockleken längs en skiva?", "Ja, vi kan fräsa ut tunnare partier t.ex. där skivan ska gå in under vitvaror. Detta görs vid CNC-bearbetning och ingår i offerten."],
    ["Vad är en 'mitred edge' (miteringskant)?", "En mitrerad kant ger intrycket av en tjock 40–60 mm skiva utan att den faktiska vikten. Två 20 mm skivor fogas i 45° i kanten för att se ut som en tjock massiv platta. Populärt för premium-look."],

    // Färg & stil
    ["Vilka färger finns det i kvartskomposit?", "Kvartskomposit finns i nästan alla färger — vitt, grått, svart, beige, grönt, blått och mer. Populära är vit med ådring (marmorliknande) och mörkt antracit. Vi kan visa aktuellt sortiment från Silestone, Caesarstone och liknande."],
    ["Finns det svart granit?", "Ja, svart granit (t.ex. Angola Black, Absolute Black) är mycket populärt och ger ett dramatiskt, exklusivt uttryck. Det döljer fläckar väl och är extremt hårt. Impregnera 1–2 ggr/år."],
    ["Vad är Carrara-marmor?", "Carrara är en klassisk vit italiensk marmor med grå ådring. Den är en av världens mest kända och använda marmorsorter. Prisvärd bland marmorerna men kräver skötsel. Perfekt för badrum och low-traffic-ytor."],
    ["Har ni mörka eller svarta marmorsorter?", "Ja, t.ex. Marquina (svart med vit ådring) och Nero Portoro är klassiska mörka marmorsorter. De är vackra men kräver extra skötsel. Kolla aktuellt sortiment med oss."],

    // Bänkskiva i specifika rum
    ["Kan ni göra skiva till tvättställ i badrum?", "Ja, vi tillverkar kommodo-skivor och badrumsplattor med integrerade urtag för tvättfat, underploggar eller frilagda handfat. Ange mått och handfatsmodell vid förfrågan."],
    ["Kan ni göra fönsterbänkar i sten?", "Ja, fönsterbänkar i granit, marmor eller kvartsit är vackra och hållbara. Ange fönstrets mått och önskad tjocklek (20–30 mm) vid förfrågan. Vi levererar och monterar i Storstockholm."],
    ["Kan jag ha sten som väggbeklädnad?", "Vi levererar primärt horisontal stenskiva (bänkskivor, fönsterbänkar, golv). För vertikala ytor som stänkskyddsplattor (bakstycken) kan vi leverera skivor — men installation på vägg kräver anpassad montering. Fråga oss vad vi kan hjälpa till med."],
    ["Kan ni göra trappsteg i sten?", "Ja, granit och kvartsit lämpar sig utmärkt för trappsteg — de är hårda och slittåliga. Ange mått per steg. Vi levererar men installationsformen diskuterar vi per projekt."],

    // Impregnering & produkter
    ["Vilka produkter rekommenderar ni för stenimpregnering?", "Vi rekommenderar Lithofin Fleckstop (för granit och kvartsit) och Lithofin Stainstop (för marmor). LTP Mattstone och Fila Surface Care är andra bra alternativ. Finns i stenhandeln och på nätet."],
    ["Hur ofta behöver jag impregnera bänkskivan?", "Granit och kvartsit: 1–2 gånger per år. Marmor: 2–3 gånger per år för bästa skydd, eller vid behov (vattentest). Kvartskomposit och keramik: behöver inte impregneras."],
    ["Kan jag använda ättika på bänkskivan?", "Nej — aldrig på marmor, kvartsit eller kalksten. Ättika är syra och etsar stenen permanent. På granit kan svag ättika tolereras kortvarigt men rekommenderas ej. På kvartskomposit och keramik är ättika OK i utspädd form men skonar ytan bättre med neutral rengöring."],

    // Snabbsvar / korta frågor
    ["Hur snabbt svarar ni?", "Vi svarar normalt inom 1–2 timmar på vardagar (Mån–Fre 8–17). Utanför kontorstid återkommer vi nästa vardag."],
    ["Kan jag boka mätning direkt?", "Ja! Klicka på 'Boka tid' i chatten för att boka ett mätningsbesök direkt i vår kalender. Alternativt kan du skicka offertförfrågan via kalkylatorn så kontaktar vi dig för att boka tid."],
    ["Vad är er minsta beställning?", "Vi har ingen formell minimigräns, men för mycket små projekt (t.ex. en liten hylla) kan frakten väga tungt. Kontakta oss så ser vi vad vi kan göra."],
    ["Arbetar ni med företag och proffs?", "Ja, vi arbetar gärna med kök- och badrumsbolag, byggbolag och inredare. Vi erbjuder löpande samarbete och kan diskutera volympriser. Kontakta info@marmorskivan.se för en proffs-dialog."],
    ["Kan man financiera bänkskivan?", "Vi erbjuder betalning via faktura med 30 dagars betalningsvillkor. Finansieringsupplägg kan diskuteras för större projekt. Kontakta oss för mer info."],

    // Stänkskydd & kringprodukter
    ["Kan ni göra stänkskydd i sten?", "Ja, vi tillverkar stänkskydd (backsplash) i sten som en fortsättning på bänkskivan. Populärt med samma material rakt upp bakom diskbänk och spis. Ange höjd och längd vid offertförfrågan."],
    ["Hur högt ska ett stänkskydd vara?", "Standardhöjd är 600–900 mm — från bänkskivans ovansida upp till köksskåpen. Vissa väljer ett fullt stänkskydd hela vägen upp. Diskutera med oss vad som passar din kökslayout."],
    ["Kan jag ha sten som bordsskiva?", "Ja! Stenbordsskivor är vackra och hållbara. Granit och kvartskomposit är populärast. Vi tillverkar på mått med önskad kantprofil. Ange mått och material vid förfrågan."],
    ["Kan ni göra stenskivor till kontor?", "Ja, t.ex. receptionsskivor, konferensbord eller skrivbordsskivor. Vi tillverkar på mått. Granit och kvartskomposit är vanligast för kontor."],

    // Urtag & teknik
    ["Vad är ett undermonterat diskho?", "Undermonterat (under-mount) innebär att diskhon sitter under stenskivan, fäst med lim och beslag underifrån. Stenkanten är synlig och snygg runt öppningen. Renare utseende, enklare att torka bänken."],
    ["Vad är ett övermonterat diskho?", "Övermonterat (over-mount / drop-in) innebär att hoens kant vilar ovanpå stenskivan. Enklare montage, men kanten samlar smuts. Billigare alternativ."],
    ["Vad är planlimt diskho?", "Planlimt (flush-mount) innebär att hons ovansida är i exakt plan med stenytan. Kräver precision vid fräsning och är det mest exklusiva alternativet. Dyrare men resulterar i en sömlös yta."],
    ["Kan ni göra integrerad diskho i sten?", "Ja, för keramik/Dekton och ibland kvartskomposit kan vi tillverka en integrerad ho där ho och bänkskiva är ett stycke. Sömlös och hygienisk. Fråga oss om ditt önskade material stöds."],
    ["Hur stort urtag behövs för en induktionshäll?", "Det beror på hällmodellen — urtaget ska vara exakt enligt tillverkarens specifikation. Uppge modell och vi fräser rätt mått. Ange även om hällen ska vara flush-monterad eller med synlig kant."],
    ["Kan ni göra urtag för diskmaskin?", "Urtag för diskmaskin avser normalt kanten som stenskivan vilar på. Vi anpassar kanten och utskärningar för att stenskivan ska passa snyggt ovanför diskmaskinsluckan."],
    ["Kan ni göra runda urtag eller organiska former?", "Ja, med CNC-fräsning kan vi göra runda, ovala eller oregelbundna urtag och former. Det tar längre tid och påverkar priset, men vi tillverkar på beställning."],

    // Installation & förberedelse
    ["Vad ska jag tänka på innan ni monterar?", "Se till att: skåpen är monterade och justerade vågrätt, gamla skivan och vitvaror är borttagna (vi kan hjälpa vid behov), väggarna är klara (kakel, målning), och att det finns tillgång till utrymmet för oss att arbeta."],
    ["Hur lång tid tar monteringen?", "En standardköks-montering tar normalt 2–4 timmar. Köksöar, många urtag eller svårtillgängliga utrymmen kan ta längre. Vi meddelar beräknad tid."],
    ["Behöver jag vara hemma vid monteringen?", "Ja, någon behöver vara hemma för att ta emot oss och godkänna resultatet. Vi bokar tid som passar dig."],
    ["Kan ni bära upp bänkskivan i trappor?", "Ja, vi är vana vid trappuppbärningar. Informera oss om trappornas bredder och antal trappor i förväg så vi kan planera med rätt personal och utrustning."],
    ["Vad händer om bänkskivan inte passar vid montering?", "I sällsynta fall kan väggar vara extra skeva eller mått ha avvikit. Vi har alltid material och verktyg för justeringar på plats. Om avvikelsen är stor och beror på vår mätning åtgärdar vi det kostnadsfritt."],
    ["Hur justerar ni mot skeva väggar?", "Vi skär ut profilen mot väggen med vinkelslipen för att kompensera för ojämnheter. Fogmassa tätar sedan glipan mot väggen. Vi strävar efter maximalt 2–3 mm fog."],

    // Miljö & hållbarhet
    ["Är natursten miljövänligt?", "Natursten har lång livslängd (50–100 år) vilket ger låg total miljöpåverkan. Utvinningen kräver energi men stenen är obehandlad och naturlig. Vi väljer leverantörer med ansvarsfulla utvinningsmetoder."],
    ["Var kommer stenen ifrån?", "Vi sourcear sten från välkända stenbrott i Italien, Portugal, Brasilien, Indien och Skandinavien beroende på material. Vi kan informera om ursprung för specifika sorter."],
    ["Kan gammal bänkskiva återvinnas?", "Stenplattor kan återanvändas som trädgårdsplattor, fönsterbänkar eller liknande. Kvartskomposit kan vara svårare att återvinna. Vi tar gärna hand om din gamla skiva vid montering."],
    ["Är kvartskomposit hälsosäkert?", "Ja, härdad kvartskomposit är inert och avger inga skadliga ämnen vid normal användning. Kvartsdamm vid bearbetning (slipning, fräsning) är farligt att inandas — det hanteras av oss med skyddsutrustning och dammsugning."],

    // Jämförelser med alternativa material
    ["Varför välja sten istället för laminat?", "Sten är överlägset i tålighet och livslängd. Laminat kan svullna av fukt, repas och åldras. Sten ökar bostadens värde, ser lyxigare ut och håller i decennier med minimal skötsel. Initialkostnaden är högre men totalekonomin är bättre."],
    ["Varför välja sten istället för trä?", "Träbänkskivor är vackra men kräver regelbunden oljebehandling och är känsliga för fukt och repor. Sten är mer hållbart, hygiensikt och lättsköt. Kombinationer med träinslag och stenbänkskivor är en populär mix."],
    ["Varför välja sten istället för betong?", "Betong kan spricka, kräver impregnering och är porös. Sten är hårdare, mer dimensionsstabilt och ger ett mer premium resultat. Kvartskomposit i betongfärg ger betong-look utan nackdelarna."],
    ["Vad är skillnaden mellan polerad och borstad stenyta?", "Polerad yta är blank och reflekterar ljus — visar fläckar och fingeravtryck mer. Borstad (honed) yta är matt och mjuk att ta på — döljer fingeravtryck och repor bättre. Borstad marmor och granit är trendigt i moderna kök."],
    ["Vad är en 'leathered' stenyta?", "Leathered (läderbehandlad) yta är en texturerad finish som ger en lite skrovlig, organisk känsla. Döljer fläckar och fingeravtryck bra. Tillgänglig för granit och kvartsit. Ger ett rustikt, exklusivt utseende."],

    // Garanti & service extra
    ["Vad händer om stenen spricker under transport?", "Vi kontrollerar varje platta vid leverans. Om skada uppstår under transport är vi ansvariga och ersätter plattan. Notera eventuella skador direkt vid leverans och kontakta oss samma dag."],
    ["Kan ni reparera befintlig bänkskiva som vi inte köpt hos er?", "I vissa fall — vi kan bedöma skador och föreslå åtgärder. Kontakta oss med bilder på info@marmorskivan.se."],
    ["Hur länge håller fogmassa och silikonfog?", "Silikonfog vid diskho och väggar håller normalt 5–10 år. Vi rekommenderar att kontrollera och förnya fogmassan vid tecken på sprickor, missfärgning eller mögel."],
    ["Kan jag köpa bara material utan montage?", "Ja, vi kan sälja tillskuren sten för hämtning eller leverans. Montagetjänsten är separat. Notera att garanti på montage då ej ingår."],

    // Specifika rum & applikationer
    ["Kan sten användas som golv?", "Ja, granit och keramik/Dekton är utmärkta golvmaterial — hårda och slittåliga. Marmor fungerar som golvmaterial men kräver impregnering och är känsligare för rörelseskador. Vi levererar golv-skivor men installerar primärt arbetsbänkar."],
    ["Kan jag ha marmorskiva i hall?", "Marmor i hall som konsolbord-skiva eller fönsterbänk fungerar bra. Undvik marmorskiva som golv i hall med hög trafik och risk för fukt. Granit och kvartsit är bättre hallalternativ."],
    ["Har ni lager av material eller är det beställningsvara?", "De flesta material är beställningsvara från leverantör. Vi har begränsat lager av de populäraste sorterna. Det är ett av skälen till 2–4 veckors ledtid."],
    ["Kan jag se prover hemma hos mig?", "Vi kan skicka prover per post för de vanligaste materialen. Du kan också komma och se material hos oss. Kontakta info@marmorskivan.se för att beställa prover."],

    // Digitalt & offert
    ["Hur exakt är prisuppskattningen i kalkylatorn?", "Kalkylatorn ger en bra uppskattning baserad på mått och material. Den slutliga offerten efter mätningsbesök kan avvika 5–15% beroende på exakta förhållanden, kantlängder och åtkomlighet. Inga betalningar tas förrän du godkänt slutofferten."],
    ["Sparas mina uppgifter i kalkylatorn?", "Dina mått och val sparas temporärt i din webbläsarsession. De skickas till oss när du begär offert. Vi hanterar dina uppgifter konfidentiellt enligt GDPR."],
    ["Kan jag spara min offertförfrågan och återkomma?", "Offertförfrågan skickas direkt när du klickar 'Skicka'. Om du vill göra ändringar — kontakta oss via chatt eller mejl så justerar vi."],
    ["Kan jag få offerten på engelska?", "Ja, vi kan kommunicera och skicka offert på engelska. Kontakta oss på info@marmorskivan.se och ange att du föredrar engelska."],

    // Konkreta vardagsfrågor
    ["Kan jag diska på en stenbänkskiva?", "Ja, naturligtvis. Normalt diskvatten och diskmedel skadar inte sten. Undvik dock att låta stående vatten ligga länge på natursten — torka av efter diskning."],
    ["Blir stenbänkskivan kall på vintern?", "Ja, sten leder värme och känns kallare än t.ex. laminat. Det är en vanlig observation. Det är ingen nackdel men kan uppfattas som ovant. Kvartskomposit är lite mer värmeisolerande än natursten."],
    ["Kan jag kavla deg direkt på stenbänkskivan?", "Ja! Stenbänkskivor är utmärkta för bakning — de är kalla, jämna och hygieniska. Granit och kvartskomposit är populärast bland bakentusiaster."],
    ["Syns skarvar på bänkskivan?", "Vi minimerar skarvar och placerar dem strategiskt. En väl gjord skarvfog med matchande epoxy är nästan osynlig. Skarvar kan inte alltid undvikas vid långa bänkar eller hörnlösningar."],
    ["Hur tunna kanter kan ni polera?", "Vi polerar standardkanter från 20 mm tjocklek. Tunnare än 15 mm är svårt att polera utan kantbyte-risk för känsligare material som marmor. Fråga oss för specifika krav."],
    ["Kan ni borra hål för diskbänkskran i efterhand?", "Ja, men vi rekommenderar att planera alla hål vid beställning. Efterborrning är möjlig men dyrare och kräver ett platsbesök. Risken för sprickor är liten men kräver rätt borr och teknik."],
    ["Hur tung är en stenbänkskiva?", "Sten väger 20–30 kg/m² vid 20 mm tjocklek (granit ca 28 kg/m², kvartskomposit ca 24 kg/m²). En typisk 3 m köksbänk på 60 cm djup väger ca 40–50 kg. Skåpen måste klara denna vikt — standardköksskåp gör det utan problem."],
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
