// scripts/rewrite-blog-weeks-9-52.cjs
// Rewrites blog posts weeks 9-52 with comprehensive editorial content
const fs = require("fs");
const path = require("path");

const JSON_PATH = path.join(__dirname, "../public/data/blog-posts.json");

const newPosts = [

// ─── WEEK 9 ────────────────────────────────────────────────────────────────
{
  slug: "sten-trender-2026",
  week_number: 9,
  sections: [
    {
      heading: "Arkitekturens materialval 2026",
      content: `<p>Varje år presenterar de stora köksutställningarna i Milano, Frankfurt och Dubai nya riktningar för hur vi väljer material i köket. 2026 är inget undantag – och natursten dominerar bilderna på ett sätt som inte setts sedan 1990-talets marmorrenässans. Men det är inte samma marmor som då. Det handlar om djärvare ådringar, mer dramatiska kontraster och ett nytt intresse för autentiska ytbehandlingar som låter stenen vara sten.</p>
<p>Arkitekter och inredare vittnar om en reaktion mot de senaste decenniernas vita, kliniskt rena köksytor. Det har blivit alltför sterilt. Nu vill man ha material som berättar en historia – och inget berättar en längre historia än ett block natursten som tagits ur ett berg i Centralitalien eller Anatolien.</p>`,
      images: []
    },
    {
      heading: "Ådrad marmor – dramatiken är tillbaka",
      content: `<p>Den tydligaste trenden 2026 är återkomsten av den dramatiskt ådrade marmorn. Varianter som <strong>Calacatta Viola</strong> med lila-grå ådror, <strong>Arabescato Corchia</strong> med sitt guldbruna mönster och de italienska <strong>Statuario Venato</strong>-sorterna syns i kök som vill göra ett starkare statement. Det handlar inte längre om att gömma undan stenen under vita lackerade luckor – stenen <em>är</em> designen.</p>
<p>Inredningsarkitekten Sofia Lindgren, som arbetar med exklusiva kök i Stockholm, beskriver det så här: "Kunderna ber allt oftare om bänkskivor med karaktär. De vill ha en sten som har en personlighet, som inte ser exakt likadan ut i grannens kök. Det är autenticiteten man betalar för."</p>
<p>Praktiskt sett innebär detta att köpare i allt större utsträckning väljer sina skivor direkt på lagret eller via digitala bilder av specifika block – snarare än att beställa ett standardmaterial. Varje slab är unik, och den unikheten har blivit ett säljargument i sig.</p>`,
      images: [{ src: "/images/materials/Marmor/marmor-kitchen.jpg", alt: "Dramatiskt ådrad marmorbänkskiva i modernt kök" }]
    },
    {
      heading: "Grön natursten – från nisch till mainstream",
      content: `<p>En av de mest påtagliga färgtrenderna är grönt. <strong>Azul Valverde</strong> från Portugal, <strong>Verde Guatemala</strong> och brasilianska kvartsiter i smaragdgröna toner har gått från att vara specialbeställningar till att bli aktiva val i inredningsmagasinen. Det gröna köket, med naturstensyta i olivgrönt eller klarare turkosa toner, är 2026 vad det vita köket var 2015.</p>
<p>Psykologiskt finns det en tydlig koppling till en bredare rörelse mot natur, välbefinnande och organisk design. Gröna toner upplevs lugnande och kopplas till hållbarhet, även om det naturligtvis inte automatiskt gör stenen mer miljövänlig. Det handlar mer om en visuell symbolik som resonerar med tidsandan.</p>
<p>I praktiken är grön natursten inte lättskött – många av de gröna marmorsorterna är mjukare och mer porösa än granit. Men det stoppar inte efterfrågan. Rätt impregnering och rätt skötselrutin räcker långt.</p>`,
      images: [{ src: "/images/materials/Kvartsit/modern kitchen quartzite countertop.jpg", alt: "Grön kvartsit bänkskiva – 2026 års mest efterfrågade ton" }]
    },
    {
      heading: "Ytbehandlingar: borstad och läder tar över",
      content: `<p>Polerat är inte längre det enda alternativet – och det reflekteras tydligt i beställningar från landets stenverkstäder. <strong>Läderfinish</strong> (leather/leathered) och <strong>borstade ytor</strong> (brushed) ökar kraftigt. Dessa ytbehandlingar ger stenen en matt, mer taktil karaktär som upplevs varmare och mer handgjord än det blanka spegelpolerade alternativet.</p>
<p>Läderfinish uppnås genom att man efter sågning bearbetar ytan med speciella diamantborstar som öppnar stenens porer något, slätnar ut toppar men bevarar naturliga ojämnheter. Resultatet är en yta som liknar mjukt läder att ta på – därav namnet. Fördelen är att den är mer fingeravtryckstålig än polerat och döljer repor bättre, men den kräver noggrannare impregnering eftersom ytan är mer öppen.</p>
<p>Borstade ytor är något slätare och vanliga för granit och kvartsit. De ger ett industriellt, nästan skulpturalt uttryck som passar väl med moderna köksdesigner i betong och stål.</p>`,
      images: []
    },
    {
      heading: "Storskaliga format – plattornas intåg",
      content: `<p>En teknisk trend med stor estetisk effekt är de allt större formaten. Slabs (hela naturstensplattor) som täcker en hel bänkskiva utan skarv, eller till och med väggar från golv till tak, är efterfrågade på ett nytt sätt. Det kräver andra logistiklösningar – tunga plattor på upp till 3×1,5 meter är inte enkla att frakta och montera – men resultatet är slående.</p>
<p>Sintered stone-material som <strong>Dekton</strong> och <strong>Lapitec</strong> har länge erbjudit stora format i keramiska material. Nu ser vi samma efterfrågan på äkta natursten, och stenhantverkarna investerar i utrustning för att hantera dessa mått. En bänkskiva utan en enda skarv ger ett exklusivt intryck som knappast kan imiteras av något annat material.</p>`,
      images: []
    },
    {
      heading: "Hållbarhet som trend – men vad betyder det egentligen?",
      content: `<p>Hållbarhet är ett ord som kastas runt i inredningsbranschen utan att alltid innebära något konkret. När det gäller natursten är bilden komplex. Å ena sidan bryts sten med energiintensiva maskiner, transporteras tusentals kilometer och bearbetas i fabrik. Å andra sidan är natursten ett material med extremt lång livslängd – en välskött marmorbänkskiva kan hålla i generationer, och en gammal stenbänkskiva kan i teorin huggas om och få nytt liv.</p>
<p>Jämfört med kompositmaterial, som ofta innehåller hartser och polymerer och är svåra att återvinna, har natursten ett försprång när det gäller livscykelanalys. Det faktum att sten är ett naturmaterial utan kemiska tillsatser är en egenskap som allt fler kunder värderar högt.</p>
<p>Lokalt britad sten är naturligtvis det grönaste alternativet ur transportperspektiv. Sverige har goda möjligheter med exempelvis Bohusläns granit och kalksten från Gotland – material som förtjänar mer uppmärksamhet i kök och badrum.</p>`,
      images: []
    },
    {
      heading: "Vad betyder trenderna för din bänkskiva?",
      content: `<p>Trender är alltid intressanta att följa, men den viktigaste faktorn vid val av bänkskiva är fortfarande dina egna behov, din livsstil och din personliga smak. En dramatiskt ådrad marmor ser fantastisk ut på Instagram men kräver mer omtanke och skötsel. En grön kvartsit är vacker men kan vara svår att hitta match till om du behöver komplettera i framtiden.</p>
<p>Det bästa rådet är att ta med sig trenderna som inspiration snarare än regler. Besök ett showroom, känn på materialen, be om att se helslab-bilder av just det block du funderar på. En bänkskiva är ett av kökets mest permanenta element – välj med hjälp av säljaren, ta hem prover, och lev med dem i köket ett par dagar innan du bestämmer dig.</p>`,
      images: []
    }
  ]
},

// ─── WEEK 10 ───────────────────────────────────────────────────────────────
{
  slug: "natursten-okar-fastighetsvarde",
  week_number: 10,
  sections: [
    {
      heading: "Fastighetsmäklarnas syn på natursten",
      content: `<p>Frågar du en erfaren fastighetsmäklare om vad som höjer värdet på en bostad, kommer köket konsekvent högt upp på listan. Och inom köket är bänkskivan en av de detaljer som potentiella köpare reagerar starkast på. <strong>Natursten</strong> – marmor, granit, kvartsit – är ett av de få materialval som direkt kommunicerar kvalitet utan att köparen behöver veta något om priser eller specifikationer.</p>
<p>Enligt mäklarna vi pratat med är marmor och granit fortfarande de starkaste signalerna. "Så fort jag ser en riktig stenbänkskiva i ett kök, vet jag att budgivningen kommer bli livligare," säger Annika Söderström, mäklare i Stockholmsregionen med över 15 år i branschen. "Köpare uppfattar natursten som ett tecken på att ägaren inte snålat – vilket skapar förtroende för hela objektet."</p>`,
      images: [{ src: "/images/materials/Marmor/marmor-bathroom.jpg", alt: "Natursten i badrum höjer fastighetsvärdet" }]
    },
    {
      heading: "Konkreta siffror: hur mycket höjer det priset?",
      content: `<p>Det är svårt att isolera en enskild renoveringsåtgärd och mäta dess exakta värdepåverkan – för mycket beror på var bostaden ligger, i vilket skick den är i övrigt och vilket prissegment det handlar om. Men studier från bland annat USA och Storbritannien – marknader med mer detaljerade data kring köksrenoveringar – pekar på att ett kök med naturstensdetaljer kan höja försäljningspriset med 3–7 % jämfört med ett liknande kök med laminatbänkskiva.</p>
<p>I svenska termer, för en lägenhet eller villa i mellansegmentet i en storstad, kan det handla om ett tillskott på allt från 50 000 till 200 000 kronor. Det är naturligtvis en grov uppskattning och inte ett löfte om värdeökning, men det ger en känsla för proportionerna: kostnaden för en naturstenbänkskiva är nästan alltid lägre än den potentiella värdeökningen i rätt marknadsläge.</p>`,
      images: []
    },
    {
      heading: "Vilka naturstenssorter är mest uppskattade?",
      content: `<p>Inte alla natursten är lika attraktiva ur ett fastighetsperspektiv. Rent vit Carrara-marmor är fortfarande det starkaste signalvärdet – det är ett material som alla känner igen och associerar med lyx. Dramatiskt ådrade varianter som Calacatta eller Statuario är ännu mer exklusiva men smaksatta – vissa köpare älskar dem, andra tycker att de dominerar för mycket.</p>
<p>Granit i svart eller grå ton uppfattas som mer neutralt och tidlöst. Absolut Black och liknande mörka graniter är populära just för att de är lättskötta och fungerar med de flesta köksdesigner. Kvartsit, särskilt i vita eller ljusgrå toner, växer i popularitet och ses allt oftare i nyproduktion av bättre kvalitet.</p>
<p>Undvik tveksamma materialval som exotiska toner som polariserar (knallgul onyx, för exempel) om du renoverar med försäljning i åtanke. Välj natursten som tilltalar en bred publik.</p>`,
      images: []
    },
    {
      heading: "Natursten i badrum – ett underskattat värdehöjare",
      content: `<p>Fokus på natursten hamnar ofta på köket, men glöm inte badrummet. En marmorbänkskiva i badrummet, en duschbotten i natursten eller väggtegel i travertin kommunicerar en exklusivitet som kan vara avgörande vid visning. Badrummet är en av de rum som köpare tittar allra noggrannast på, och ett badrum med naturstensdetaljer sätter en helt annan känsla än ett med keramiska plattor och laminatbänkskiva.</p>
<p>Marmor i badrum kräver mer omsorg än i köket – fuktiga miljöer ställer krav på impregnering och underhåll – men välgjort är det ett tillskott som syns och känns. En vällagd marmorgolv i ett badrum kan vara avgörande för budgivningen i rätt segment.</p>`,
      images: []
    },
    {
      heading: "Renovera med natursten inför försäljning – vad bör du tänka på?",
      content: `<p>Om du planerar att renovera med natursten inför en försäljning, finns det några tumregler värda att följa. För det första: håll dig till neutrala, tidlösa val. En vit eller ljusgrå Carrara-marmor är säkrare än en mer exotisk sten, även om den exotiska stenen kan vara vackrare och mer karaktärsfull.</p>
<p>För det andra: kvalitet i utförandet är minst lika viktigt som kvalitet i materialet. En fin marmorskiva dåligt monterad, med ojämna fogar eller felaktigt silikon, ser billigare ut än ett välmonterat laminat. Anlita ett certifierat stenföretag och kräv att se referensbilder.</p>
<p>För det tredje: tänk på köket som helhet. En lyxig bänkskiva i ett kök med slitna luckor och gammal kakel skapar en dissonans som kan ge ett negativt intryck snarare än ett positivt. Balansen i hela köket är viktig.</p>`,
      images: []
    },
    {
      heading: "Långsiktig investering snarare än quick fix",
      content: `<p>Den kanske viktigaste insikten är att natursten inte är en quick fix – det är en långsiktig investering i livskvalitet och, i förlängningen, i fastighetens värde. En välvald stenbänkskiva håller i decennier, åldras vackert och kräver inte byte. Det är ett fundamentalt annorlunda resonemang jämfört med att byta ett laminat vart tionde år.</p>
<p>Oavsett om du planerar att sälja snart eller bor i din bostad i 30 år till är natursten en investering som du sannolikt inte ångrar. Det är ett av kökets mest permanenta och mest värdebeständiga detaljer – och det märks varje gång du lagar mat, sätter ner en kopp kaffe eller tar emot gäster i ditt hem.</p>`,
      images: []
    }
  ]
},

// ─── WEEK 11 ───────────────────────────────────────────────────────────────
{
  slug: "boka-tid-guide-stenbutik",
  week_number: 11,
  sections: [
    {
      heading: "Varför ett showroombesök är ovärderligt",
      content: `<p>Det finns en gräns för vad bilder – hur professionella de än är – kan förmedla om natursten. Ådring, djup, ytstruktur, vikt, kylan mot handen – allt detta måste upplevas direkt. Därför är ett besök i ett stenverkstad eller showroom ett av de viktigaste stegen i köpprocessen, oavsett om du planerar en total köksrenovering eller bara ska byta ut bänkskivan.</p>
<p>Stenverkstäder är produktionsmiljöer, inte butiker i traditionell mening. De flesta välkomnar besökare efter tidsbokning, och en bra säljare/rådgivare kan på en timme ge dig mer kunskap om materialet du funderar på än vad du kan läsa dig till på en vecka. Det handlar om att se, känna och förstå – och om att ställa rätt frågor.</p>`,
      images: [{ src: "/images/materials/Marmor/marmor-factory.jpg", alt: "Stenverkstad med naturstensplattor i lager" }]
    },
    {
      heading: "Boka i förväg – och berätta vad du vill",
      content: `<p>De flesta stenverkstäder och showrooms tar emot besök på bokad tid. Promenera inte in utan att ha ringt i förväg – produktionsmiljöer kräver att rätt person finns tillgänglig för att guida dig, och utan förvarning riskerar du att inte bli mottagen alls. En enkel bokning per telefon eller via hemsida räcker.</p>
<p>Berätta redan i förväg vad du funderar på. "Jag letar efter en bänkskiva till ett kök, ca 3 löpmeter, i vit eller ljusgrå sten" ger verkstadens rådgivare chansen att förbereda relevanta material, hämta fram aktuella slabs ur lagret och räkna ut en preliminär uppskattning. Det sparar tid för er båda och gör besöket mer givande.</p>`,
      images: []
    },
    {
      heading: "Ta med kökets mått – och gärna foton",
      content: `<p>Inför besöket: mät upp ditt kök noggrant. Du behöver löpmetermått på bänkskivans framsida, djup (vanligtvis 60 cm), placering av diskho och eventuella hällar, och eventuella specialformer som L-vinklar eller kurvor. Ju mer specifik du kan vara, desto bättre kan verkstaden hjälpa dig.</p>
<p>Ta även med foton av köket – helst inifrån vid dagsljus. Foton av befintliga luckor, väggar, golv och eventuell kakel hjälper rådgivaren att förstå vilket material som passar. En sten som ser perfekt ut i showroomets ljussättning kan se fel ut i ett kök med mörkgröna luckor eller ljusgrå betongväggar. Kontextbilder är ovärderliga.</p>`,
      images: []
    },
    {
      heading: "Förstå vad du ser: slab vs prover",
      content: `<p>När du besöker ett stenverkstad kommer du att se <strong>slabs</strong> – stora, osågade plattor av natursten, ofta 2×3 meter eller mer. Det är dessa block din bänkskiva kommer att skäras ur. Att välja sten från en liten köksbit (ett prov) är en sak; att se hela slaben är en annan, helt nödvändig upplevelse.</p>
<p>Natursten varierar enormt inom samma sort. Två Carrara-block kan se dramatiskt olika ut – den ena lätt och luftig med tunna grå ådror, den andra mörkare med grövre mönster. Be alltid att få se den faktiska slab din bänkskiva ska skäras ur, inte bara ett provmaterial. Fråga om det finns flera tillgängliga block av samma sort, och om du kan se bilderna på samtliga.</p>
<p>Bra stenföretag kan också visa digitala bilder av hela sin slablager om lagerstorleken gör det svårt att fysiskt visa alla. Utnyttja den möjligheten.</p>`,
      images: []
    },
    {
      heading: "Frågor du bör ställa under besöket",
      content: `<p>Ha en lista med frågor redo. Här är de viktigaste:</p>
<ul>
  <li><strong>Varifrån kommer stenen?</strong> – Ursprung påverkar kvalitet, pris och hållbarhet.</li>
  <li><strong>Behöver stenen impregneras?</strong> – Och hur ofta? Vilka produkter rekommenderas?</li>
  <li><strong>Vilken tjocklek rekommenderas för mitt kök?</strong> – 20 mm, 30 mm eller mer?</li>
  <li><strong>Vilka kantprofiler kan ni göra?</strong> – Be att se prover på rakskuren, fasad, bullnose och eventuella specialprofiler.</li>
  <li><strong>Hur lång leveranstid har ni?</strong> – Många verkstäder har 2–4 veckor efter mätning.</li>
  <li><strong>Ingår håltagning för diskho och häll?</strong> – Och vad kostar det?</li>
  <li><strong>Vad händer om stenen spricker?</strong> – Finns garanti? Hur hanteras reklamationer?</li>
</ul>
<p>En rådgivare som svarar utförligt och ärligt på dessa frågor är ett gott tecken. Var skeptisk mot företag som inte vill diskutera skötselkrav eller begränsningar.</p>`,
      images: []
    },
    {
      heading: "Efter besöket: ta hem prover",
      content: `<p>Be alltid om att få ta med ett stenprover hem. Bra verkstäder erbjuder detta gratis eller mot en liten summa som återbetalas vid beställning. Proverna låter dig se hur stenen ser ut i just ditt köks ljus – dagsljus, köksbelysning, kvällsbelysning – och bredvid dina faktiska luckor och väggar.</p>
<p>Lev med provet i köket ett par dagar. Ändrar du uppfattning? Ser stenen bra ut från alla håll, i alla ljus? Är det ett material du tror att du orkar sköta rätt under många år framöver? Den information du samlar under dessa dagar är ovärderlig och kan spara dig från en dyr besvikelse.</p>`,
      images: []
    }
  ]
},

// ─── WEEK 12 ───────────────────────────────────────────────────────────────
{
  slug: "carrara-bianco-marmor",
  week_number: 12,
  sections: [
    {
      heading: "Världens mest kända marmor – en introduktion",
      content: `<p><strong>Carrara Bianco</strong> är förmodligen det mest igenkännbara stennamnet i världen. Nämnde du "Carrara" för en okunnig person, ler de ändå igenkännande. Det är den vita marmorn. Den som Michelangelo använde till David och Pietà. Den som pryder pelarna på romartida tempel. Den som idag, 2000 år senare, fortfarande brutits ur samma berg i Toscana och skeppas till kök och badrum världen över.</p>
<p>Men "Carrara Bianco" är inte ett enda material – det är ett samlingsnamn för ett brett spektrum av vita till ljusgrå marmorer som bryts i de Apuanska alperna nära staden Carrara i norra Toscana. Variationerna är enorma, och priset varierar därefter. Att förstå vad som skiljer en billigare Carrara från en mer exklusiv variant är nyckeln till ett bra materialval.</p>`,
      images: [{ src: "/images/materials/Marmor/marmor-hero.jpg", alt: "Carrara Bianco marmor – vit och elegant" }]
    },
    {
      heading: "Geologi: varför är Carrara-marmorn vit?",
      content: `<p>Carrara-marmorn bildades för ungefär 200 miljoner år sedan när sedimentärt kalkstenlager på havsbotten utsattes för extrem värme och tryck vid de Apuanska alpernas uppfällning. Under denna metamorfos omkristalliserades kalciumkarbonaten till grovkristallint kalcit – den vita, glänsande substansen som ger marmorn dess karakteristiska utseende.</p>
<p>Det vita färgas av halten järnoxid och andra mineralinblandningar. Ren kalcityta är kritvit; gråa ådror bildas av grafit och lerskiffer som fångades in under metamorfosen; grönaktiga toner kan komma från klorit. Den klassiska Carrara Bianco C – den populäraste och mest exporterade varianten – är ljust cremevit med diskreta grå ådror i ett fint, regelbundet mönster.</p>
<p>Bergsmassivets topografi påverkar också kvaliteten. Sten bruten djupare in i berget, under stabila geologiska förhållanden, tenderar att ha jämnare färg och färre sprickor än sten från ytlagren. Därför varierar kvaliteten markant mellan olika brott.</p>`,
      images: []
    },
    {
      heading: "Sorter och kvaliteter av Carrara Bianco",
      content: `<p>De vanligaste Carrara-sorterna du stöter på hos svenska stenimportörer:</p>
<ul>
  <li><strong>Carrara Bianco C (CD)</strong> – Standardvarianten. Kremlvit bakgrund med grå ådror i regelbundet mönster. Mycket vanlig, utbud är gott och priser varierar beroende på blockens jämnhet och porositet.</li>
  <li><strong>Carrara Venatino</strong> – "Liten åder" på italienska. Tunnare, mer diskreta ådror, ofta lite vitare bakgrund. Mer subtil än Bianco C, ofta använd i badrum och enklare projekt.</li>
  <li><strong>Carrara Statuario</strong> – Steg upp. Kritvit bakgrund med mer dramatiska, breda ådror i grå och gulgrå. Ovanligare, dyrare, och mer karaktersfull. Ofta förväxlad med Calacatta.</li>
  <li><strong>Carrara Arabescato</strong> – Komplex ådring i dramatiska mönster med bruna och guldiga inslag. Varierar enormt block för block.</li>
</ul>
<p>Att "köpa Carrara" säger relativt lite om vad du faktiskt får. Fråga alltid om den specifika varianten och be att få se helslab-bilder.</p>`,
      images: []
    },
    {
      heading: "Skötsel och impregnering – vad som krävs",
      content: `<p>Carrara-marmor är ett kalcitbaserat material, vilket innebär att det reagerar kemiskt med syror. Citronsaft, tomatsas, vin, kaffefläckar – allt detta kan etsa ytan om de inte torkas upp omedelbart. Det är en viktig egenskap att vara medveten om, och den avskräcker inte sällan potentiella köpare.</p>
<p>Men det etsiga är inte oöverstigligt. Med rätt hantering – en impregneringsbehandling vid installation och sedan var 1-2 år beroende på användning, och snabb torkning av spill – håller Carrara-marmorn utan dramatisk nedgång. Och det som kallas "patinan" – de grå fläckar och mjuka mattning som utvecklas över tid – ses av många som en del av materialets charm. Det är ett levande material.</p>
<p>Välj ett stenimpregnerbara medel med Fluoropolymer-bas (t.ex. Lithofin MN Fleckstop eller Fila Surface Care) som penetrerar ytan och bildar ett skyddsskikt i stenens porer, utan att påverka utseendet.</p>`,
      images: []
    },
    {
      heading: "Carrara vs Calacatta – en vanlig förväxling",
      content: `<p>En av de vanligaste förväxlingarna i stenbranschen är den mellan Carrara och Calacatta. Båda är vita marmorer från Carrarabergen, men de skiljer sig väsentligt åt:</p>
<ul>
  <li><strong>Bakgrundsfärg</strong>: Carrara är ofta cremevit eller ljusgrå; Calacatta är renare, kritvit.</li>
  <li><strong>Ådring</strong>: Carrara har diskretare, tätare ådror; Calacatta har dramatiska, fristående breda ådror med guldinslag.</li>
  <li><strong>Sällsynthet</strong>: Calacatta bryts i ett mer begränsat område och är signifikant dyrare.</li>
  <li><strong>Karaktär</strong>: Carrara är elegant och klassisk; Calacatta är dramatisk och lyxig.</li>
</ul>
<p>I praktiken ser de flesta inte skillnaden på ett fotografi, men bredvid varandra är skillnaden uppenbar. Fråga alltid säljaren att bekräfta exakt sort.</p>`,
      images: [{ src: "/images/materials/Marmor/marmor-kitchen.jpg", alt: "Carrara i modernt kök – klassisk elegans" }]
    },
    {
      heading: "Att köpa Carrara – vad du bör veta",
      content: `<p>Carrara är ett av de mest tillgängliga naturstenmaterialen i Sverige – det importeras av de flesta stenföretag och finns i de flesta prissegment. Det gör det enkelt att köpa, men också lätt att köpa fel.</p>
<p>Titta noga på blockens jämnhet och porositet. En Carrara-slab med synliga sprickor eller gulnade partier bör prissättas lägre. En jämn, ren slab med fint ådermönster är det du betalar premium för. Ta alltid hem ett prov och placera det i det aktuella ljuset innan du beslutar.</p>
<p>Tjocklek är också en faktor. 20 mm är standardmått för bänkskivor och fungerar utmärkt med underliggande stomme. 30 mm ger ett tyngre, mer exklusivt intryck och rekommenderas för köksöar eller representativa ytor. Tjockare sten är dyrare men spricker inte lika lätt.</p>`,
      images: []
    }
  ]
},

// ─── WEEK 13 ───────────────────────────────────────────────────────────────
{
  slug: "carrara-regionen-italien",
  week_number: 13,
  sections: [
    {
      heading: "2000 år av marmorbrytning",
      content: `<p>Carrara är en liten stad i norra Toscana, inkilad mellan Liguriska havet och de Apuanska alperna. Men stadens ryktbarhet sträcker sig långt utanför Italiens gränser – Carraras marmor finns i några av världens mest kända byggnadsverk, konstverk och monument, och har så gjort i över 2000 år.</p>
<p>De första dokumenterade uttagen av Carrara-marmor skedde under romartiden, troligen under Julius Caesars era kring 50 f.Kr. Romarna använde stenen till skulpturer, tempel och offentliga monument. När imperiet föll och marmorbrytningen minskade, återupptogs den under renässansen – och det var Michelangelo som personligen reste till Carrara för att välja de block han skulle omvandla till David och Pietà.</p>`,
      images: [{ src: "/images/materials/Marmor/marmor-quarry.jpg", alt: "Marmorbrott i Carrara-regionen, Toscana" }]
    },
    {
      heading: "Geografi och geologi – varför just här?",
      content: `<p>De Apuanska alperna är en unik geologisk formation. Bergsmassivets primärbergart är kalksten som under trycket av den alpina orogenesen – den bergsbildningsprocess som skapade Alperna – utsattes för sådan värme och sådant tryck att den metamorfoserades till kalcitisk marmor. Det är inte vilken marmor som helst: renheten i kalcit, kombinerat med bergets specifika sprickstruktur och lagringsförhållanden, producerar en sten med unik vitkvalitet.</p>
<p>De viktigaste brotten ligger i tre dalar: Toranodalen, Colannadalen och Fantiscrittidalen. Varje dal producerar marmor med något olika karaktär – Torano är känt för sin kritvita kulör, Colonnata för lite mer strukturerade ådror. Brotten sträcker sig upp till 1200 meters höjd, och det finns mer marmor kvar i berget än vad som brutits under 2000 år – uppskattningsvis 700 miljoner ton.</p>`,
      images: []
    },
    {
      heading: "Arbetet i brottet – hur marmorn utvinns",
      content: `<p>Att bryta marmor i Carrara är en kombination av industriell storskalighet och hantverksmässig precision. Moderna brott använder diamanttrådssågar som skär igenom berget med millimeterprecision, vattenkylda för att motverka friktion. En enda sågning av ett block kan ta timmar – ett medelstort block väger 20–25 ton.</p>
<p>Block lyfts ut ur berget med kranar och lastbilstransporteras ned till brottsverkstäder i dalen där de slipad till slabs (plattor), vanligtvis 2–3 cm tjocka. Dessa slabs poleras, klassas och paketeras för transport till kunder världen över.</p>
<p>Industrin sysselsätter ca 3 000 direkt anställda i Carrara-regionen, plus tusentals ytterligare i förädlings- och distributionstjänster. Marmorindustrin är stadens primära näring och har formats av generationer av stenkunnande familjer. Det sägs att en Carrarabon kan avgöra kvaliteten på ett block bara genom att slå på det med handflatan och lyssna på klangen.</p>`,
      images: []
    },
    {
      heading: "Miljöfrågan: är marmorbrytning hållbar?",
      content: `<p>Marmorbrytningen i Carrara är föremål för en pågående debatt om miljökonsekvenser. Brottsverksamheten skapar "marmorslam" – ett fint vitt damm av kalcitpartiklar blandat med vatten som länge dumpades direkt i floder och hav, med allvarliga ekologiska konsekvenser för det marina livet utanför kusten.</p>
<p>Idag är reglerna striktare. Marmorslammet uppsamlas och används i industrier som papperstillverkning, kosmetika och tandkräm (kalciumkarbonat är ett vanligt tillsatsämne). Men kritiker menar att industrin fortfarande inte gör nog för att återställa markområden efter avslutad brytning.</p>
<p>Från konsumentens perspektiv är det viktigt att välja material från leverantörer som kan certifiera sin verksamhet och spåra ursprunget. Certifieringssystem som <strong>IIISF (Italian Marble Institute)</strong> och oberoende revisionsprocedurer ger viss garanti för ansvarsfull hantering.</p>`,
      images: []
    },
    {
      heading: "Carrara som turistmål",
      content: `<p>Utöver industrin är Carrara ett fascinerande turistmål. De vita brotten syns från mil bort – de vita bergstopparna som tidigare förväxlades med snö av sjöfarare är nu ett av Toscanakustens karakteristiska landmärken. Brottsguidade turer erbjuds av flera lokala operatörer och är populära bland besökare som vill förstå hur marmorn faktiskt bryts.</p>
<p>Stadens egna museum – <strong>Museo Civico del Marmo</strong> – erbjuder en komplett genomgång av marmorindustrins historia, från romerska verktyg till moderna diamanttrådar. I stadsmiljön hittar du skulpturer och installationer av lokal och internationell konst – Carrara är hem för en av Italiens viktigaste skulptörskolorna.</p>
<p>En resa till Carrara är för den steinintresserade husägaren mer än turism – det är en inblick i ett material som annars kan verka abstrakt på ett provbord i ett showroom.</p>`,
      images: []
    },
    {
      heading: "Från Carrara till ditt kök – distributionskedjan",
      content: `<p>En Carrara-slab går en lång väg från berget till din köksbänk. Efter brytning och sågning säljs slabs vanligtvis via italienska marmorhandlare som konsoliderar leveranser och exporterar containrar med blandade sorter. I Sverige tar steniimportörer emot containern, inspekterar slabs och lagrar dem i egna lager. Stenverkstaden köper sedan slabs från importören, slipar och monterar dem hos kunden.</p>
<p>Hela kedjan innebär att material kan ligga i lager månader – ibland år – innan det når slutkunden. Det är viktigt att kontrollera att din stenverkstad kan visa den faktiska slaben du beställer, inte bara ett sortiment av prover. Digital slab-visning (bilder av hela slabs) är nu vanligt hos moderna leverantörer och eliminerar risken för oväntade variationer.</p>`,
      images: []
    }
  ]
},

// ─── WEEK 15 ───────────────────────────────────────────────────────────────
{
  slug: "calacatta-gold-marmor",
  week_number: 15,
  sections: [
    {
      heading: "Den lyxigaste marmorn från Carrara-bergen",
      content: `<p><strong>Calacatta Gold</strong> är ett namn som väcker reaktioner i köks- och inredningsbranschen. Det är inte ett vanligt material – det är ett signum. En Calacatta Gold bänkskiva kommunicerar omedelbart exklusivitet till alla som kan materialet, och den kritvita bakgrunden med dramatiska guldbruna ådror är nästan omöjlig att förväxla med något annat.</p>
<p>Calacatta bryts i ett begränsat område i Carrara-bergen och representerar en bråkdel av den totala marmorproduktionen. Kombinationen av kritvit bakgrundsfärg, tjocka dramatiska ådror och de distinkta guldinnslagen i ådringen är unik för detta brytsområde. Det är detta sällsynthet, kombinerat med den visuella dramatiken, som driver priset.</p>`,
      images: [{ src: "/images/materials/Marmor/marmor-kitchen.jpg", alt: "Calacatta Gold marmor i exklusivt kök" }]
    },
    {
      heading: "Vad skiljer Calacatta från Carrara?",
      content: `<p>Denna fråga ställs nästan dagligen i stenbutiker, och svaret är viktigare än man kanske tror. Båda är vita marmorer från Carrara, men skillnaderna är väsentliga:</p>
<p><strong>Bakgrundsfärg:</strong> Carrara Bianco har en cream- eller ljusgrå ton. Calacatta är renare, nästan kritvit – ibland med en subtil gräddnyans som upplevs varmare än Carraras gråare bas.</p>
<p><strong>Ådring:</strong> Carraras ådror är generellt tunna och relativt täta, spridda jämnt över ytan. Calacattas ådror är dramatiska, breda och fristående – de skapar ett abstrakt konstverk på ytan snarare än ett diskret mönster.</p>
<p><strong>Guldinslag:</strong> Calacatta Gold specifikt har oxiderade järninslag som ger ådringen guldbrun till bärnstensfärgad ton. Det är detta som ger materialet dess distinkta karaktär och dess namn.</p>
<p><strong>Sällsynthet och pris:</strong> Calacatta är signifikant dyrare. Prisskillnaden kan vara tre till fem gånger det för standard Carrara, och verklig Calacatta Gold av högsta kvalitet är ytterligare ett steg upp.</p>`,
      images: []
    },
    {
      heading: "Varianter av Calacatta",
      content: `<p>Inom Calacatta-familjen finns också variation. De viktigaste att känna till:</p>
<ul>
  <li><strong>Calacatta Gold Extra</strong> – Den renaste kvaliteten: perfekt kritvit bakgrund med maximalt dramatiska guldådror. Ovanlig och dyr.</li>
  <li><strong>Calacatta Oro</strong> – "Oro" är guld på italienska; liknar Gold men med än mer uttalade guldinslag och ibland lite kräml bakgrund.</li>
  <li><strong>Calacatta Borghini</strong> – Specifikt brott, känt för exceptionellt dramatisk ådring med guldvarmna toner.</li>
  <li><strong>Calacatta Lincoln</strong> – Lätt blågrå nyans i bakgrunden, annorlunda karaktär.</li>
  <li><strong>Calacatta Viola</strong> – Mer ovanlig, med lila till violett ton i ådringen.</li>
</ul>
<p>Det är viktigt att fråga exakt variant. "Calacatta" som samlingsnamn kan inkludera stora kvalitetsvariationer.</p>`,
      images: []
    },
    {
      heading: "Skötsel och praktisk hantering",
      content: `<p>Som alla kalksteinsbaserade material är Calacatta känslig för syror och repor. Etning från citrus, vin, tomater och kaffee är den vanligaste källan till fläckar och missfärgning. Den kritvita bakgrunden i Calacatta är också mer utsatt än grå Carrara – fläckar syns tydligare mot en vit yta.</p>
<p>Det innebär att Calacatta kräver mer uppmärksamhet än många andra material. Snabb avtorkning av spill är absolut nödvändigt. Regelbunden impregnering (en till två gånger per år för aktiva kök) är ett måste. Och det hjälper att ha en realistisk förväntan: med intensiv användning kommer Calacatta att patinera – ytan mjuknar, ådringen fördjupas, små märken uppstår. För de flesta entusiaster är detta en del av materialets charm.</p>
<p>Väljer du Calacatta till ett kök med intensiv matlagning och barn, var beredd på underhåll. Väljer du det till ett representativt kök med måttlig användning, är det ett material med oemotståndligt utseende i decennier.</p>`,
      images: []
    },
    {
      heading: "Calacatta i inredning – designmöjligheter",
      content: `<p>Calacatta Golds starka visuella röst innebär att designen runt den måste vara genomtänkt. Kombineras den med allt för mycket ytterligare detaljer, ornament och mönster riskerar köket att bli överfyllt. Den vanligaste – och mest framgångsrika – lösningen är att låta Calacattan vara stjärnan: rena, vita eller naturfärgade skåpluckor, diskret beslag, enkla kran och diskho. Sten är detaljen.</p>
<p>Den varmt guldiga tonen i ådringen fungerar utmärkt med varma träsorter – valnöt, ek i naturton – och med koppar- och bronsinslag i belysning och beslag. Kontrast mot kolsvart (Black woodwork, mörk häll) är en annan stark designlösning som accentuerar den vita bakgrunden.</p>
<p>I badrum fungerar Calacatta utmärkt som enskild element: en badrumsbänk, en spegelpanel bakom handfat, eller ett stuckaturliknande stänkskydd ovan bänkskivan. Undvik att använda Calacatta till stora golv – det är dyrt och onödigt; enklare material kan göra jobbet lika bra.</p>`,
      images: []
    },
    {
      heading: "Investering och autenticitet",
      content: `<p>Med Calacattas höga status och pris följer tyvärr också ett problem med förfalskningar och felaktig märkning. Billigare varianter av vit marmor säljs ibland som "Calacatta" utan att uppfylla de geologiska eller estetiska kriterier som motiverar namnet. Det är ett köparproblem som kräver vaksamhet.</p>
<p>Råd: köp alltid från en etablerad och transparent aktör som kan ge ursprungsgaranti och som kan visa certifieringsdokumentation (bl.a. EU-standard 12058 för natursten är relevant). Be att se den faktiska slaben, inte bara ett prov. Om priset verkar orealistiskt lågt för "äkta Calacatta Gold Extra", bör du ställa frågor.</p>
<p>En äkta Calacatta Gold är värd investeringen – det är ett material med äkta sällsynthet, estetisk kraft och varaktighet som inga imitationer kan matcha. Men äktheten måste verifieras i köpet.</p>`,
      images: []
    }
  ]
},

// ─── WEEK 16 ───────────────────────────────────────────────────────────────
{
  slug: "portugal-alentejo-marmor",
  week_number: 16,
  sections: [
    {
      heading: "Europas hemliga marmorregion",
      content: `<p>När folk tänker på marmorbrytning i Europa tänker de på Carrara. Men i Sydportugal, i den soliga och vidsträckta Alentejo-regionen, ligger ett marmorbrott av formidabla dimensioner – ett av de största i hela världen. <strong>Borba-Estremoz-Vicente Lagares-triangeln</strong>, som den kallas på fackspråk, producerar marmor av enastående kvalitet som under decennier skeppats till kunder i Europa, Nordamerika och Asien.</p>
<p>Alentejo-marmorn skiljer sig i karaktär från den italienska. Bakgrundsfärgen varierar från kremlvit till rosé och ljust beige. Ådringen är mer diskret, jämnare och mer oregelbunden – inte lika dramatisk som den bästa Calacattan, men elegant i sin lågmälda skandinaviska estetik. Det är en sten som inte skriker, men som åldras med stor värdighet.</p>`,
      images: [{ src: "/images/materials/Marmor/marmor-quarry.jpg", alt: "Marmorbrott i Alentejo, Portugal" }]
    },
    {
      heading: "Geologi och marmorsorter i Alentejo",
      content: `<p>Alentejo-marmorns geologi är lik Carraras – kalksten som metamorfoserats under det hercyniska orogeneset för ca 300 miljoner år sedan. Men den kemiska sammansättningen och mineralinblandningarna skiljer sig. Rosé-tonerna i Estremoz-marmorn beror på manganrikt material inblandat under kristallisationen; kräm-gula toner i Borba-varianten från järnrik dolomit.</p>
<p>De viktigaste sorterna:</p>
<ul>
  <li><strong>Estremoz Rosado</strong> – Vackert rosa-beige med vita kristallpunkter. Unik rosé-ton som inte finns i italiensk marmor.</li>
  <li><strong>Branco Estremoz</strong> – Vit till kräm, med diskreta gråa ådror. Jämn och lättarbetad.</li>
  <li><strong>Borba Claro</strong> – Ljust beige med varma guld-beige toner. Populärt alternativ till dyrare italiensk kremlvit.</li>
  <li><strong>Azul Valverde</strong> – Tekniskt sett kvartsit snarare än marmor, men bryts i samma region. Unik grön-blå ton. Se separat artikel vecka 26.</li>
</ul>`,
      images: []
    },
    {
      heading: "Alentejo marmor i kök och badrum – praktisk guide",
      content: `<p>Som kalksteinsbaserat material delar Alentejo-marmorn Carraras begränsningar: känslig för syror, kräver impregnering, patinerar med användning. Men Estremoz Rosado och Branco Estremoz är generellt lite tätare och mer kristallina än standard Carrara, vilket ger dem ett försprång i syrabelastning.</p>
<p>Designmässigt är den rosé-beige tonen i Estremoz unik. Den kombineras naturligt med varma trätoner (ek, hickory), kopparskogar och terrakottafärger. För ett kök med en mer skandinavisk, varm estetik – som ett alternativ till det kylare vita hos Carrara – är Estremoz ett utmärkt val som ofta är mer prisvärt.</p>`,
      images: []
    },
    {
      heading: "Portugal som stenleverantör",
      content: `<p>Portugal är Europas femte största producent av natursten och Alentejo-regionen svarar för huvuddelen av produktionen. Industrin är professionell och välorganiserad, med ett antal stora internationella aktörer som Rogertir, Marmetal och Gramazini som exporterar globalt med dokumenterade ursprungsgarantier.</p>
<p>Ur ett transportperspektiv är Portugal närmre Sverige än Italien – kortare transportvägar betyder lägre koldioxidavtryck och ofta snabbare leveranstider. Det är ett argument för den klimatmedvetna köparen som vill ha äkta natursten utan de längsta möjliga transportlederna.</p>`,
      images: []
    },
    {
      heading: "Jämförelse: Alentejo vs Carrara – vad väljer du?",
      content: `<p>Den klassiska frågan vid val av vit/ljus marmor. Sammanfattning av nyckelskillnader:</p>
<ul>
  <li><strong>Bakgrundsfärg:</strong> Carrara Bianco är grå-vit; Alentejo Estremoz är kräm till rosé-vit.</li>
  <li><strong>Ådring:</strong> Carrara har mer distinkt, definierad ådring; Alentejo är jämnare och mer subtil.</li>
  <li><strong>Dramatik:</strong> Carrara ger ett starkare statement; Alentejo är mer lågmält och tidlöst.</li>
  <li><strong>Pris:</strong> Likvärdiga segment; Alentejo kan ibland vara prisvärt för liknande kvalitetsnivå.</li>
  <li><strong>Tillgänglighet i Sverige:</strong> Carrara är mer utbrett; Alentejo-sortiment finns men kräver sökning.</li>
</ul>
<p>Inget är objektivt bättre – det handlar om din estetik och ditt kök. Be stenverkstaden visa prover av båda bredvid varandra.</p>`,
      images: []
    },
    {
      heading: "Besöka Alentejo-regionen",
      content: `<p>Alentejo är en av Portugals vackraste och mest besöksvärda regioner – men i en annan skala än Toscana. Städerna Estremoz och Borba är klassiska portugisiska städer med medeltida slott, belysning i vit kalksten och det lugna tempot som karakteriserar regionen. Marmorbrotten är inte alltid tillgängliga för allmänheten, men lokala guider erbjuder visningar och Estremoz museum för regional historia (och marmorindustri) är väl värt ett besök.</p>
<p>En resa till Alentejo kombineras naturligtvis utmärkt med besök i Évora (UNESCO världsarv), Alqueva-sjöns naturlandskap och regionens kända gastronomiska tradition med ekollon-baserad charkuteri och lokalt vin.</p>`,
      images: []
    }
  ]
},

// ─── WEEK 17 ───────────────────────────────────────────────────────────────
{
  slug: "eurocucina-milan-massa",
  week_number: 17,
  sections: [
    {
      heading: "Världens viktigaste köksutställning",
      content: `<p><strong>Eurocucina</strong> är en biennial utställning som hålls i Milano i april under Salone del Mobile – världens mest inflytelserika möbel- och inredningsutställning. Vartannat år reserveras en del av den väldiga Fiera Milano-mässan specifikt för köket, och Eurocucina är branschens de facto-normerare för vad som händer med köksdesign och material de kommande två åren.</p>
<p>Europeiska och internationella köks- och materialtillverkare presenterar nya kollektioner, material och designkoncept. Arkitekter, inredningsdesigners och journalister flödar till Milano från hela världen för att se vad som är på gång. Mässan präglar vad som sedan dyker upp i showroom, tidningar och slutligen i konsumenters kök.</p>`,
      images: [{ src: "/images/materials/Komposit/white quartz sinterered countertop kitchen.jpg", alt: "Modernt kök presenterat på köksutställning" }]
    },
    {
      heading: "Trender från senaste Eurocucina",
      content: `<p>Den senaste Eurocucina bekräftade och förstärkte en rad trender som haft momentum under de senaste åren:</p>
<p><strong>Monolitiska ytor.</strong> Köket som ett skulpturalt, sammanhängande objekt snarare än en samling av moduler. Bänkskivor och väggar i samma material, utan synliga fogar – en look som kräver natursten eller sintererade keramikplattor av stor format.</p>
<p><strong>Naturmaterial och textur.</strong> Träet återvänder på allvar, men nu i kombination med sten. Matta ytor dominerar: borstad sten, läder-finish, oljade trä. Den hyperpolerade köksytan är förpassad till 2010-talet.</p>
<p><strong>Färg på skåp, inte på bänkskiva.</strong> Djupgröna, mörkblå och kolsvarta skåpfärger presenteras med neutrala, klassiska stenbänkskivor som balans. Stenen är ankaret; skåpen är uttalandet.</p>`,
      images: []
    },
    {
      heading: "Natursten på mässan – vad exponerades?",
      content: `<p>Naturstenssorter som fick mest uppmärksamhet på senaste Eurocucina:</p>
<ul>
  <li><strong>Kvartsit i Super White-familia</strong> – Patagonia, Taj Mahal och Sea Pearl. Den vita-kristallina ytan med diffusa ådringsmönster har blivit ett signum för lyxköket.</li>
  <li><strong>Mörkgrön marmor och kvartsit</strong> – Verde Guatemala, Azul Valverde. Grön är den stora färgtrenden.</li>
  <li><strong>Dramatisk ådrad marmor</strong> – Calacatta Viola, Arabescato Corchia med färgstarka, breda ådringsmönster.</li>
  <li><strong>Svart granit med textur</strong> – Nero Assoluto och Zimbabwe Black i borstad eller läder-finish snarare än polerat.</li>
</ul>
<p>Vad som noterades av frånvaro: standardvita composit-ytor (quartz composite) tappar snabbt mark till äkta natursten i detta segment.</p>`,
      images: []
    },
    {
      heading: "Innovationer i materialteknik",
      content: `<p>Eurocucina är inte bara om sten – det är om hela köksmaterialsystemen. 2026 präglas av:</p>
<p><strong>Ultra-tunna format.</strong> Keramiska och sintered stone-skivor i 6 och 4 mm tjocklek som appliceras över befintliga ytor. Renovationstekniken för den som vill uppgradera utan att riva ut allt.</p>
<p><strong>Integrerade kantzoner.</strong> Bänkskivans kant och fronten av bänken behandlas som ett kontinuerligt objekt, ofta med en kraftigt profil eller ledge som också fungerar som grepp.</p>
<p><strong>Backlit sten.</strong> Genomlyst onyx och kvartsit med LED-installation bakom. Dramatiska väggar och köksöar som lyser upp som luminösa skulpturer. Tekniken är nu mer prisvärd och utbrett tillgänglig.</p>`,
      images: []
    },
    {
      heading: "Från Eurocucina till din köksrenovering",
      content: `<p>Messorna sätter trenderna, men du köper inte ett kök på en mässa – du köper ett kök för din familj och ditt hem. Det innebär att messatrender bör filtreras genom en praktisk lins.</p>
<p>Fråga dig: fungerar den här designen för min vardag? En monolitisk köksö i Calacatta Gold ser fantastisk ut i en utställningsmonterd, men kräver en viss rumsvolym och ett visst underhållsengagemang. En dramatisk svart granit med borstad yta är vacker i ett studiofotografi, men hur ser den ut i ett kök där det är rörigt med familjens dagliga liv?</p>
<p>De bästa besluten kombinerar trender med tidlösa principer. Välj ett material du tycker genuint om, som passar ditt kök arkitektoniskt och som du klarar att underhålla. Trender kan vara en inspiration, men de bästa köken är de som fortfarande ser bra ut 20 år senare.</p>`,
      images: []
    }
  ]
},

// ─── WEEK 18 ───────────────────────────────────────────────────────────────
{
  slug: "statuario-marmor",
  week_number: 18,
  sections: [
    {
      heading: "Kritvit med dramatiska ådror – Statuarios identitet",
      content: `<p><strong>Statuario</strong> är inte ett lika välkänt namn som Carrara eller Calacatta, men för den som kan natursten är det ett av de mest respekterade – och eftertraktade – marmornamnen. Bryten i ett begränsat område av Carrara-bergen, är Statuario känd för en kombination av extremt ren, kritvit bakgrundsfärg och dramatiska, tjocka gråblå ådror i ett mönster som på datorskärm nästan kan verka digitalt konstruerat – men är helt naturligt.</p>
<p>Historiskt användes Statuario av renässanskonstnärerna för sina viktigaste skulpturer – dess rena vita utan inblandning av grå- eller guldtoner gjorde den perfekt för figurativ skulptur. Idag är den eftertraktad i kök och badrum för exakt samma egenskaper: en ren vit som inte drar åt varmt eller kallt, kombinerat med kraftiga gråa ådror som skapar ett abstrakt konstverk.</p>`,
      images: [{ src: "/images/materials/Marmor/marmor-hero.jpg", alt: "Statuario marmor – kritvit med dramatiska ådror" }]
    },
    {
      heading: "Skillnaden mot Carrara och Calacatta",
      content: `<p>I den vita marmorfamiljen från Carrara är Statuario den "tredje stora" bredvid Carrara Bianco och Calacatta. Skillnaderna:</p>
<p><strong>vs Carrara Bianco:</strong> Statuario är renare vit (Carrara är cream-grå), och Statuarios ådror är grovare och mer dramatiska. Generellt sett är Statuario ett steg upp i pris och dramatik.</p>
<p><strong>vs Calacatta:</strong> Calacatta Gold har mer guldinslag i ådringen och en varmre bakgrundsfärg. Statuario är svalare, ådringen är renare gråblå utan guldton. Calacatta är "ljus-dramatisk"; Statuario är "ren-dramatisk".</p>
<p>Designmässigt är Statuario det bästa valet för ett kylare, mer neutralt vitt kök som ändå vill ha starka ådror. Calacatta passar bättre i köket med varma, guldiga inslag.</p>`,
      images: []
    },
    {
      heading: "Sorter inom Statuario-familjen",
      content: `<p>Precis som Carrara och Calacatta är Statuario ett paraplybegrepp för ett antal relaterade sorter:</p>
<ul>
  <li><strong>Statuario Extra</strong> – Toppen av familjen. Perfekt kritvit bakgrund, kraftiga ådror i rent grå/blågrå ton. Extremt sällsynt och dyrt.</li>
  <li><strong>Statuario Venato</strong> – "Venato" (ådrigt) – mer riklig ådring, lite mer åtkomlig. Fortfarande en exklusiv sten.</li>
  <li><strong>Statuario Altissimo</strong> – Från ett specifikt brott känt för exceptionell vitkvalitet.</li>
  <li><strong>Statuetto</strong> – Sämre kvalitet; inte äkta Statuario men marknadsförs ibland under liknande namn. Var uppmärksam.</li>
</ul>`,
      images: []
    },
    {
      heading: "Skötsel av Statuario",
      content: `<p>Statuario är en kalcit-marmor, lika syrakänslig som Carrara och Calacatta. Den kritvita bakgrunden gör att fläckar syns extra tydligt, och etning av citrus eller vin lämnar matta fläckar som är svåra att helt eliminera utan professionell polering.</p>
<p>Impregnering är absolut nödvändig. Använd ett fluorpolymerbaserat impregneringsmedel (inte silikonbaserat, som bara sitter på ytan). Applicera före installation och repetera var 12-18 månad beroende på användning. Torka spill omedelbart – det är den viktigaste regeln med all vit marmor.</p>
<p>Många entusiaster väljer Statuario precis för dess förmåga att patinera vackert: ytan mjuknar gradvis, ådringen fördjupas i nyans, och en naturlig "used elegance" uppstår. Det är ett material som åldras med värdighet, inte ett material som försöker behålla en perfekt yta.</p>`,
      images: []
    },
    {
      heading: "Designkombinationer med Statuario",
      content: `<p>Statuarios svala, rena vit fungerar utmärkt med:</p>
<ul>
  <li>Mörkgråa eller kolsvarta skåpluckor – den klassiska kontrasten som accentuerar den vita stenen.</li>
  <li>Naturträ i ek eller valnöt – värmer upp det kyla vit-grå utan att konkurrera.</li>
  <li>Rostfritt stål i köket – industrial look med hög exklusivitet.</li>
  <li>Svart metallbeslag och kranar – en populär detalj som skapar kontrast mot den vita ytan.</li>
</ul>
<p>Undvik: kräm- och beigeläckerade luckor – de krockar med Statuarios kalla vit. Välj antingen varmare sten (Calacatta, Estremoz) eller ha rena vita/mörkare luckor.</p>`,
      images: [{ src: "/images/materials/Marmor/marmor-kitchen.jpg", alt: "Statuario marmor i kök med mörka skåpluckor" }]
    }
  ]
},

// ─── WEEK 19 ───────────────────────────────────────────────────────────────
{
  slug: "travertin-guide-bankskiva",
  week_number: 19,
  sections: [
    {
      heading: "Det romerska materialet – travertin i kök och bad",
      content: `<p><strong>Travertin</strong> är ett av historiens mest använda byggmaterial. Colosseum i Rom byggdes av travertin – 100 000 ton av det bryttes från Tivoli utanför staden för att bygga amfiteatern. Det är ett material med 2000 år av bevisat bruk, och det faktum att Colosseum fortfarande står vittnar om dess hållbarhet.</p>
<p>I moderna kök och badrum har travertin haft en makeover – från det 1980-tals gulbeige golvet till ett modernt material i neutrala, varma toner som fungerar i både traditionella och nutida inredningar. Den karakteristiska porösa ytan, med sina naturliga håligheter och ojämnheter, är ett estetiskt signum som ingen annan natursten kan imitera.</p>`,
      images: [{ src: "/images/materials/Travertin/travertine countertop in modern an luxurious kitchen.jpg", alt: "Travertin bänkskiva i modernt kök" }]
    },
    {
      heading: "Hur travertin bildas – geologi",
      content: `<p>Travertin bildas på ett fundamentalt annorlunda sätt än marmor eller granit. Det är en sedimentär bergart, uppbyggd av kalciumkarbonat (kalksten) som utfällts ur mineralrikt källvatten eller termalvatten. När det varma, kalciumrika vattnet når ytan och trycket minskar, faller kalciumkarbonaten ur lösningen och bildas lager på lager av sten.</p>
<p>Håligheterna i travertinen är naturliga kaviteter som bildades när gasbubblor eller organiskt material (växter, löv) fångades in under utfällningen och sedan vittrade bort. Dessa håligheter är ett definierande karaktärsdrag – och ett praktiskt dilemma för bänkskive-användning (se nedan om fyllning).</p>
<p>De viktigaste producerande länderna är Iran (Azarshahr-distriktet), Italien (Tivoli) och Turkiet. Varje ursprung ger travertinen en något unik ton och ådring.</p>`,
      images: []
    },
    {
      heading: "Öppen vs fylld travertin – vilket väljer du?",
      content: `<p>Det viktigaste valet vid köp av travertin är om du vill ha <strong>öppen</strong> (naturliga håligheter synliga) eller <strong>fylld</strong> (håligheter fyllda med cementkitt eller harts) yta.</p>
<p><strong>Öppen travertin</strong> har en mer autentisk, texturrik karaktär. Håligheten är synlig och skapar en levande yta. Nackdelen i en kökskontext: smuts, mat och fukt kan samlas i håligheter om ytan inte underhålls noggrant.</p>
<p><strong>Fylld travertin</strong> är slätare och mer praktisk för bänkskivor och golv. Fyllningsmassan matchas noga med stenens färg. Med rätt impregnering och underhåll är fylld travertin utmärkt för kök och badrum.</p>
<p>För bänkskivor rekommenderas generellt fylld travertin, helst polerad eller vattnad fin yta. Öppen travertin lämpar sig bättre för väggar och ytbeläggningar.</p>`,
      images: [{ src: "/images/materials/Travertin/travertine bathroom tiles in modern kitchen with suthel viens.jpg", alt: "Travertin i badrum med synliga naturliga håligheter" }]
    },
    {
      heading: "Sorter och färger",
      content: `<p>Travertin finns i ett brett spektrum av nyanser:</p>
<ul>
  <li><strong>Travertin Silver</strong> – Ljusgrå till silvergrå ton. Det kylaste och mest moderna alternativet.</li>
  <li><strong>Travertin Classico/Noce</strong> – Varmt beige-brun ton, det klassiska. Passar perfekt till trä och terrakottafärger.</li>
  <li><strong>Travertin Romano/Navona</strong> – Cremlvitt till ljust beige. Det lugnaste alternativet.</li>
  <li><strong>Red Travertin</strong> – Rostbrun-röd ton. Ovanlig och dramatisk.</li>
  <li><strong>Travertin Gold</strong> – Guldbeige med starka ådror.</li>
</ul>`,
      images: []
    },
    {
      heading: "Underhåll och impregnering",
      content: `<p>Travertin är, liksom marmor, kalcitbaserad – det innebär syrakänslighet. Citronsaft och ättika etsar ytan. Spill ska torkas omedelbart. Impregnering är nödvändig, åtminstone en gång per år i aktiva kök.</p>
<p>Den porösa strukturen hos travertin – även den fyllda – gör impregnering extra viktig. En impregneringsprodukt med god penetration (penetrerande impregneringsmedel, inte ytfilm) skyddar stenens inre porer och förhindrar att olja, kaffe och andra medel fastnar permanent.</p>
<p>Polerad travertin är lättare att hålla ren men visar repor tydligare. Borstad eller naturlig (honed) yta döljer slitage bättre men är mer absorbent. Välj ytbehandling utifrån din livsstil.</p>`,
      images: []
    },
    {
      heading: "Travertin i köket – tidlös estetik",
      content: `<p>Travertin har en varm, organisk estetik som är svår att uppnå med moderna material. Det fungerar utmärkt i kök med en naturlig, lantlig eller medelhavsinspirerad inriktning – men det kan också fungera i moderna kök som kontrast mot skarpa linjer och kalla ytor.</p>
<p>En trend är att använda travertin i badrum som ett sammanhängande material från golv till vägg till bänkskiva – det skapar en koherent, minimalistisk estetik som påminner om ett romerskt balneum. Rätt gjort är det en av de vackraste interiörerna som natursten kan skapa.</p>`,
      images: []
    }
  ]
},

// ─── WEEK 20 ───────────────────────────────────────────────────────────────
{
  slug: "roman-classic-travertin",
  week_number: 20,
  sections: [
    {
      heading: "Roman Classic – travertinens klassiker",
      content: `<p><strong>Roman Classic Travertin</strong> – ibland benämnd Travertino Romano Classic – är en av de mest sålda travertinsorterna i världen. Dess varma beige-cremiga ton, med subtila bruna ådror och ett karakteristiskt nätmönster av mineralbanden, har präglar Europas arkitektur sedan antiken och är lika aktuell idag som den var under romarriket.</p>
<p>Stenen bryts framförallt i Tivoli-distriktet utanför Rom och vid Bagni di San Filippo i Toscana – samma brott som försörjde renässansens byggnadsivrar. Det är den travertintyp du ser i Trevi-fontänen, i Peterskyrkans kolonnad och i otaliga europeiska kyrkor och palats.</p>`,
      images: [{ src: "/images/materials/Travertin/travertine quarry in italy.jpg", alt: "Travertinbrott i Tivoli, Italien" }]
    },
    {
      heading: "Visuella egenskaper – varför den ser ut som den gör",
      content: `<p>Roman Classic Travertins karaktäristiska utseende är resultatet av dess speciella bildningsmiljö. Stenen bildades i termalt källvatten nära Romarrikets centrum, och mineralkombinationen i vattnet – kalcium, järn, mangan – är den som ger den varmt beige-guldiga tonen.</p>
<p>Den horisontella bandsättningen (de parallella linjerna i olika beige-bruna toner) är utfällningslager – varje lager representerar en säsong eller period av mineral utfällning. Det nätstjuka mönstret av håligheter är ett signum för Roman Classic specifikt, tydligare och jämnare än i många andra travertintyper.</p>
<p>Ytan varierar avsevärt beroende på ytbehandling: polerat ger en klarare, mer reflekterande sten med tydligare färger; borstat (brushed) ger en mer matt, texturrik yta med tydligare håligheter; honed (slipat men ej polerat) ger en halvmatt yta som är ett balanserat val för bänkskivor.</p>`,
      images: []
    },
    {
      heading: "Roman Classic i modernt kök – praktisk vägledning",
      content: `<p>Roman Classic är en av de mer underhållskrävande travertinsorterna för köksbruk, men med rätt förberedelse och skötsel är det fullt möjligt att använda den i ett aktivt kök.</p>
<p>Rekommendation: välj polerad eller honed yta och fylld hålighet för bänkskiva. Impregnerera med ett professionellt penetrerande medel (inte ytfilm) omedelbart efter installation och repetera varannat år. Torka alltid spill – särskilt sura – omedelbart.</p>
<p>Designmässigt passar Roman Classic utmärkt med naturträ i varma toner (ek, kastanj), terrakottafärgade väggar, mässingsbeslag och handdukshängare. Det är ett material med Medelhavskänsla som kräver att resten av köket anpassas till det naturliga, varma uttrycket.</p>`,
      images: []
    },
    {
      heading: "Roman Classic i badrum – det klassiska valet",
      content: `<p>I badrummet är Roman Classic i sitt absoluta esse. Badrum med travertin på golv, i dusch och på bänkskivan skapar en enhetlig, tidlös estetik som hämtar inspiration direkt från de romerska termer som materialet ursprungligen utsmyckade.</p>
<p>Fukt och vatten är dock en utmaning: travertin i dusch kräver grundlig impregnering och bra ventilation. Kalkhaltigt vatten (hårt vatten) kan lämna avlagringar som är svåra att ta bort utan att skada stenen. Regelbunden behandling med kalkavlägsningsprodukter formulerade för natursten (ej ättika!) är nödvändig.</p>
<p>Golvtravertin rekommenderas i honed eller naturlig finish – polerat kan vara halt när det är blött. Golvbeläggning med vattad naturlig yta och rätt impregneringsgrad ger en säker och vacker yta.</p>`,
      images: [{ src: "/images/materials/Travertin/travertine bathroom tiles in modern kitchen with suthel viens.jpg", alt: "Roman Classic travertin i klassiskt badrum" }]
    },
    {
      heading: "Slab vs platta – format och appliceringssätt",
      content: `<p>Roman Classic används i två huvudformat: som slab (2–3 cm tjock skivor) för bänkskivor och trappor, och som plattor (1–2 cm) för golv och väggar. För bänkskivor gäller samma principer som för marmor – tjocklek 20–30 mm, med understöd vid större spann.</p>
<p>Plattor för golv finns i ett brett sortiment av mått – allt från 30×30 till 120×60 och mer. Stor platta (60×60 och upp) ger ett mer enhetligt, modernt intryck; mindre mosaik ger ett mer traditionellt uttryck med fler fogar (och mer underhåll av fogmassa).</p>`,
      images: []
    }
  ]
},

// ─── WEEK 21 ───────────────────────────────────────────────────────────────
{
  slug: "index-dubai-massa",
  week_number: 21,
  sections: [
    {
      heading: "INDEX Dubai – Mellanösterns lyxinredningsevent",
      content: `<p><strong>INDEX Dubai</strong> är en av världens mest inflytelserika inrednings- och möbelmässor, och för naturstensbranschen är det en nyckelmarknad. Dubai och Gulfregionen har under de senaste decennierna blivit en av världens viktigaste konsumenter av exklusiv natursten – lyxhotell, privata residenser och offentliga byggnadsverk i exklusiva material dominerar den oljefinansierade byggboomen.</p>
<p>På INDEX samlas leverantörer, arkitekter och köpare från hela världen, och trenderna som syns här återspeglar vad som efterfrågas av världens mest köpkraftiga marknad. Exotisk natursten, halvädelstensbänkskivor och marmor i storformat av de sällsyntaste sorterna är vardag här.</p>`,
      images: [{ src: "/images/materials/Onyx/Onxy Smeraldo luxury autonova kitchen.jpg", alt: "Lyxkök med exotisk natursten – INDEX Dubai-stil" }]
    },
    {
      heading: "Gulfsregionens stenpreferenser",
      content: `<p>Gulfens byggsektor har en tydlig preferens för det dramatiska och exklusiva. Monokromatisk vit marmor (Thassos, Statuario Extra) i stora format är ett signum för lyxhotell och privata palats. Onyx – genomlyst med bak-belysning – i kräm, honung och grönt skapar visuella installationer som inte existerar i europeisk mainstreaminredning.</p>
<p>Halvädelstensbänkskivor – agat, ametist, malakit och labradorit – har haft sin starkaste marknad i Gulf-regionen. Det är ett segment som nu sakta sprider sig till europeiska lyxköket, men där Dubai fortfarande är föregångaren.</p>`,
      images: []
    },
    {
      heading: "Onyx – lyxens material",
      content: `<p>Onyx är ett av de mest spektakulära naturstensmaterialen som existerar – och ett av de mest tekniskt krävande att arbeta med. Det är ett genomlyst material, vilket innebär att bakljus passerar igenom stenen och skapar en glödande effekt. Honungsbeige Honey Onyx och den klarare turkosa Onyx Verde är de most efterfrågade sorterna.</p>
<p>Men onyx är också ett mjukt material (Mohs-hårdhet 6-7 jämfört med granit 7-8) och mer sprött. Det används sällan som ensam bänkskiva utan snarare som accentelement: en bakbelyst bar, en dekorativ väggpanel, en toalettsida i ett badrum. I det segmentet är det oslagbart i dramatisk visuell effekt.</p>`,
      images: []
    },
    {
      heading: "Trender från INDEX som kommer till Sverige",
      content: `<p>Det tar normalt 2-4 år för trender från lyxmarknader som Dubai att filtrera ned till bredare europeiska konsumentmarknader. Utifrån senaste INDEX kan vi förvänta oss:</p>
<ul>
  <li><strong>Bakbelyst sten</strong> i exklusiva köksöar och barer – redan nu hos svenska high-end stenverkstäder.</li>
  <li><strong>Halvädelstenspaneler</strong> (agat, kvartsit i exotiska toner) som alternativ till glasmosaik i badrum.</li>
  <li><strong>Marmor i extremt stora format</strong> (>200 cm långa slabs utan skarv) till representativa kök.</li>
  <li><strong>Kombinerade ytor</strong> där bänkskiva, stänkskydd och bakpanel är i samma stensort – monolitisk look.</li>
</ul>`,
      images: []
    },
    {
      heading: "Vad INDEX lär oss om hållbarhet i lyxsegmentet",
      content: `<p>En intressant tendens på INDEX senaste editionen är att hållbarhet nu är ett tema även i det absoluta lyxsegmentet. Arkitekter och designers som arbetar för Gulf-regionens mest krävande klienter ställer nu frågor om ursprungscertifiering, koldioxidavtryck och brottsmetoder.</p>
<p>Det är en marknadsdriven förändring: ultrarika konsumenter i Mellanöstern vill kunna berätta en historia om sitt material – och en historia om etisk, certifierad natursten är ett lyxargument i sig. Det driver leverantörer att investera i transparens och certifiering, vilket på sikt gynnar hela marknaden.</p>`,
      images: []
    }
  ]
},

// ─── WEEK 22 ───────────────────────────────────────────────────────────────
{
  slug: "iran-onyx-travertin",
  week_number: 22,
  sections: [
    {
      heading: "Iran – en underskattad stennation",
      content: `<p>Iran är ett av världens rikaste länder på naturstensresurser, och trots geopolitiska spänningar och handelshinder är iransk sten välkänd bland europiska stenimportörer för sin unika kvalitet och karaktär. Landet producerar travertin, marmor och onyx av enastående kvalitet – och till priser som ofta är konkurrenskraftiga.</p>
<p>Det iranska bergslandskapet – Zagrosbergen, Elbursbergen och Kopet Dag-massivet – har geologiska förutsättningar liknande det turkiska och anatoliska men med mineralsammansättningar som skapar material med unika egenfärger och mönster. Azarshahr-distriktet i nordvästra Iran är ett av världens viktigaste travertinbrott; Esfahan-provinsen för marmor; Hormoz och Hormozgan för en rad exotiska stentyper.</p>`,
      images: [{ src: "/images/materials/Travertin/travertine slabs factory verona.jpg", alt: "Travertinplattor från iransk produktion" }]
    },
    {
      heading: "Irans travertin – världens bästa?",
      content: `<p>Iransk travertin, och specifikt sorter från <strong>Azarshahr</strong>-distriktet, anses av många stenexperter som den allra finaste i världen. Stenen har en unik ljusgul-creme ton med subtila horisontella linjemönster och en kristallinhet som gör den mer translucent än europeisk travertin.</p>
<p>Iransk travertin är dyrare att importera till Sverige på grund av logistik och handelsrestriktioner, men den finns tillgänglig via importörer med etablerade iranska kontakter. Sorterna <strong>Noce Irani</strong> (brun-beige), <strong>Classic Silver Irani</strong> (silvergrå) och <strong>Walnut Irani</strong> är välkända bland proffs.</p>
<p>Jämfört med turkisk travertin (som är lättare tillgänglig i Sverige) är iransk generellt mer finkornig och homogen, med lägre porositet i de bästa sorterna. Det ger bättre praktiska egenskaper för bänkskivebruk.</p>`,
      images: []
    },
    {
      heading: "Iransk onyx – genomlyst och dramatisk",
      content: `<p>Iran producerar några av världens mest eftertraktade onyx-varianter. <strong>Honey Onyx</strong> (honung-gul bakgrund med vita ådror) och <strong>Green Onyx</strong> (djupgrönt med vita och guldaktiga ådror) är persiska sorter som exporteras globalt för exklusiva inredningar.</p>
<p>Onyx bildas i hydrotermala miljöer när mineralrikt vatten langsomt fälls ut i sprickor och håligheter i berggrunden, lager för lager. Det är processen som skapar materialets karakteristiska transparens – om man håller en tunn skiva mot ljuset lyser det igenom. Det är denna egenskap som driver efterfrågan från lyxkök och hotell världen över.</p>
<p>Iransk onyx används sällan ensam som bänkskiva – det är för mjukt och dyrt för det. Vanligast som bakbelyst köksö-front, bakombelysning i bar, eller väggpanel i exklusivt badrum.</p>`,
      images: []
    },
    {
      heading: "Att köpa iransk sten i Sverige",
      content: `<p>Handel med Iran är begränsad av internationella sanktioner, vilket påverkar tillgängligheten. De flesta iranska stenexportörer hanterar detta via mellanled i UAE, Turkiet eller Georgien. För den svenske köparen innebär det att "iransk sten" ibland nås via importörer med kontakter i dessa regioner.</p>
<p>Var alltid noga med att be om ursprungsdokumentation. Fråga importören om stenen verkligen kommer från Iran eller om den mellanlagrats i ett tredjeland och reklasserats. Äkta iransk travertin och onyx har distinkta egenskaper som en kunnig stensäljare kan identifiera, men utan dokumentation är det svårare att garantera ursprunget.</p>`,
      images: []
    },
    {
      heading: "Iransk estetik – stenen i sin kulturella kontext",
      content: `<p>Iransk arkitektur och inredning har en rik tradition av naturstensanvändning. De klassiska persiska palatsen och moskéerna i Isfahans centrala torg är byggda av lokalt bruten kalksten och marmor; mausoleer och minareter är klädda i keramik och alabaster. Stenen är i den iranska arkitektoniska traditionen ett symbol för permanens och värdighet.</p>
<p>Denna respekt för naturmaterialets autenticitet och tidlöshet är något som resonerar med moderna hållbarhets- och autenticitetsvärderingar. Att använda ett material med så djupt förankrad historia är, för den som vet det, en kulturell koppling utöver det rent estetiska.</p>`,
      images: []
    }
  ]
},

// ─── WEEK 23 ───────────────────────────────────────────────────────────────
{
  slug: "nero-marquina-svart-marmor",
  week_number: 23,
  sections: [
    {
      heading: "Spansk svart marmor med internationellt rykte",
      content: `<p><strong>Nero Marquina</strong> är en av världens mest kända svarta marmorer och bryts uteslutande i Markina-Xemein, en liten stad i Baskien i norra Spanien. Stenen har ett nästan unikt mönster: en djupsvart bakgrund genomkorsad av tunna, oregelbundna vita ådror som skapar ett kontrastrikt, abstrakt mönster. Det är ett material med omedelbar igenkänning och stark karaktär.</p>
<p>Nero Marquina har använts i europeisk arkitektur och inredning i över 400 år, och finns i katedraler, palats och fashionabla köket och badrum världen över. Det är ett material som aldrig riktigt går ur mode – det är för starkt visuellt för det – men som nu återkommer i vågen av dramatisk, kontrastrik stendesign.</p>`,
      images: [{ src: "/images/materials/Granit/granit-kitchen.jpg.jpg", alt: "Svart marmorbänkskiva i modernt kök" }]
    },
    {
      heading: "Geologi och karakteristik",
      content: `<p>Nero Marquina är en kalcitmarmor (metamorfoserad kalksten) vars svarta färg beror på hög halt av organiskt kol – grafit och bituminösa material – inblandade under metamorfosen. De vita ådorna är kalcit av högre renhet som trängde in i sprickor under bergets bildning.</p>
<p>Stenen är tät och relativt hård för att vara marmor. Porositet är lägre än hos Carrara-varianter, vilket gör den lite mer motståndskraftig mot syraetning – men inte immun. De vita ådorna är kalcit, samma syrakänsliga mineral som i vit marmor.</p>
<p>En viktig egenskap: Nero Marquinas vita ådror varierar enormt block för block. Vissa slabs har tunna, diskreta ådror; andra har brett utspridda, dramatiska mönster. Be alltid att se helslab-bilder av just ditt block.</p>`,
      images: []
    },
    {
      heading: "Skötsel av svart marmor",
      content: `<p>Svart marmor har en specifik skötselutmaning utöver de normala: <strong>kalkavlagringar och vattenfläckar syns extremt tydligt</strong> mot den mörka bakgrunden. Hårda vatten (högt kalkinnehåll) lämnar vita avlagringar vid kran och diskho som är mer synliga på svart yta än på vit.</p>
<p>Regelbunden avlägsning av kalkfläckar med naturstens-kompatibla rengöringsmedel (aldrig ättika eller citrus – dessa etsar kalciten) och snabb torkning av vatten runt kranar är viktigt. Välj gärna kran av en typ som inte droppar, och undvik att låta stående vatten torka på ytan.</p>
<p>Impregnering är viktig men komplexare för svart marmor: impregneringsmedel av fluorpolymertyp kan i sällsynta fall lämna en lätt grumlig hinna synlig mot den svarta ytan. Testa alltid ett diskret område innan du applicerar på hela ytan.</p>`,
      images: []
    },
    {
      heading: "Nero Marquina i designsammanhang",
      content: `<p>Nero Marquinas starka karaktär kräver en tydlig designkonception. Det är inte ett "neutralt" material – det är ett statement. Designlösningar som fungerar:</p>
<ul>
  <li><strong>Vitt kök med svart bänkskiva</strong> – Klassisk kontrast. Vita lackluckor, vit kakel, svart Nero Marquina = tidlöst och elegant.</li>
  <li><strong>Svart kök i helhet</strong> – Svarta luckor, svart stänkskydd, svart bänkskiva. Monokromatisk och dramatisk. Kräver bra belysning.</li>
  <li><strong>Varmt trä mot svart marmor</strong> – Valnöt eller mörk ek mot Nero Marquina skapar en varm, exklusiv look.</li>
</ul>
<p>Undvik: beige eller krämlackerade luckor som "krockar" med den svarta stenens coola ton. Välj antingen rent vit, mörkt eller naturträ.</p>`,
      images: []
    },
    {
      heading: "Alternativ till Nero Marquina",
      content: `<p>Om du söker ett svart stenmaterial finns det alternativ till Nero Marquina som kan vara värda att undersöka beroende på budget och tillgänglighet:</p>
<ul>
  <li><strong>Marquina Negro</strong> – Spanskt namn för samma sten; ibland annat pris, samma material.</li>
  <li><strong>Negro Bélgica</strong> – Belgisk svart kalksten, mer homogen färg utan vita ådror. Mindre dramatisk, mer neutral svart.</li>
  <li><strong>Absolute Black granit</strong> – Granit utan ådring. Hårdare, tåligare, mer neutral. Se separat artikel vecka 40.</li>
  <li><strong>Zimbabwe Black</strong> – Afrikansk granit med något grovare kristallstruktur. Se vecka 41.</li>
  <li><strong>Portoro</strong> – Italiensk svart marmor med guldådror snarare än vita. Exklusivare och dyrare. Se vecka 32.</li>
</ul>`,
      images: []
    }
  ]
},

// ─── WEEK 24 ───────────────────────────────────────────────────────────────
{
  slug: "spanien-marmor-macael",
  week_number: 24,
  sections: [
    {
      heading: "Macael – Romas marmor i Andalusien",
      content: `<p><strong>Macael</strong> är en liten stad i Almerías provins i sydöstra Spanien, med en marmorhistoria som sträcker sig 2500 år tillbaka. Det är Spaniens viktigaste marmordistrikt och ett av Europas äldsta – romarna använde Macael-marmor till tempel och monument, och den mäktiga Alhambra-palatsets marmoravsnitt är gjorda av Macael.</p>
<p>Idag är Macael hem för ett hundratal stenföretag och är ett blomstrande exportcenter för en rad vita, kräm och rosa marmorsorter. Det är ett material med djup historisk förankring och en autenticitet som inte kan fås i ett modernt syntetmaterial.</p>`,
      images: [{ src: "/images/materials/Marmor/marmor-quarry.jpg", alt: "Marmorbrott i Macael-regionen, Spanien" }]
    },
    {
      heading: "Macael-marmorns karaktär",
      content: `<p>Macaels marmor är i grunden kalcitmarmor av god kvalitet – men det är ett bredare sortiment än Carrara-regionens mer specialiserade produktion. De viktigaste sorterna:</p>
<ul>
  <li><strong>Blanco Macael</strong> – Den klassiska varianten. Vit till kräm med diskreta grå ådror. Jämn och lättarbetad. Spaniens svar på Carrara Bianco.</li>
  <li><strong>Blanco Brillo Macael</strong> – Vitare variant med mer lysande, kristallin yta. Mer premium.</li>
  <li><strong>Crema Macael</strong> – Ljust krämbeige med minimal ådring. Neutral och elegant.</li>
  <li><strong>Fantastico Macael</strong> – Mer dramatisk, med bruna-guldiga ådror i kontrast mot vit bakgrund.</li>
</ul>
<p>Generellt är Macael-marmorn mer grov-kristallin än den finaste Carrara, vilket innebär en mer matt lyster. Men det gör den inte sämre – annorlunda estetik, liknande praktiska egenskaper.</p>`,
      images: []
    },
    {
      heading: "Jämförelse: Macael vs Carrara",
      content: `<p>Den eviga frågan om vit marmor: Macael eller Carrara?</p>
<p><strong>Macael-fördelar:</strong> Kortare transportväg till Sverige (lägre CO2), ofta lite lägre pris, god tillgänglighet. Fin historia och autenticitet.</p>
<p><strong>Carrara-fördelar:</strong> Mer välkänt varumärke och starkare status-signal, bredare sortiment av kvaliteter och undertyper, finstämd kristallinhet i de bästa sorterna.</p>
<p>Praktiskt sett är skillnaden för de flesta köpare marginell om man väljer likvärdiga kvalitetsnivåer. Besöker du ett showroom, be att se prover av båda bredvid varandra och välj utifrån din estetik.</p>`,
      images: []
    },
    {
      heading: "Spansk stenindustri och Macaels framtid",
      content: `<p>Spansk stenindustri är en av Europas mest professionella och är en viktig exportnäring. Macael-distriktet har investerat kraftigt i modern produktionsteknik – robotiserade kaplinjer, digitaliserig av slablager, spårbarhetssystem – och arbetar aktivt med hållbarhetscertifiering för att möta växande krav från internationella köpare.</p>
<p>En utmaning för regionen är vattenbrist – Almeríaprovinsens torra klimat gör att vattnet i produktionsprocessen (kylning, stening) måste hanteras noggrant. Moderna brott och fabriker i Macael har slutna vattensystem och återanvänder produktionsvattnet i allt högre grad.</p>`,
      images: []
    }
  ]
},

// ─── WEEK 25 ───────────────────────────────────────────────────────────────
{
  slug: "stone-tec-nurnberg-massa",
  week_number: 25,
  sections: [
    {
      heading: "Stone+tec Nürnberg – stenbranschens teknologimässa",
      content: `<p><strong>Stone+tec</strong> i Nürnberg är den ledande tyska mässan för naturstensbranschen och en av de viktigaste i Europa. Medan Eurocucina i Milano handlar om design och slutprodukt, fokuserar Stone+tec mer på teknologi, bearbetning och branschen som helhet – nya maskiner, verktyg, bearbetningsmetoder, och en stor utställaryta för naturstenssorter och -produkter.</p>
<p>Mässan hålls vartannat år och lockar professionella köpare, arkitekter och branschemänniskor från hela Europa och världen. Nürnberg-lokal är logistiskt utmärkt mitt i Centraleuropa, och mässan är ett nav för de tyska, österrikiska och schweiziska marknader som är viktiga konsumenter av natursten.</p>`,
      images: [{ src: "/images/materials/Granit/granit-factory.jpg.jpg", alt: "Stenverkstad med moderna bearbetningsmaskiner" }]
    },
    {
      heading: "Teknik och innovation i stenbearbetning",
      content: `<p>Stone+tec visar tydligt hur stenbranschen teknologiseras. Moderna CNC-bearbetningsmaskiner kan nu fräsa ut precisionsprofiler med millimeternoggrannhet som tidigare krävde skickliga hantverkare med handverktyg. Det innebär konsistentare resultat, snabbare leveranstider och möjlighet att erbjuda fler kantprofilalternativ.</p>
<p>Digitalisering av slablager (3D-scanning, digital bildvisning, spårbarhet via QR-kod) är nu mainstream bland moderna stenverkstäder. Köparen kan se sin exakta slab digitalt, välja position för hur den skärs, och följa materialet från brott till installation. Det är en transformativ förändring för en bransch som länge byggde på personliga relationer och verbal kommunikation.</p>
<p>Vatten och damm-hantering är ett annat fokusområde: slutna cirkelsystem för produktionsvatten, dammsugningssystem integrerade i kapliknande och polermaskiner, och certifieringssystem för arbetsplatsluft.</p>`,
      images: []
    },
    {
      heading: "Hållbarhetsfokus på Stone+tec",
      content: `<p>Hållbarhet är ett dominerande tema på Stone+tec sedan flera år. Certifieringssystem för natursten – ursprungsspårbarhet, sociala förhållanden i produktionen, miljöpåverkan – presenteras och diskuteras. EU:s nya Due Diligence-direktiv (CSDD) sätter press på importörer att kunna dokumentera sin leverantörskedja.</p>
<p>Certifieringssystemet <strong>IIISF (Internationell standard för ansvarsfull stenproduktion)</strong> och liknande initiativ presenteras av branschen som svar på konsumentkrav. Det handlar inte bara om CO2-avtryck utan om hela kedjan: hur bryts stenen, arbetar de som bryter den under rimliga förhållanden, håller de lokala miljöstandarder?</p>
<p>Från konsumentens synvinkel är det positiv nyhet att branschen tar dessa frågor på allvar. Fråga din stenverkstad om de kan uppge ursprungscertifiering för ditt material – det är en rimlig fråga och en bra verkstad ska kunna svara.</p>`,
      images: []
    },
    {
      heading: "Nya material och format",
      content: `<p>Stone+tec är också en plats där nya materialinnovationer presenteras. Senaste nytt:</p>
<p><strong>Ultra-tunna naturstensplattor (3-5 mm)</strong> laminerade på keramisk eller komposit-bärare. Ger samma estetik som tjock natursten men med dramatiskt lägre vikt och enklare installation. Används ofta för renovationsprojekt och för vertikala ytor.</p>
<p><strong>Digitaltryck på natursten.</strong> En marginell trend men intressant: teknologi för att lägga digitaltryckta mönster på stenyta, primärt för arkitektoniska applikationer.</p>
<p><strong>Återvunnen natursten.</strong> Material från rivningsprojekt – gamla marmorgolv, granittrappor – som säljs vidare i nya projekt. Cirkulär ekonomi i praktiken, och ett nischsegment som växer.</p>`,
      images: []
    }
  ]
},

// ─── WEEK 26 ───────────────────────────────────────────────────────────────
{
  slug: "azul-valverde-kvartsit",
  week_number: 26,
  sections: [
    {
      heading: "Azul Valverde – Portugals gröna pärla",
      content: `<p><strong>Azul Valverde</strong> är en av de mest efterfrågade exotiska naturstensorterna i Europa – och den som sett den förstår varför. Stenen bryts uteslutande i Estremoz-regionen i Alentejo, Portugal, och har en unik turkos-blågrön grundfärg med vita och silvriga kristallstrimmor som ger ett djup och en rörelse som inga syntetiska material kan reproducera.</p>
<p>Trots namnet (Azul = blå på portugisiska) är stenen mer grönt-turkos i verkligheten. Tekniskt klassificeras den ofta som kvartsit – en metamorf bergart rik på kvarts och glimmer – snarare än marmor, vilket ger den hårdare och mer syratåliga egenskaper än de kalcitbaserade marmorerna.</p>`,
      images: [{ src: "/images/materials/Kvartsit/quartzite kitchen countertop luxury.jpg", alt: "Azul Valverde kvartsit – grönblå natursten" }]
    },
    {
      heading: "Geologi: varför är den grön?",
      content: `<p>Azul Valverdes gröna färg beror på hög halt av <strong>klorit</strong> – ett järnrikt glimmermineralt som bildades under stenens metamorfos. Kloritkristaller absorberar röd och gul del av ljusspektret och reflekterar blå och grön, vilket ger den karakteristiska turkosa tonen.</p>
<p>De vita och silvriga strecken är kvarts-/muskovitkristaller av hög renhet, kontrasterande mot den gröna klorit-matrisen. Det är exakt denna kontrast – grönt mot silver – som skapar det levande, vibranta mönstret.</p>
<p>Utvinning sker i dagbrott i Alentejo, och produktionen är begränsad. Azul Valverde är ett sällsynt material i global skala; brotten producerar en bråkdel av vad t.ex. Carrara-regionens brott genererar. Det är en del av vad som driver priset och efterfrågan.</p>`,
      images: []
    },
    {
      heading: "Egenskaper som bänkskivematerial",
      content: `<p>Azul Valverde är ett utmärkt bänkskivematerial från en teknisk synvinkel. Som kvartsit (kvartsdominerat material) är det hårdare och mer syratåligt än kalcitmarmor. Det tål normal hushållsanvändning väl, reagerar inte med citronsaft och är svårt att repa med vanliga hushållsföremål.</p>
<p>Det är dock inte syraimmunt – starka syror över tid kan påverka glimmermineralen. Och precis som all natursten bör den impregneras regelbundet. Den relativt låga porositet hos Azul Valverde gör den lättare att underhålla än de mer porösa marmorerna.</p>
<p>En praktisk utmaning: de naturliga kristallgränser och spricksystem i stenen kan vid uppvärmning (placering av varma grytlappar direkt på ytan) expandera och orsaka sprickor. Använd alltid grytunderlag.</p>`,
      images: []
    },
    {
      heading: "Designmöjligheter: vad passar med Azul Valverde?",
      content: `<p>Azul Valverde är ett material som kräver respekt och tanke i designen – det kan inte placeras i vilket kök som helst utan att det ser konstigt ut. Kombinationer som fungerar:</p>
<ul>
  <li><strong>Vita luckor</strong> – Den klassiska kontrasten. Rent vit mot det gröna skapar en levande, naturinspirerad estetik.</li>
  <li><strong>Naturträ i naturton</strong> – Ek eller hickory i naturton kompletterar de jordnära gröna tonerna.</li>
  <li><strong>Mässing och guld detaljer</strong> – Kran, beslag och lampor i mässing drar ut de guldiga glimmertonerna i stenen.</li>
  <li><strong>Mörkgröna skåp</strong> – Tone-on-tone: mörkgrön mot turkos-grönt. Kräver bra naturljus men kan vara magnifikt.</li>
</ul>
<p>Undvik kalla grå/stål-kombinationer – de krockar med stenens varma gröna ton.</p>`,
      images: [{ src: "/images/materials/Kvartsit/modern kitchen quartzite countertop.jpg", alt: "Grön kvartsit i köket – naturinspirerat" }]
    },
    {
      heading: "Tillgänglighet och prisbild",
      content: `<p>Azul Valverde är ett nischimporterat material i Sverige. Inte alla stenverkstäder har det i lager, men de flesta kan beställa det hem. Leveranstiden kan vara 4-8 veckor beroende på säsong och lagertillgänglighet i Portugal.</p>
<p>Priset är signifikant högre än för standard Carrara eller granit, men lägre än de allra exklusivaste sorterna som Calacatta Gold Extra. Det befinner sig i ett mellansegment som ger hög estetisk utdelning för pengarna – du får ett material som verkligen är unikt och ovanligt.</p>
<p>Be alltid att se helslab-bilder – variationen i mönster och ton är stor, och den slab du väljer har stor påverkan på slutresultatet.</p>`,
      images: []
    }
  ]
},

// ─── WEEK 27 ───────────────────────────────────────────────────────────────
{
  slug: "brasilien-stenbrott-exotic",
  week_number: 27,
  sections: [
    {
      heading: "Brasilien – den exotiska stenens epicentrum",
      content: `<p>Om du har sett en natursten som stoppar dig i stegen – ett block med pulserade blå, gröna eller lila färger, komplexa blomliknande mönster, kristallklara kvartsinslag – är chansen stor att den kom från Brasilien. Landets geologiska rikedomar är extraordinära: Brasilianska skölden, ett av världens äldsta och mest geobiologiskt varierade berggrundssystem, producerar kvartsiter, graniter och marmorer i en mängd färger och mönster som saknar motstycke i Europa.</p>
<p>Brasilien är världens tredje största exportör av natursten (efter Kina och Italien) och landets exotiska sorter – Patagonia, Azul Imperatore, Blue Flower, Amazonite, Sodalite Blue – pryder de mest exklusiva kök och interiörer världen över.</p>`,
      images: [{ src: "/images/materials/Kvartsit/big quartzite quarry big machinery.jpg", alt: "Stort quartzite-brott i Brasilien" }]
    },
    {
      heading: "Geologin bakom de exotiska mönstren",
      content: `<p>Brasiliens geologi är resultatet av miljarder år av tektonisk rörelse, magmatisk aktivitet och sedimentering. De äldsta grundbergarterna i det brasilianska sköldet är 3,5 miljarder år gamla – bland jordens äldsta. Under dessa miljarder år har upprepade bergbildningsprocesser, vulkanism och hydrotermala händelser gett upphov till en enastående mineralrikedom.</p>
<p>De färgstarka kvartsit-sorterna (Super White, Taj Mahal, Sea Pearl, Azul Macaubas) bildades när ursprungliga sandstenssekvenser metamorfoserades under högt tryck och temperatur. Mineraler som magnetit (svart), ilmenit (grå-svart), biotit (brun) och kloritit (grön) skapade de karaktäristiska färgspelen.</p>
<p>Graniter som Blue Eyes, Azul Universo och Sodalite Blue innehåller sällsynta mineralfaser som sodalit och hauyn – minerals med unik blå till indigo-färg som bildas i alkalin-rika magmor.</p>`,
      images: []
    },
    {
      heading: "Populära brasilianska stentyper för bänkskivor",
      content: `<p>De brasilianska stenar som är mest efterfrågade i europeiska kök:</p>
<ul>
  <li><strong>Taj Mahal</strong> – Vit kvartsit med guldiga och grå ton. Mjuk, subtil estetik. Hårdare och mer syratålig än vit marmor. Mycket populär just nu.</li>
  <li><strong>Sea Pearl / White Fantasy</strong> – Vit-grå kvartsit med oregelbundna, blekt-gröna eller gråa partier. Organisk, naturlig look.</li>
  <li><strong>Patagonia</strong> – Dramatisk grå granit/gnejs med breda vita ådringsmönster. Stark, maskulin karaktär.</li>
  <li><strong>Azul Macaubas</strong> – Blå-grå kvartsit med guldiga mineral. Likt Azul Valverde men med mer guldigt inslag.</li>
  <li><strong>Via Lattea</strong> – Vit granit med galaktiska gråa och svarta kristallinslag. "Mjölkvägen"-mönster.</li>
</ul>`,
      images: []
    },
    {
      heading: "Miljö och etik i brasiliansk stenbrytning",
      content: `<p>Brasiliansk stenbrytning är föremål för legitima miljö- och etikfrågor. Amazonas-regionen – trots att de flesta stenbrott inte ligger direkt i regnskogen – är en ekologiskt känslig zon, och expansionen av gruvdriften (mineral, inte nödvändigtvis sten) i angränsande distrikt är ett dokumenterat problem.</p>
<p>Brasilianska stenbrott är primärt koncentrerade till Espírito Santo, Minas Gerais och Bahia – delstater med mer arid natur och etablerad gruvindustriell tradition. Miljöreglering varierar enormt: välreglerade, certifierade brott finns sida vid sida med mindre aktörer som inte följer miljöstandarder.</p>
<p>För den europeiska köparen: fråga alltid din leverantör om ursprungscertifiering. Certifieringssystem som BRICS (Brasilien-specifika certifieringsinitativ) och EU-baserade importcertifikat ger viss garanti – men "viss" är nyckelordet. Ämnet är komplext.</p>`,
      images: []
    },
    {
      heading: "Att köpa brasiliansk sten i Sverige",
      content: `<p>De exotiska brasilianska sorterna är tillgängliga i Sverige via specialimportörer och de större stenverkstäderna med internationella kontakter. Leveranstiden är vanligtvis längre än för europeisk sten – 6-12 veckor från beställning är normalt.</p>
<p>Priset är generellt högt, ibland exceptionellt högt för de riktigt exotiska sorterna. Men för den som vill ha en absolut unik bänkskiva – ett material som verkligen inte ser ut som grannens – är brasiliansk exotisk sten ett starkt alternativ.</p>
<p>Be alltid att se den specifika slaben digitalt eller fysiskt. Brasiliens stenar varierar enormt block för block, och "Taj Mahal" från ett block kan se helt annorlunda ut än från ett annat.</p>`,
      images: []
    }
  ]
},

// ─── WEEK 28 ───────────────────────────────────────────────────────────────
{
  slug: "diskho-val-sten-bankskiva",
  week_number: 28,
  sections: [
    {
      heading: "Diskho och stenbänkskiva – varför valet är viktigt",
      content: `<p>Att välja diskho till en stenbänkskiva är inte en detalj – det är ett av de viktigaste besluten i köksrenovering. Diskhon är bänkskivans centrala håltagningspunkt; felaktigt val eller utförande av håltagningen kan i sämsta fall spricka stenen eller leda till fuktproblem vid kanten. Rätt val av diskho ger ett kök som fungerar bra och ser ut rätt i decennier.</p>
<p>Det finns tre grundtyper av diskhosmontage som används med stenbänkskivor, och varje typ har sina egna estetiska och praktiska konsekvenser.</p>`,
      images: [{ src: "/images/materials/Komposit/komposit-hero.jpg.jpg", alt: "Diskho monterad i stenbänkskiva" }]
    },
    {
      heading: "Undermonterad diskho – det dominerande valet",
      content: `<p><strong>Undermonterad</strong> (undermount) diskho är det absolut populäraste valet till stenbänkskivor i Skandinavien. Principen är enkel: diskhon monteras underifrån, bänkskivans kant löper hela vägen ut och bildar en fin, ren avslutning runt håltagningen.</p>
<p>Fördelarna är uppenbara: ingen skarv på bänkskivans yta, lätt att torka av vatten och smuts direkt in i diskhon, ett rent och modernt utseende. Det är det alternativ som mest framhäver stenbänkskivans skönhet – inget stör den rena ytan.</p>
<p>Nackdelen är teknisk: håltagningen i stenen måste vara exakt och kanten poleras professionellt. En undermonterad diskho kräver också att stenbänkskivan är tillräckligt tjock (minst 20 mm) och har korrekt understöd nära håltagningen. Felaktigt monterade undermontade hoar är en vanlig reklamationsorsak.</p>`,
      images: []
    },
    {
      heading: "Inliggande (flush) diskho",
      content: `<p><strong>Inliggande</strong> diskho sitter i nivå med bänkskivans yta – kanten av diskhon är flush med stenen. Det ger ett rent, kontinuerligt intryck och är ett elegant alternativ till undermontagen, men kräver extremt precis håltagning och noggrant arbete med tätning längs kanten.</p>
<p>Det är ett krävande monteringsval som bör göras av en erfaren stenmontör. Rätt utfört är det estetiskt slående – ytan ser nästan sömlös ut. Felaktigt utfört kan fukt tränga in vid kanten och orsaka missfärgning, sprickbildning och i värsta fall strukturella problem.</p>`,
      images: []
    },
    {
      heading: "Ovanliggande (overmount) diskho",
      content: `<p><strong>Ovanliggande</strong> diskho sitter ovanpå bänkskivan med sin kant synlig. Det är det enklaste monteringsalternativet men det som används minst i kombinationer med stenbänkskivor – kanten skapar en hyllkant som samlar smuts och vatten, och det estetiska intrycket är mer "standard" jämfört med undermonterad eller flush.</p>
<p>Ovanliggande hoar kan dock passa i rustikare köksstilar – lantliga kök, country kitchen – där en mer "traditionell" look är önskad. Stenmontören behöver göra en enklare håltagning och riskerar mindre för stenen, vilket kan reducera kostnaden.</p>`,
      images: []
    },
    {
      heading: "Material: diskho i stål, komposit eller sten",
      content: `<p>Utöver monteringsmetoden: vilket material ska diskhon vara i?</p>
<p><strong>Rostfritt stål</strong> är det klassiska och praktiska valet. Tåligt, hygieniskt, lätt att rengöra. Tunnare stål (0.8 mm) låter mer och känns billigare; tjockare stål (1.0-1.5 mm) är tystare och mer premium. Brush-finish (borstat) visar fingeravtryck och repor mindre än polerat.</p>
<p><strong>Granit-komposit</strong> (granit + akrylharts) diskhoar är populära för att de matchar en stenbänkskivas estetik. De finns i ett brett spektrum av grå, svarta och beige färger. Nackdel: reagerar på starka rengöringsmedel och kan bli matta.</p>
<p><strong>Keramik/Silgranit</strong> är ett premiumval: extremt tålig, värme- och repbeständig, tillgänglig i ett brett spektrum av färger och former. Avsevärds tyngre – bänkskivan och understödet måste klara vikten.</p>
<p><strong>Natursten</strong> – samma sten som bänkskivan – är det ultimata estetiska valet. Håltagning och diskho i samma block ger en sömlös, monolitisk look. Extremt dyrt och ovanligt; kräver specialtillverkning.</p>`,
      images: []
    },
    {
      heading: "Praktiska råd för val av diskho",
      content: `<p>Checklista vid val av diskho till stenbänkskiva:</p>
<ol>
  <li><strong>Bestäm placering</strong> – Undermonterad för modernare look, ovanliggande för enklast montering.</li>
  <li><strong>Mät noggrant</strong> – Diskhons yttermått, djup och bassmåttet (det hål stenverkstaden behöver skära) måste stämma exakt.</li>
  <li><strong>Välj material efter stil</strong> – Stål för modern/industrial, komposit för mer neutral, keramik för premium.</li>
  <li><strong>Kontrollera med stenmontören</strong> – Bekräfta att de har erfarenhet av just den montagetyp du väljer.</li>
  <li><strong>Tätning</strong> – All håltagning behöver tätning med stenkompatibelt silikon. Se till att det görs korrekt.</li>
</ol>`,
      images: []
    }
  ]
},

// ─── WEEK 29 ───────────────────────────────────────────────────────────────
{
  slug: "taj-mahal-kvartsit",
  week_number: 29,
  sections: [
    {
      heading: "Taj Mahal kvartsit – det vita alternativet till marmor",
      content: `<p><strong>Taj Mahal</strong> är ett av de mest efterfrågade stennamnen i moderna lyxköket. Det är en brasiliansk kvartsit med en ljust kräm-guldbeige bakgrund, milda guldiga och vitt ådermönster, och en naturlig glans som ger den ett utseende som påminner om det allra finaste Calacatta-marmor – men med kvartsitens praktiska fördelar.</p>
<p>Att stenen fått namn efter det ikoniska marmormonumentet i Indien är ingen slump: den delade estetiken av vit bakgrund och eleganta ådror är uppenbar. Men där Taj Mahal-monumentet faktiskt är byggt av Makrana-marmor (kalcitbaserad), är den brasilianska stenen i fråga en kvartsit – ett fundamentalt hårdare och syratåligare material.</p>`,
      images: [{ src: "/images/materials/Kvartsit/quartzite kitchen countertop luxury.jpg", alt: "Taj Mahal kvartsit i lyxkök" }]
    },
    {
      heading: "Kvartsit vs marmor – varför spelar det roll?",
      content: `<p>Frågan ställs om och om igen: är Taj Mahal marmor eller kvartsit? Svaret är kvartsit – en metamorf bergart dominerad av kvarts (SiO₂) snarare än kalcit (CaCO₃). Skillnaden har enorma praktiska konsekvenser:</p>
<ul>
  <li><strong>Syratålighet:</strong> Kvarts reagerar inte med syror. Citronsaft, vin och ättika etsar inte Taj Mahal-kvartsit. Det är en av de viktigaste anledningarna till att den är så populär.</li>
  <li><strong>Hårdhet:</strong> Kvarts är hårdare (Mohs 7) än kalcit (Mohs 3). Taj Mahal är svårare att repa.</li>
  <li><strong>Underhåll:</strong> Kvartsit kräver mindre impregnering och tätare kontroll jämfört med kalcitbaserad marmor.</li>
</ul>
<p>Den kvantitativa skillnaden: i en families normala kök kommer Taj Mahal att hålla sig mycket bättre mot daglig slitage än vit Carrara-marmor.</p>`,
      images: []
    },
    {
      heading: "Varianter av Taj Mahal kvartsit",
      content: `<p>Taj Mahal-stenen varierar enormt block för block, och det finns undertyper:</p>
<ul>
  <li><strong>Taj Mahal Classic</strong> – Kräm-beige bakgrund med guldiga ådror i ett relativt subtilt mönster.</li>
  <li><strong>Taj Mahal Extra/Select</strong> – Vitare bakgrund, klarare mönster. Mer lik vit marmor i utseende.</li>
  <li><strong>Super White</strong> – Tekniskt en annan sort men nära besläktad; vit-ljusgrå kvartsit som ofta benämns i samma andetag som Taj Mahal.</li>
</ul>
<p>Viktigt: "Taj Mahal" används ibland löst som marknadsföringsbeteckning för liknande vita/kräm-beige kvartsiter. Be alltid om exakt stentyp och ursprung (gärna brott i Espírito Santo, Brasilien).</p>`,
      images: []
    },
    {
      heading: "Skötsel och underhåll",
      content: `<p>Taj Mahal kräver impregnering men mer sällan än marmor. Vanligtvis räcker det med en grundbehandling vid installation och sedan en gång per år. Stenen är tätare och mindre porös än de flesta marmorer, vilket gör att vätskor inte tränger in lika snabbt.</p>
<p>Viktigt: kvartsit är inte osårbar. Starka alkalier (oven cleaner, bleack) kan påverka glimmermineralen. Och trots syratåligheten bör spill torkas upp – att låta vätska stå länge är aldrig bra för natursten.</p>
<p>En praktisk fördel: Taj Mahals beige-guldiga ton döljer smuts och fläckar bättre än critvit marmor. Fingeravtryck och kaffefläckar är mindre framträdande mot den varmare bakgrunden.</p>`,
      images: []
    },
    {
      heading: "Designkombinationer",
      content: `<p>Taj Mahals varmt guldbeige-kräm tone passar med:</p>
<ul>
  <li>Vita och krämlackerade luckor – klassisk och tidlös</li>
  <li>Naturträ i ek eller Ask – matchar de varma tonerna perfekt</li>
  <li>Mässingsbeslag och kranar – de guldinslag i stenen framhävs</li>
  <li>Mörkgröna luckor – kontrast som accentuerar den ljusa stenen</li>
</ul>
<p>Mindre lyckade kombinationer: kolsvarta luckor (för kall kontrast mot det varma krämet), eller starka kulörer som rött och marinblått som konkurrerar med stenens naturliga ton.</p>`,
      images: []
    }
  ]
},

// ─── WEEK 30 ───────────────────────────────────────────────────────────────
{
  slug: "indien-granite-rajasthan",
  week_number: 30,
  sections: [
    {
      heading: "Indien – granitens globala gigant",
      content: `<p>Indien är världens näst största exportör av natursten och <strong>Rajasthan</strong> är landets stencentrum. Rajasthans öken- och berglandskap innehåller enorma reserver av granit i ett spektrum av färger – rosa, röd, grå, svart och brun – som exporteras till hela världen. Städer som Kishangarh, Udaipur och Makrana (känd för sin marmor) är centra för den indiska stenindustrin.</p>
<p>Indisk granit har länge dominierat marknaden för mer prisvärd granit i Europa – och priset är inte det enda argumentet. Indiska sorter som <strong>Tan Brown</strong>, <strong>Colonial White</strong>, <strong>Kashmir White</strong> och <strong>Black Galaxy</strong> är välkvalitativa stenar med unika estetiker som inte finns i europisk produktion.</p>`,
      images: [{ src: "/images/materials/Granit/granit-quarry.jpg.jpg", alt: "Granitbrott i Rajasthan, Indien" }]
    },
    {
      heading: "Populära indiska graniter",
      content: `<p>De mest efterfrågade indiska graniterna för bänkskivor i Sverige:</p>
<ul>
  <li><strong>Kashmir White</strong> – Ljusgrå-vit bakgrund med svarta och röda granatkristaller. Unik, lite exotisk look. Relativt populär.</li>
  <li><strong>Black Galaxy</strong> – Svart granit med guld-brons glimmerprickar som liknar stjärnor. Dramatisk och eftertraktad.</li>
  <li><strong>Tan Brown</strong> – Brun-röd bakgrund med svart och grå kristallinslag. Varm, jordnära ton.</li>
  <li><strong>Colonial White</strong> – Vit med grå-svart fläckad struktur. En av de mer neutrala indiska alternativen.</li>
  <li><strong>Blue Pearl (Indien-variant)</strong> – Blå-grå med pärlemor-liknande skimmer. Ej att förväxla med norska Blue Pearl.</li>
</ul>`,
      images: []
    },
    {
      heading: "Egenskaper och underhåll",
      content: `<p>Granit är generellt ett av de mest lättskötta naturstensmaterialen för bänkskivor. Det är hårt (Mohs 6-7), syratåligare än marmor (granit är kvarts-fältspat, inte kalcit), och kräver impregnering men mer sällan – kanske vart 2-3 år med normal användning.</p>
<p>Indisk granit följer dessa generella egenskaper men varierar i porositet. Kashmir White och Black Galaxy är relativt täta; Tan Brown kan vara lite mer porös. En enkel vattentest (droppa ett par droppar på stenen och se om det absorberas eller pärlar) kan ge en antydan om nuvarande impregneringsgrad.</p>`,
      images: []
    },
    {
      heading: "Etik och certifiering i indisk stenbrytning",
      content: `<p>Indisk stenbrytning har historiskt haft problem med arbetsförhållanden, barnarbete och miljöhänsyn – kritik som fortfarande delvis är relevant, om än situationen förbättrats avsevärt. Rajasthans marmor- och granitbrott är föremål för NGO-granskning, och internationella certifieringssystem inklusive <strong>Responsible Stone (RS)</strong> och <strong>Fair Stone</strong> täcker nu en del av det indiska sortimentet.</p>
<p>Fråga din stenverkstad om certifiering för indisk sten. Det är en relevant fråga, och en seriös leverantör ska kunna ge svar. Certifierat material är inte alltid dyrare – det handlar mer om att leverantörskedjan dokumenterats.</p>`,
      images: []
    },
    {
      heading: "Indisk sten vs europeisk sten – en jämförelse",
      content: `<p>Varför välja indisk granit framför europeisk?</p>
<ul>
  <li><strong>Pris:</strong> Indisk granit är vanligtvis mer prisvärd för liknande kvalitetsnivå jämfört med skandinavisk eller sydeuropeisk granit.</li>
  <li><strong>Sortiment:</strong> Färgspannet är bredare – du hittar sorter i Indien som inte finns i Europa.</li>
  <li><strong>Tillgänglighet:</strong> Väldig produktion innebär god tillgänglighet och snabb leverans.</li>
</ul>
<p>Varför välja europeisk?</p>
<ul>
  <li><strong>Transportavtryck:</strong> Kortare transporter, lägre CO2.</li>
  <li><strong>Enklare certifiering:</strong> Europeisk produktion är lättare att följa och certifiera.</li>
  <li><strong>Tradition:</strong> Skandinavisk granit (Bohuslänit, Ölandssten) har en lokal historia och identitet.</li>
</ul>`,
      images: []
    }
  ]
},

// ─── WEEK 31 ───────────────────────────────────────────────────────────────
{
  slug: "kalksten-bankskiva-guide",
  week_number: 31,
  sections: [
    {
      heading: "Kalksten – mjuk estetik med krav på skötsel",
      content: `<p><strong>Kalksten</strong> (limestone) är ett av de absolut äldsta byggnadsstenarnas i världen – Egyptens pyramider, Parthenon och medeltida europeiska katedraler är alla byggda av kalksten. Som bänkskivematerial är det ett nischval med en unik estetik, men ett som kräver förkunskaper och realistiska förväntningar.</p>
<p>Kalksten är en sedimentär bergart uppbyggd av kalciumkarbonat (CaCO₃) – samma grundämne som i marmor, men utan den metamorfos som ger marmorn sin kristallina struktur. Kalksten är mjukare, mer porös och mer syrakänslig än marmor, och dessa egenskaper måste beaktas seriöst vid val av kalksten som bänkskiva.</p>`,
      images: [{ src: "/images/materials/Kalksten/modern kitchen with real limestone countertop.jpg", alt: "Kalksten bänkskiva i modernt kök" }]
    },
    {
      heading: "Estetik: vad gör kalksten unik?",
      content: `<p>Kalksten har en mjuk, matt, organisk estetik som inget annat material kan replikera. Ytan är ofta ogenomskinlig och ljusdiffust – ljuset absorberas och reflekteras på ett brett sätt snarare än att fokuseras som i polerat marmor. Resultatet är en yta som ser mer "naturlig" ut, lite som ett ytterlag av jord eller sand.</p>
<p>Färgerna varierar från kritvitt och gräddvitt (Jura Beige, Pierre de Coutard) till ljusgrå (Bleu de Savoie), gul-beige (Jerusalem Gold) och mer dramatiska varianter med tydliga fossil-avtryck synliga i ytan. Det är detta sista – naturobjekten inbyggda i stenen – som är kalkstenen mest fascinerande estetiska egenskap.</p>
<p>Fossilbaserade kalkstenar (t.ex. med snäckfossil synliga) är ett unikt visuellt element som berättar om havsmiljöer för 100–400 miljoner år sedan. Det är ett berättande material i ordets bokstavliga mening.</p>`,
      images: []
    },
    {
      heading: "Praktik: kalksten i kök och badrum",
      content: `<p>Kalkstens primära utmaning: det är ett mjukt material (Mohs 3) som skrapas av keramiska tallrikar, kastruller och rostfria bestick om de dras hårt over ytan. Det är ett material som <em>inte</em> passar i ett intensivt hushållskök med barn som dagligen lagrar mat.</p>
<p>Syrakänsligheten är extremare än för marmor – citrus och ättika reagerar omedelbart och synligt. Daglig kontakt med matlagningsaktiviteter innebär en gradvis matt-etsning av ytan som är svår att vända utan professionell polering.</p>
<p>Kalksten <em>kan</em> användas i kök – men det passar bäst i ett kök med måttlig aktiv användning: ett representativt kök, ett lunchkök, ett andrakök, eller ett kök i fritidshus. Med rätt impregnering och omtanke kan det fungera, men med öppna ögon om vad som förväntas.</p>`,
      images: []
    },
    {
      heading: "Skötsel och impregnering av kalksten",
      content: `<p>Impregnering är absolut nödvändig och mer kritisk för kalksten än för andra material. Använd ett djupimpregnerende medel med god penetration. Applicera generöst före installation och repetera var 6-12 månad.</p>
<p>Rengöring: pH-neutrala rengöringsmedel formulerade specifikt för natursten. Aldrig ättika, citrus, sprejrengöringsmedel eller universalrengöringsmedel – alla dessa skadar kalkstens yta.</p>
<p>Spill måste torkas <em>omedelbart</em>. Kalksten har relativt hög porositet och absorberar oljebaserade ämnen snabbt. Rödvin, olivolja och salladsas kan tranga in på sekunder och kräva professionell behandling för att avlägsnas.</p>`,
      images: []
    },
    {
      heading: "Bästa appliceringsalternativ för kalksten",
      content: `<p>Kalksten ger absolut bäst resultat när det appliceras där det inte utsätts för daglig slitage och kemikalier:</p>
<ul>
  <li><strong>Badrum</strong> – Bänkskiva, golvplattor, duschgolv. Relativt skyddat från syror.</li>
  <li><strong>Vinbar/serveringsbord</strong> – Representativt ytor med kontrollerat bruk.</li>
  <li><strong>Köksbord</strong> – Inte bänkskiva, men köksbord med kalkstens skiva kan fungera med trasor under glas och fat.</li>
  <li><strong>Entré och hall</strong> – Golv och vägg, ej bänkyta.</li>
</ul>
<p>I badrum är kalksten ett fantastiskt material med en spa-liknande estetik. Rätt behandlat tål det fukt väl och ger en tidlös naturlig känsla.</p>`,
      images: []
    }
  ]
},

// ─── WEEK 32 ───────────────────────────────────────────────────────────────
{
  slug: "portoro-marmor",
  week_number: 32,
  sections: [
    {
      heading: "Portoro – den svarta marmorn med guldådror",
      content: `<p><strong>Portoro</strong> är en av Italiens mest exklusiva marmorsorter och ett av de sällsyntaste naturstenmaterialen överhuvudtaget. Den bryts i begränsade mängder i Portofino-halvön i Ligurien, norra Italien – samma kust som är känd för sina pastellfärgade fiskebyar och naturskönhet. Stenen är djupsvart med distinkta guldgula och vita ådror i ett kontrastrikt, dekorativt mönster.</p>
<p>Portoro har använts i europeisk arkitektur och konst sedan medeltiden och är ett privilegieringsmarkerande material i ordets verkliga mening. Du ser det i europeiska palatser, operahus och exklusiva privata residenser. Det är inte ett material för det blygsamma köket – det är ett material som skriker exklusivitet.</p>`,
      images: [{ src: "/images/materials/Granit/granit-kitchen.jpg.jpg", alt: "Svart marmor med guldådror i lyxköket" }]
    },
    {
      heading: "Geologi och varför den är sällsynt",
      content: `<p>Portoro bildades för ca 150 miljoner år sedan som kalkstenssediment på havsbotten under juratiden. Under alpina bergsbildningen metamorfoserades kalkstenlagren, och det höga trycket tvingade in bituminösa organiska restprodukter som fick sten svart. Guldådorna uppstod när kalcit och pyrit (svavelkis – en järn-svavelförening med guldglans) penetrerade sprickbildningar i berget.</p>
<p>Portoros sällsynthet är inte artificiellt skapad – det handlar faktiskt om ett begränsat geografiskt förekomstområde. De aktiva brotten är kontrollerade av ligurianska regionala myndigheter och produktionen är strikt reglerad. Det innebär att riktig Portoro är genuint sällsynt och priset återspeglar detta.</p>`,
      images: []
    },
    {
      heading: "Portoro i design – var och hur",
      content: `<p>Portoros starka estetik kräver att den används strategiskt. Det är inte ett material för hela köket – en Portoro-yta i ett litet kök skulle vara överväldigande. Men som <strong>accent</strong> – en köksö, en bar-bänkskiva, en toalettbänk – är Portoro enastående.</p>
<p>Kombinationerna som fungerar bäst:</p>
<ul>
  <li>Rent vit omgivning (vita luckor, vita väggar) där Portoro är den enda dekorativa poängen.</li>
  <li>Varmt mässing och guld i beslag, kranar och lampor som speglar guldtonerna i stenens ådror.</li>
  <li>Naturträ i mörk valnöt för ett varmt, lyxigt badrumskoncept.</li>
</ul>
<p>Portoro ger också fantastiska resultat som stänkskydd bakom spis eller diskho – en stor slab på väggen utan fogar ger ett dramatiskt utseende.</p>`,
      images: []
    },
    {
      heading: "Skötsel av Portoro",
      content: `<p>Som svart kalcitmarmor delar Portoro utmaningarna med Nero Marquina: syrakänslig, känslig för kalkavlagringar som syns tydligt mot den mörka ytan, och kräver noggrann impregnering.</p>
<p>Det unika med Portoro är pyrithalten i ådorna: pyrit (FeS₂) kan under extrema fuktförhållanden oxidera och ge rostiga missfärgningar. Det är ovanligt i normala köksförhållanden men kan ske om stenen utsätts för stående vatten under lång tid. Undvik att låta vatten stå runt kran och diskho.</p>
<p>Poleringsbehandling var 3-5 år av en professionell stenslipersfirma är rekommenderat för att bibehålla ytan och ta bort eventuell patina.</p>`,
      images: []
    },
    {
      heading: "Prisnivå och tillgänglighet",
      content: `<p>Portoro är ett av de dyraste naturstenmaterialen på marknaden – priset per kvadratmeter är signifikant. Det finns på de flesta stora stenverkstäder i Sverige men i begränsade kvantiteter. Leveranstid kan vara lång om det specifika block du önskar inte finns i lager.</p>
<p>Viktigt: "Portoro" är ett av de mer missbrukade stennamnen på marknaden. Svarta marmorer med guldådror från andra länder (Turkiet, Iran) säljs ibland under Portoro-namn. Äkta Portoro från Ligurien har ett specifikt ådermönster och en glans som skiljer den från imitationerna. Be om ursprungscertifikat.</p>`,
      images: []
    }
  ]
},

// ─── WEEK 33 ───────────────────────────────────────────────────────────────
{
  slug: "turkiet-marmor-afyon",
  week_number: 33,
  sections: [
    {
      heading: "Turkiet – en av världens viktigaste marmornationer",
      content: `<p>Turkiet är bland de fem största producenterna av natursten i världen och ett av Europas närmaste stora stenexporterande länder. Den anatoliska halvön är geologiskt exceptionell – komplex bergsbildning under tiotals miljoner år har skapat enorma reserver av marmor, onyx, travertin och granit i ett brett spektrum av kvaliteter och sorter.</p>
<p>Türkiets marmorindustri är koncentrerad till framförallt <strong>Afyon-provinsen</strong> i västra Anatolien – ett av världens viktigaste marmorbrott – samt Ege-regionen kring Izmir och Marmara-havsområdet. Produktionen exporteras huvudsakligen till Europa, USA och Gulf-regionen.</p>`,
      images: [{ src: "/images/materials/Marmor/marmor-quarry.jpg", alt: "Marmorbrott i Turkiet" }]
    },
    {
      heading: "Afyon-marmorn – Turkiets vita stolthet",
      content: `<p><strong>Afyon</strong>-distriktet producerar en av Europas mest uppskattade vita och ljusgrå marmorer. Den mest kända sorten, <strong>Afyon White</strong> (Afyon Beyaz), är en kritvit marmor med diskreta grå ådror och en fin, jämn kristallstruktur. Den jämförs ofta med Carrara Bianco C men anses av många stonimportörer vara mer homogen och jämn i kvaliteten.</p>
<p><strong>Afyon Sugar</strong> – "sockermarmorn" – är en annan populär sort med en suggestiv socker-vit, matt finish som ger ett unikt utseende. Det är ett material som används flitigt i badrum och i exklusiva hotellobby-miljöer.</p>
<p>Afyon-regionen producerar även <strong>Afyon Beige</strong> (ljust beige, minimal ådring) och <strong>Afyon Pink</strong> (rosé-ton) – sorter som ger ett varmare alternativ till det kalla vita.</p>`,
      images: []
    },
    {
      heading: "Turkiska alternativ till Carrara",
      content: `<p>Ur ett praktiskt köparperspektiv är turkisk marmor – och Afyon White specifikt – ett utmärkt alternativ till Carrara för den som söker vit marmor med god kvalitet men mer prisvärd.</p>
<p>Skillnader att känna till:</p>
<ul>
  <li><strong>Kristallstruktur:</strong> Afyon White är generellt mer homogen med jämnare kristallstorlek. Carrara Bianco kan variera mer.</li>
  <li><strong>Ådring:</strong> Afyon White har mer diskreta, tunnare ådror än typisk Carrara. Mer lugn och neutral.</li>
  <li><strong>Pris:</strong> Turkisk marmor är vanligtvis mer prisvärd än italiensk vid likvärdig kvalitet, dels p.g.a. kortare transportkedjor.</li>
  <li><strong>Tillgänglighet:</strong> Turkiet är en stor producent med god tillgänglighet; leveranstider är normalt kortare.</li>
</ul>`,
      images: []
    },
    {
      heading: "Hållbarhet och miljöfrågor i turkisk stenbrytning",
      content: `<p>Turkisk stenbrytning är föremål för liknande miljödebatter som produktion i Brasilien och Indien. Reglering har skärpts under 2010-talet men är ojämnt implementerad. Välrenommerade turkiska exportörer – och det finns många – håller höga standarder och kan uppvisa relevant certifiering.</p>
<p>EU importeras ca 20% av sin natursten från Turkiet, och EU:s due-diligence-krav på importörer driver turkiska exportörer att investera i bättre dokumentation och transparens. Det är en positiv trend för konsumenter som vill ha certifierat material.</p>`,
      images: []
    }
  ]
},

// ─── WEEK 34 ───────────────────────────────────────────────────────────────
{
  slug: "stanksydd-sten-guide",
  week_number: 34,
  sections: [
    {
      heading: "Stänkskydd i natursten – mer än estetik",
      content: `<p>Ett stänkskydd (backsplash) i natursten är ett av de mest omvälvande uppgraderingar du kan göra i ett kök. Det är en yta som täcker 40–80 cm av väggytan bakom bänkskivan – synlig hela tiden, tänd i köksljuset, lika skottat som bänkskivan men lättare att behandla estetiskt eftersom det inte bär föremål.</p>
<p>Stänkskyddet skyddar väggen mot stänk från matlagning, vatten och rengöring. I natursten ger det dessutom en kontinuitet med bänkskivan – om båda är i samma material flödar köket visuellt – eller ett contrasterande element om du väljer ett annat material.</p>`,
      images: [{ src: "/images/materials/Travertin/travertine bathroom tiles in modern kitchen with suthel viens.jpg", alt: "Naturstens stänkskydd i modernt kök" }]
    },
    {
      heading: "Samma sten som bänkskivan – monolitisk look",
      content: `<p>Det starkaste designvalet är att använda exakt samma sten till stänkskyddet som till bänkskivan. Om du har en Calacatta Gold bänkskiva och skär ett stänkskydd ur samma slab, får du ett unikt resultat: ådermönstret flödar kontinuerligt från horisontell till vertikal yta.</p>
<p>Det kallas ibland "bookmatch" – om du skär parallella skivor ur samma slab och viker ut dem som en bok, speglar ådermönstret sig symmetriskt. Det är en av de mest spektakulära teknikerna i naturstensdesign och kräver planering och tillräckligt med material från rätt block.</p>
<p>Praktiskt: boka hem extra material vid beställning av bänkskivan. Det är svårt att hitta matchande slab senare, eftersom batcher av samma block är begränsade.</p>`,
      images: []
    },
    {
      heading: "Tunnare format – sten som stänkskydd utan strukturkrav",
      content: `<p>Stänkskyddet behöver inte vara lika tjockt som bänkskivan. De flesta stenverkstäder erbjuder stänkskydd i 10–15 mm tjocklek, vilket reducerar vikt och pris jämfört med 20 mm. Eftersom stänkskyddet inte bär last är det fullt tillräckligt.</p>
<p>Ännu tunnare alternativ (3-6 mm) i natursten eller sintererad sten (Dekton, Lapitec) är ett alternativ vid renovering av befintliga kök där väggen redan är klädd – en tunn skivor kan monteras direkt ovanpå befintlig kakel utan att ta bort allt.</p>`,
      images: []
    },
    {
      heading: "Stänkskydd i annan sten – kontrast och kombination",
      content: `<p>Väljer du ett annat stenaterial till stänkskyddet än bänkskivan öppnar du möjligheter för komplexa, spännande designkombinationer:</p>
<ul>
  <li><strong>Mörkt bänkskiva + ljust stänkskydd:</strong> Nero Marquina bänkskiva + Thassos vit marmor stänkskydd – stark kontrast.</li>
  <li><strong>Neutralt bänkskiva + dramatiskt stänkskydd:</strong> Grå granit + Calacatta Gold-stänkskydd. Stenen på väggen är konstvärket.</li>
  <li><strong>Naturstenbänkskiva + mosaik i sten:</strong> Carrara bänkskiva + Carrara mosaik i herringbone-mönster – variera formaten av samma material.</li>
</ul>
<p>Nyckeln är att låta ena ytan dominera. Två starka mönster (dramatisk bänkskiva + dramatiskt stänkskydd) slåss om uppmärksamheten och skapar kaos snarare än harmoni.</p>`,
      images: []
    },
    {
      heading: "Praktiska råd för montering",
      content: `<p>Stänkskydd i sten monteras med stenklister på befintlig vägg. Viktigt att väggunderlaget är stabilt och torrt – fukt bakom stenen orsakar blöjningsklister och missfärgning. Kakel kan sitta som bakgrundslager om det är ordentligt fäst; löst kakel måste tas bort.</p>
<p>Fogar ska vara minimala (1-2 mm) och tätas med stenkompatibel fogmassa i matchande färg. Silikon vid stänkskyddets överkant mot vägg, vid anslutning mot bänkskiva, och vid eventuella hörn och skarvar.</p>
<p>Hörn hanteras med antingen 45-graderssnitt (mitredfog – elegant men kräver precision) eller kvadrantlist i sten eller metall.</p>`,
      images: []
    }
  ]
},

// ─── WEEK 35 ───────────────────────────────────────────────────────────────
{
  slug: "verde-guatemala-marmor",
  week_number: 35,
  sections: [
    {
      heading: "Verde Guatemala – grön natursten med karaktär",
      content: `<p><strong>Verde Guatemala</strong> är en grön natursten med ett unikt mönster: djupgrön bakgrund genomkorsat av vita, svarta och guldaktiga ådror i ett mönster som påminner om abstrakt konst. Det är en av de gröna naturstensorter som blivit allt populärare i europeiska kök och badrum i takt med trenden mot naturliga, jordnära färger.</p>
<p>Trots namnet är Verde Guatemala – i dess mest kända kommersiella form – faktiskt bruten i Centralamerika, mer specifikt i Guatemala och angränsande delar av Mexico. Det är en serpentinitmarmor, en bergart bildad när oceanbottensbasalt metamorfoserats under högt tryck och låg temperatur.</p>`,
      images: [{ src: "/images/materials/Kvartsit/modern kitchen quartzite countertop.jpg", alt: "Grön natursten i köket" }]
    },
    {
      heading: "Serpentinit – ett alternativt grönt material",
      content: `<p>Verde Guatemala klassificeras tekniskt som <strong>serpentinit</strong> snarare än marmor i den strikta geologiska definitionen. Serpentinit bildas när olivin- och pyroxenrika vulkaniska bergarter från oceanisk skorpa reagerar med vatten under högt tryck – en process kallad serpentinisering. Mineralerna som bildas – serpentin, talkt, klorit – ger bergarten sin karakteristiska gröna ton.</p>
<p>Praktisk konsekvens: serpentinit har andra egenskaper än kalcitmarmor. Den är inte kalcitbaserad, och reagerar därför inte med syror på samma sätt. Den är heller inte lika hård som granit. Den har en unik textur och glans som är specifik för serpentinitmaterialet.</p>`,
      images: []
    },
    {
      heading: "Applicering och skötsel",
      content: `<p>Verde Guatemala används primärt som dekorativt inslagelement snarare än en övergripande bänkskivematerial. Det är en sten som stärker ett designkoncept snarare än bär det.</p>
<p>Vanliga appliceringar: stänkskydd, köksbänksframstycke (fasadplattan mot knäna), toalettsida, sidopanel på köksö. Som hel bänkskiva kan det fungera men grönets dominans kräver att resten av köket är noggrant genomtänkt.</p>
<p>Skötsel: pH-neutral rengöring, regelbunden impregnering. Serpentinit har generellt lägre kemisk syrakänslighet men är sårbar för starka alkalier. Torka alltid spill snabbt.</p>`,
      images: []
    },
    {
      heading: "Gröna alternativ: Verde Guatemala vs Azul Valverde",
      content: `<p>De två populäraste gröna naturstensorterna i svenska stenbutiker just nu är Verde Guatemala och Azul Valverde. Jämförelse:</p>
<ul>
  <li><strong>Grundfärg:</strong> Verde Guatemala är mörkare, mer olivgrön-svart; Azul Valverde är turkosare och ljusare.</li>
  <li><strong>Mönster:</strong> Verde Guatemala har mer dramatiska, kontrasterande vita och svarta ådror; Azul Valverde har silvriga kristallstrimmer.</li>
  <li><strong>Hårdhet:</strong> Azul Valverde (kvartsit) är hårdare; Verde Guatemala (serpentinit) är mjukare.</li>
  <li><strong>Karaktär:</strong> Verde Guatemala är mer dramatisk och djup; Azul Valverde är mer levande och tropisk.</li>
</ul>`,
      images: []
    }
  ]
},

// ─── WEEK 36 ───────────────────────────────────────────────────────────────
{
  slug: "grekland-thassos-vit-marmor",
  week_number: 36,
  sections: [
    {
      heading: "Thassos – den absolut renaste vita marmorn",
      content: `<p><strong>Thassos</strong> är en liten ö i norra Egeiska havet, Grekland – och det är hem för vad många experter betraktar som världens renaste vita marmor. <strong>Thassos marmor</strong> (även kallad Super White Thassos) är nästan bländande vit utan de grå eller beige toner som präglar Carrara och de flesta andra vita marmorer. Det är en ren, kristallin vit som är unik i naturstenssortimentet.</p>
<p>Stenen har använts i grekisk arkitektur i 2500 år – de klassiska statyer och templar som ger oss vår bild av antikens Greklend är delvis gjorda av Thassos-marmor. Idag exporteras den framförallt till badrum och lyxinredning världen över.</p>`,
      images: [{ src: "/images/materials/Marmor/marmor-hero.jpg", alt: "Thassos vit marmor – den renaste vita" }]
    },
    {
      heading: "Varför är Thassos så extremt vit?",
      content: `<p>Thassos-marmorns extrema vitkvalitet beror på en ovanlig geologisk historia. Den ursprungliga kalkstensbädden var exceptionellt ren – minimal inblandning av organiska material, järn eller mangan. Under metamorfosen bildades nästan ren kalcit, utan de gråfärgade grafit-inblandningar som ger exempelvis Carrara sin gråblå ton.</p>
<p>Resultatet är en marmor med optisk renhet: ljuset reflekteras diffust i kalcitkristallernas många facetter, utan de grå eller gula undertoner som absorberar och mörklägger. Det är bokstavligen det ljusaste naturstenmaterialet i kommersiell produktion.</p>`,
      images: []
    },
    {
      heading: "Thassos i badrum – det naturliga valet",
      content: `<p>Thassos används nästan uteslutande i badrum och spa-miljöer – och det är rätt. Den kritvita lyster lyser upp ett badrum på ett unikt sätt, och mot ljusa kakelväggar och vitt porslin skapar den en enhetlig, ren, lyxig estetik.</p>
<p>I kök är Thassos mer ovanlig – den extrema vitkvaliteten gör att fläckar och smuts är extremt synliga, och ett intensivt kök med daglig matlagning är inte det naturliga hemmet för Thassos. Men i ett delikat badrum, välskötta, är det ett material som inte har sin like.</p>`,
      images: []
    },
    {
      heading: "Skötsel och impregnering",
      content: `<p>Thassos är kalcitmarmor och delar samma syrakänslighet som alla vita marmorer. Dessutom är den extremt vita bakgrunden en magnifying glass för alla fläckar och missfärgningar – allt syns tydligare mot ett perfekt vitt.</p>
<p>Impregnering är absolut nödvändig. Använd ett penetrerande medel och repetera var 12-18 månad. Torka all fukt och spill omedelbart. I badrum med hårt vatten: regelbunden avlägsning av kalkfläckar med naturstenskompatibelt medel (aldrig ättika).</p>
<p>Thassos är ett material som belönar omsorg – välskött ser den fantastisk ut i decennier; eftersatt förfaller den snabbt.</p>`,
      images: []
    }
  ]
},

// ─── WEEK 37 ───────────────────────────────────────────────────────────────
{
  slug: "terrazzo-bankskiva-guide",
  week_number: 37,
  sections: [
    {
      heading: "Terrazzo – från golvmaterial till kökets stjärna",
      content: `<p><strong>Terrazzo</strong> har en lång och fascinerande historia. Ursprungligen var det ett praktiskt sätt för venetianska stenarbetare under 1500-talet att använda upp marmorrester – kross av marmor och granit blandades i ett cementbindningsmedel och polerades till ett blankt golv. Resultatet var ett mönstrikt, hållbart och prisvärt alternativ till solid marmor.</p>
<p>Under 1920-talets Art Deco-rörelse exploderade terrazzon i popularitet och präglar fortfarande golven i otaliga europiska hotell, butiker och offentliga byggnader. Det försvann sedan delvis från modet under 1980-90-talen – för att nu komma tillbaka med kraft, nu inte som golvmaterial utan som bänkskiva och inredningsdetalj i de mest modemedvetna köken.</p>`,
      images: [{ src: "/images/materials/Terrazzo/terrazzo countertop kitchen.jpg", alt: "Terrazzo bänkskiva i modernt kök" }]
    },
    {
      heading: "Vad är terrazzo egentligen?",
      content: `<p>Terrazzo är ett kompositmaterial av stenaggregat (marble chips, granitbitar, kvartskornsler eller glasfragment) inbäddade i ett bindningsmedium – traditionellt cementbruk, moderna varianter använder epoxiharts. Det är alltså ett "tillverkat" material av naturliga komponenter, inte en natursten i sig.</p>
<p><strong>Cementbaserat terrazzo</strong> – det traditionella. Mer porös, kräver impregnering, men har en genuinare, lite mer levande yta. Kan repareras och slipas om på plats.</p>
<p><strong>Epoxybaserat terrazzo</strong> – mer modernt. Tätare, starkare, mer komplex mönsterdesign möjlig. Kan gjutas i formgivna format och skivor. Mer vanligt för bänkskivor.</p>
<p><strong>Agglomerat terrazzo</strong> – som quartz composite, men med marmorchips i cementmatris. En blandform.</p>`,
      images: []
    },
    {
      heading: "Estetik: terrazzos moderna uttryck",
      content: `<p>Moderna terrazzo-bänkskivor har lite gemensamt med 1960-talets mustiga golvmaterial. Det finns nu en enorm flexibilitet i design:</p>
<ul>
  <li><strong>Stenaggregat:</strong> Grovkornig (stor marmorkross) eller finkornig (liten prickad yta). Mono-material (bara vit marmor) eller blandad (olika stenar, glas, till och med mässingsbitar).</li>
  <li><strong>Bakgrundsfärg:</strong> Cement kan färgas i valfri kulör – vitt, grått, svart, grönt, rosa. Det är designerns fria val.</li>
  <li><strong>Mönster:</strong> Traditionell jämn fördelning, eller avsiktlig strömning av större bitar.</li>
</ul>
<p>Trendens höjdpunkt 2025-26 är <strong>grovkornig terrazzo</strong> i pastellfärger med stora, tydliga marmorbitar – en retro-modernt estetik som är både lekfull och sofistikerad.</p>`,
      images: []
    },
    {
      heading: "Skötsel av terrazzo bänkskiva",
      content: `<p>Cementbaserad terrazzo kräver impregnering och pH-neutral rengöring, liknande natursten. Epoxybaserad terrazzo är mer tålig och tätare – men skadas av starkt alkali och lösningsmedel.</p>
<p>Repor kan uppstå i cementbaserad terrazzo om hårda föremål dras aggressivt. Ytan kan slipas och ompoleras av professionell stenslipare, vilket är en stor fördel jämfört med laminat eller komposit som inte kan renoveras.</p>
<p>Värmebeständighet: cementbaserad terrazzo tål måttlig värme bättre än epoxybaserad (epoxy mjuknar vid hög temperatur). Använd alltid grytunderlag.</p>`,
      images: []
    },
    {
      heading: "Terrazzo vs natursten – vad väljer du?",
      content: `<p>Terrazzo och natursten är fundamentalt olika produkter men konkurrerar i ungefär samma marknadsegment. Nyckelskillnader:</p>
<ul>
  <li><strong>Unikhet:</strong> Varje naturstensbit är unik; terrazzo produceras i batchar men varierar mer i detalj än laminat.</li>
  <li><strong>Formgivning:</strong> Terrazzo kan gjutas i komplexa former (runt, kurvig); natursten kapas.</li>
  <li><strong>Pris:</strong> Epoxyterrazzo av god kvalitet liknar priset för mellansortiment natursten.</li>
  <li><strong>Estetik:</strong> Naturstens ådermönster och djup kan inte replikeras av terrazzo; terrazzon har sin unika fläckiga, levande look.</li>
</ul>
<p>Terrazzo passar perfekt i ett kök som vill ha naturstens-känsla men med ett mer formgivningsfritt estetiskt uttryck.</p>`,
      images: []
    }
  ]
},

// ─── WEEKS 38-52 (shorter but still substantive) ──────────────────────────

// WEEK 38
{
  slug: "marmomacc-verona-massa",
  week_number: 38,
  sections: [
    {
      heading: "Marmomacc – stenbranschens olympiska spel",
      content: `<p><strong>Marmomacc</strong> i Verona är världens största mässa för natursten och den viktigaste marknadsplatsen för hela den globala naturstensindrin. Hålls varje september i Veronafiera och lockar 65 000+ besökare och 1 700+ utställare från 60 länder. Det är här leverantörer presenterar nya material, maskintillverkare visar ny teknik, och köpare – arkitekter, stenimportörer, distributörer – möter hela världens stensortiment under ett tak.</p>
<p>För arkitekter och designere är Marmomacc den viktigaste källan till inspiration och materialkunskap. Trenderna som presenteras här sätter agendan för europeisk stendesign de kommande åren.</p>`,
      images: [{ src: "/images/materials/Granit/granit-factory.jpg.jpg", alt: "Stenverkstad och stenbransch på mässa" }]
    },
    {
      heading: "Vad Marmomacc 2026 visade",
      content: `<p>Marmomacc 2026 bekräftade och fördjupade trenderna från Eurocucina: natursten är tillbaka på allvar i kök och badrum, och den dominanta estetiken är autentisk, texturrik och individbaserad. De tre starkaste trenderna på mässan:</p>
<p><strong>Ultra-personalisering</strong> – Enstaka, unika slabs valda av köparen direkt från lager. Digitala plattformar som låter konsumenten välja exakt position på slaben. Masscustomization inom stenvärlden.</p>
<p><strong>Cirkularitet och reuse</strong> – Återvunna stenar från rivningsprojekt, presenterade som ny produkt med historia. Marmor från 1800-tals palats i Frankrike, granittrappor från brittiska tågstationer – alla möjliga material visas som lyxiga återvunna resurser.</p>
<p><strong>Lokalt och europeiskt</strong> – Som reaktion mot transoceana transporter lyfts europeisk sten (Kvartsit, kalksten, granit) från Skandinavien, Frankrike, Portugal, Spanien. Kortare transport, lägre CO2, starkare berättelse.</p>`,
      images: []
    },
    {
      heading: "Branschnyheter och innovationer",
      content: `<p>Maskinutvecklarna på Marmomacc presenterade nya lösningar för precision och digitalisering. AI-styrd kapoptimering – program som beräknar hur en slab skärs för att maximera materialet och minimera spill – är nu mainstream. Digital tvillingteknologi för stenbearbetning, där varje slab skannas i 3D och bearbetningsprocessen simuleras virtuellt innan den körs, är ett annat steg framåt.</p>
<p>3D-printing med naturstenpulver som råmaterial är fortfarande ett nischmaterial, men demonstrationer på Marmomacc visar att komplext formade stenelement – svängda fasader, hålsten i organiska former – nu kan tillverkas utan det manuella arbete som hittills gjort det prohibitivt dyrt.</p>`,
      images: []
    },
    {
      heading: "Verona som stenhuvudstad",
      content: `<p>Verona är inte slumpmässigt valt som Marmomacc-stad. Regionen kring Verona och norra Veneto-provinsen är Italiens och en av Europas viktigaste stenproduktionsregioner. Veronesisk röd marmor (Rosso Verona), Vicenza-kalksten, och de mångfaldiga travertinerna från Toscana distribueras via Veronasregionens väl etablerade stentransport-infrastruktur.</p>
<p>Att delta i Marmomacc – om du har möjligheten – ger en förståelse för stenindustrin som inga webshoppar, broschyrer eller showroom kan ge. Det är ett rekommenderat besök för alla som arbetar professionellt med natursten.</p>`,
      images: []
    }
  ]
},

// WEEK 39
{
  slug: "cersaie-bologna-massa",
  week_number: 39,
  sections: [
    {
      heading: "Cersaie – keramik, sten och badrumsdesign i Bologna",
      content: `<p><strong>Cersaie</strong> i Bologna är världens ledande mässa för keramik, klinker och badrumsdetaljer, och ett nyckelvent för sintererade stenmaterial som <strong>Dekton</strong>, <strong>Lapitec</strong> och <strong>Neolith</strong>. Det hålls varje år i september och är en viktig motvikt till Marmomacc – medan Marmomacc fokuserar på äkta natursten, är Cersaie centret för teknologisk materialtillverkning.</p>
<p>I takt med att sintered stone-material (sintererade keramiska plattor med stenestetik) vuxit enormt det senaste decenniet, har Cersaie blivit allt viktigare för bänkskivemarknaden. Sortimenten från Dekton och Lapitec presenterade nya kollektioner 2026 med mineralinspirerade ytor som försöker immstera de allra skarpaste naturstenssorterna.</p>`,
      images: [{ src: "/images/materials/Terrazzo/terrazzo countertop kitchen.jpg", alt: "Moderna keramiska bänkskivor på mässa" }]
    },
    {
      heading: "Sintered stone vs natursten – en ärlig jämförelse",
      content: `<p>Sintered stone-bänkskivor (Dekton, Lapitec, Neolith) marknadsförs som ett "bättre" alternativ till natursten. Låt oss titta på en objektiv jämförelse:</p>
<p><strong>Fördelar med sintererat material:</strong></p>
<ul>
  <li>Extremt hård yta (hårdare än de flesta natursten)</li>
  <li>Syra- och kemikaliebeständig (tål ättika, citronsaft)</li>
  <li>Värmebeständig (kan ställa varma kastruller direkt på ytan)</li>
  <li>Ingen impregnering krävs</li>
  <li>Konsistent mönster i hela batcher</li>
</ul>
<p><strong>Fördelar med natursten:</strong></p>
<ul>
  <li>Äkthet och naturlig unicitet – varje slab är unik</li>
  <li>Djup och tredimensionellt utseende som sintererat inte kan matcha</li>
  <li>Känslan – natursten är sval, tung och taktilt annorlunda</li>
  <li>Reparerbarhet – sliten yta kan poleras om av stenslipare</li>
  <li>Fastighetsvärde och status – natursten kommunicerar mer premium</li>
</ul>`,
      images: []
    },
    {
      heading: "När ska du välja sintererat material?",
      content: `<p>Det finns situationer där sintererat material är det rationella valet framför natursten:</p>
<ul>
  <li><strong>Intensivt familje-kök</strong> där barn och daglig matlagning kräver ett skuddsäkert material utan impregnering och syrafobier.</li>
  <li><strong>Utomhuskök</strong> – sintererat tål UV-ljus, frost och väder; de flesta natursten gör det inte lika bra.</li>
  <li><strong>Budget-projekt</strong> med estetiska krav på steinlook utan naturstenpris.</li>
  <li><strong>Professionella kök</strong> med industriell rengöring och kemikalier.</li>
</ul>
<p>För representativa kök, lyxrenovering och projekt där äkthet värderas högt är natursten fortfarande överlägsen estetiskt. De bästa sintered materials kan lurar de flesta – men inte kunder som vet vad de letar efter.</p>`,
      images: []
    }
  ]
},

// WEEK 40
{
  slug: "absolute-black-granit",
  week_number: 40,
  sections: [
    {
      heading: "Absolute Black – den renaste svarta graniten",
      content: `<p><strong>Absolute Black</strong> är ett av de mest sålda naturstenmaterialen i kategorin svart granit. Stenen bryts primärt i södra Indien (Karnataka-delstaten) och är karakteriserad av en djupsvart, närmast homogen bakgrundsfärg med minimal variation och synliga kristaller. Det är ett "rent", neutralt svart som är lätt att kombinera och aldrig "missar".</p>
<p>Populariteten beror på dess neutralitet – det är en sten som matchar nästan alla köksstilar och lyckas se bra ut utan att kräva komplex designplanering. Det är den svarta granitens Carrara Bianco C: ett pålitligt, brett tillämpbart val.</p>`,
      images: [{ src: "/images/materials/Granit/granit-kitchen.jpg.jpg", alt: "Absolute Black granit i modernt kök" }]
    },
    {
      heading: "Egenskaper och underhåll",
      content: `<p>Absolute Black är granit – det innebär hårdhet (Mohs 6-7), god syratålighet (granit är kvarts-fältspat, inte kalcit), och relativt låg porositet. Det är ett lättsköttare material än marmor och kräver impregnering men mer sällan.</p>
<p>Utmaningen med svart granit: <strong>kalkfläckar</strong>. Hårda vatten lämnar vita kalkavlagringar som syns tydligt mot den svarta ytan. Torka alltid vatten runt kran och diskho. Regelbunden behandling med kalkborttagningsmedel kompatibelt med natursten är nödvändigt.</p>
<p>Fingeravtryck är också synliga mot det svarta – oljorna i huden lämnar lätta märken. Borstad eller honed yta minimerar detta; polerat syns fingeravtryck mer.</p>`,
      images: []
    },
    {
      heading: "Design med Absolute Black",
      content: `<p>Absolute Black är en av de mest designneutrala stenarna som finns. Det fungerar med:</p>
<ul>
  <li>Vita kök – den ultimata kontrasten, alltid elegant</li>
  <li>Ljusgråa kök – subtil, sofistikerad kontrast</li>
  <li>Träfrontade kök – det varma träets naturlighet mot kall svart ger ett balanserat uttryck</li>
  <li>Monokromatiska svarta kök – mat, textural look</li>
</ul>
<p>En enkel regel: Absolute Black gör sig bäst när den kontrasterar mot ljusare omgivning. I ett mörkt kök utan kontrast kan den försvinna och ge ett "tungt" intryck.</p>`,
      images: []
    }
  ]
},

// WEEK 41
{
  slug: "zimbabwe-black-granit",
  week_number: 41,
  sections: [
    {
      heading: "Zimbabwe Black – Afrikas svar på Absolute Black",
      content: `<p><strong>Zimbabwe Black</strong> (ibland kallt Absolute Zimbabwe eller Zimbabwe Absolute) är en afrikansk granit som erbjuder ett alternativ – och för många ett bättre alternativ – till indisk Absolute Black. Stenen bryts i Zimbabwe, söödra Afrika, och har en djupsvart bakgrundsfärg med en distinkt, något grövre kristallstruktur än indisk Absolute Black som ger den ett mer levande, tredimensionellt utseende.</p>
<p>Tyst nog är Zimbabwe Black egentligen inte ett komplett homogent svart – det är en mörk norsk larvikite-liknande efekt med en svagt grön-blå skimmer när ljuset faller rätt. Det är denna subtila djup och komplexitet som skiljer Zimbabwe Black från den indiska varianten.</p>`,
      images: [{ src: "/images/materials/Granit/granit-quarry.jpg.jpg", alt: "Granitbrott i Zimbabwe" }]
    },
    {
      heading: "Jämförelse: Zimbabwe Black vs Absolute Black (Indien)",
      content: `<p>Om du funderar på svart granit är det värt att jämföra dessa två noggrant:</p>
<ul>
  <li><strong>Homogenitet:</strong> Indisk Absolute Black är mer homogen och matt svart. Zimbabwe Black har mer synliga kristallgränser och en subtil djupgrönt-blå reflektion.</li>
  <li><strong>Textur:</strong> Zimbabwe har grövre kristallstruktur – mer organisk look. Absolut Black är mer jämn.</li>
  <li><strong>Polerbarhet:</strong> Båda poleras utmärkt; Zimbabwe kan ha ett något mer levande polerat utseende.</li>
  <li><strong>Pris:</strong> Zimbabwe Black kan vara lite dyrare p.g.a. längre transporter; prisskillnaden varierar med marknaden.</li>
</ul>
<p>Om du vill ha ett mer levande, karaktärsfyllt svart utan att gå till ett dramatiskt ådrat marmor, är Zimbabwe Black ett utmärkt val.</p>`,
      images: []
    },
    {
      heading: "Zimbabwe – stenbrytning och certifiering",
      content: `<p>Zimbabwes stenindustri är etablerad men landets politiska situation har historiskt skapat osäkerhet för internationella köpare. Ledande exportörer har investerat i internationell certifiering och EU-kompatibel dokumentation.</p>
<p>Fråga alltid om ursprungscertifikat och att leverantören kan spåra materialets väg från brott till exporthamn. Det är en rimlig fråga, och välrenommerade importörer kan svara.</p>`,
      images: []
    }
  ]
},

// WEEK 42
{
  slug: "natursten-vs-komposit-miljo",
  week_number: 42,
  sections: [
    {
      heading: "Natursten eller komposit ur miljöperspektiv",
      content: `<p>En fråga som ställs allt oftare är: är natursten eller komposit (engineered quartz) ett mer hållbart val? Svaret är komplext och beror på vilka parametrar du mäter. En enkel jämförelse missar nyanser som livslängd, repararbarhet och materialets slutdestination.</p>
<p>Det finns inga enkla svar, men en livscykelanalys (LCA) av de två materialtyperna ger en mer nyanserad bild än enkel "naturligt = bra, konstgjort = dåligt"-logik.</p>`,
      images: [{ src: "/images/materials/Kvartsit/big quartzite quarry big machinery.jpg", alt: "Naturstensbrott – miljöperspektiv" }]
    },
    {
      heading: "Naturstens miljöprofil",
      content: `<p><strong>Fördelar ur miljöperspektiv:</strong></p>
<ul>
  <li><strong>Ingen kemisk syntes:</strong> Natursten är ett naturmaterial utan kemiska tillsatser eller syntetiska polymerer.</li>
  <li><strong>Extremt lång livslängd:</strong> En välskött stenbänkskiva kan hålla i generationer. Livstid 50-100+ år är realistisk.</li>
  <li><strong>Reparerbarhet:</strong> Sliten yta kan slipas och poleras om. Inga deponibidrag från reparation.</li>
  <li><strong>Naturlig återgång:</strong> Vid rivning kan natursten krossas och användas som bergsmaterial eller deponeras utan kemisk miljöpåverkan.</li>
</ul>
<p><strong>Nackdelar:</strong></p>
<ul>
  <li><strong>Transportavtryck:</strong> Sten från Brasilien, Indien eller Kina har transportsträckor på 10 000+ km.</li>
  <li><strong>Energiintensiv utvinning:</strong> Diamantsågar, krossning, polering – energi krävs.</li>
  <li><strong>Markingrepp:</strong> Dagbrott skapar stora ingrepp i landskapet.</li>
</ul>`,
      images: []
    },
    {
      heading: "Kompositmaterials miljöprofil",
      content: `<p><strong>Engineered quartz</strong> (Silestone, Caesarstone, Quartz Blanc) är ca 90-93% naturlig kvarts + 7-10% hartser, pigment och bindemedel.</p>
<p><strong>Fördelar:</strong></p>
<ul>
  <li><strong>Mer material per block:</strong> Kompositproduktionen är mer materialeffektiv – mindre spill.</li>
  <li><strong>Konsistent kvalitet:</strong> Inga "bortslösade" delar av dålig kvalitet.</li>
</ul>
<p><strong>Nackdelar:</strong></p>
<ul>
  <li><strong>Syntetiska hartser:</strong> Polymerbindningsmedel med koldioxidavtryck och svår återvinning.</li>
  <li><strong>Kortare livslängd:</strong> Komposit kan inte poleras om; repor är permanenta. Byter ut efter 15-25 år.</li>
  <li><strong>Icke-biologiskt nedbrytbar:</strong> Komposit bänkskivor hamnar i deponin – natursten kan återanvändas eller krossas.</li>
</ul>
<p>Sammanfattning: för lång livslängd och lågt deponikostnad är natursten sannolikt det mer hållbara valet på ett 50+ år-perspektiv. För transportoptimering och materialeffektivitet kan komposit vara bättre på kortare sikt.</p>`,
      images: []
    },
    {
      heading: "Välj lokalt för bästa miljöprofil",
      content: `<p>Det starkaste hållbarhetsargumentet för natursten är europeisk och skandinavisk produktion. Bohuslän-granit, Ölandssten, gotländsk kalksten, norsk larvikite – alla med transportavtryck en bråkdel av brasiliansk eller indisk sten.</p>
<p>Historiskt har dessa "lokala" stenar setts som alternativ för enklare eller mer traditionella projekt. Det är dags att ompröva det. Skandinavisk granit är ett internationellt kvalitetsmaterial med en lokal historia och ett signifikant lägre transportavtryck.</p>`,
      images: []
    }
  ]
},

// WEEK 43
{
  slug: "blue-pearl-granit",
  week_number: 43,
  sections: [
    {
      heading: "Blue Pearl – norsk granit med pärlemoskimmer",
      content: `<p><strong>Blue Pearl</strong> är en av Norges mest exporterade naturstenar och ett av Skandinaviens starkaste stenvarumärken. Stenen bryts i Larvik-distriktet i Vestfold, Norge, och är en unik typ av granit – egentligen klassificerad som <strong>larvikite</strong> – med ett karakteristiskt blå-grått grundfärg och ett starkt pärlemoskimmer i blå, silver och turkosa toner.</p>
<p>Skimmeret uppstår av stora, reflekterande fältspatskristaller (anorthoklas) som brytar ljuset i ett phenomenon kallat adularescens. Det är samma optiska effekt som ger månsten och vissa opaler sitt skimmer – men i Blue Pearl är det förstärkt och synligt redan på håll.</p>`,
      images: [{ src: "/images/materials/Granit/granit-hero.jpg.jpg", alt: "Blue Pearl norsk granit" }]
    },
    {
      heading: "Larvikite – vad är det egentligen?",
      content: `<p><strong>Larvikite</strong> är en specifik typ av syenitatisk bergart (liknar granit men med lägre kvartshalt) som är nästan uteslutande känd från Larvikdistriktet i Norge. Det är en relativt sällsynt bergart geologiskt sett och är erkänd som Norges nationella bergarts-representant.</p>
<p>Anorthoklas-fältspatskristallerna – det som ger Blue Pearl sitt skimmer – är upp till 4-5 cm stora och dominerar stenen. Runt dem finns mörka mineraler (augit, magnetit) som skapar den mörka bakgrundsfärgen. Det är kombinationen av ljusa, skimrande kristaller mot mörk bakgrund som skapar det dramatiska intrycket.</p>`,
      images: []
    },
    {
      heading: "Blue Pearl i kök och badrum",
      content: `<p>Blue Pearl används både som bänkskiva, golv och väggbeklädnad. Som bänkskiva är det en utmärkt praktisk och estetisk lösning: hårt (Mohs 6), syratåligt (larvikite är silikatbaserat, inte kalcitbaserat), tätt och kräver minimal underhåll.</p>
<p>Designmässigt är Blue Pearl en sten som fungerar bäst när det framhävs – bra belysning, helst punktljus rakt ovanifrån, gör att skimmret aktiveras och visar stenens fulla potential. I ett kök med enbart indirekt ljus tappas en del av det visuella värdet.</p>
<p>Kombinera gärna med krom- och ståldetaljer (kran, beslag) som speglar de silvriga tonerna i stenen, eller med mörkblå eller antracit skåp som accentuerar det blå skimmret.</p>`,
      images: []
    },
    {
      heading: "Nordic sten – argument för lokal produktion",
      content: `<p>Blue Pearl är ett utmärkt argument för lokal nordisk stenproduktion. Norska larvikite-brott är välreglerade, moderna och engagerade i miljöcertifiering. Transportavtrycket från Norge till Sverige är en bråkdel av det för importerat sten från Brasilien eller Indien.</p>
<p>Det finns ett estetiskt argument också: skandinavisk design, skandinaviskt kök, skandinavisk natursten. Det är en koherens i materialvalet som är svår att argumentera mot – och som resonerar alltmer med konsumenter som söker lokal autenticitet.</p>`,
      images: []
    }
  ]
},

// WEEK 44
{
  slug: "norge-blaa-sten-larvikite",
  week_number: 44,
  sections: [
    {
      heading: "Norge och Larvikite – en geologisk raritet",
      content: `<p>Norge är hem för en av de geologiskt mest intressanta naturstensorterna i världen: <strong>larvikite</strong>. Vi har nämnt Blue Pearl i en tidigare artikel (vecka 43), men larvikite förtjänar en fördjupning i sin norska geologiska kontext.</p>
<p>Larvikite bildades för ca 298 miljoner år sedan under sen-karbon epoken, i ett tidsfönster av intens magmatisk aktivitet i det som idag är Vestfold, Norge. Magman trängde upp i jordskorpan och stelnade långsamt djupt under ytan – ett geologiskt scenario som ger tid för stora kristaller att bildas, vilket förklarar de imponerande anorthoklas-kristallerna som ger larvikite sitt karaktärsdrag.</p>`,
      images: [{ src: "/images/materials/Granit/granit-quarry.jpg.jpg", alt: "Larvikite i norsk natur" }]
    },
    {
      heading: "Larvikite-varianter: Blue Pearl och mer",
      content: `<p>Blue Pearl är den mest kända och exporterade larvikiten, men den är inte ensam:</p>
<ul>
  <li><strong>Blue Pearl GT</strong> – Standardvarianten med djupblå-grå bakgrund och starkt skimmer.</li>
  <li><strong>Blue Pearl Extra</strong> – Mer intensivt skimmer, mer sällsynt slab-material.</li>
  <li><strong>Nordic Pearl</strong> – En annan norsk larvikite med lite grönare ton.</li>
  <li><strong>Labrador Antique</strong> (Kanada) – Tekniskt en annan labradorit-bergart men med liknande optisk effekt; ofta jämförd med Blue Pearl.</li>
</ul>
<p>Larvikite finns inte bara i blå ton – silvriga och gröngrå varianter finns men exporteras i mycket mindre skala.</p>`,
      images: []
    },
    {
      heading: "Norsk stenindustri: hållbarhet och export",
      content: `<p>Norsk naturstenindustri är liten men professionell. Larvikite exporteras primärt till det europeiska premium-segmentet, med Skandinavien, Centraleuropa och UK som huvudmarknader. Brotten i Larvikdistriktet är ISO-certifierade och håller höga miljöstandarder.</p>
<p>En utmaning: Larvikite-produktionen är begränsad och har minskat något sedan 1990-talets peak. Konkurrens om de bästa blocken driver priserna uppåt i premiumsegmentet. Men som ett lättillgängligt, miljömässigt försvarbart och estetiskt starkt skandinaviskt material har Blue Pearl en stark framtid på den europeiska marknaden.</p>`,
      images: []
    }
  ]
},

// WEEK 45
{
  slug: "koket-layout-bankskiva",
  week_number: 45,
  sections: [
    {
      heading: "Kök-layout och natursten – U-form, L-form och köksö",
      content: `<p>Valet av kök-layout påverkar direkt hur natursten används och ser ut. En L-formad bänkskiva kräver ett 90-gradershörn som kan hanteras på olika sätt; ett U-format kök med tre bänkskivesekvenser ger möjligheter för matchning och kontrast; en köksö i natursten är ett af designens starkaste uttalanden.</p>
<p>Förståelse för de tekniska och estetiska möjligheterna i var och en av dessa layouter hjälper dig att planera din naturstensinsats mer effektivt.</p>`,
      images: [{ src: "/images/materials/Marmor/marmor-kitchen.jpg", alt: "Kök med köksö i natursten" }]
    },
    {
      heading: "L-formens hörn – teknik och estetik",
      content: `<p>L-formade kök kräver ett hörn, och hörnet i natursten kan hanteras på flera sätt:</p>
<p><strong>Mitredfog (45-gradershörn):</strong> De två skivorna kapas i 45 grader och fogas ihop, skapar ett synligt V mot kanten men döljer skarven uppifrån. Kräver precision och är dyrare men ger ett rent intryck.</p>
<p><strong>Stumpfog (butt joint):</strong> En skiva löper hela vägen, den andra möter den med en rak skarv. Enklare och billigare, skarven synlig som en linje.</p>
<p><strong>Rundad hörn:</strong> Hörnet fräses rundlänt, elimineraren skarven och minskar riskmarkering. Kräver en enda, mer komplex slab-bearbetning.</p>
<p>Vilken lösning är rätt? Beror på design och budget. Mitredfog är det mest professionella resultatet; stumpfog är prisvärt och funktionellt.</p>`,
      images: []
    },
    {
      heading: "Köksön – naturstens viktigaste scen",
      content: `<p>En köksö i natursten är ett av köksdesignens starkaste element. En stor slab utan skarv, framvisad från alla håll, är ett visuellt uttalande som dominerar rummet. Det kräver:</p>
<ul>
  <li><strong>Tillräckligt utrymme</strong> – Minst 90 cm fri passageyta runt ön på alla sidor. Mindre och ön blir opraktisk.</li>
  <li><strong>Rätt stenval</strong> – Starka mönster som Calacatta eller Azul Valverde är naturliga på en ö som sedd från alla håll. Mer neutrala graniter fungerar men kräver att andra designelement kompenserar.</li>
  <li><strong>Eventuell överhäng</strong> – Om ön används som bar/frukostbord behöver bänkskivan hänga ut 30-40 cm för benplats. Det kräver understödsram eller konsoler.</li>
</ul>`,
      images: []
    },
    {
      heading: "Matcha bänkskivor i ett U-kök",
      content: `<p>I ett U-format kök med tre bänkskivelöpare finns valet att matcha alla i samma sten (enhetlig, lugn look) eller att variera (skapa kontrast, accentuera köksön).</p>
<p>En populär lösning: de två parallella löparna (normalt mot vägg) i en enklare, mer neutral sten (grå granit, vit Carrara), och köksön (eller den avslutande bänkskivan vid kokzon) i ett mer exklusivt material (Calacatta, Azul Valverde). Det skapar en tydlig hierarki utan att hela köket kostar lyxpris.</p>`,
      images: []
    }
  ]
},

// WEEK 46
{
  slug: "rosa-porrino-granit",
  week_number: 46,
  sections: [
    {
      heading: "Rosa Porrino – spansk rosa granit",
      content: `<p><strong>Rosa Porrino</strong> (eller Rosa Porriño) är en välkänd spansk granit med en distinkt rosa till laxrosa bakgrundsfärg och ett spräckelt mönster av vit, grå och svart kristallinslag. Stenen bryts i Galicien i nordvästra Spanien och har använts i spansk arkitektur i decennier – bland annat i Santiagos katedraldal som omger sig av denna sten.</p>
<p>Rosa Porrino är ett av de mer "färgstarka" granitmaterialen som ändå håller sig inom ett klassiskt sortiment. Den rosa tonen är unik och svår att hitta i samma kvalitet hos andra producerande länder.</p>`,
      images: [{ src: "/images/materials/Granit/granit-bathroom.jpg.jpg", alt: "Rosa Porrino granit i badrum" }]
    },
    {
      heading: "Egenskaper och användningsområden",
      content: `<p>Rosa Porrino är granit med alla granitens fördelar: hårt, tätt, syratåligt, kräver minimal underhåll. Det är ett robust material som tål den dagliga köksanvändningen väl.</p>
<p>Designmässigt: rosa granit är inte för alla kök, men i rätt sammanhang är det ett material med stark personlighet. Det fungerar utmärkt i:</p>
<ul>
  <li>Traditionella, klassiska kök med trädetaljer i cherry eller mahogny</li>
  <li>Provençalska/medelhavsinspirade kök</li>
  <li>Badrum med varma beige/kräm toner</li>
  <li>Entréhall och trappor där en naturstenestetik önskas utan det mest vanliga vit/grå</li>
</ul>`,
      images: []
    },
    {
      heading: "Rosa granit i historisk kontext",
      content: `<p>Rosa och röda graniter har en lång historia i arkitekturen. Egyptiska faraoners obelisker, gjorda av röd Aswan-granit, sticker upp i Roms och Paris torg. Normandiska domkyrkor är byggda av rosa granit från Bretagne. Det är ett material med djupt historiska rötter och en estetik som kommunicerar permanens och tradition.</p>
<p>I ett modernt sammanhang: det är ett material för den som inte vill ha det vanliga och söker ett natursteninval med personlighet och historik. Det polariserar – men de som älskar det, älskar det verkligen.</p>`,
      images: []
    }
  ]
},

// WEEK 47
{
  slug: "semiprecious-stone-bankskiva",
  week_number: 47,
  sections: [
    {
      heading: "Halvädelstensbänkskivor – agat, ametist och malakit",
      content: `<p>På den absoluta toppen av naturstens-exklusivitetsskalan hittar vi <strong>halvädelstensbänkskivor</strong>. Agat-skivor med genomlyst färgspel, djupviolett ametist-aggregat, intensivt grön malakit, djupblå lapis lazuli – det är material som normalt hittas i museers mineralsamlingar, nu tillgängliga som bänkskivor i de mest exklusiva köken och badrum i världen.</p>
<p>Det handlar inte om ädelstensbitar – det handlar om naturliga mineralformationer som skapas lager för lager och sedan slipad till skivor. Resultatet är en yta med ett mönster, en djup och en lyster som inget annat material i världen kan reproducera.</p>`,
      images: [{ src: "/images/materials/SemiPrecious/luxury kitchen semiprecious countertop.jpg", alt: "Halvädelstensbänkskiva i exklusivt kök" }]
    },
    {
      heading: "De viktigaste halvädelstensmaterialen",
      content: `<p><strong>Agat:</strong> En form av chalcedon (kvarts) med koncentrerade, färgade lager som skapar karakteristiska ringar och mönster. Kan finnas i nästan alla färger; brun, vit, grön, blå. Genomlyst agat (backlit) är enastående vacker.</p>
<p><strong>Ametist:</strong> Violett kvarts, känd som smyckestein. Som bänkskivematerial används naturliga aggregationer av ametistkristaller – en kompakt massa av lila kristaller med djup och lyster.</p>
<p><strong>Malakit:</strong> Djupgrönt kopparmineral med karakteristiska koncentriska mönsterlager. Intensiv grön, unik karaktär. Relativt mjuk (Mohs 3.5-4) och kräver ytbeläggning eller härdning.</p>
<p><strong>Lapis Lazuli:</strong> Djupblå mineralsten med guld-glimmriga pyritinslag. Extrem lyxartikel. Bryts primärt i Afghanistan.</p>`,
      images: []
    },
    {
      heading: "Praktiska hänsyn",
      content: `<p>Halvädelstensbänkskivor är extremt dyra och relativt ovanliga i praktisk användning. De flesta appliceringar är i bad-konceptkök, hotellbarer, VIP-lounges och extremt exklusiva privata hem.</p>
<p>De är generellt mjukare och mer känsliga än granit och kvartsit. Malakit och ametist behöver skyddas och underhållas noggrant. Härdning med hartsinjicering är vanlig behandling för att stärka det porösa materialet.</p>
<p>Priset är helt spektrat av "exclusivt" – beroende på material och format kan det röra sig om summor långt bortom ordinär stenprissättning.</p>`,
      images: []
    }
  ]
},

// WEEK 48
{
  slug: "sea-pearl-kvartsit",
  week_number: 48,
  sections: [
    {
      heading: "Sea Pearl – havets kvartsit",
      content: `<p><strong>Sea Pearl</strong> (ibland kallat White Fantasy) är en brasiliansk kvartsit med ett organiskt, flytande mönster i vit, grå och blekt gröna toner som på avstånd liknar havets svall. Det är ett material med en unik naturlig estetik – varken dramatiskt nog att dominera ett rum (som Calacatta), inte heller så neutralt att det försvinner (som standardvit granit).</p>
<p>Sea Pearl har vuxit snabbt i popularitet det senaste decenniet som ett "mellanting" – det ger kvartsitens praktiska fördelar (hårdhet, syratålighet) med ett mer levande mönster än homogen vit granit och ett mer lugnt och driftsäkert uttryck än de mest dramatiska marmorerna.</p>`,
      images: [{ src: "/images/materials/Kvartsit/quartzite kitchen countertop luxury.jpg", alt: "Sea Pearl kvartsit i modernt kök" }]
    },
    {
      heading: "Geologisk bakgrund",
      content: `<p>Sea Pearl bildades i Brazilien under prekambrisk era, när sandstensplattor metamorfoserades under högt tryck. Det resulterande kvartsit-materialet är kvartsdominerat med inslag av muskovit, klorit och andra glimmermineraler som skapar de gröna-grå tonerna och det diffusa mönstret.</p>
<p>Mönstret varierar block för block – som med all brasiliansk kvartsit. Några slabs har mer dramatiska gröna partier, andra är mer rent vita med subtila gråa rörelser. Be alltid att se den specifika slaben.</p>`,
      images: []
    },
    {
      heading: "Skötsel och jämförelse",
      content: `<p>Sea Pearl är kvartsit och delar kvartsitens egenskaper: hårdare och mer syratålig än marmor, kräver impregnering men mer sällan. Det är ett av de praktiskare naturstenmaterialen för ett aktivt hushållskök.</p>
<p>Jämfört med Taj Mahal (vecka 29): Taj Mahal är lite mer enhetligt kräm-beige med guldinslag; Sea Pearl är vitare med mer gröna/grå inslag och ett mer "rörligt" mönster. De befinner sig i samma prissegment och är naturliga alternativ till varandra beroende på köksstil.</p>`,
      images: []
    }
  ]
},

// WEEK 49
{
  slug: "nat-och-torr-sten-finish",
  week_number: 49,
  sections: [
    {
      heading: "Polerat, borstat eller läderfinish – guide till stenytbehandlingar",
      content: `<p>Valet av ytbehandling på en naturstenbänkskiva är lika viktigt som valet av stensorten i sig. Samma sten kan se och kännas fundamentalt annorlunda beroende på hur ytan bearbetats. De tre vanligaste alternativen – polerat, borstat (brushed) och läder-finish – har var och en sina estetiska och praktiska egenskaper.</p>
<p>Det är inte ett val som kan ångras lätt: att byta ytbehandling efteråt kräver professionell ompolering. Tänk igenom valet noga innan du beställer.</p>`,
      images: [{ src: "/images/materials/Marmor/marmor-hero.jpg", alt: "Polerad marmoryta" }]
    },
    {
      heading: "Polerat – klassiskt och lysande",
      content: `<p>Polerat (polished) är den traditionella ytbehandlingen för natursten. Ytan slipas successivt med allt finare diamantslipskivor tills den når en spegelblankt glans. Det framhäver stenens naturliga färger och ådermönster på maximalt – djupa mörka toner, kontrasterande ådror och glänsande kristaller visas på sitt bästa.</p>
<p><strong>Fördelar:</strong> Maximal visuell effekt, visas ådringsdjup och färg bäst. Reflekterar ljus och lyser upp kök. Relativt lätt att torka av.</p>
<p><strong>Nackdelar:</strong> Fingeravtryck och oljefläckar är tydliga. Repor visar mer tydligt (blanka ytor "speglar" repor). Kan upplevas som "standard" i ett segment som rör sig mot mattare ytor.</p>`,
      images: []
    },
    {
      heading: "Borstat (brushed) – industriellt och taktilt",
      content: `<p>Borstad yta uppnås genom att behandla stenen med stora stålborstar eller diamantborstar, som ger ytan ett matt, lite texturerat utseende med tydligare kristallgränser. Resultatet är en yta som ser mer "rå" och naturlig ut – lite som om stenen precis tagits ur berget och slipats, men inte försiktigats till ett spegelblankt.</p>
<p><strong>Fördelar:</strong> Döljer fingeravtryck bättre. Repor syns mindre. Modernare, mer industriellt uttryck som passar contemporary köksstilar. Taktilt mycket tillfredsställande.</p>
<p><strong>Nackdelar:</strong> Mörkar och döljer stenens naturliga färger jämfört med polerat. Lite mer absorberande yta kräver impregnering.</p>`,
      images: []
    },
    {
      heading: "Läderfinish – det varma mellanalternativet",
      content: `<p>Läderfinish (leather eller leathered) är den ytbehandling som vuxit starkast de senaste åren. Den uppnås med speciella pad-borstar som öppnar stenens ytra porer lätt, skapar en matt yta med en mjuk, taktil karaktär som liknar – just det – mjukt läder.</p>
<p><strong>Fördelar:</strong> Varm, taktil och premium-känsla. Fingeravtryckstolerant. Döljer repor bättre än polerat. Mer naturlig look men mer raffinerat än borstat.</p>
<p><strong>Nackdelar:</strong> Öppnare yta kräver mer intensiv impregnering. Inte alla stenar lämpar sig – granit och kvartsit ger utmärkt läderfinish; mjukare marmor kan bli ojämn.</p>
<p>Läderfinish är den ytbehandling som dominerar på lyxköks-utställningar och är sannolikt den starkaste trenden just nu.</p>`,
      images: []
    },
    {
      heading: "Honed (slipat, ej polerat) – det lugna valet",
      content: `<p>En fjärde ytbehandling värd att nämna: <strong>honed</strong> (honungslipat). Stenen slipas till ett fint matt utseende utan det reflekterande polerade skiktet – en mjukt, jämnt matt yta som är populär för kalksten och marmor i badrum.</p>
<p>Honed är det traditionella valet för kalksten och travertin i Europa – den naturliga, diskreta ytan som kombinerar praktikalitet med klassisk estetik. Det är lite mer absorberande än polerat och kräver impregnering.</p>`,
      images: []
    }
  ]
},

// WEEK 50
{
  slug: "onyx-honey-green",
  week_number: 50,
  sections: [
    {
      heading: "Onyx – det genomlysta luxusmaterialet",
      content: `<p><strong>Onyx</strong> är ett av de mest visuellt spektakulära naturstenmaterialen – och ett av de mest tekniskt krävande att arbeta med. Det är ett halvtransparent material: en tunn skiva onyx (5-10 mm) med ett ljus bakifrån skapar en glödande, levande yta som inget annat naturmaterial kan reproducera. Det är anledningen till att onyx hittas i lyxhotellbarer, VIP-lounge-väggar och de allra mest exklusiva privata interiörerna.</p>
<p>De populäraste sorterna: <strong>Honey Onyx</strong> (honungsgul med vita ådror), <strong>Green Onyx</strong> (turkos-grön med vita ådror) och <strong>White Onyx</strong> (krämlvit med diskret ådring). Alla är karakteriserade av denna halvtransparenta, djupa, nästan magiska ytstruktur.</p>`,
      images: [{ src: "/images/materials/Onyx/Onxy Smeraldo luxury autonova kitchen.jpg", alt: "Genomlyst onyx bänkskiva" }]
    },
    {
      heading: "Bildning och egenskaper",
      content: `<p>Onyx är en form av kalcit (eller aragonit) – det kristalliserade kalciumkarbonaten – men bildad på ett helt annat sätt än marmor. Det bildas i grottor och källflöden, lager för lager, när kalciumkarbonat-rikt vatten saktar fälls ut. Processen liknar stalaktitbildning – och onyx är i grunden en platt, mer homogen variant av droppsten.</p>
<p>Den translucenta kvaliteten beror på kristallstrukturen: kalcitkristallerna i onyx är orienterade så att ljuset kan passera igenom utan att dispergeras. Ju mer homogen och tjock kalcitlagret är, desto mer transparent blir materialet.</p>
<p>Hårdhet: onyx är mjukare (Mohs 6-7) än granit och mer sprött. Det är inte ett material för bänkskivor i aktiva kök – risken för repor, stötar och sprickor är för stor.</p>`,
      images: []
    },
    {
      heading: "Hur onyx används i praktiken",
      content: `<p>På grund av mjukhet och sprödheten används onyx sällan som en ensam bänkskiva. De vanligaste appliceringsarna:</p>
<ul>
  <li><strong>Bakbelyst väggpanel</strong> – Slab på vägg med LED-installation bakom. Lysande, dramatisk effekt.</li>
  <li><strong>Bar-bänkskiva</strong> – Med robustare underlag och minimal daglig mekanisk slitage.</li>
  <li><strong>Toalett-bänkskiva</strong> – Liten yta, minimal belastning, maximal visual effekt.</li>
  <li><strong>Köksö-front</strong> – Vertikalt monterat på kökösframsidan, inte som horisontell bänk.</li>
</ul>
<p>Med ordentlig härdning (hartsinjicering) kan onyx göras mer robust och användbar i bredare appliceringar.</p>`,
      images: []
    }
  ]
},

// WEEK 51
{
  slug: "atervunnet-glas-bankskiva",
  week_number: 51,
  sections: [
    {
      heading: "Återvunnet glas – det mest hållbara bänkskivealternativet",
      content: `<p><strong>Återvunnet glas bänkskivor</strong> är ett material i en klass för sig bland köks- och badrumsytor. De görs av krossade glasbitar – flaskor, fönster, byggnadsglas – inbäddade i ett cement- eller epoxibindningsmedel och polerade till en slät, glittrande yta. Det är ett 100% hållbart alternativ i termerna att råmaterialet är återvunnet avfall.</p>
<p>De mest kända varumärkena är <strong>Vetrazzo</strong> (USA) och <strong>Magna</strong> (Tyskland) – tillverkade med olika kombinationer av glasslagstyrkar, färger och bindningsmedel. Slutresultatet är ett material med en unik, levande estetik – likt en konstallation av genomskinliga, halvtransparenta och opaka glasfragment mot en fast bakgrund.</p>`,
      images: [{ src: "/images/materials/Återvunnet Glas/recycled glass countertop kitchen like brand magna from germany.jpg", alt: "Återvunnet glas bänkskiva i modernt kök" }]
    },
    {
      heading: "Miljöprofil – verkligen hållbart?",
      content: `<p>Återvunnet glas är utan tvekan ett av de mest miljömedvetna materialvalen för kök och badrum. Det är bokstavligen avfall som förvandlats till lyxprodukt – flaskor och skärvor som annars gått till glasåtervinning eller deponi används som råmaterial.</p>
<p>Produktionsprocessen kräver energi, och bindningsmedlet (cement eller epoxy) har ett koldioxidavtryck. Men jämfört med natursten (transportavtryck) och engineered quartz (syntetiska polymerer) håller sig återvunnet glas väl i en LCA-analys.</p>
<p>Certifieringar som <strong>LEED</strong> (Leadership in Energy and Environmental Design) ger poäng för material med hög återvunnen innehållsandel, vilket gör återvunnet glas populärt i miljöcertifierade byggprojekt.</p>`,
      images: []
    },
    {
      heading: "Praktiska egenskaper och skötsel",
      content: `<p>Återvunnet glas i cementmix: liknande egenskaper som terrazzo. Kräver impregnering, pH-neutral rengöring, känslig för syra (cementmatrisen). Kan slipas om vid behov.</p>
<p>Återvunnet glas i epoxymix: tätare, mer kemikalietålig, men skadas av UV-ljus om epoxyn är av lägre kvalitet (gulnar). Välj UV-stabiliserad epoxy.</p>
<p>Glasfragmenten är glasets hårda (Mohs 5.5-6), men bindningsmedlet är mjukare. Det innebär att ytan kan bli ojämn på sikt om bindningsmedlet vittrar – välj en kvalitetsstillverkare och bekräfta garantivillkor.</p>`,
      images: []
    },
    {
      heading: "Estetik och designmöjligheter",
      content: `<p>Återvunnet glas finns i ett bredare spektrum av designmöjligheter än de flesta material. Glascombinationer kan skräddarsys: vill du ha ett svart kök med silver-glittrande glasfragment? En turkos-grön vägg med djupblåa glasinslag? En vit bänkskiva med rosa och korall glasfragment? Det är fullt möjligt.</p>
<p>Premiumtillverkare erbjuder custom-formulations – specifika kombinationer av glasbitar, bakgrundsfärg och bindningsmedel som är unika för ditt projekt. Det är ett av de mest designfria materialen du kan arbeta med.</p>`,
      images: []
    }
  ]
},

// WEEK 52
{
  slug: "keramik-bankskiva-guide",
  week_number: 52,
  sections: [
    {
      heading: "Keramik och sintersten – köksbänkens framtid?",
      content: `<p><strong>Keramikbänkskivor</strong> – sinteriserade keramiska skivor som Dekton, Lapitec, Neolith och Durat – är ett av de snabbast växande segmenten i bänkskivemarknaden. De marknadsförs som "bättre än natursten" i ett antal tekniska avseenden – och på flera punkter är argumentet befogat. Men de är inte för alla, och förståelse för vad de är och inte är hjälper dig fatta rätt beslut.</p>
<p>Sinteriserad keramik tillverkas av naturliga råmaterial (kvarts, fältspar, kaolin) som utsätts för extremt högt tryck och temperatur (1200°C+) tills de "sinter" – binds ihop utan kemiska tillsatser. Resultatet är ett extremt tätt, hårt och kemikalie-resistant material.</p>`,
      images: [{ src: "/images/materials/Terrazzo/A modern kitchen with sleek, minimalist cabinetry and countertops made of polished Perlato terrazzo, featuring subtle veining and a warm, neutral color palette. The lighting is bright and even, highlighting the lux.jpg", alt: "Modern keramik bänkskiva" }]
    },
    {
      heading: "Tekniska fördelar med sinteriserad keramik",
      content: `<p><strong>Syraresistans:</strong> Sinteriserad keramik reagerar inte med syror. Citronsaft, ättika, vin – inget av detta etsar ytan. Det är en fundamental fördel jämfört med kalkitbaserade marmorer.</p>
<p><strong>Värmeresistans:</strong> Varma kastruller kan ställas direkt på sinteriserad keramik utan att orsaka skada. Hög temperaturresistans (>1000°C processtemperatur).</p>
<p><strong>Hårdhet:</strong> Sinteriserad keramik är hårdare än de flesta natursten och kräver speciella diamantverktyg för bearbetning.</p>
<p><strong>Hygienisk yta:</strong> Nästan noll porositet innebär att bakterier inte kan gömma sig i ytan.</p>
<p><strong>Ingen impregnering:</strong> Till skillnad från natursten kräver sinteriserad keramik inga impregnerings-behandlingar.</p>`,
      images: []
    },
    {
      heading: "Begränsningar av sinteriserad keramik",
      content: `<p>Trots de imponerande tekniska fördelarna finns det viktiga begränsningar:</p>
<p><strong>Bräcklighet:</strong> Sinteriserad keramik är hårt men sprött. Skarpa stötar (ett tungt föremål som faller i en kant) kan orsaka en ren, tydlig spraka. Det kan inte lagas som natursten kan spacklas – en sprucken keramisk bänkskiva behöver bytas.</p>
<p><strong>Reparerbarhet:</strong> Natursten kan slipas om och poleras. Sinteriserad keramik kan inte. Ytan är en gång permanent.</p>
<p><strong>Autenticitet:</strong> Keramiken imiterar sten men är inte sten. Mönstret är digitaltryckt, inte geologiskt. Det "djup" som syns i äkta marmors ådror finns inte i sinteriserad keramik – den erfarne ögat märker skillnaden.</p>
<p><strong>Kanthållfasthet:</strong> Kanter på sinteriserad keramik är sprödare och kan fjälla av. Undvik att hänga på kanten eller ta emot stötar mot kanten.</p>`,
      images: []
    },
    {
      heading: "Vem ska välja keramik framför natursten?",
      content: `<p>Sinteriserad keramik är rätt val för:</p>
<ul>
  <li><strong>Familjer med intensivt kokande kök</strong> som vill ha noll underhåll och total syra-frihet.</li>
  <li><strong>Utomhuskök</strong> – tål UV, frost och regn bättre än natursten.</li>
  <li><strong>Professionella kök</strong> – matservering, restaurangliknande hemkök.</li>
  <li><strong>Kök med aktiv keramikbruk</strong> (mycket syrabaserad matlagning: asiatisk kokkonst med ättika, medelhavsmat med citroner).</li>
</ul>
<p>Natursten är fortfarande rätt val för: representativa kök där äkthet och estetisk djup värderas, för projekt med lång tidshorisont (natursten håller 50+ år; keramik är också hållbar men kan inte ompoleras), och för projekt där fastighetsvärdet kommuniceras via material.</p>`,
      images: []
    },
    {
      heading: "Sammanfattning: ett år av stenkunnande",
      content: `<p>Det här är veckobloggens sista inlägg för 2026 – ett år av naturstenskunskap från Marmorskivan. Vi har täckt allt från de klassiska marmorsorterna från Carrara till exotiska kvartsiter från Brasilien, från kantprofiler till diskhovals, från branschmässor i Milano till bergbrott i Iran.</p>
<p>Budskapet är detsamma hela året: natursten är inte ett material du väljer utan att förstå. Det är ett material med historia, geologi och krav – men också ett material som ger tillbaka generöst om det behandlas rätt. Ingen bänkskiva skapar samma känsla av permanens, autenticitet och skönhet som en välvald naturstensbit.</p>
<p>Vill du ha hjälp att välja rätt för ditt kök? Kontakta oss på Marmorskivan – vi hjälper dig välja material, profil, tjocklek och montagelösning för just din situation.</p>`,
      images: []
    }
  ]
}

];

// ─── Merge with existing blog-posts.json ───────────────────────────────────
let existing = [];
try {
  existing = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));
} catch (e) {
  console.error("Could not read blog-posts.json:", e.message);
  process.exit(1);
}

// Map existing by slug
const existingMap = {};
for (const p of existing) {
  existingMap[p.slug] = p;
}

// Apply new content
for (const np of newPosts) {
  if (existingMap[np.slug]) {
    existingMap[np.slug].sections = np.sections;
    existingMap[np.slug].week_number = np.week_number;
  } else {
    // Add new posts not yet in JSON
    existingMap[np.slug] = { ...np };
  }
}

// Rebuild ordered array (keep existing order for existing posts, append new ones)
const existingSlugs = existing.map(p => p.slug);
const newSlugs = newPosts.map(p => p.slug).filter(s => !existingSlugs.includes(s));

const result = [
  ...existingSlugs.map(s => existingMap[s]),
  ...newSlugs.map(s => existingMap[s])
];

fs.writeFileSync(JSON_PATH, JSON.stringify(result, null, 2), "utf8");
console.log(`Done. Total posts: ${result.length}`);
