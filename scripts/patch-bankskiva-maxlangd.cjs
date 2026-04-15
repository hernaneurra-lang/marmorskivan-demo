// scripts/patch-bankskiva-maxlangd.cjs
// Patches 'bankskiva-maxlangd-och-skarvar' sections via admin API
// Run: node scripts/patch-bankskiva-maxlangd.cjs
const https = require("https");

const API_BASE = "marmorskivan-demo-production.up.railway.app";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "marmorskivan-admin";

const CTA = "<div class='not-prose mt-4'><a href='/app' class='inline-flex px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow'>Beräkna pris →</a></div>";

const sections = [
  {
    heading: "Hur stor är en råplatta – och vad begränsar längden?",
    content: `<p>En naturstenbänkskiva börjar sitt liv som en råplatta – en <em>slab</em> – som bryts ur berget i ett stenbryteri och sedan sågas till lämplig tjocklek. Plattans storlek bestämmer direkt hur lång din bänkskiva kan bli utan skarv.</p><p>Råplattor är organiska produkter. Storlek, form och kvalitet varierar beroende på bergart, bryteri och land. Det finns inga globalt standardiserade plattmått, men industrin har etablerat riktlinjer:</p><ul><li><strong>Granit:</strong> 270–335 cm längd × 150–200 cm bredd – en av de mest generösa bergarterna</li><li><strong>Kvartsit:</strong> 300–350 cm längd × 165–200 cm bredd – de allra största naturstensplattorna</li><li><strong>Marmor:</strong> 255–305 cm längd × 140–190 cm bredd – mer spröd, kräver oftare skarv</li><li><strong>Kvarts/komposit:</strong> 305–320 cm längd × 140–165 cm bredd – fabriksgjord, konsekvent storlek</li><li><strong>Keramik/sintrad sten:</strong> 320 cm och längre – kan ofta levereras utan skarv i standard kök</li></ul><p>Utöver råplattans storlek spelar transport en roll. En 3,4 meter lång sten väger hundratals kilo – trapphus, hissar och smala entréer sätter ibland sina egna gränser.</p>`,
    images: [{ src: "/images/materials/Kvartsit/big quartzite quarry big machinery.jpg", alt: "Kvartsitplattor i fabrik – stora råplattor med varierande mått" }]
  },
  {
    heading: "Maxlängd per material – tumregler",
    content: `<p>Hos oss på Marmorskivan levereras bänkskivor utan skarv upp till dessa längder:</p><ul><li><strong>Granit:</strong> upp till ca 290–330 cm utan skarv</li><li><strong>Kvartsit:</strong> upp till ca 300–340 cm – störst variation, beroende på ursprungsbrytteri</li><li><strong>Marmor:</strong> ca 250–300 cm – mer spröd och tyngre att hantera, kräver oftare delning</li><li><strong>Kvarts/komposit:</strong> exakt 300 cm (standardplatta) – vill du ha längre köket behöver du skarv</li><li><strong>Keramik/sintrad sten:</strong> 320 cm och mer möjligt – stor fördel för långa kökslinjer</li></ul><p>Har du ett kök som överstiger 300 cm på en rät sträcka är en skarv i de flesta fall oundviklig – oavsett material. Frågan är inte <em>om</em> du får en skarv, utan <em>var</em> den hamnar.</p>`
  },
  {
    heading: "Regel nr 1: Placera skarven vid håluttaget",
    content: `<p>Det finaste rådet vi kan ge dig är detta:</p><blockquote><strong>Lägg skarven vid håluttaget – diskho, spishäll eller blandarhål. Där blir den näst intill osynlig.</strong></blockquote><p>Anledningen är enkel. Håluttaget är ett redan befintligt avbrott i stenytan. Ögat förväntar sig att stenen slutar vid diskho-kanten – det registrerar aldrig att det faktiskt är en skarv. Hällen eller hoens ram täcker fogen och gör den bokstavligt talat osynlig uppifrån.</p><p>Det är ett av de viktigaste råden vi ger våra kunder: välj din placering av skarvarna redan i planeringsfasen – innan templating – så att håluttagen och skarven hamnar rätt från start.</p>`,
    images: [{ src: "/images/materials/Granit/granit-kitchen.jpg.jpg", alt: "Diskho i granitbänkskiva – idealt ställe för skarv" }]
  },
  {
    heading: "Varför håluttaget fungerar perfekt som skarv-plats",
    content: `<p>Det finns tre anledningar till att håluttaget är den bästa platsen:</p><ol><li><strong>Naturligt visuellt avbrott.</strong> Diskho, häll och blandare bryter redan av stenytan. Ögat söker inte skarvar vid dessa punkter – de tillhör kökets normala utseende.</li><li><strong>Apparaten täcker fogen.</strong> En underliggande diskho (undermount) eller en inbyggd spishäll döljer skarven längs hela sin kant. Det som syns – om ens det – är en millimetertunna linje under blandarhållets krom.</li><li><strong>Strukturellt smart.</strong> Stenen på ömse sidor om ett håluttag är kortare och lättare. Skarven hamnar naturligt vid en bärande skåpkant under bänken, vilket ger stadigt stöd.</li></ol><p>En viktig detalj: vi placerar skarven <em>längs kanten av</em> håluttaget, inte tvärs igenom mitten. Detta planeras vid templating och säkerställer att skarvkanten sammanfaller med hocutoutens eller hällens yttre rand.</p>`
  },
  {
    heading: "Andra bra placeringar – hörn och L-form",
    content: `<p>Har du ett L-kök eller U-kök är hörnet ett annat självklart val för skarven. Stenen byter riktning och ögat uppfattar hörnet som en naturlig gräns – precis som med ett håluttag.</p><p>Tumregler för hörn-skarvar:</p><ul><li>Placera aldrig skarven <em>i</em> ett inre hörn (90°-punkten). Det är en spänningspunkt – fogmassan kan spricka med tiden.</li><li>Förflytta skarven minst 15 cm längs en av armarna, bort från hörnet. Då hamnar den över en stabil skåpkant och risken för rörelseskador minimeras.</li><li>Vid L-form med lång väggarm och spishäll kan skarvpunkten kombineras med hällens håluttag – dubbel fördel.</li></ul>`,
    images: [{ src: "/images/materials/Marmor/marmor-kitchen.jpg", alt: "L-kök med naturstenbänkskiva – skarven vid hörnet" }]
  },
  {
    heading: "Det här ska du undvika",
    content: `<p>Lika viktigt som att välja rätt plats är att undvika fel:</p><ul><li><strong>Inte mitt i en fri yta.</strong> En skarv mitt på en öppen bänkyta syns tydligast – speciellt om stenen har stark ådring som bryts av. Ingen täcker fogen och ögat dras dit direkt.</li><li><strong>Inte utan undre stöd.</strong> Skarven måste vila på en skåpkant eller bärande list. En fog som hänger fritt kan sjunka med millimetrar och skapa en synlig kant.</li><li><strong>Inte för nära in i hörnet.</strong> Inre hörn är spänningspunkter. Gå minst 15 cm ut på armen.</li><li><strong>Inte för nära diskho-kanten om det inte planerats.</strong> Om skarven hamnar 2–3 cm från hocutoutens kant – utan att täckas av ho-ramen – är det sämsta av båda världar: synlig skarv nära ett vattenutsatt område.</li></ul>`
  },
  {
    heading: "Hur vi utför en professionell skarv",
    content: `<p>En välgjord skarv är en hantverksprocess i flera steg:</p><ol><li><strong>Exakt kapning.</strong> Båda stenarnas skarvkanter kapas med en bryggsåg och raka stöd. Målsättningen är en fogbredd på ca 1,5 mm. Vidare gap syns alltid, oavsett hur väl du matchar färg.</li><li><strong>Armering.</strong> I granit och kvartskomposit fräses spår i undersidan och stålstavar gjuts in med epoxy. I marmor används glasfiberarmering (stål syns igenom den ljusare stenen). Armeringen ger dragstyrka som fogmassa ensam inte klarar.</li><li><strong>Ådernmatchning.</strong> Vi lägger ut båda plattorna och roterar dem tills ådringens mönster löper så naturligt som möjligt över fogen. Vid dramatiska stenar som Calacatta eller Statuario görs detta extra noggrant.</li><li><strong>Fogning med epoxy.</strong> Epoxi är det professionella valet – polyester gulnar med UV-ljus. Epoxin pigmenteras att matcha stenens grundton och fylls i fogen med ett spatel.</li><li><strong>Polering.</strong> När epoxin härdat slipas fogen jämnt och poleras med de omgivande stenarnas finhet. Rätt utfört syns knappt en linje.</li></ol><p>Gapet under montering är 3–8 mm för att ge plats för fogmassa och eventuell justering. Slutresultatet är alltid betydligt tätare.</p>`
  },
  {
    heading: "Vanliga frågor",
    content: `<p><strong>Kan jag ha en bänkskiva helt utan skarv i ett 320 cm kök?</strong><br/>Det beror på materialet. Kvartsit och granit kan i många fall levereras upp till 330–340 cm som en hel platta. Keramik klarar ofta 320 cm. Kontakta oss så tittar vi på längsta tillgängliga platta för just ditt material – det varierar per leverantör och ursprungsbrytteri.</p><p><strong>Syns skarven vid diskho?</strong><br/>Vid korrekt placering och utförande är svaret nej – du ser det inte i vardagen. Hocutoutens kant döljer fogen och ögat uppfattar det som ett naturligt avbrott.</p><p><strong>Är en skarv ett tecken på dålig kvalitet?</strong><br/>Nej. Även i exklusiva kök med Calacatta eller Statuario används skarvar. Det är ett geometriskt faktum att naturstensplattor inte är oändligt långa. En välgjord skarv är ett kvalitetstecken – inte ett problem.</p><p><strong>Ingår skarven i priset?</strong><br/>Ja, arbetet med att skapa fogen ingår i vår offert. Vid mer avancerad armering eller ådernmatchning specificerar vi detta separat. Vi är transparenta med vad som ingår.</p>` + CTA
  }
];

async function request(method, path, body) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const req = https.request({
      hostname: API_BASE,
      path,
      method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ADMIN_TOKEN}`,
        ...(data ? { "Content-Length": Buffer.byteLength(data) } : {})
      }
    }, res => {
      let body = "";
      res.on("data", c => body += c);
      res.on("end", () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(body) }); }
        catch { resolve({ status: res.statusCode, data: body }); }
      });
    });
    req.on("error", reject);
    if (data) req.write(data);
    req.end();
  });
}

async function main() {
  console.log("Fetching all blog posts...");
  const { data: posts } = await request("GET", "/api/admin/blog/posts");
  const post = posts.find(p => p.slug === "bankskiva-maxlangd-och-skarvar");
  if (!post) { console.error("Post not found – deploy to Railway first, then run this script."); process.exit(1); }
  console.log(`Found post id=${post.id} – patching sections...`);

  const { status, data } = await request("PATCH", `/api/admin/blog/posts/${post.id}`, {
    sections,
    meta_description: "Hur lång kan en stenbänkskiva vara utan skarv? Guide till maxlängder per material och var du placerar skarven så den blir näst intill osynlig – vid diskho, spishäll och håluttag.",
    read_time: "6 min"
  });
  console.log(`Status: ${status}`, JSON.stringify(data).substring(0, 200));
}

main().catch(console.error);
