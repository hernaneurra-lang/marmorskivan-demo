// ===== FIL: src/pages/material/Kvartsit.jsx =====
import { useTranslation } from "react-i18next";
import StoneDetailPage from "../../components/StoneDetailPage";

export default function Kvartsit() {
  const { t } = useTranslation();

  return (
    <StoneDetailPage
      title={t("materialPages.quartzite.seo.title", {
        defaultValue:
          "Kvartsit bänkskivor – Slitstarkt & exklusivt naturmaterial | Marmorskivan.se",
      })}
      metaDescription={t("materialPages.quartzite.seo.metaDescription", {
        defaultValue:
          "Kvartsit bänkskivor – en av de hårdaste naturstenarna. Lär dig mer om kvartsit – ursprung, fördelar, nackdelar, användningsområden och skötsel.",
      })}
      h1={t("materialPages.quartzite.h1", {
        defaultValue: "Kvartsit – Allt om bänkskivor i kvartsit, ursprung & skötsel",
      })}
      heroImage="/images/materials/Kvartsit/kvartsit-hero.jpg"
      backgroundImage="/images/materials/kvartsit-hero.jpg"
      textSize="lg"
      sections={[
        {
          heading: t("materialPages.quartzite.sections.what.heading", { defaultValue: "Vad är kvartsit?" }),
          content: t("materialPages.quartzite.sections.what.content", {
            defaultValue: `
              <p>Kvartsit är en <strong>metamorf bergart</strong> som bildas när sandsten utsätts för <strong>högt tryck och temperatur</strong> under miljontals år. 
              Resultatet blir en sten som är <strong>en av de hårdaste i världen</strong>, ännu hårdare än granit.</p>

              <p>Kvartsit kombinerar <strong>styrkan från granit</strong> med <strong>den eleganta ådringen från marmor</strong>, vilket gör den till ett exklusivt val för både kök, badrum och designprojekt.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.quartzite.sections.whereToday.heading", { defaultValue: "Var finns kvartsit idag?" }),
          content: t("materialPages.quartzite.sections.whereToday.content", {
            defaultValue: `
              <p>Kvartsit bryts i flera delar av världen och har olika utseenden beroende på ursprung:</p>
              <ul>
                <li><strong>Brasilien</strong> – känd för färgstarka och mönstrade kvartsiter.</li>
                <li><strong>Norge & Sverige</strong> – ljusare kvartsiter med diskreta ådringar.</li>
                <li><strong>Italien</strong> – exklusiva sorter med marmorliknande ådring.</li>
                <li><strong>Indien & Afrika</strong> – producerar tåliga sorter i grå och beige toner.</li>
              </ul>
              <p>Varje ursprung ger <strong>unika färger och mönster</strong>, från klassiskt vit och grå till grön, blå och guldskimrande kvartsit.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.quartzite.sections.extraction.heading", { defaultValue: "Hur utvinns kvartsit?" }),
          content: t("materialPages.quartzite.sections.extraction.content", {
            defaultValue: `
              <p>Kvartsit bryts i <strong>stenbrott</strong> där blocken sågas ut med diamantvajrar. 
              Därefter transporteras de till fabriker där de <strong>sågas, slipas och poleras</strong> till bänkskivor och plattor.</p>

              <p>Bearbetning av kvartsit är mer krävande än för marmor och granit, men resultatet är en <strong>extremt slitstark yta</strong> som samtidigt är estetiskt tilltalande.</p>
            `,
          }),
          images: [
            {
              src: "/images/materials/Kvartsit/kvartsit-quarry.jpg",
              alt: t("materialPages.quartzite.sections.extraction.images.0.alt", {
                defaultValue: "Kvartsit i stenbrott",
              }),
            },
            {
              src: "/images/materials/Kvartsit/kvartsit-slabs.jpg",
              alt: t("materialPages.quartzite.sections.extraction.images.1.alt", {
                defaultValue: "Kvartsitskivor i fabrik",
              }),
            },
          ],
        },
        {
          heading: t("materialPages.quartzite.sections.pros.heading", { defaultValue: "Fördelar med kvartsitbänkskivor" }),
          content: t("materialPages.quartzite.sections.pros.content", {
            defaultValue: `
              <ul>
                <li>✅ <strong>Mycket hårdare än marmor</strong> – extremt slitstarkt material.</li>
                <li>✅ <strong>Värmetålig</strong> – klarar höga temperaturer bättre än komposit.</li>
                <li>✅ <strong>Vackra ådringar</strong> – påminner om marmor men med högre slitstyrka.</li>
                <li>✅ <strong>Låg porositet</strong> – mer motståndskraftig mot vätskor än marmor.</li>
                <li>✅ <strong>Exklusivt material</strong> – används i lyxiga designprojekt världen över.</li>
              </ul>
            `,
          }),
        },
        {
          heading: t("materialPages.quartzite.sections.cons.heading", { defaultValue: "Nackdelar att känna till" }),
          content: t("materialPages.quartzite.sections.cons.content", {
            defaultValue: `
              <ul>
                <li>⚠️ <strong>Högre prisnivå</strong> – kvartsit är ofta dyrare än granit och marmor.</li>
                <li>⚠️ <strong>Svårbearbetad</strong> – kräver avancerad utrustning vid tillverkning.</li>
                <li>⚠️ <strong>Variationer i utseende</strong> – varje skiva är unik, vilket kan vara både en fördel och en utmaning vid stora projekt.</li>
              </ul>
            `,
          }),
        },
        {
          heading: t("materialPages.quartzite.sections.uses.heading", { defaultValue: "Användningsområden" }),
          content: t("materialPages.quartzite.sections.uses.content", {
            defaultValue: `
              <p>Kvartsit är en av de mest <strong>mångsidiga och slitstarka</strong> naturstenarna och används i:</p>
              <ul>
                <li>🏡 <strong>Köksbänkar</strong> – perfekt för den som vill ha både skönhet och hållbarhet.</li>
                <li>🛁 <strong>Badrum</strong> – bänkar, hyllor och väggbeklädnader.</li>
                <li>🏨 <strong>Lyxiga inredningsprojekt</strong> – hotell, restauranger och exklusiva hem.</li>
                <li>🏛️ <strong>Arkitektur</strong> – fasader och golv i exklusiva byggnader.</li>
              </ul>
            `,
          }),
          images: [
            {
              src: "/images/materials/Kvartsit/kvartsit-kitchen.jpg",
              alt: t("materialPages.quartzite.sections.uses.images.0.alt", { defaultValue: "Kök med kvartsit" }),
            },
            {
              src: "/images/materials/Kvartsit/kvartsit-bathroom.jpg",
              alt: t("materialPages.quartzite.sections.uses.images.1.alt", { defaultValue: "Badrum med kvartsit" }),
            },
          ],
        },
        {
          heading: t("materialPages.quartzite.sections.faq.heading", { defaultValue: "Vanliga frågor" }),
          content: t("materialPages.quartzite.sections.faq.content", {
            defaultValue: `
              <p><strong>Är kvartsit tåligare än granit?</strong><br/> Ja, kvartsit är ännu hårdare och mer motståndskraftig mot repor.</p>
              <p><strong>Behöver kvartsit impregneras?</strong><br/> Ja, men mer sällan än marmor eftersom stenen har lägre porositet.</p>
              <p><strong>Tål kvartsit värme?</strong><br/> Ja, kvartsit är mycket värmetålig och klarar heta kastruller bättre än de flesta andra stensorter.</p>
              <p><strong>Finns kvartsit i olika färger?</strong><br/> Ja, från klassiska vita och gråa till gröna, blå och guldskimrande varianter.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.quartzite.sections.care.heading", { defaultValue: "Skötsel & underhåll" }),
          content: t("materialPages.quartzite.sections.care.content", {
            defaultValue: `
              <p>Kvartsit är relativt lättskött, men för bästa resultat bör du:</p>
              <ul>
                <li>🧽 <strong>Impregnera vid behov</strong> – ger extra skydd mot fläckar.</li>
                <li>🧽 <strong>Rengör med milda medel</strong> – använd pH-neutrala rengöringsprodukter.</li>
                <li>🧽 <strong>Undvik starka kemikalier</strong> – syror och slipande rengöringsmedel kan skada ytan.</li>
                <li>🧽 <strong>Torka upp spill direkt</strong> – även om stenen är tåligare än marmor.</li>
              </ul>
              <p>Med rätt <em>skötsel av kvartsit</em> kan en bänkskiva hålla sig vacker i flera decennier.</p>
            `,
          }),
          images: [
            {
              src: "/images/materials/Kvartsit/kvartsit-care.jpg",
              alt: t("materialPages.quartzite.sections.care.images.0.alt", { defaultValue: "Skötsel av kvartsit" }),
            },
          ],
        },
      ]}
    />
  );
}
