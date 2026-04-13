// scripts/update-kantprofiler.cjs
const fs = require("fs");
const path = require("path");

const JSON_PATH = path.join(__dirname, "../public/data/blog-posts.json");

// Video helper – renders an autoplay loop video inline in HTML content
function video(file, label) {
  return `<div class="my-4">
  <video autoplay loop muted playsinline style="width:100%;max-width:640px;border-radius:8px;">
    <source src="/images/blog/${file}" type="video/mp4">
  </video>
  <p class="text-sm text-gray-500 mt-1 italic">${label}</p>
</div>`;
}

const updatedPost = {
  slug: "kantprofiler-guide",
  sections: [
    {
      heading: "Vad är en kantprofil och varför spelar den roll?",
      content: `<p>Kantprofilen är den bearbetade kanten på din naturstenbänkskiva – den synliga avslutningen längs framsidan och öppna sidor. Det är en detalj som syns varje dag och påverkar både estetik och säkerhet. Rätt profil förstärker hela kökets stil; fel profil kan verka ogenomtänkt mot ett i övrigt välplanerat kök.</p>
<p>Utöver estetiken påverkar kantprofilen <strong>säkerhet</strong> – skarpa rätvinkliga kanter är obekväma och kan vara farliga i ett kök med barn – och <strong>hållbarhet</strong> – tunna, spetsiga kanter är mer benägna att flagna vid stötar jämfört med en rundad profil.</p>
<p>Hos Marmorskivan ingår alltid en standardprofil i priset. Mer avancerade profiler tillkommer i pris. Alla profiler kan utföras i samtliga material vi arbetar med – marmor, granit, kvartsit, travertin och komposit.</p>`,
      images: [{ src: "/images/blog/edge_hero.jpg", alt: "Kantprofiler för naturstenbänkskiva – översikt" }]
    },
    {
      heading: "Pencil – minimalismens kant",
      content: `<p><strong>Pencil</strong>-profilen är den mest diskreta kantprofilen. En minimal rundning längs överkanten – ungefär som ett finger dragen lätt längs kanten – tar bort det skarpa hörnet utan att tillföra någon tydlig formgivning. Resultatet är en kant som nästan inte märks, och det är precis poängen.</p>
<p>Pencil passar utmärkt i moderna, minimalistiska kök där materialet och ytbehandlingen ska stå i fokus – inte kantens form. Enkel geometri gör den lätt att hålla ren.</p>
<p><strong>Bäst för:</strong> Moderna och minimalistiska kök. Tunnare skivor (20 mm).</p>
${video("pencil.mp4", "Pencil-profil – diskret och ren")}`,
      images: [{ src: "/edges/Pencil.JPG", alt: "Pencil kantprofil" }]
    },
    {
      heading: "Arrised – lätt fas på båda kanterna",
      content: `<p><strong>Arrised</strong>-profilen har en liten fas – ett avskuret hörn – längs både övre och undre kanten. Det ger bänkskivan en definierad, geometrisk avslutning som är lite skarpare och mer formell än lättad kant, men utan den tydliga 45-gradighetens som fasad kant har.</p>
<p>Det är ett utmärkt mellanting mellan ett rent rakt hörn och en mer utarbetad profil – elegant utan att vara påträngande.</p>
<p><strong>Bäst för:</strong> Kök som vill ha ett snyggt, lite mer formellt avslut utan att gå hela vägen till fasad profil.</p>
${video("arrised.mp4", "Arrised-profil – lätt fas på övre och undre kant")}`,
      images: []
    },
    {
      heading: "Hajnos (Sharknose) – spetsig och modern",
      content: `<p><strong>Hajnosen</strong> är en unik profil där kanten spetsas ut nedåt – överkanten är plan men underkanten vinklas in mot en punkt, likt en hajfena sedd framifrån. Det ger bänkskivan ett distinkt, modernt och lite aggressivt utseende som skiljer sig från alla andra profiler.</p>
<p>Det är ett designval som kräver att resten av köket är genomtänkt – hajnosen är en stark profil som inte passar i ett traditionellt kök. Men i rätt sammanhang, ett industriellt eller arkitektoniskt kök med tydliga designuttryck, är den enastående.</p>
<p><strong>Bäst för:</strong> Designkök med starkt arkitektoniskt uttryck. Tjockare skivor (30–40 mm).</p>
${video("sharknose.mp4", "Hajnos-profil – spetsig och distinkt")}`,
      images: []
    },
    {
      heading: "Bullnose 20 mm – den klassiska mjuka kanten",
      content: `<p><strong>Bullnose 20 mm</strong> är en av de mest klassiska och populära kantprofilerna för natursten. Kanten rundas helt – en perfekt halvbåge från överkant till underkant – och ger en mjuk, inbjudande avslutning som är bekväm att stödja sig mot och säker i ett kök med barn.</p>
<p>Det är ett tidlöst val som passar från traditionella lantliga kök till moderna badrum. Bullnose-profilen dateras inte på samma sätt som mer modenyckfulla profiler.</p>
<p><strong>Bäst för:</strong> Familjer med barn. Traditionella och lantliga kök. Badrum.</p>
${video("bullnose.mp4", "Bullnose 20 mm – klassisk rundad kant")}`,
      images: [
        { src: "/edges/halvrund.jpg", alt: "Halvrund bullnose kantprofil" },
        { src: "/edges/Hel Bullnose.JPG", alt: "Hel bullnose kantprofil" }
      ]
    },
    {
      heading: "Halv Bullnose – mjuk övre kant",
      content: `<p><strong>Halv bullnose</strong> rundar bara överkanten – underkanten förblir rak. Det ger en mjuk, vänlig avslutning uppifrån som är behaglig att ta på, men med en mer strikt underdel. Resultatet är ett mellanting mellan lättad kant och hel bullnose – mer karaktär än lättad, mer diskret än hel bullnose.</p>
<p>Profilen fungerar bra på 20 mm skivor där en hel bullnose kan verka lite stor i proportion till skivans tjocklek.</p>
<p><strong>Bäst för:</strong> Tunnare skivor. Kök som vill ha mjukhet men inte hela bullnosens rundning.</p>
${video("half_bullnose.mp4", "Halv bullnose – rundning på övre kanten")}`,
      images: [{ src: "/edges/avrundad.jpg", alt: "Halv bullnose – avrundad övre kant" }]
    },
    {
      heading: "Dubbel Bullnose – rundning på båda sidor",
      content: `<p><strong>Dubbel bullnose</strong> har en rundad båge på både övre och undre kanten. Det ger en synlig tjocklek och tyngd åt kanten – bänkskivan ser mer solid ut, mer som en tung marmorskiva av gammalt snitt. Det är en profil som kommunicerar generositet och substans.</p>
<p>Används ofta på köksöar där kanten syns från båda sidor och man vill att kanten ska vara ett tydligt designelement.</p>
<p><strong>Bäst för:</strong> Köksöar. Badrumsbänkskivor. Projekt där kantens detalj ska synas.</p>
${video("double_bullnose.mp4", "Dubbel bullnose – rundning på övre och undre kant")}`,
      images: [{ src: "/edges/Double bullnose.JPG", alt: "Dubbel bullnose kantprofil" }]
    },
    {
      heading: "Bullnose 40 mm – kraftfull rundad kant",
      content: `<p><strong>Bullnose 40 mm</strong> är hel bullnose applicerad på en tjockare skiva (40 mm) eller laminerad kant. Den större radien ger en generösare, mer monumental rundning som kommunicerar tyngd och lyx. Det är en profil som kräver en tjock skiva för att se proportionerlig ut – på en 20 mm skiva vore en 40 mm radius omöjlig.</p>
<p>Passar perfekt på laminerade köksöar eller i badrum med rejäla bänkskivor där man vill ha ett exklusivt, traditionellt uttryck.</p>
<p><strong>Bäst för:</strong> Tjocka skivor och laminerade kanter. Representativa köksöar och badrum.</p>
${video("bullnose_40.mp4", "Bullnose 40 mm – kraftfull rundning på tjock skiva")}`,
      images: [{ src: "/edges/Dubbel radie.JPG", alt: "Bullnose 40mm – stor rundad kant" }]
    },
    {
      heading: "Cove Dupont – elegant konkav profil",
      content: `<p><strong>Cove Dupont</strong> är en kombination av en konkav nedsänkning och en avslutningsmassa – profilen "scooper" in längs överkanten och avslutas med en liten konvex tupp eller platt avslut. Det ger en sofistikerad, nästan skulptural kant med rörelse och djup.</p>
<p>Det är en av de mer ovanliga profilerna och kräver mer hantverk att utföra korrekt. Rätt gjort är den enastående i ett kökssammanhang med klassisk elegans.</p>
<p><strong>Bäst för:</strong> Klassiska och formella kök. Projekt där man vill ha något utöver det vanliga utan att gå hela vägen till ogee.</p>
${video("cove_dupont.mp4", "Cove Dupont – elegant konkav kantprofil")}`,
      images: []
    },
    {
      heading: "Ogee – den dekorativa S-profilen",
      content: `<p><strong>Ogee</strong>-profilen hämtar sin inspiration från klassisk europeisk arkitektur. Den S-formade kurvan – en konkav böjning följt av en konvex – ger kanten ett tydligt tredimensionellt, dekorativt utseende som ingen annan profil matchar i utsmyckning.</p>
<p>Ogee passar i traditionella, klassiska köksinteriörer med ornamenterade luckor och detaljer. I ett minimalistiskt kök verkar den malplacerad – den tillhör ett designspråk med detalj och ornament.</p>
<p><strong>Bäst för:</strong> Traditionella och formella kök. Tjockare skivor (30–40 mm).</p>
${video("ogee.mp4", "Ogee – klassisk S-formad dekorativ kantprofil")}`,
      images: [{ src: "/edges/Ogee.JPG", alt: "Ogee kantprofil – S-formad klassisk profil" }]
    },
    {
      heading: "Mitrerad 40 mm – monolitisk laminerad kant",
      content: `<p><strong>Mitrerad kant</strong> skapar illusionen av en massivt tjock bänkskiva. Två stycken sten kapas i 45 graders vinkel och fogas längs kanten, varvid kanten ger ett intryck av 60–80 mm tjocklek – trots att skivan är 20–30 mm. Det mest monumentala och exklusiva kantutförandet.</p>
<p>Används på köksöar och representativa bänkskivor där skivans synliga tjocklek är ett designuttryck i sig. Kräver mer material och precision – och priset återspeglar det.</p>
<p><strong>Bäst för:</strong> Köksöar. Projekt där tjocklek och monumentalitet är designmålet.</p>
${video("mitred_40.mp4", "Mitrerad 40 mm – laminerad kant för monolitisk look")}`,
      images: [{ src: "/edges/Miter.JPG", alt: "Mitrerad kantprofil – laminerad 40mm" }]
    },
    {
      heading: "Mitrerad Plus 40 mm – förstärkt mitrerad profil",
      content: `<p><strong>Mitrerad Plus</strong> är en vidareutveckling av den klassiska mitrerade kanten med en extra detalj längs fogen – en liten fas, steg eller profildetalj som bryter av och ger kanten ännu mer djup och komplexitet. Det är en profil för den som vill ha miter-kantens monumentalitet men med ett extra hantverkstryck.</p>
<p>Ovanligare och mer specialbearbetad – kräver erfaret hantverk för ett bra resultat.</p>
<p><strong>Bäst för:</strong> Exklusiva projekt med höga detaljkrav. Representativa köksöar.</p>
${video("mitred_40_plus.mp4", "Mitrerad Plus 40 mm – förstärkt mitrerad kant med profildetalj")}`,
      images: [{ src: "/edges/trippel-laminerad bullnose.JPG", alt: "Avancerad laminerad kantprofil" }]
    },
    {
      heading: "Royal Ogee – den kungliga S-profilen",
      content: `<p><strong>Royal Ogee</strong> är ogee-profilens storslagna storebror. En bredare, djupare S-kurva med mer uttalad rörelse och mer visuellt utrymme ger kanten ett nästan arkitektoniskt uttryck. Det är en profil som syns och hörs – ingen missar den.</p>
<p>Royal Ogee används på tjocka skivor och laminerade kanter i de mest formella och representativa sammanhangen: hotell, restauranger, exklusiva bostäder med klassisk interiör. Det är en profil med en tydlig historia och stilkänsla.</p>
<p><strong>Bäst för:</strong> Exklusiva och formella miljöer. Tjocka och laminerade kanter. Kök med uttalad klassisk stil.</p>
${video("royal_ogee.mp4", "Royal Ogee – storslaget dekorativ S-profil")}`,
      images: []
    },
    {
      heading: "Vilken profil passar dig?",
      content: `<p>En snabb beslutsguide:</p>
<ul>
  <li><strong>Modernt och minimalistiskt</strong> → Pencil, Arrised eller Halv Bullnose</li>
  <li><strong>Klassiskt och traditionellt</strong> → Ogee, Royal Ogee eller Cove Dupont</li>
  <li><strong>Familj med barn</strong> → Bullnose 20 mm eller Dubbel Bullnose (mjuka, säkra kanter)</li>
  <li><strong>Köksö som ska imponera</strong> → Mitrerad 40 mm eller Bullnose 40 mm</li>
  <li><strong>Vill ha något unikt</strong> → Hajnos eller Mitrerad Plus</li>
  <li><strong>Osäker?</strong> → Lättad kant. Den missar aldrig.</li>
</ul>
<p>Besök gärna vårt showroom och känn på profilerna fysiskt – bilder och video ger en god bild men ingenting ersätter att hålla i den faktiska kanten. Vi visar gärna samtliga alternativ i ditt valda material och hjälper dig hitta rätt.</p>`,
      images: []
    }
  ]
};

// ─── Merge ──────────────────────────────────────────────────────────────────
const posts = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
const idx = posts.findIndex(p => p.slug === updatedPost.slug);
if (idx === -1) { console.error("Post not found"); process.exit(1); }
posts[idx].sections = updatedPost.sections;
fs.writeFileSync(JSON_PATH, JSON.stringify(posts, null, 2), "utf8");
console.log(`Done – kantprofiler-guide updated with ${updatedPost.sections.length} sections`);
