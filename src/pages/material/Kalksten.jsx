// ===== FIL: src/pages/material/Kalksten.jsx =====
import { useTranslation } from "react-i18next";
import StoneDetailPage from "../../components/StoneDetailPage";

export default function Kalksten() {
  const { t } = useTranslation();

  return (
    <StoneDetailPage
      title={t("materialPages.limestone.seo.title", {
        defaultValue:
          "Kalksten bänkskivor – Köpa kalksten till kök & badrum | Pris & skötsel | Marmorskivan.se",
      })}
      metaDescription={t("materialPages.limestone.seo.metaDescription", {
        defaultValue:
          "Kalkstensbänkskivor för kök och badrum – lär dig allt om kalksten. Ursprung, utvinning, fördelar, nackdelar, pris, användningsområden och skötselråd.",
      })}
      h1={t("materialPages.limestone.h1", {
        defaultValue: "Kalksten – Allt om kalkstensbänkskivor, ursprung & skötsel",
      })}
      heroImage="/images/materials/Kalksten/kalksten-hero.jpg"
      backgroundImage="/images/materials/kalksten-hero.jpg"
      textSize="lg"
      sections={[
        {
          heading: t("materialPages.limestone.sections.what.heading", {
            defaultValue: "Vad är kalksten?",
          }),
          content: t("materialPages.limestone.sections.what.content", {
            defaultValue: `
              <p>Kalksten är en <strong>sedimentär bergart</strong> som bildats under miljontals år av marina avlagringar, ofta med synliga fossil. 
              Till skillnad från granit och marmor är kalksten mjukare och mer porös, men den har en <strong>varm, naturlig och tidlös känsla</strong>.</p>

              <p>Färgerna varierar från <strong>ljusgrå och beige</strong> till <strong>mörkgrå, brun och gulaktig</strong>, vilket gör kalksten till ett mångsidigt val för både moderna och klassiska miljöer.</p>

              <p>Tack vare sin naturliga skönhet används kalksten flitigt i <em>bänkskivor, golv, väggar och fasader</em>, men materialet kräver viss omsorg för att hålla sig vackert över tid.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.limestone.sections.whereToday.heading", {
            defaultValue: "Var finns kalksten idag?",
          }),
          content: t("materialPages.limestone.sections.whereToday.content", {
            defaultValue: `
              <p>Kalksten bryts på många platser i världen och har olika karaktär beroende på ursprung:</p>
              <ul>
                <li><strong>Sverige</strong> – bland annat Ölandskalksten och Gotlandskalksten.</li>
                <li><strong>Danmark</strong> – Mønstens kalksten och Bornholmskalksten.</li>
                <li><strong>Frankrike</strong> – känd för ljusa kalkstenar som används i klassiska byggnader.</li>
                <li><strong>England</strong> – Portland Stone, använd i många historiska byggnader.</li>
                <li><strong>Turkiet & Spanien</strong> – stora producenter av beige och grå kalksten.</li>
              </ul>
              <p>Olika ursprung ger unika <strong>färgtoner, ådringar och fossilinslag</strong>, vilket gör varje kalkstensskiva unik.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.limestone.sections.extraction.heading", {
            defaultValue: "Hur utvinns kalksten?",
          }),
          content: t("materialPages.limestone.sections.extraction.content", {
            defaultValue: `
              <p>Kalksten bryts i <strong>stenbrott</strong>, där block sågas ut och bearbetas till plattor och skivor. 
              Tack vare sin jämnare struktur än granit är kalksten lättare att bearbeta, vilket gör den populär för <em>bänkskivor, golv och väggbeklädnad</em>.</p>

              <p>I fabrikerna kapas blocken till skivor som sedan slipas, poleras eller lämnas med mattare finish beroende på användningsområde. 
              På senare år har även mer <strong>hållbara produktionsmetoder</strong> introducerats med återanvändning av vatten och minskat spill.</p>
            `,
          }),
          images: [
            {
              src: "/images/materials/Kalksten/kalksten-quarry.jpg",
              alt: t("materialPages.limestone.sections.extraction.images.0.alt", {
                defaultValue: "Stenbrott med kalksten",
              }),
            },
            {
              src: "/images/materials/Kalksten/kalksten-slabs.jpg",
              alt: t("materialPages.limestone.sections.extraction.images.1.alt", {
                defaultValue: "Kalkstensplattor",
              }),
            },
          ],
        },
        {
          heading: t("materialPages.limestone.sections.pros.heading", {
            defaultValue: "Fördelar med kalkstensbänkskivor",
          }),
          content: t("materialPages.limestone.sections.pros.content", {
            defaultValue: `
              <ul>
                <li>✅ <strong>Naturligt och tidlöst</strong> – skapar en varm och harmonisk känsla.</li>
                <li>✅ <strong>Behaglig färgskala</strong> – passar både moderna och klassiska inredningar.</li>
                <li>✅ <strong>Miljövänligt material</strong> – kalksten kräver relativt lite energi vid utvinning jämfört med andra stenar.</li>
                <li>✅ <strong>Unikt uttryck</strong> – ofta med vackra fossilinslag som gör varje skiva unik.</li>
              </ul>
            `,
          }),
        },
        {
          heading: t("materialPages.limestone.sections.cons.heading", {
            defaultValue: "Nackdelar att känna till",
          }),
          content: t("materialPages.limestone.sections.cons.content", {
            defaultValue: `
              <ul>
                <li>⚠️ <strong>Porös</strong> – mer känslig för fläckar än granit och kvartsit.</li>
                <li>⚠️ <strong>Känslig för syror</strong> – vin, citron och kaffe kan etsa ytan.</li>
                <li>⚠️ <strong>Kräver underhåll</strong> – behöver regelbunden impregnering och skötsel.</li>
                <li>⚠️ <strong>Mjukare sten</strong> – kan repas lättare än granit och marmor.</li>
              </ul>
            `,
          }),
        },
        {
          heading: t("materialPages.limestone.sections.uses.heading", {
            defaultValue: "Användningsområden",
          }),
          content: t("materialPages.limestone.sections.uses.content", {
            defaultValue: `
              <p>Kalksten används i både inomhus- och utomhusmiljöer:</p>
              <ul>
                <li>🏡 <strong>Bänkskivor</strong> – kök, köksöar och fönsterbänkar.</li>
                <li>🛁 <strong>Badrum</strong> – tvättställ, hyllor och duschväggar.</li>
                <li>🏛️ <strong>Golv och väggar</strong> – i hem, hotell och offentliga byggnader.</li>
                <li>🌳 <strong>Utomhus</strong> – fasader, trädgårdsplattor och trappor.</li>
              </ul>
            `,
          }),
          images: [
            {
              src: "/images/materials/Kalksten/kalksten-kitchen.jpg",
              alt: t("materialPages.limestone.sections.uses.images.0.alt", {
                defaultValue: "Kök med kalkstensbänkskiva",
              }),
            },
            {
              src: "/images/materials/Kalksten/kalksten-bathroom.jpg",
              alt: t("materialPages.limestone.sections.uses.images.1.alt", {
                defaultValue: "Badrum med kalksten",
              }),
            },
          ],
        },
        {
          heading: t("materialPages.limestone.sections.faq.heading", {
            defaultValue: "Vanliga frågor",
          }),
          content: t("materialPages.limestone.sections.faq.content", {
            defaultValue: `
              <p><strong>Är kalksten slitstark?</strong><br/> Inte lika tålig som granit, men fungerar bra vid rätt användning och skötsel.</p>
              <p><strong>Behöver kalksten impregneras?</strong><br/> Ja, regelbundet – minst en gång per år.</p>
              <p><strong>Kan kalksten användas i kök?</strong><br/> Ja, men det kräver försiktighet eftersom stenen är känslig för syror och fläckar.</p>
              <p><strong>Vad kostar en kalkstensbänkskiva?</strong><br/> Priset varierar beroende på ursprung, färg och bearbetning – svensk kalksten är ofta mer prisvärd än importerad.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.limestone.sections.care.heading", {
            defaultValue: "Skötsel & underhåll",
          }),
          content: t("materialPages.limestone.sections.care.content", {
            defaultValue: `
              <p>För att din kalkstensbänkskiva ska hålla sig vacker så länge som möjligt:</p>
              <ul>
                <li>🧽 <strong>Impregnera varje år</strong> – ger skydd mot vätskor och fläckar.</li>
                <li>🧽 <strong>Undvik syror</strong> – vin, citrus och rengöringsmedel med lågt pH kan skada ytan.</li>
                <li>🧽 <strong>Använd milda rengöringsmedel</strong> – rengör med pH-neutrala produkter.</li>
                <li>🧽 <strong>Torka upp spill direkt</strong> – särskilt vätskor som olja, vin eller kaffe.</li>
                <li>🧽 <strong>Använd skärbräda</strong> – för att undvika repor.</li>
              </ul>
              <p>Med rätt <em>skötsel av kalksten</em> behåller materialet sin naturliga charm i många år.</p>
            `,
          }),
          images: [
            {
              src: "/images/materials/Kalksten/kalksten-care.jpg",
              alt: t("materialPages.limestone.sections.care.images.0.alt", {
                defaultValue: "Skötsel av kalksten",
              }),
            },
          ],
        },
      ]}
    />
  );
}
