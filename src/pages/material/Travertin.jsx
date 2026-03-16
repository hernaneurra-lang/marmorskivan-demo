// ===== FIL: src/pages/material/Travertin.jsx =====
import { useTranslation } from "react-i18next";
import StoneDetailPage from "../../components/StoneDetailPage";

export default function Travertin() {
  const { t } = useTranslation();

  return (
    <StoneDetailPage
      title={t("materialPages.travertine.seo.title", {
        defaultValue: "Travertin bänkskivor – Klassisk kalksten för kök & badrum | Marmorskivan.se",
      })}
      metaDescription={t("materialPages.travertine.seo.metaDescription", {
        defaultValue:
          "Travertin bänkskivor för kök och badrum – en varm, naturlig kalksten med historisk karaktär. Läs mer om travertin – ursprung, användning, fördelar, nackdelar och skötsel.",
      })}
      h1={t("materialPages.travertine.h1", {
        defaultValue: "Travertin – Allt om bänkskivor i travertin, ursprung & skötsel",
      })}
      heroImage="/images/materials/Travertin/travertin-hero.jpg"
      backgroundImage="/images/materials/travertin-hero.jpg"
      textSize="lg"
      sections={[
        {
          heading: t("materialPages.travertine.sections.what.heading", { defaultValue: "Vad är travertin?" }),
          content: t("materialPages.travertine.sections.what.content", {
            defaultValue: `
              <p>Travertin är en <strong>kalksten</strong> som bildats kring <strong>varma källor</strong> och kännetecknas av sin <strong>porösa struktur</strong> och sina <strong>varma, jordnära färgtoner</strong>. 
              Den har använts i tusentals år, bland annat i <em>romerska byggnadsverk</em> som Colosseum i Rom.</p>

              <p>Travertin varierar i färg från <strong>beige och ljusbrun</strong> till <strong>grå, röd och gyllene nyanser</strong>. 
              Dess naturliga håligheter kan fyllas med harts eller lämnas öppna för en mer rustik känsla. 
              Detta gör travertin till ett populärt material för både <strong>klassiska och moderna inredningar</strong>.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.travertine.sections.whereToday.heading", {
            defaultValue: "Var finns travertin idag?",
          }),
          content: t("materialPages.travertine.sections.whereToday.content", {
            defaultValue: `
              <p>Travertin bryts på flera platser i världen, men de mest kända förekomsterna finns i:</p>
              <ul>
                <li><strong>Italien</strong> – särskilt i Toscana och Rom-regionen.</li>
                <li><strong>Turkiet</strong> – en av de största producenterna idag.</li>
                <li><strong>Iran</strong> – känd för ljus och varm travertin.</li>
                <li><strong>Mexiko & Peru</strong> – levererar travertin i unika färger.</li>
              </ul>
              <p>Ursprunget påverkar travertinens <strong>färg, porositet och mönster</strong>, vilket gör varje bänkskiva unik.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.travertine.sections.extraction.heading", { defaultValue: "Hur utvinns travertin?" }),
          content: t("materialPages.travertine.sections.extraction.content", {
            defaultValue: `
              <p>Travertin bryts i <strong>stenbrott</strong> och bearbetas i block. Eftersom stenen är <strong>porös</strong> fylls ofta håligheterna med harts eller cement innan den slipas och poleras. 
              På så sätt får man en jämnare yta som är mer <strong>hållbar för kök och badrum</strong>.</p>

              <p>Stenen kan behandlas på olika sätt för att skapa <strong>matt, borstad eller polerad finish</strong> beroende på önskat uttryck.</p>
            `,
          }),
          images: [
            {
              src: "/images/materials/Travertin/travertin-quarry.jpg",
              alt: t("materialPages.travertine.sections.extraction.images.0.alt", {
                defaultValue: "Travertin stenbrott",
              }),
            },
            {
              src: "/images/materials/Travertin/travertin-slabs.jpg",
              alt: t("materialPages.travertine.sections.extraction.images.1.alt", {
                defaultValue: "Travertinskivor",
              }),
            },
          ],
        },
        {
          heading: t("materialPages.travertine.sections.pros.heading", {
            defaultValue: "Fördelar med travertinbänkskivor",
          }),
          content: t("materialPages.travertine.sections.pros.content", {
            defaultValue: `
              <ul>
                <li>✅ <strong>Varm och naturlig känsla</strong> – ger rummet en tidlös atmosfär.</li>
                <li>✅ <strong>Klassisk elegans</strong> – användes redan i antikens arkitektur.</li>
                <li>✅ <strong>Historiskt material</strong> – förknippas med exklusiva byggnader och miljöer.</li>
                <li>✅ <strong>Flera ytbehandlingar</strong> – polerad, matt eller borstad.</li>
              </ul>
            `,
          }),
        },
        {
          heading: t("materialPages.travertine.sections.cons.heading", { defaultValue: "Nackdelar att känna till" }),
          content: t("materialPages.travertine.sections.cons.content", {
            defaultValue: `
              <ul>
                <li>⚠️ <strong>Porös sten</strong> – mer känslig för vätskor och syror än granit.</li>
                <li>⚠️ <strong>Kräver regelbundet underhåll</strong> – impregnering är nödvändig.</li>
                <li>⚠️ <strong>Känslig för syror</strong> – vin, citron och kaffe kan etsa ytan.</li>
                <li>⚠️ <strong>Inte lika tålig som granit</strong> – bättre lämpad för dekorativa ytor eller varsam användning.</li>
              </ul>
            `,
          }),
        },
        {
          heading: t("materialPages.travertine.sections.uses.heading", { defaultValue: "Användningsområden" }),
          content: t("materialPages.travertine.sections.uses.content", {
            defaultValue: `
              <ul>
                <li>🏡 <strong>Köksbänkar</strong> – för en naturlig och varm känsla i hemmet.</li>
                <li>🛁 <strong>Badrum</strong> – handfat, hyllor och duschytor.</li>
                <li>🏛️ <strong>Golv och väggar</strong> – ofta i exklusiva hem och offentliga byggnader.</li>
                <li>🌿 <strong>Utomhus</strong> – används i terrasser och trädgårdsdetaljer.</li>
              </ul>
            `,
          }),
          images: [
            {
              src: "/images/materials/Travertin/travertin-kitchen.jpg",
              alt: t("materialPages.travertine.sections.uses.images.0.alt", { defaultValue: "Kök med travertin" }),
            },
            {
              src: "/images/materials/Travertin/travertin-bathroom.jpg",
              alt: t("materialPages.travertine.sections.uses.images.1.alt", { defaultValue: "Badrum med travertin" }),
            },
          ],
        },
        {
          heading: t("materialPages.travertine.sections.faq.heading", { defaultValue: "Vanliga frågor" }),
          content: t("materialPages.travertine.sections.faq.content", {
            defaultValue: `
              <p><strong>Är travertin slitstark?</strong><br/> Inte lika tålig som granit, men fungerar bra i kök och badrum om den underhålls rätt.</p>
              <p><strong>Behöver travertin impregneras?</strong><br/> Ja, regelbundet – helst flera gånger per år beroende på användning.</p>
              <p><strong>Kan travertin användas i dusch?</strong><br/> Ja, men kräver noggrann tätning och regelbunden skötsel.</p>
              <p><strong>Vilka färger finns travertin i?</strong><br/> Beige, brun, grå, gyllene och rödliga toner är vanligast.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.travertine.sections.care.heading", { defaultValue: "Skötsel & underhåll" }),
          content: t("materialPages.travertine.sections.care.content", {
            defaultValue: `
              <p>Travertin är en vacker men <strong>krävande natursten</strong>. För att den ska hålla sig vacker bör du:</p>
              <ul>
                <li>🧽 <strong>Impregnera ofta</strong> – skyddar mot fläckar och vätskor.</li>
                <li>🧽 <strong>Undvik syror</strong> – citron, vin och sura rengöringsmedel kan skada ytan.</li>
                <li>🧽 <strong>Använd milda rengöringsmedel</strong> – såpa eller pH-neutrala produkter.</li>
                <li>🧽 <strong>Torka upp spill direkt</strong> – särskilt olja, vin och kaffe.</li>
              </ul>
              <p>Med rätt <em>skötsel av travertin</em> kan stenen bevara sin naturliga charm i många år.</p>
            `,
          }),
          images: [
            {
              src: "/images/materials/Travertin/travertin-care.jpg",
              alt: t("materialPages.travertine.sections.care.images.0.alt", {
                defaultValue: "Skötsel av travertin",
              }),
            },
          ],
        },
      ]}
    />
  );
}
