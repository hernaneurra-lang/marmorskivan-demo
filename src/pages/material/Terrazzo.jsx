// ===== FIL: src/pages/material/Terrazzo.jsx =====
import { useTranslation } from "react-i18next";
import StoneDetailPage from "../../components/StoneDetailPage";

export default function Terrazzo() {
  const { t } = useTranslation();

  return (
    <StoneDetailPage
      title={t("materialPages.terrazzo.seo.title", {
        defaultValue: "Terrazzo bänkskivor – Hållbart, modernt & färgglatt material | Marmorskivan.se",
      })}
      metaDescription={t("materialPages.terrazzo.seo.metaDescription", {
        defaultValue:
          "Terrazzo bänkskivor för kök och badrum – ett slitstarkt och miljövänligt material gjort av krossad sten i cement eller resin. Läs mer om terrazzo – tillverkning, fördelar, nackdelar och skötsel.",
      })}
      h1={t("materialPages.terrazzo.h1", {
        defaultValue: "Terrazzo – Allt om bänkskivor i terrazzo, tillverkning & skötsel",
      })}
      heroImage="/images/materials/Terrazzo/terrazzo-hero.jpg"
      backgroundImage="/images/materials/terrazzo-hero.jpg"
      textSize="lg"
      sections={[
        {
          heading: t("materialPages.terrazzo.sections.what.heading", { defaultValue: "Vad är terrazzo?" }),
          content: t("materialPages.terrazzo.sections.what.content", {
            defaultValue: `
              <p>Terrazzo är ett <strong>kompositmaterial</strong> som består av krossad sten, glas, marmorfragment eller andra mineraler som blandas med <strong>cement eller resin</strong>. 
              Resultatet blir ett <strong>slitstarkt, dekorativt och färgglatt material</strong> med unika mönster.</p>

              <p>Materialet har använts i flera hundra år, särskilt i <em>italiensk arkitektur</em>, och har på senare tid blivit mycket populärt igen i <strong>moderna kök, badrum och offentliga miljöer</strong>.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.terrazzo.sections.manufacturing.heading", { defaultValue: "Hur tillverkas terrazzo?" }),
          content: t("materialPages.terrazzo.sections.manufacturing.content", {
            defaultValue: `
              <p>Terrazzo kan tillverkas på två sätt: med <strong>cementbaserad bindning</strong> eller med <strong>resin/epoxy</strong>. 
              Cementterrazzo är traditionell och mycket hållbar, medan resinbaserad terrazzo är mer flexibel och kan tillverkas i tunnare skivor.</p>

              <p>Efter att blandningen gjutits i block eller plattor <strong>slipas och poleras</strong> ytan fram för att få en jämn, glansig finish och framhäva stenfragmentens färger och mönster.</p>
            `,
          }),
          images: [
            {
              src: "/images/materials/Terrazzo/terrazzo-slabs.jpg",
              alt: t("materialPages.terrazzo.sections.manufacturing.images.0.alt", {
                defaultValue: "Terrazzo-block i fabrik",
              }),
            },
            {
              src: "/images/materials/Terrazzo/terrazzo-closeup.jpg",
              alt: t("materialPages.terrazzo.sections.manufacturing.images.1.alt", {
                defaultValue: "Närbild av terrazzo",
              }),
            },
          ],
        },
        {
          heading: t("materialPages.terrazzo.sections.whereMade.heading", { defaultValue: "Var tillverkas terrazzo idag?" }),
          content: t("materialPages.terrazzo.sections.whereMade.content", {
            defaultValue: `
              <p>Terrazzo produceras numera i stor skala i flera regioner:</p>
              <ul>
                <li><strong>Italien</strong> – terrazzo har sina historiska rötter här och landet är fortsatt en stor producent och exportör.</li>
                <li><strong>Spanien & Portugal</strong> – stark europeisk produktion av plattor och skivor för både privat och offentlig miljö.</li>
                <li><strong>Storbritannien & Tyskland</strong> – fabrikstillverkad terrazzo och prefabricerade skivor för projekt och inredning.</li>
                <li><strong>USA</strong> – inhemsk tillverkning av prefabricerade terrazzo-plattor och bänkskivor.</li>
                <li><strong>Kina</strong> – stor volymtillverkning och export av både cement- och resinbaserad terrazzo.</li>
              </ul>
              <p>Tack vare <strong>flexibel design</strong> och <strong>återvunnet innehåll</strong> ökar efterfrågan globalt, vilket har lett till produktion i flera länder nära slutkund för kortare ledtider och bättre hållbarhet.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.terrazzo.sections.whereUsed.heading", { defaultValue: "Var används terrazzo idag?" }),
          content: t("materialPages.terrazzo.sections.whereUsed.content", {
            defaultValue: `
              <p>Terrazzo har gjort comeback som ett <strong>designmaterial</strong> tack vare sin unika estetik och hållbarhet. 
              Det används i:</p>
              <ul>
                <li><strong>Kök</strong> – bänkskivor, köksöar och stänkskydd.</li>
                <li><strong>Badrum</strong> – handfat, duschväggar och bänkar.</li>
                <li><strong>Offentliga miljöer</strong> – hotell, butiker, restauranger och flygplatser.</li>
                <li><strong>Arkitektur</strong> – golv och väggar i både moderna och klassiska byggnader.</li>
              </ul>
              <p>Eftersom terrazzo kan <strong>skräddarsys i färg och mönster</strong> används det ofta av arkitekter och designers som vill skapa en unik visuell identitet.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.terrazzo.sections.pros.heading", { defaultValue: "Fördelar med terrazzo" }),
          content: t("materialPages.terrazzo.sections.pros.content", {
            defaultValue: `
              <ul>
                <li>✅ <strong>Många färgval</strong> – kan anpassas till alla inredningsstilar.</li>
                <li>✅ <strong>Hållbart och slitstarkt</strong> – särskilt i offentliga miljöer med hög belastning.</li>
                <li>✅ <strong>Miljövänligt</strong> – ofta tillverkat med återvunnet material.</li>
                <li>✅ <strong>Lång livslängd</strong> – rätt underhållet kan terrazzo hålla i generationer.</li>
                <li>✅ <strong>Tidlös estetik</strong> – används både i klassisk och modern design.</li>
              </ul>
            `,
          }),
        },
        {
          heading: t("materialPages.terrazzo.sections.cons.heading", { defaultValue: "Nackdelar att känna till" }),
          content: t("materialPages.terrazzo.sections.cons.content", {
            defaultValue: `
              <ul>
                <li>⚠️ <strong>Känsligt för sprickor</strong> – kan spricka vid hårda slag eller om underlaget inte är stabilt.</li>
                <li>⚠️ <strong>Kräver underhåll</strong> – behöver slipas och poleras för att behålla glansen.</li>
                <li>⚠️ <strong>Kan vara tungt</strong> – särskilt cementbaserad terrazzo kräver en stabil konstruktion.</li>
              </ul>
            `,
          }),
        },
        {
          heading: t("materialPages.terrazzo.sections.uses.heading", { defaultValue: "Användningsområden" }),
          content: t("materialPages.terrazzo.sections.uses.content", {
            defaultValue: `
              <ul>
                <li>🏡 <strong>Köksbänkar</strong> – färgstarka och unika ytor i köket.</li>
                <li>🛁 <strong>Badrum</strong> – terrazzo används för bänkar, tvättställ och duschytor.</li>
                <li>🏢 <strong>Offentliga miljöer</strong> – hotell, caféer, butiker och gallerior.</li>
                <li>🏛️ <strong>Arkitektur</strong> – terrazzo har länge använts i golv och trapphus i offentliga byggnader.</li>
              </ul>
            `,
          }),
          images: [
            {
              src: "/images/materials/Terrazzo/terrazzo-kitchen.jpg",
              alt: t("materialPages.terrazzo.sections.uses.images.0.alt", {
                defaultValue: "Kök med terrazzo-bänkskiva",
              }),
            },
            {
              src: "/images/materials/Terrazzo/terrazzo-bathroom.jpg",
              alt: t("materialPages.terrazzo.sections.uses.images.1.alt", {
                defaultValue: "Badrum med terrazzo",
              }),
            },
          ],
        },
        {
          heading: t("materialPages.terrazzo.sections.faq.heading", { defaultValue: "Vanliga frågor" }),
          content: t("materialPages.terrazzo.sections.faq.content", {
            defaultValue: `
              <p><strong>Är terrazzo miljövänligt?</strong><br/> Ja, eftersom terrazzo ofta innehåller återvunnet material är det ett hållbart val.</p>
              <p><strong>Behöver terrazzo impregneras?</strong><br/> Ja, regelbundet för att skydda mot vätskor och fläckar.</p>
              <p><strong>Kan terrazzo repareras?</strong><br/> Ja, mindre skador kan slipas bort och ytan kan poleras upp på nytt.</p>
              <p><strong>Är terrazzo bra för kök?</strong><br/> Ja, men det kräver rätt skötsel och impregnering för att hålla sig vackert.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.terrazzo.sections.care.heading", { defaultValue: "Skötsel & underhåll" }),
          content: t("materialPages.terrazzo.sections.care.content", {
            defaultValue: `
              <p>För att terrazzo ska behålla sin lyster och slitstyrka bör du:</p>
              <ul>
                <li>🧽 <strong>Impregnera regelbundet</strong> – skyddar mot vätskor och fläckar.</li>
                <li>🧽 <strong>Använd milda rengöringsmedel</strong> – undvik starka syror.</li>
                <li>🧽 <strong>Polera vid behov</strong> – slipning och polering återställer glansen.</li>
                <li>🧽 <strong>Torka upp spill direkt</strong> – särskilt vin, olja och syrliga vätskor.</li>
              </ul>
              <p>Med rätt <em>skötsel av terrazzo</em> kan materialet hålla sig vackert i flera decennier.</p>
            `,
          }),
          images: [
            {
              src: "/images/materials/Terrazzo/terrazzo-care.jpg",
              alt: t("materialPages.terrazzo.sections.care.images.0.alt", {
                defaultValue: "Skötsel av terrazzo",
              }),
            },
          ],
        },
      ]}
    />
  );
}
