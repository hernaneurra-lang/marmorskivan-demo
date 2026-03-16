// ===== FIL: src/pages/material/Granit.jsx =====
import { useTranslation } from "react-i18next";
import StoneDetailPage from "../../components/StoneDetailPage";

export default function Granit() {
  const { t } = useTranslation();

  return (
    <StoneDetailPage
      title={t("materialPages.granite.seo.title", {
        defaultValue:
          "Granitbänkskivor – Köpa granit till kök & badrum | Pris & skötsel | Marmorskivan.se",
      })}
      metaDescription={t("materialPages.granite.seo.metaDescription", {
        defaultValue:
          "Granitbänkskivor för kök och badrum – lär dig allt om granit. Ursprung, utvinning, fördelar, nackdelar, pris, användningsområden och skötselråd.",
      })}
      h1={t("materialPages.granite.h1", {
        defaultValue: "Granit – Allt om granitbänkskivor, ursprung & skötsel",
      })}
      heroImage="/images/materials/Granit/granit-hero.jpg"
      backgroundImage="/images/materials/granit-hero.jpg"
      textSize="lg"
      sections={[
        {
          heading: t("materialPages.granite.sections.what.heading", { defaultValue: "Vad är granit?" }),
          content: t("materialPages.granite.sections.what.content", {
            defaultValue: `
              <p>Granit är en <strong>magmatisk bergart</strong> som bildas när magma långsamt svalnar djupt nere i jordskorpan. 
              Denna process gör graniten extremt <strong>hård, slitstark och motståndskraftig</strong> mot värme, syror och repor.</p>

              <p>Granit består främst av kvarts, fältspat och glimmer, vilket ger stenen dess styrka och naturliga variationer i färg och struktur. 
              Färgerna kan variera från <strong>ljusgrå och vit</strong> till <strong>svart, röd och grön</strong>, ofta med gnistrande inslag som ger en exklusiv känsla.</p>

              <p>Tack vare sin unika kombination av <strong>hårdhet, tålighet och tidlös skönhet</strong> är granit ett av de mest eftertraktade materialen för bänkskivor i kök och badrum.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.granite.sections.whereToday.heading", { defaultValue: "Var finns granit idag?" }),
          content: t("materialPages.granite.sections.whereToday.content", {
            defaultValue: `
              <p>Granit finns i stora delar av världen och bryts i olika färgvarianter beroende på var den utvinns:</p>
              <ul>
                <li><strong>Sverige</strong> – känd för Bohusgranit och svart Diabas.</li>
                <li><strong>Indien</strong> – stora producenter av röd och svart granit.</li>
                <li><strong>Brasilien</strong> – granit med livliga mönster och färger.</li>
                <li><strong>Kina</strong> – en av världens största producenter av olika granitsorter.</li>
                <li><strong>Norge & Finland</strong> – mörk granit av hög kvalitet.</li>
                <li><strong>Afrika</strong> – unika varianter i grönt, blått och brunt.</li>
              </ul>

              <p>Olika ursprung ger olika <strong>färger, ådringar och hårdhet</strong>, vilket gör varje granitskiva unik.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.granite.sections.extraction.heading", { defaultValue: "Hur utvinns granit?" }),
          content: t("materialPages.granite.sections.extraction.content", {
            defaultValue: `
              <p>Granit bryts i <strong>stenbrott</strong>, där stora block sprängs eller sågas loss från berggrunden. 
              Därefter bearbetas blocken med diamantvajrar och sågar till skivor som poleras och anpassas till bänkskivor och andra byggnadsdetaljer.</p>

              <p>Till skillnad från marmor är granit svårare att bearbeta på grund av sin extrema hårdhet, men det gör också materialet <strong>mer hållbart</strong> för tuffa miljöer som kök och offentliga ytor.</p>

              <p>Precis som inom marmorindustrin pågår en utveckling mot <strong>mer hållbar brytning</strong>, med återvinning av vatten, energieffektiv teknik och minskat spill.</p>
            `,
          }),
          images: [
            {
              src: "/images/materials/Granit/granit-quarry.jpg",
              alt: t("materialPages.granite.sections.extraction.images.0.alt", {
                defaultValue: "Granitblock i stenbrott",
              }),
            },
            {
              src: "/images/materials/Granit/granit-factory.jpg",
              alt: t("materialPages.granite.sections.extraction.images.1.alt", {
                defaultValue: "Sågning och bearbetning av granitblock",
              }),
            },
          ],
        },
        {
          heading: t("materialPages.granite.sections.pros.heading", { defaultValue: "Fördelar med granitbänkskivor" }),
          content: t("materialPages.granite.sections.pros.content", {
            defaultValue: `
              <ul>
                <li>✅ <strong>Mycket tålig</strong> – granit är hårdare än marmor och tål repor och slag bättre.</li>
                <li>✅ <strong>Värmetålig</strong> – klarar heta kastruller och stekpannor utan problem.</li>
                <li>✅ <strong>Låg porositet</strong> – absorberar vätskor dåligt, vilket gör den mer hygienisk än marmor.</li>
                <li>✅ <strong>Lång livslängd</strong> – rätt skött kan en granitbänkskiva hålla i generationer.</li>
                <li>✅ <strong>Naturlig variation</strong> – varje granitskiva har sitt unika uttryck och färgspel.</li>
              </ul>
            `,
          }),
        },
        {
          heading: t("materialPages.granite.sections.cons.heading", { defaultValue: "Nackdelar att känna till" }),
          content: t("materialPages.granite.sections.cons.content", {
            defaultValue: `
              <ul>
                <li>⚠️ <strong>Tungt material</strong> – kräver stabil stomme vid montering.</li>
                <li>⚠️ <strong>Pris</strong> – granit är dyrare än enklare alternativ som laminat och komposit.</li>
                <li>⚠️ <strong>Naturliga variationer</strong> – mönster och färger kan skilja sig från provexemplar.</li>
                <li>⚠️ <strong>Kall känsla</strong> – granit behåller en sval temperatur, vilket kan upplevas hårt i vissa miljöer.</li>
              </ul>
            `,
          }),
        },
        {
          heading: t("materialPages.granite.sections.uses.heading", { defaultValue: "Användningsområden" }),
          content: t("materialPages.granite.sections.uses.content", {
            defaultValue: `
              <p>Granit är extremt mångsidigt och används både i privata hem och offentliga miljöer:</p>
              <ul>
                <li>🏡 <strong>Köksbänkar</strong> – det vanligaste användningsområdet för granit i hemmet.</li>
                <li>🛁 <strong>Badrum</strong> – tvättställ, hyllor och duschväggar i granit.</li>
                <li>🏢 <strong>Offentliga miljöer</strong> – hotell, restauranger och butiker använder granit för slitstarka golv och bardiskar.</li>
                <li>🖼️ <strong>Utemiljö</strong> – granit används även i trappor, fasader och marksten tack vare sin väderbeständighet.</li>
              </ul>
            `,
          }),
          images: [
            {
              src: "/images/materials/Granit/granit-kitchen.jpg",
              alt: t("materialPages.granite.sections.uses.images.0.alt", {
                defaultValue: "Kök med granitbänkskiva",
              }),
            },
            {
              src: "/images/materials/Granit/granit-bathroom.jpg",
              alt: t("materialPages.granite.sections.uses.images.1.alt", {
                defaultValue: "Badrum med granitbänkskiva",
              }),
            },
          ],
        },
        {
          heading: t("materialPages.granite.sections.faq.heading", { defaultValue: "Vanliga frågor" }),
          content: t("materialPages.granite.sections.faq.content", {
            defaultValue: `
              <p><strong>Behöver granit impregneras?</strong><br/> Ja, men inte lika ofta som marmor – ungefär vartannat år räcker i de flesta kök.</p>
              <p><strong>Tål granit hetta?</strong><br/> Ja, granit är mycket värmetåligt och klarar heta kastruller och pannor direkt på ytan.</p>
              <p><strong>Vad kostar en granitbänkskiva?</strong><br/> Priset varierar beroende på sort, tjocklek och bearbetning. Svensk granit kan vara prisvärd, medan exklusiva importerade sorter ofta är dyrare.</p>
              <p><strong>Är granit bättre än marmor?</strong><br/> Granit är hårdare, tåligare och kräver mindre underhåll än marmor. Marmor väljs oftare för sitt exklusiva utseende, medan granit väljs för sin slitstyrka.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.granite.sections.care.heading", { defaultValue: "Skötsel & underhåll" }),
          content: t("materialPages.granite.sections.care.content", {
            defaultValue: `
              <p>Granit är lätt att sköta, men med rätt underhåll håller den sig vacker ännu längre:</p>
              <ul>
                <li>🧽 <strong>Rengör med milda rengöringsmedel</strong> – undvik starka syror, även om granit tål dem bättre än marmor.</li>
                <li>🧽 <strong>Impregnera vartannat år</strong> – ger extra skydd mot vätskor och fläckar.</li>
                <li>🧽 <strong>Torka upp spill snabbt</strong> – speciellt olja och vin som annars kan tränga in över tid.</li>
                <li>🧽 <strong>Använd skärbräda</strong> – skyddar både ytan och dina knivar.</li>
              </ul>
              <p>Med rätt <em>skötsel av granit</em> är detta ett av de mest hållbara materialen du kan välja för kök och badrum.</p>
            `,
          }),
          images: [
            {
              src: "/images/materials/Granit/granit-care.jpg",
              alt: t("materialPages.granite.sections.care.images.0.alt", {
                defaultValue: "Impregnering av granitskiva",
              }),
            },
          ],
        },
      ]}
    />
  );
}
