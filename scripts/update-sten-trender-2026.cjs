// scripts/update-sten-trender-2026.cjs
// Updates sten-trender-2026 via Railway admin API
const https = require("https");

const API_BASE = "marmorskivan-demo-production.up.railway.app";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "marmorskivan-admin";

const sections = [
  {
    heading: "Stentrender 2026: Mellan lokalt arv och europeisk dramatik",
    content: `<p>Under 2026 ser vi ett paradigmskifte inom arkitekturen där natursten lämnar rollen som enbart en vacker yta för att istället bli byggnadens ryggrad. Arkitekter över hela Europa, inklusive Sverige, söker nu material som erbjuder <strong>permanens, taktilitet och ett minimalt klimatavtryck</strong>.</p>
<p>Det handlar inte längre om att välja sten för att det är vackert – det handlar om att välja sten för att det är rätt. Rätt för planeten, rätt för byggnaden, rätt för den människa som ska leva och arbeta i rummet.</p>`,
    images: [
      { src: "/images/materials/Kvartsit/modern kitchen quartzite countertop.jpg", alt: "Modern kök med kvartsit bänkskiva – stentrender 2026" }
    ]
  },
  {
    heading: "1. Från yta till struktur: \"Massive Stone\"-vågen",
    content: `<p>Den mest betydande tekniska trenden i Europa 2026 är återgången till sten som ett <strong>bärande material</strong> – inte enbart som ytskikt eller dekor.</p>
<p><strong>I Europa:</strong> I Frankrike och Storbritannien kombineras massiva stenblock med korslimmat trä (CLT) för att skapa högpresterande hybridkonstruktioner. Sten och trä samverkar – stenen ger termisk massa och permanens, träet ger flexibilitet och lågt koldioxidavtryck.</p>
<p><strong>I Sverige:</strong> Den svenska <em>Borghamnskalkstenen</em> – utsedd till Årets Sten 2026 – leder vägen. Den används inte längre bara som golv, utan som massiva bärande element och monumentala inredningsdetaljer som utstrålar historisk tyngd. Borghamn i Östergötland har brutits i hundratals år och materialet bär en genuint svensk identitet som arkitekterna nu återupptäcker.`,
    images: [
      { src: "/images/materials/Kalksten/modern kitchen with real limestone countertop.jpg", alt: "Borghamnskalksten och kalksten i modernt kök" },
      { src: "/images/materials/Kalksten/limestone quarry in Norway.jpg", alt: "Nordisk kalkstensbrott – lokal stenproduktion" }
    ]
  },
  {
    heading: "2. Estetik: Värme och dramatisk karaktär",
    content: `<p>Den sterila, minimalistiska "vita" eran är officiellt över. 2026 handlar om <strong>färgstark ärlighet</strong> – material som vågar visa sin natur.</p>
<p><strong>Varma baser:</strong> Sandiga toner, taupe och krämig travertin dominerar den europeiska paletten och skapar en mjukare, mer "jordad" minimalism. Det är inte kallt och sterilt – det är varmt och organiskt.</p>
<p><strong>Dramatiska accenter:</strong> För bänkskivor och fondväggar väljer arkitekter kvartsit och marmor med extrem ådring i djupt grönt, burgundy och midnattsblått. En enda dramatisk slab kan bära ett helt rums designuttryck.</p>
<p><strong>Ljus som designelement:</strong> I södra Europa ser vi en ökning av bakbelyst sten – onyx och agat – för att skapa stämningsfulla, lysande miljöer i spa, hotellfoajéer och exklusiva restauranger. Genomlyst honungsgul onyx är 2026 års mest spektakulära materialval.</p>`,
    images: [
      { src: "/images/materials/Travertin/travertine countertop in modern an luxurious kitchen.jpg", alt: "Travertin bänkskiva – varm ton och jordad estetik" },
      { src: "/images/materials/Kvartsit/quartzite kitchen countertop luxury.jpg", alt: "Dramatisk kvartsit med extrem ådring" },
      { src: "/images/materials/Onyx/Onxy Smeraldo luxury autonova kitchen.jpg", alt: "Bakbelyst onyx – ljus som designelement" }
    ]
  },
  {
    heading: "3. Taktilitet och yta – Adjö till högblankt",
    content: `<p>2026 handlar om hur stenen <em>känns</em> under fingertopparna, inte bara hur den ser ut på ett fotografi. Den högblanka poleringen har ersatts av ytor som inbjuder till kontakt.</p>
<p><strong>Honed & Leathered:</strong> Mattslipade och läderartade ytor dämpar reflektioner och framhäver stenens naturliga textur. En läderfinishad kvartsit känns som det låter – mjukt, varmt, taktilt. Det är en yta som man vill röra vid.</p>
<p><strong>3D-bearbetning:</strong> Räfflade (fluted) paneler och råhuggna ytor skapar skuggspel och djup. Vertikala räfflor på en köksö i natursten ger ett arkitektoniskt uttryck som kombinerar det klassiska med det samtida – en kontrast till släta glas- och stålpartier som blivit alltför vanliga.</p>
<p>Sandblästrad sten – en yta som ger stenen ett nästan betongliknande, matt uttryck – är ett annat alternativ som ökar i popularitet, särskilt i Skandinavien.</p>`,
    images: [
      { src: "/images/materials/Kvartsit/quartzite slabs factory.jpg", alt: "Kvartsitplattor – olika ytbehandlingar" },
      { src: "/images/materials/Travertin/travertine bathroom tiles in modern kitchen with suthel viens.jpg", alt: "Travertin med taktil, mattad yta" }
    ]
  },
  {
    heading: "4. Cirkulär ekonomi och \"Stone Scraps\"",
    content: `<p>Hållbarhet är inte längre ett val utan ett krav – drivet av nya EU-direktiv och en generation arkitekter och konsumenter som ställer verkliga krav på leverantörskedjan.</p>
<p><strong>Regionalt fokus:</strong> Transportutsläpp styr materialvalen på ett nytt sätt. Svenska projekt prioriterar nordisk granit och kalksten. På kontinenten väljer man regionala stenbrott för att minimera logistiken. Det lokala är det nya lyxiga.</p>
<p><strong>Kreativt återbruk – "Stone Scraps":</strong> Spillmaterial från stenbrotten – bitar som tidigare kastats – får nytt liv. Storskalig terrazzo och mosaikliknande "patchwork"-mönster, där det ofullkomliga och unika blir en del av den exklusiva designen. En bänkskiva gjord av spillbitar från ett marmorbrotts dagliga produktion är inte ett billigare alternativ – det är ett mer berättande alternativ.</p>
<p>EU:s nya Due Diligence-direktiv (CSDD) kräver dessutom att importörer kan dokumentera hela leverantörskedjan – ursprung, arbetsförhållanden, miljöpåverkan. Det driver transparens och certifiering på ett sätt vi inte sett tidigare.</p>`,
    images: [
      { src: "/images/materials/Terrazzo/terrazzo countertop kitchen.jpg", alt: "Terrazzo av återvunnet stenspill – cirkulär design" },
      { src: "/images/materials/Kalksten/limestone slabs factory in sweden realistik.jpg", alt: "Svensk kalkstensproduktion – lokalt och hållbart" }
    ]
  },
  {
    heading: "Sammanfattning: Arkitektens val 2026",
    content: `<table style="width:100%;border-collapse:collapse;font-size:14px;margin:16px 0;">
  <thead>
    <tr style="background:#f3f4f6;border-bottom:2px solid #e5e7eb;">
      <th style="text-align:left;padding:10px 14px;font-weight:700;">Kategori</th>
      <th style="text-align:left;padding:10px 14px;font-weight:700;">Trendfokus</th>
      <th style="text-align:left;padding:10px 14px;font-weight:700;">Exempel på material</th>
    </tr>
  </thead>
  <tbody>
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:10px 14px;font-weight:600;">Konstruktion</td>
      <td style="padding:10px 14px;">Massivt och bärande</td>
      <td style="padding:10px 14px;">Borghamnskalksten, Granit</td>
    </tr>
    <tr style="border-bottom:1px solid #e5e7eb;background:#fafafa;">
      <td style="padding:10px 14px;font-weight:600;">Färgpalett</td>
      <td style="padding:10px 14px;">Jordnära &amp; Dramatisk</td>
      <td style="padding:10px 14px;">Travertin, Grön Kvartsit, Burgundy Marmor</td>
    </tr>
    <tr style="border-bottom:1px solid #e5e7eb;">
      <td style="padding:10px 14px;font-weight:600;">Ytfinish</td>
      <td style="padding:10px 14px;">Taktil &amp; Matt</td>
      <td style="padding:10px 14px;">Sandblästrat, Räfflat (Fluted), Borstat</td>
    </tr>
    <tr style="background:#fafafa;">
      <td style="padding:10px 14px;font-weight:600;">Hållbarhet</td>
      <td style="padding:10px 14px;">Lokalt &amp; Cirkulärt</td>
      <td style="padding:10px 14px;">Svensk sten, EU-regional sten, Återbrukat spill</td>
    </tr>
  </tbody>
</table>
<p>Trenderna för 2026 pekar mot ett mer ansvarsfullt och autentiskt förhållande till natursten. Inte mer yta – mer substans. Inte mer glans – mer karaktär. Det är en riktning som Marmorskivan delar.</p>`,
    images: [
      { src: "/images/materials/Granit/granit-kitchen.jpg", alt: "Granit bänkskiva – nordisk och hållbar" }
    ]
  }
];

async function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: API_BASE, path, method,
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": ADMIN_TOKEN,
        ...(data ? { "Content-Length": Buffer.byteLength(data) } : {})
      }
    }, res => {
      let b = ""; res.on("data", c => b += c);
      res.on("end", () => { try { resolve({ status: res.statusCode, data: JSON.parse(b) }); } catch { resolve({ status: res.statusCode, data: b }); } });
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  const { data: posts } = await request("GET", "/api/admin/blog/posts");
  if (!Array.isArray(posts)) { console.error("Unexpected response:", posts); process.exit(1); }
  const post = posts.find(p => p.slug === "sten-trender-2026");
  if (!post) { console.error("Post not found"); process.exit(1); }
  console.log(`Found id=${post.id}, current sections: ${post.sections?.length}`);

  const { status, data } = await request("PATCH", `/api/admin/blog/posts/${post.id}`, { sections });
  console.log(`Status: ${status}`, data);
}

main().catch(console.error);
