// ===== FIL: src/pages/material/Onyx.jsx =====
import { useTranslation } from "react-i18next";
import StoneDetailPage from "../../components/StoneDetailPage";

export default function Onyx() {
  const { t } = useTranslation();

  return (
    <StoneDetailPage
      title={t("materialPages.onyx.seo.title", {
        defaultValue: "Onyx bänkskivor – Exklusivt & genomskinligt naturmaterial | Marmorskivan.se",
      })}
      metaDescription={t("materialPages.onyx.seo.metaDescription", {
        defaultValue:
          "Onyx är en exklusiv natursten som kan bakbelysas för unika effekter. Lär dig mer om onyx – ursprung, användning, fördelar, nackdelar och skötsel.",
      })}
      h1={t("materialPages.onyx.h1", {
        defaultValue: "Onyx – Allt om onyxbänkskivor, ursprung & skötsel",
      })}
      heroImage="/images/materials/Onyx/onyx-hero.jpg"
      backgroundImage="/images/materials/onyx-hero.jpg"
      textSize="lg"
      sections={[
        {
          heading: t("materialPages.onyx.sections.what.heading", { defaultValue: "Vad är onyx?" }),
          content: t("materialPages.onyx.sections.what.content", {
            defaultValue: `
              <p>Onyx är en <strong>unik och exklusiv natursten</strong> som tillhör kalcitfamiljen. 
              Stenen kännetecknas av sina <strong>genomskinliga egenskaper</strong> och sina dramatiska lager av färg, som kan variera från vit och grön till brun, röd och guldskimrande.</p>

              <p>Det som gör onyx speciell är dess förmåga att <strong>släppa igenom ljus</strong>. 
              När den bakbelyses skapas en spektakulär effekt som framhäver stenens naturliga ådringar och färgskiftningar – något som gör den populär i <em>lyxiga inredningar, hotell, barer och exklusiva hem</em>.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.onyx.sections.whereToday.heading", { defaultValue: "Var finns onyx idag?" }),
          content: t("materialPages.onyx.sections.whereToday.content", {
            defaultValue: `
              <p>Onyx är en relativt sällsynt sten och bryts främst i:</p>
              <ul>
                <li><strong>Mexiko</strong> – känd för onyx i gröna och brunaktiga toner.</li>
                <li><strong>Pakistan</strong> – producerar många dekorativa varianter.</li>
                <li><strong>Iran</strong> – stor exportör av ljus onyx med mjuka färger.</li>
                <li><strong>Turkiet</strong> – betydande producent av onyx för den europeiska marknaden.</li>
              </ul>
              <p>Dessa ursprung ger olika färgvariationer och mönster, vilket gör varje <strong>onyxbänkskiva</strong> till ett unikt konstverk.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.onyx.sections.extraction.heading", { defaultValue: "Hur utvinns onyx?" }),
          content: t("materialPages.onyx.sections.extraction.content", {
            defaultValue: `
              <p>Onyx bryts i <strong>stenbrott</strong>, men eftersom materialet är <strong>sprödare än marmor och granit</strong> krävs extra försiktighet. 
              Blocken sågas ut med diamantvajrar och bearbetas i tunnare skivor för att bevara stenens transparens och minska risken för sprickor.</p>

              <p>Ofta används onyx i <strong>tunnare skivor</strong> som kan monteras med bakbelysning, vilket gör stenen särskilt eftertraktad i exklusiva designprojekt.</p>
            `,
          }),
          images: [
            {
              src: "/images/materials/Onyx/Onyx-quarry.jpg",
              alt: t("materialPages.onyx.sections.extraction.images.0.alt", {
                defaultValue: "Stenbrott med onyx",
              }),
            },
            {
              src: "/images/materials/Onyx/Onyx-factory.jpg",
              alt: t("materialPages.onyx.sections.extraction.images.1.alt", {
                defaultValue: "Onyxbearbetning i fabrik",
              }),
            },
          ],
        },
        {
          heading: t("materialPages.onyx.sections.pros.heading", { defaultValue: "Fördelar med onyxbänkskivor" }),
          content: t("materialPages.onyx.sections.pros.content", {
            defaultValue: `
              <ul>
                <li>✅ <strong>Exklusivt utseende</strong> – onyx är en av de mest iögonfallande naturstenarna.</li>
                <li>✅ <strong>Transparent</strong> – kan bakbelysas för dramatiska effekter.</li>
                <li>✅ <strong>Lyxig känsla</strong> – används i exklusiva hem, hotell och restauranger.</li>
                <li>✅ <strong>Unika mönster</strong> – varje skiva är ett konstverk från naturen.</li>
              </ul>
            `,
          }),
        },
        {
          heading: t("materialPages.onyx.sections.cons.heading", { defaultValue: "Nackdelar att känna till" }),
          content: t("materialPages.onyx.sections.cons.content", {
            defaultValue: `
              <ul>
                <li>⚠️ <strong>Sprödare än andra naturstenar</strong> – onyx är mer känslig för slag och tryck.</li>
                <li>⚠️ <strong>Kräver noggrann skötsel</strong> – ytan måste impregneras och behandlas med försiktighet.</li>
                <li>⚠️ <strong>Högt pris</strong> – onyx är betydligt dyrare än marmor och granit.</li>
                <li>⚠️ <strong>Inte optimal för hårt belastade kök</strong> – används bäst som dekorativ sten.</li>
              </ul>
            `,
          }),
        },
        {
          heading: t("materialPages.onyx.sections.uses.heading", { defaultValue: "Användningsområden" }),
          content: t("materialPages.onyx.sections.uses.content", {
            defaultValue: `
              <p>Onyx används sällan som standardmaterial, utan främst i <strong>lyxiga och dekorativa sammanhang</strong>:</p>
              <ul>
                <li>🏡 <strong>Exklusiva kök och badrum</strong> – för den som söker något helt unikt.</li>
                <li>💡 <strong>Bakbelysta väggar</strong> – skapar spektakulära ljuseffekter.</li>
                <li>🍸 <strong>Bardiskar & receptioner</strong> – ger en dramatisk och exklusiv känsla.</li>
                <li>🏨 <strong>Hotell & butiker</strong> – används för att skapa lyxiga miljöer.</li>
              </ul>
            `,
          }),
          images: [
            {
              src: "/images/materials/Onyx/Onyx-kitchen.jpg",
              alt: t("materialPages.onyx.sections.uses.images.0.alt", {
                defaultValue: "Kök med onyxbänkskiva",
              }),
            },
            {
              src: "/images/materials/Onyx/Onyx-backlit.jpg",
              alt: t("materialPages.onyx.sections.uses.images.1.alt", {
                defaultValue: "Bakbelyst onyxvägg",
              }),
            },
          ],
        },
        {
          heading: t("materialPages.onyx.sections.faq.heading", { defaultValue: "Vanliga frågor" }),
          content: t("materialPages.onyx.sections.faq.content", {
            defaultValue: `
              <p><strong>Är onyx tåligt nog för kök?</strong><br/> Onyx kan användas i kök, men kräver stor försiktighet och rekommenderas främst som dekorativ sten eller i miljöer med mindre slitage.</p>
              <p><strong>Kan man belysa onyx?</strong><br/> Ja, onyx är halvtransparent och kan bakbelysas för att skapa fantastiska ljuseffekter.</p>
              <p><strong>Är onyx dyrare än andra stensorter?</strong><br/> Ja, onyx räknas som en av de mest exklusiva och kostsamma naturstenarna.</p>
              <p><strong>Vilka färger finns onyx i?</strong><br/> Onyx finns i många färger – från vit och grön till röd, brun och guldskimrande varianter.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.onyx.sections.care.heading", { defaultValue: "Skötsel & underhåll" }),
          content: t("materialPages.onyx.sections.care.content", {
            defaultValue: `
              <p>Onyx kräver mer omsorg än andra naturstenar, men med rätt underhåll bevaras dess exklusiva utseende:</p>
              <ul>
                <li>🧽 <strong>Rengör med milda rengöringsmedel</strong> – undvik sura eller starka kemikalier.</li>
                <li>🧽 <strong>Använd mjuka trasor</strong> – hårda borstar kan repa ytan.</li>
                <li>🧽 <strong>Impregnera regelbundet</strong> – skyddar mot fläckar och spill.</li>
                <li>🧽 <strong>Placera med omtanke</strong> – använd onyx främst på dekorativa ytor snarare än hårt belastade arbetsytor.</li>
              </ul>
              <p>Med rätt <em>skötsel av onyx</em> behåller stenen sin lyster och unika karaktär i många år.</p>
            `,
          }),
          images: [
            {
              src: "/images/materials/Onyx/Onyx-care.jpg",
              alt: t("materialPages.onyx.sections.care.images.0.alt", {
                defaultValue: "Skötsel av onyx",
              }),
            },
          ],
        },
      ]}
    />
  );
}
  