// scripts/update-kantprofiler.cjs
const fs = require("fs");
const path = require("path");

const JSON_PATH = path.join(__dirname, "../public/data/blog-posts.json");

const updatedPost = {
  slug: "kantprofiler-guide",
  sections: [
    {
      heading: "Vad är en kantprofil och varför spelar den roll?",
      content: `<p>Kantprofilen är den bearbetade kanten på din naturstenbänkskiva – den synliga avslutningen längs framsidan och eventuella öppna sidor. Det är en detalj som syns varje gång du går förbi köket, lägger handen på bänken eller tar emot gäster. Rätt vald profil förstärker hela kökets stil; fel vald kan verka ogenomtänkt mot ett i övrigt välplanerat kök.</p>
<p>Utöver estetiken påverkar kantprofilen också <strong>säkerhet</strong> – skarpa rätvinkliga kanter kan vara obekväma eller till och med farliga i ett aktivt kök med barn – och <strong>hållbarhet</strong> – tunna, spetsiga kanter är mer benägna att flagna vid stötar än en avrundad profil.</p>
<p>Hos Marmorskivan ingår alltid en standardprofil i priset. Mer avancerade profiler tillkommer i pris. Alla profiler nedan kan utföras i samtliga material vi arbetar med – marmor, granit, kvartsit, travertin och komposit.</p>`,
      images: []
    },
    {
      heading: "Pencil – minimalismens kant",
      content: `<p><strong>Pencil</strong>-profilen är den mest diskreta av alla kantprofiler. En minimal rundning – ungefär som ett finger dragen lätt längs kanten – tar bort det skarpa hörnet utan att tillföra någon egentlig formgivning. Resultatet är en kant som nästan inte märks, och det är precis poängen.</p>
<p>Pencil passar utmärkt i kök med en modern, minimalistisk estetik där man vill att bänkskivans material och yta ska stå i fokus – inte kantens form. Det är också ett praktiskt val eftersom den enkla geometrin är lättare att hålla ren och kräver minimal slipning.</p>
<p><strong>Bäst för:</strong> Moderna och minimalistiska kök. Tunnare skivor (20 mm) där en större profil kan se oproportionerlig ut.</p>`,
      images: [
        { src: "/edges/Pencil.JPG", alt: "Pencil kantprofil – diskret och minimalistisk" }
      ]
    },
    {
      heading: "Lättad (Eased Edge) – den universella standarden",
      content: `<p><strong>Lättad kant</strong> – på engelska <em>eased edge</em> – är den vanligaste kantprofilen i Sverige och en av de mest använda i hela världen. Den kombinerar en lätt rundad övre kant med raka sidor, vilket ger ett rent, enkelt avslut utan tydlig formgivning.</p>
<p>Det är en profil som fungerar med de flesta köksstilar – varken för modern eller för traditionell. Den är lätt att hålla ren (inga djupa spår att dammas i), tål vardagsbelastning väl och ger ett professionellt intryck utan tillkommande kostnad. Hos många stenverkstäder ingår lättad kant som standardprofil.</p>
<p><strong>Bäst för:</strong> Universalt val. Passar alla material och de flesta köksstilar. Bra standardval om du är osäker.</p>`,
      images: [
        { src: "/edges/Lättad.JPG", alt: "Lättad kantprofil – universell och lättskött" }
      ]
    },
    {
      heading: "Fasad / Bevel – skarp elegans",
      content: `<p><strong>Fasad kant</strong> (bevel) innebär en rak 45-graders fas längs övre kanten. Det ger en skarp, geometrisk avslutning med en tydlig linje som syns och ger bänkskivan en mer formell, väldefinierad kontur. Fasan kan vara smal (3–5 mm) för ett diskret resultat, eller bredare (10–15 mm) för ett mer uttalat designuttryck.</p>
<p>Fasad kant är populär i kök med Art Deco-inspirerad design, industriella stilar eller klassiska traditionella kök där tydliga linjer och geometrisk precision värderas. Den är inte en profil som "försvinner" – den syns och bidrar aktivt till kökets estetik.</p>
<p><strong>Dubbel bevel</strong> – en fas på både övre och undre kanten – ger ett ännu mer definierat uttryck och används ibland på tjockare skivor (30–40 mm) för att låta kantens tjocklek bli ett designelement i sig.</p>
<p><strong>Bäst för:</strong> Traditionella, formella och Art Deco-inspirerade kök. Tjockare skivor.</p>`,
      images: [
        { src: "/edges/fasad.jpg", alt: "Fasad kantprofil – 45 graders fas" },
        { src: "/edges/Bevel.JPG", alt: "Bevel kantprofil – skarp geometrisk kant" },
        { src: "/edges/Double Bevel.JPG", alt: "Dubbel bevel – fas på båda kanterna" }
      ]
    },
    {
      heading: "Avrundad / Halvrund (Bullnose) – den klassiska mjuka kanten",
      content: `<p><strong>Bullnose</strong> är kanske den mest klassiska kantprofilen för natursten. Kanten rundas helt – en perfekt halvcirkel från överkant till underkant – och ger en mjuk, inbjudande avslutning som är bekväm att stödja sig mot och säker i ett kök med barn.</p>
<p>Det finns flera varianter:</p>
<ul>
  <li><strong>Hel bullnose</strong> – Komplett halvcikelrundning. Mjukt och tidlöst.</li>
  <li><strong>Dubbel bullnose</strong> – Rundning på både övre och undre kanten. Ger en tjockare, mer tredimensionell kant.</li>
  <li><strong>Dubbel radie</strong> – En mjukare variant med större rundningsradius. Vanlig på tjockare skivor.</li>
</ul>
<p>Bullnose är ett tidlöst val som passar från traditionella lantliga kök till moderna badrum. Det är inte ett val som "dateras" på samma sätt som mer modenyckfulla profiler.</p>
<p><strong>Bäst för:</strong> Familjer med barn (säker, mjuk kant). Traditionella och lantliga kök. Badrum.</p>`,
      images: [
        { src: "/edges/halvrund.jpg", alt: "Halvrund bullnose kantprofil" },
        { src: "/edges/Hel Bullnose.JPG", alt: "Hel bullnose – komplett rundad kant" },
        { src: "/edges/Double bullnose.JPG", alt: "Dubbel bullnose – rundning på båda sidor" },
        { src: "/edges/Dubbel radie.JPG", alt: "Dubbel radie bullnose profil" }
      ]
    },
    {
      heading: "Avrundad (Rounded) – modern variant av bullnose",
      content: `<p>En <strong>avrundad kant</strong> liknar bullnose men med en mjukare, mer organisk rundning – inte en perfekt halvcirkel utan en friare kurva som ger ett mer modernt, strömlinjeformat intryck. Det är en profil som passar perfekt i kök med organisk formgivning och naturliga material.</p>
<p>Till skillnad från en strikt bullnose kan den avrundade kanten varieras i hur uttryckt rundningen är – från knappt märkbar till mer generöst böjd. Det ger stenverkstaden och kunden möjlighet att anpassa profilen till just det specifika kökets proportioner.</p>
<p><strong>Bäst för:</strong> Moderna kök med organisk design. Köksöar där kanten syns från alla håll.</p>`,
      images: [
        { src: "/edges/avrundad.jpg", alt: "Avrundad kantprofil – modern och organisk" },
        { src: "/edges/rundad.jpg", alt: "Rundad kant – mjuk och strömlinjeformad" }
      ]
    },
    {
      heading: "Ogee – den dekorativa klassikern",
      content: `<p><strong>Ogee</strong>-profilen är den mest utsmyckade av standardprofilerna och hämtar sin inspiration från klassisk europeisk arkitektur. Profilen har en S-formad kurva – en konkav böjning följt av en konvex – som ger kanten ett tydligt tredimensionellt, dekorativt utseende.</p>
<p>Ogee är ett starkt uttalande och passar bäst i traditionella, klassiska eller formella köksinteriörer. I ett minimalistiskt eller skandinaviskt kök kan profilen verka malplacerad – den tillhör ett designspråk med ornament och detalj snarare än enkelhet och renhet.</p>
<p><strong>Royal Ogee</strong> är en mer utarbetad variant med djupare S-kurva och en bredare profil – den passar framförallt på tjockare skivor (40 mm) och i representativa miljöer som hotell, restauranger och exklusiva bostäder.</p>
<p><strong>Bäst för:</strong> Traditionella och formella kök. Tjockare skivor (30–40 mm). Kök i klassisk stil med ornamenterade luckor och detaljer.</p>`,
      images: [
        { src: "/edges/Ogee.JPG", alt: "Ogee kantprofil – klassisk S-formad dekorativ kant" }
      ]
    },
    {
      heading: "Miter – monolitisk laminerad kant",
      content: `<p><strong>Mitrerad kant</strong> (miter eller mitred) är en speciell profil som skapar illusionen av en mycket tjock bänkskiva. Två stycken sten kapas i 45 graders vinkel och fogas samman längs kanten, varvid den synliga kanten ger ett intryck av en massiv, solid stenbänk – ofta 60–80 mm eller mer – trots att den faktiska skivan är 20–30 mm.</p>
<p>Det är det mest monumentala och exklusiva kantutförandet och används primärt på köksöar, representativa bänkskivor och ställen där bänkskivans tjocklek är ett tydligt designuttalande. Det kräver mer material och mer precisionarbete – och priset återspeglar detta.</p>
<p><strong>Trippel laminerad bullnose</strong> kombinerar samma lamineringsteknik men med en avrundad avslutning – tre lager sten ger en rejäl, avrundad kant med stor visuell tyngd.</p>
<p><strong>Bäst för:</strong> Köksöar. Representativa bänkskivor. Projekt där tjocklek är ett designelement.</p>`,
      images: [
        { src: "/edges/Miter.JPG", alt: "Mitrerad kant – laminerad för tjock monolitisk look" },
        { src: "/edges/trippel-laminerad bullnose.JPG", alt: "Trippel laminerad bullnose – tre lager ger rejäl rundad kant" }
      ]
    },
    {
      heading: "Vilken profil ska du välja?",
      content: `<p>Det enkla svaret: välj en profil som passar din köksstil och din livsstil. Här är en snabb beslutsguide:</p>
<ul>
  <li><strong>Modernt och minimalistiskt kök</strong> → Pencil, Lättad eller Avrundad</li>
  <li><strong>Traditionellt och klassiskt kök</strong> → Fasad, Bullnose eller Ogee</li>
  <li><strong>Familj med barn</strong> → Bullnose eller Avrundad (inga vassa hörn)</li>
  <li><strong>Köksö som ska imponera</strong> → Miter eller Dubbel bullnose</li>
  <li><strong>Osäker?</strong> → Lättad kant. Den missar aldrig.</li>
</ul>
<p>Kom alltid in i vårt showroom och känn på profilerna fysiskt – det är svårt att fullt ut uppskatta skillnaden mellan profiler enbart från bilder. Vi visar gärna samtliga alternativ i de material du funderar på och hjälper dig hitta kombinationen som passar ditt kök perfekt.</p>`,
      images: []
    }
  ]
};

// ─── Merge ──────────────────────────────────────────────────────────────────
const posts = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
const idx = posts.findIndex(p => p.slug === updatedPost.slug);
if (idx === -1) {
  console.error("Post not found:", updatedPost.slug);
  process.exit(1);
}
posts[idx].sections = updatedPost.sections;
fs.writeFileSync(JSON_PATH, JSON.stringify(posts, null, 2), "utf8");
console.log("Done – kantprofiler-guide updated with", updatedPost.sections.length, "sections");
