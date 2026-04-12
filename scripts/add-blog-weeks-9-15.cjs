// Run: node scripts/add-blog-weeks-9-15.js
const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "../public/data/blog-posts.json");
const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

const CTA = "<div class='not-prose mt-4'><a href='/app' class='inline-flex px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow'>Beräkna pris →</a></div>";

const newPosts = [
  {
    slug: "sten-trender-2026",
    title: "Stentrender 2026 – vad väljer arkitekterna nu? | Marmorskivan.se",
    metaDescription: "Stentrender 2026 – de hetaste materialen och ytorna just nu. Från dramatiska svarta graniter till varma beige kvartsiter och texturerade ytor.",
    h1: "Stentrender 2026 – vad väljer arkitekterna nu?",
    heroImage: "/images/materials/Kvartsit/modern kitchen quartzite countertop.jpg",
    publishedDate: "2026-02-23",
    category: "Inspiration",
    readTime: "4 min",
    sections: [
      { heading: "Vad driver trenderna 2026?", content: "<p>Arkitekter och köksstilisterna pekar på tre starka drivkrafter i år: <strong>minimalism</strong>, <strong>naturlighet</strong> och <strong>kontrast</strong>. Köken ska vara rena men levande – och stenen spelar en nyckelroll.</p>" },
      { heading: "Beige och cream dominerar", content: "<p>Varma neutrala toner tar över från det kalla grå. Kvartsiter som <strong>Taj Mahal</strong> och <strong>Super White</strong>, travertin och ljus kalksten är heta. De passar Skandinaviens naturliga ljus perfekt och åldras vackert.</p>", images: [{ src: "/images/materials/Kvartsit/quartzite kitchen countertop luxury.jpg", alt: "Varm beige kvartsit – trend 2026" }, { src: "/images/materials/Travertin/travertine countertop in modern an luxurious kitchen.jpg", alt: "Travertin i modernt kök – naturlig ton trend 2026" }] },
      { heading: "Svart är fortfarande starkt", content: "<p><strong>Absolute Black granit</strong> och svart komposit håller ställningarna i premium-segmentet. Kombinationen svart bänkskiva + ljusa skåp i ask eller ek är en av de mest sökta köksbilderna just nu.</p>", images: [{ src: "/images/materials/Granit/granit-kitchen.jpg.jpg", alt: "Svart granitbänkskiva – klassisk kontrast" }] },
      { heading: "Texturerade ytor istället för polerat", content: "<p>Borstad (honed), läderbehandlad och sandblästrad yta tar mer plats. Polerat är fortfarande klassiskt men texturerade ytor döljer fingeravtryck bättre och ger ett organiskt uttryck som passar 2026-ars estetik.</p>" },
      { heading: "Återvunnet och hållbart", content: "<p>Återvunnet glas och terrazzo med återvunnet material är en tydlig trend bland designmedvetna kunder. Det ger en unik yta och en berättelse.</p>" + CTA },
      { heading: "Vanliga frågor", content: "<p><strong>Vad är den hetaste stenen 2026?</strong><br/>Taj Mahal kvartsit och Roman Classic Travertin toppar designstudioernas önskelistor just nu.</p><p><strong>Är polerat ute?</strong><br/>Nej – men borstad och leathered finish ökar kraftigt.</p>" }
    ]
  },
  {
    slug: "natursten-okar-fastighetsvarde",
    title: "Natursten och fastighetsvärde – vad säger mäklarna? | Marmorskivan.se",
    metaDescription: "Höjer en stenbänkskiva fastighetsvärdet? Vi tittar på vad mäklare och köpare faktiskt värderar – och vilket material ger bäst ROI.",
    h1: "Natursten och fastighetsvärde – vad säger mäklarna?",
    heroImage: "/images/materials/Marmor/marmor-bathroom.jpg",
    publishedDate: "2026-03-02",
    category: "Guide",
    readTime: "4 min",
    sections: [
      { heading: "Köpare lägger märke till köket", content: "<p>Enligt mäklare är köket det rum som starkast påverkar ett bostadsköps intryck. En stenbänkskiva i natursten signalerar kvalitet direkt – och det märks i budgivningen.</p>" },
      { heading: "Vilket material värderas högst?", content: "<p>Mäklare nämner genomgående <strong>marmor</strong> och <strong>granit</strong> som de material som skapar starkast positiv reaktion hos köpare. Kvartsit och premium-komposit upplevs också som tydliga kvalitetsmarkeringar.</p>", images: [{ src: "/images/materials/Marmor/marmor-kitchen.jpg", alt: "Marmorkök – höjer fastighetsvärdet" }, { src: "/images/materials/Granit/granit-kitchen.jpg.jpg", alt: "Granitbänkskiva – tydlig kvalitetsmarkering" }] },
      { heading: "Tidlöst slår trendigt", content: "<p>Välj material som är tidlöst snarare än trendigt. Carrara marmor, svart granit och varm kvartsit appellerar till breda köpargrupper. Extrema färgval kan alienera köpare.</p>" },
      { heading: "Badrum räknas också", content: "<p>Stenbänkskivor i badrum ger nästan lika stark effekt som i köket. Marmor i badrum upplevs som ren lyx – och det syns i prisbilden.</p>" + CTA },
      { heading: "Vanliga frågor", content: "<p><strong>Räcker det att byta bara bänkskivan?</strong><br/>Ja – ett nytt sten-topplock lyfter hela kökets känsla utan att byta skåpen.</p><p><strong>Vilket material ger bäst ROI?</strong><br/>Granit och Carrara marmor återbetalar sig bäst på bredast marknad.</p>" }
    ]
  },
  {
    slug: "boka-tid-guide-stenbutik",
    title: "Besök i stenbutik – vad du bör ta med och fråga | Marmorskivan.se",
    metaDescription: "Guide till ditt besök i en stenbutik. Vad ska du ta med? Vad ska du fråga? Så förbereder du dig för att hitta rätt material.",
    h1: "Så går ett besök i stenbutik till – vad du bör ta med",
    heroImage: "/images/materials/Marmor/marmor-factory.jpg",
    publishedDate: "2026-03-09",
    category: "Guide",
    readTime: "4 min",
    sections: [
      { heading: "Varför besöka en stenbutik?", content: "<p>Bilder på skärmen ger aldrig hela bilden. Natursten varierar platta för platta – ådring, nyans och struktur måste du se och känna på i verkligheten.</p>" },
      { heading: "Det här tar du med", content: "<ul><li><strong>Mått på ditt kök</strong> – längder, djup, L-form eller rak.</li><li><strong>Bilder på ditt kök</strong> – skåpfärg, kakel, golv.</li><li><strong>Inspiration</strong> – screenshots från Pinterest eller Instagram.</li><li><strong>Budget</strong> – ett spann räcker för att fokusera rätt.</li></ul>" },
      { heading: "De viktigaste frågorna att ställa", content: "<ul><li>Varifrån kommer stenen och hur tät är den?</li><li>Behöver den impregneras och hur ofta?</li><li>Hur hanterar den syra (citrus, vin)?</li><li>Kan jag se en hel platta?</li><li>Vilken kantprofil ingår och vad kostar alternativa?</li><li>Hur lång är leveranstiden just nu?</li></ul>", images: [{ src: "/images/materials/Kvartsit/quartzite slabs factory.jpg", alt: "Kvartsitplattor – se hela plattor innan beslut" }, { src: "/images/materials/Marmor/marmor-quarry.jpg", alt: "Natursten i olika sorter – viktigt att jämföra i verkligheten" }] },
      { heading: "Tänk på ljuset", content: "<p>Sten ser annorlunda ut i butikens belysning jämfört med ditt hem. Ta med ett litet prov hem och se det i ditt köksfönster – extra viktigt för vita och ljusa material.</p>" + CTA },
      { heading: "Vanliga frågor", content: "<p><strong>Kostar besöket något?</strong><br/>Nej – besök och rådgivning är alltid kostnadsfritt.</p><p><strong>Måste jag boka tid?</strong><br/>Boka enkelt tid för ett personligt möte – du slipper kö och vi kan förbereda relevant material.</p>" }
    ]
  },
  {
    slug: "carrara-bianco-marmor",
    title: "Carrara Bianco – världens mest kända marmor | Marmorskivan.se",
    metaDescription: "Carrara Bianco är världens mest älskade marmor. Guide till egenskaper, skötsel, sorter och vad som skiljer Carrara från Calacatta och Statuario.",
    h1: "Carrara Bianco – världens mest kända marmor",
    heroImage: "/images/materials/Marmor/marmor-hero.jpg",
    publishedDate: "2026-03-16",
    category: "Material",
    readTime: "5 min",
    sections: [
      { heading: "Vad är Carrara Bianco?", content: "<p>Carrara Bianco är en vit marmor från Carrarabergen i Toscana, Italien – den mest kända och använda marmorn i världen. Michelangelos David är hugget i Carrara. Det har formats köket och badrummet i decennier.</p>" },
      { heading: "Utseende och variation", content: "<p>Carrara Bianco har en ljusgrå till vit grundton med fina gråblå ådror. Substorter: <strong>Carrara C</strong> (vitare, finare ådror), <strong>Carrara CD</strong> (mer markant ådring), <strong>Venato</strong> (dramatiska flödande ådror). Varje platta är unik.</p>", images: [{ src: "/images/materials/Marmor/marmor-kitchen.jpg", alt: "Carrara Bianco bänkskiva i modernt kök" }, { src: "/images/materials/Marmor/marmor-bathroom.jpg", alt: "Carrara marmor i badrum – klassisk elegans" }] },
      { heading: "Skillnaden mot Calacatta och Statuario", content: "<div class='not-prose mt-2 grid sm:grid-cols-3 gap-3'><div class='border rounded-xl p-4 bg-white'><div class='font-semibold text-sm'>Carrara Bianco</div><div class='text-xs text-gray-600 mt-1'>Ljusgrå grund, fina ådror. Mest tillgänglig av de tre.</div></div><div class='border rounded-xl p-4 bg-white'><div class='font-semibold text-sm'>Calacatta</div><div class='text-xs text-gray-600 mt-1'>Vitare grund, dramatiska guld-ådror. Exklusivare.</div></div><div class='border rounded-xl p-4 bg-white'><div class='font-semibold text-sm'>Statuario</div><div class='text-xs text-gray-600 mt-1'>Ljusvit med tydliga grå ådror. Premium-prissatt.</div></div></div>" },
      { heading: "Skötsel", content: "<p>Impregnera vid installation och 1–2 gånger per år. Rengör med pH-neutralt medel. Torka upp surt spill (citrus, vin) direkt. Undvik ättika och slipmedel.</p>" + CTA },
      { heading: "Vanliga frågor", content: "<p><strong>Är Carrara Bianco lämpligt i kök?</strong><br/>Ja – med rätt skötsel. Välj tätare substort (Carrara C eller Venato) och impregnera regelbundet.</p><p><strong>Varför är Calacatta dyrare?</strong><br/>Calacatta bryts i ett begränsat område, har vitare grundfärg och mer dramatisk ådring. Sällsynthet driver priset.</p>" }
    ]
  },
  {
    slug: "carrara-regionen-italien",
    title: "Carrara-regionen i Italien – 2000 år av marmorbrytning | Marmorskivan.se",
    metaDescription: "Carrara i Toscana är världens marmorkapital. Lär dig om regionens historia, kvarteren och varför just denna plats producerar världens finaste marmor.",
    h1: "Carrara-regionen i Italien – 2000 år av marmorbrytning",
    heroImage: "/images/materials/Marmor/marmor-quarry.jpg",
    publishedDate: "2026-03-23",
    category: "Region",
    readTime: "5 min",
    sections: [
      { heading: "Världens marmorkapital", content: "<p>Carrarabergen i norra Toscana har levererat marmor i över 2000 år. Romarna byggde tempel och monument i Carrara. Michelangelo reste dit personligen för att välja block till sina skulpturer.</p>" },
      { heading: "Apuan Alps – berget som skapade marmorn", content: "<p>Apuanska alperna bildades när havsbotten av kalksten trycktes ner och omvandlades under extremt tryck och värme – ett geologiskt fenomen som skapade den täta kristallina marmorn. Vitt berg lyser mot himlen i solljuset.</p>", images: [{ src: "/images/materials/Marmor/marmor-quarry.jpg", alt: "Carrara-brotten i Apuanska alperna" }, { src: "/images/materials/Kvartsit/big quartzite quarry big machinery.jpg", alt: "Modernt stenbrott med maskiner" }] },
      { heading: "De tre kvarteren", content: "<ul><li><strong>Fantiscritti</strong> – det mest kända med de djupaste brotten. Producerar klassisk Carrara Bianco och Statuario.</li><li><strong>Miseglia</strong> – extra vit tät marmor, bl.a. Calacatta Gold.</li><li><strong>Torano</strong> – mer varierad ådring, bl.a. Arabescato.</li></ul>" },
      { heading: "Hur brytningen går till idag", content: "<p>Moderna brott använder diamanttrådssågar som skär block på 10–25 ton. Laserscanners kartlägger berget. Trots modern teknik är ungefär 60% av varje block avfall – natursten är per definition ett ineffektivt men vackert material.</p>" },
      { heading: "Carrara-marmor vs imitationer", content: "<p>Kvartskomposit och keramik i 'Carrara-look' finns på marknaden. Äkta Carrara-marmor har certifikat med ursprungsintyg. Fråga alltid din leverantör.</p>" + CTA },
      { heading: "Vanliga frågor", content: "<p><strong>Kan man besöka stenbrotten?</strong><br/>Ja – det finns guidade turer och ett marmor-museum (Museo del Marmo) i Carrara.</p><p><strong>Varför varierar Carrara så mycket?</strong><br/>Olika kvarter och djup ger olika mineralsammansättning – det är naturligt och en del av stenens karaktär.</p>" }
    ]
  },
  {
    slug: "kantprofiler-guide",
    title: "Kantprofiler för bänkskiva – alla alternativ förklarade | Marmorskivan.se",
    metaDescription: "Guide till kantprofiler för bänkskivor – rakskuren, fasad, halvrund bullnose, ogee och mitrerad kant. Se bilder och välj rätt profil för ditt kök.",
    h1: "Kantprofiler för bänkskiva – komplett guide med alla alternativ",
    heroImage: "/images/materials/Granit/granit-factory.jpg.jpg",
    publishedDate: "2026-03-30",
    category: "Guide",
    readTime: "5 min",
    sections: [
      { heading: "Varför kantprofilen spelar roll", content: "<p>Kantprofilen är det sista avtrycket av din bänkskiva – den syns varje dag och påverkar säkerhet (skarpa vs mjuka hörn) och estetik (modernt vs klassiskt). Ett val som ofta underskattas men märks i slutresultatet.</p>" },
      { heading: "Lättad (eased edge)", content: "<p>Den vanligaste profilen – en diskret rundning i överkanten. Varken helt rak eller bullnose. Praktisk och lättskött. Ingår ofta som standard.</p>", images: [{ src: "/edges/Lättad.JPG", alt: "Lättad kantprofil bänkskiva" }] },
      { heading: "Fasad (beveled edge)", content: "<p>En 45-graders fas längs överkanten. Mjukar upp kanten och ger ett snyggt avslut. Ingår ofta i standardpriset.</p><p><strong>Bäst för:</strong> Universalt val som passar de flesta stilar.</p>", images: [{ src: "/edges/fasad.jpg", alt: "Fasad 45° kantprofil" }, { src: "/edges/Bevel.JPG", alt: "Bevel kantprofil bänkskiva" }] },
      { heading: "Halvrund / Bullnose", content: "<p>Kanten rundas av till en kvarts- eller halvcirkel. Mjuk och organisk – populär i klassiska och lantliga kök. Inga skarpa hörn.</p><p><strong>Bäst för:</strong> Barnfamiljer, klassisk stil.</p>", images: [{ src: "/edges/halvrund.jpg", alt: "Halvrund kantprofil" }, { src: "/edges/Hel Bullnose.JPG", alt: "Hel bullnose kantprofil" }, { src: "/edges/avrundad.jpg", alt: "Avrundad kantprofil" }] },
      { heading: "Dubbel fas / Dubbel bullnose", content: "<p>Fasning eller rundning på både övre och undre kanten. Ger ett mer bearbetat och sofistikerat intryck.</p>", images: [{ src: "/edges/Double Bevel.JPG", alt: "Dubbel fasad kantprofil" }, { src: "/edges/Double bullnose.JPG", alt: "Dubbel bullnose kantprofil" }] },
      { heading: "Ogee – den klassiska lyxkanten", content: "<p>S-formad profil med en konkav följt av konvex kurva. Klassisk och elegant – förknippad med traditionella premium-kök. Kräver mer arbete = dyrare.</p><p><strong>Bäst för:</strong> Klassiska, formella kök.</p>", images: [{ src: "/edges/Ogee.JPG", alt: "Ogee kantprofil – klassisk S-form" }] },
      { heading: "Mitrerad kant", content: "<p>Två skivor fogas i 45° vid kanten för att skapa illusionen av en tjock massiv platta utan den faktiska vikten. Sofistikerat och rent.</p><p><strong>Bäst för:</strong> Moderna premium-kök med massiv känsla.</p>", images: [{ src: "/edges/Miter.JPG", alt: "Mitrerad kantprofil – premium look" }] },
      { heading: "Pencil och rundad", content: "<p>Pencil-kanten är en liten rundning av bara överkantens yttersta mm – subtil och modern. Rundad är ett mellanting mellan lättad och bullnose.</p>", images: [{ src: "/edges/Pencil.JPG", alt: "Pencil kantprofil" }, { src: "/edges/rundad.jpg", alt: "Rundad kantprofil" }] },
      { heading: "Vilket ingår i standardpriset?", content: "<p>Normalt ingår <strong>lättad</strong> eller <strong>fasad 45°</strong>. Profilkanter som bullnose, ogee och mitrerad är tillägg. Fråga alltid vad som ingår i offerten.</p>" + CTA },
      { heading: "Vanliga frågor", content: "<p><strong>Kan man blanda kantprofiler?</strong><br/>Ja – t.ex. bullnose på köksö och fasad på övriga bänkar. Håll dig till max 2 profiler för ett harmoniskt resultat.</p><p><strong>Vilken kant tål mest?</strong><br/>Lättad och fasad är robustast. Bullnose och ogee har mer material exponerat mot stötar.</p><p><strong>Kostar kantprofilen mycket extra?</strong><br/>Fasad/lättad ingår ofta. Bullnose och ogee kostar typiskt ett tillägg per löpmeter. Mitrerad kant är mest arbetsintensivt.</p>" }
    ]
  },
  {
    slug: "calacatta-gold-marmor",
    title: "Calacatta Gold – bland de lyxigaste marmorsorterna | Marmorskivan.se",
    metaDescription: "Calacatta Gold är en av världens mest eftertraktade marmorsorter. Guide till utseende, sorter, skötsel och vad som skiljer Calacatta från Carrara.",
    h1: "Calacatta Gold – bland de lyxigaste marmorsorterna",
    heroImage: "/images/materials/Marmor/marmor-kitchen.jpg",
    publishedDate: "2026-04-06",
    category: "Material",
    readTime: "5 min",
    sections: [
      { heading: "Vad är Calacatta Gold?", content: "<p>Calacatta Gold är en marmor från ett begränsat område i Carrara-bergen – känd för sin kritvita grundfärg och dramatiska guld- och gråbruna ådror. Ett av de mest eftertraktade och reproducerade marmorsorterna i världen.</p>" },
      { heading: "Vad skiljer Calacatta från Carrara?", content: "<div class='not-prose mt-2 grid sm:grid-cols-2 gap-4'><div class='border rounded-xl p-4 bg-white'><div class='font-semibold'>Calacatta Gold</div><ul class='text-sm text-gray-600 mt-2 space-y-1'><li>✓ Kritvit grund</li><li>✓ Dramatiska guld/gråa ådror</li><li>✓ Mer sällsynt och exklusivt</li></ul></div><div class='border rounded-xl p-4 bg-white'><div class='font-semibold'>Carrara Bianco</div><ul class='text-sm text-gray-600 mt-2 space-y-1'><li>✓ Ljusgrå-vit grund</li><li>✓ Finare, subtilare ådror</li><li>✓ Mer tillgängligt</li></ul></div></div>", images: [{ src: "/images/materials/Marmor/marmor-hero.jpg", alt: "Calacatta Gold – kritvit marmor med dramatiska ådror" }] },
      { heading: "Substorter av Calacatta", content: "<ul><li><strong>Calacatta Gold</strong> – varma guldtoner i ådrorna</li><li><strong>Calacatta Oro</strong> – ännu starkare guldton</li><li><strong>Calacatta Borghini</strong> – dramatisk med breda svarta och grå ådror</li><li><strong>Calacatta Viola</strong> – lila/rosa toner, sällsynt</li></ul>" },
      { heading: "Skötsel och egenskaper", content: "<p>Calacatta är kalksten och känslig för syra. Impregnera vid installation och 1–2 gånger per år. Torka upp surt spill direkt. Välj tätare substort för aktivt kök.</p>" },
      { heading: "Alternativ med Calacatta-look", content: "<p>Vill du ha utseendet men mer robusthet?</p><ul><li><strong>Kvartsit</strong> – Super White och Taj Mahal ser likadant ut men är hårdare</li><li><strong>Komposit</strong> – Silestone Calatta Gold, Caesarstone – icke-poröst, inget underhåll</li><li><strong>Keramik</strong> – Dekton Aura – extremt tåligt</li></ul>" + CTA },
      { heading: "Vanliga frågor", content: "<p><strong>Är Calacatta alltid äkta marmor?</strong><br/>Nej – många komposit och keramikprodukter marknadsförs som 'Calacatta' för att beskriva utseendet. Fråga om det är natursten.</p><p><strong>Passar Calacatta i kök?</strong><br/>Ja, med rätt skötsel. Välj tätare sort eller Calacatta-look i kvartsit för intensivt använda kök.</p>" }
    ]
  }
];

// Only add posts that don't already exist
const existingSlugs = new Set(data.map(p => p.slug));
let added = 0;
for (const post of newPosts) {
  if (!existingSlugs.has(post.slug)) {
    data.push(post);
    added++;
  } else {
    // Update sections if exists
    const idx = data.findIndex(p => p.slug === post.slug);
    if (idx !== -1) {
      data[idx] = { ...data[idx], ...post };
      console.log("Updated:", post.slug);
    }
  }
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log("Added", added, "new posts. Total:", data.length);
