// ===== FIL: src/pages/material/AtervunnetGlas.jsx =====
import { useTranslation } from "react-i18next";
import StoneDetailPage from "../../components/StoneDetailPage";

export default function AtervunnetGlas() {
  const { t } = useTranslation();

  return (
    <StoneDetailPage
      title={t("materialPages.recycledGlass.seo.title", {
        defaultValue:
          "Återvunnet glas bänkskivor – Miljövänligt, modernt & färgstarkt | Marmorskivan.se",
      })}
      metaDescription={t("materialPages.recycledGlass.seo.metaDescription", {
        defaultValue:
          "Återvunnet glas bänkskivor – ett hållbart val för kök och badrum. Lär dig mer om återvunnet glas – tillverkning, fördelar, nackdelar, användningsområden och skötsel.",
      })}
      h1={t("materialPages.recycledGlass.h1", {
        defaultValue: "Återvunnet glas – Allt om bänkskivor i återvunnet glas & miljövänliga material",
      })}
      heroImage="/images/materials/Glas/glas-hero.jpg"
      backgroundImage="/images/materials/glas-hero.jpg"
      textSize="lg"
      showComparison={true}
      sections={[
        {
          heading: t("materialPages.recycledGlass.sections.what.heading", {
            defaultValue: "Vad är återvunnet glas?",
          }),
          content: t("materialPages.recycledGlass.sections.what.content", {
            defaultValue: `
              <p>Återvunnet glas är ett <strong>hållbart material</strong> som tillverkas av <strong>krossat glas</strong> som blandas med 
              <strong>resin eller cement</strong> och pressas till solida skivor. 
              Resultatet blir en <strong>miljövänlig bänkskiva</strong> med unika färger och mönster.</p>

              <p>Materialet har blivit populärt bland dem som söker <strong>hållbara och moderna alternativ</strong> till natursten och komposit, 
              samtidigt som det erbjuder ett mer <strong>färgstarkt uttryck</strong>.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.recycledGlass.sections.manufacturing.heading", {
            defaultValue: "Hur tillverkas återvunnet glas-skivor?",
          }),
          content: t("materialPages.recycledGlass.sections.manufacturing.content", {
            defaultValue: `
              <p>Tillverkningen börjar med att <strong>glas samlas in och krossas</strong>. 
              Därefter blandas det med <strong>bindemedel som cement eller resin</strong>, och gjuts till block eller skivor. 
              Ytan <strong>slipas och poleras</strong> för att framhäva glasfragmentens färgspel.</p>

              <p>Resultatet blir ett material som är <strong>slitstarkt, dekorativt och miljövänligt</strong> – perfekt för kök, badrum och moderna inredningsprojekt.</p>
            `,
          }),
          images: [
            {
              src: "/images/materials/Glas/glas-slabs.jpg",
              alt: t("materialPages.recycledGlass.sections.manufacturing.images.0.alt", {
                defaultValue: "Skivor av återvunnet glas",
              }),
            },
            {
              src: "/images/materials/Glas/glas-closeup.jpg",
              alt: t("materialPages.recycledGlass.sections.manufacturing.images.1.alt", {
                defaultValue: "Närbild av återvunnet glas",
              }),
            },
          ],
        },
        {
          heading: t("materialPages.recycledGlass.sections.whereMade.heading", {
            defaultValue: "Var tillverkas återvunnet glas-bänkskivor?",
          }),
          content: t("materialPages.recycledGlass.sections.whereMade.content", {
            defaultValue: `
              <p>De största klustren av tillverkare av bänkskivor i återvunnet glas finns i:</p>
              <ul>
                <li><strong>USA</strong> – etablerade producenter med fabriker i bl.a. Georgia och New York.</li>
                <li><strong>Tyskland</strong> – tillverkare av glas-keramiska skivor av 100 % återvunnet glas.</li>
                <li><strong>Storbritannien</strong> – inhemsk tillverkning av återvunna glasskivor för kök och inredning.</li>
                <li><strong>Kina</strong> – ett av de största klustren för exportproduktion av återvunnet glas-skivor.</li>
              </ul>
              <p><strong>Europa</strong> (främst Tyskland, Storbritannien och Frankrike) samt <strong>Nordamerika</strong> driver också mycket av efterfrågan tack vare 
              utbyggd återvinningsinfrastruktur och hårdare hållbarhetskrav.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.recycledGlass.sections.whereUsed.heading", {
            defaultValue: "Var används återvunnet glas idag?",
          }),
          content: t("materialPages.recycledGlass.sections.whereUsed.content", {
            defaultValue: `
              <p>Återvunnet glas används i en rad olika miljöer där <strong>hållbarhet och design</strong> står i fokus:</p>
              <ul>
                <li><strong>Kök</strong> – bänkskivor och köksöar med unik färg och lyster.</li>
                <li><strong>Badrum</strong> – handfat, hyllor och dekorativa ytor.</li>
                <li><strong>Offentliga miljöer</strong> – caféer, hotell och kontor som vill visa miljöprofil.</li>
                <li><strong>Arkitektur & inredning</strong> – väggpaneler, bardiskar och speciallösningar.</li>
              </ul>
              <p>Materialet är särskilt populärt i <strong>miljömedvetna inredningsprojekt</strong> och bland arkitekter som vill kombinera estetik med hållbarhet.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.recycledGlass.sections.pros.heading", {
            defaultValue: "Fördelar med återvunnet glas",
          }),
          content: t("materialPages.recycledGlass.sections.pros.content", {
            defaultValue: `
              <ul>
                <li>✅ <strong>Miljövänligt</strong> – tillverkat av återvunnet material.</li>
                <li>✅ <strong>Färgstarkt och unikt</strong> – varje skiva får ett eget utseende.</li>
                <li>✅ <strong>Modernt uttryck</strong> – perfekt för samtida kök och badrum.</li>
                <li>✅ <strong>Lång livslängd</strong> – tåligt vid rätt skötsel.</li>
              </ul>
            `,
          }),
        },
        {
          heading: t("materialPages.recycledGlass.sections.cons.heading", {
            defaultValue: "Nackdelar att känna till",
          }),
          content: t("materialPages.recycledGlass.sections.cons.content", {
            defaultValue: `
              <ul>
                <li>⚠️ <strong>Känsligt för repor</strong> – hårda slag och metallföremål kan skada ytan.</li>
                <li>⚠️ <strong>Mindre traditionellt</strong> – passar inte alla inredningsstilar.</li>
                <li>⚠️ <strong>Kan kräva polering</strong> – för att behålla glansen över tid.</li>
              </ul>
            `,
          }),
        },
        {
          heading: t("materialPages.recycledGlass.sections.uses.heading", {
            defaultValue: "Användningsområden",
          }),
          content: t("materialPages.recycledGlass.sections.uses.content", {
            defaultValue: `
              <p>Återvunnet glas kan användas i flera olika miljöer:</p>
              <ul>
                <li>🏡 <strong>Köksbänkar</strong> – ett modernt alternativ till natursten.</li>
                <li>🛁 <strong>Badrum</strong> – dekorativa och slitstarka ytor.</li>
                <li>🏢 <strong>Hållbara inredningsprojekt</strong> – för företag och offentliga miljöer.</li>
                <li>🎨 <strong>Designlösningar</strong> – väggpaneler, bardiskar och specialprojekt.</li>
              </ul>
            `,
          }),
          images: [
            {
              src: "/images/materials/Glas/glas-kitchen.jpg",
              alt: t("materialPages.recycledGlass.sections.uses.images.0.alt", {
                defaultValue: "Kök med återvunnet glas",
              }),
            },
            {
              src: "/images/materials/Glas/glas-bathroom.jpg",
              alt: t("materialPages.recycledGlass.sections.uses.images.1.alt", {
                defaultValue: "Badrum med återvunnet glas",
              }),
            },
          ],
        },
        {
          heading: t("materialPages.recycledGlass.sections.faq.heading", {
            defaultValue: "Vanliga frågor",
          }),
          content: t("materialPages.recycledGlass.sections.faq.content", {
            defaultValue: `
              <p><strong>Är återvunnet glas hållbart?</strong><br/> Ja, men det är något mjukare än granit och kan repas lättare.</p>
              <p><strong>Är det miljövänligt?</strong><br/> Ja, det tillverkas av återvunnet material och är därför ett bra val för hållbara projekt.</p>
              <p><strong>Kan återvunnet glas bakbelysas?</strong><br/> Ja, i vissa varianter kan glaset vara delvis transparent och kombineras med belysning.</p>
              <p><strong>Passar återvunnet glas i kök?</strong><br/> Ja, men använd alltid skärbräda och grytunderlägg för att undvika repor och värmeskador.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.recycledGlass.sections.care.heading", {
            defaultValue: "Skötsel & underhåll",
          }),
          content: t("materialPages.recycledGlass.sections.care.content", {
            defaultValue: `
              <p>För att behålla glansen och hållbarheten hos en bänkskiva i återvunnet glas bör du:</p>
              <ul>
                <li>🧽 <strong>Rengör med mild såpa</strong> – undvik slipande eller starka rengöringsmedel.</li>
                <li>🧽 <strong>Polera vid behov</strong> – för att återställa glansen.</li>
                <li>🧽 <strong>Torka upp spill direkt</strong> – särskilt syror och färgstarka vätskor.</li>
                <li>🧽 <strong>Använd underlägg</strong> – skyddar mot värmechocker och repor.</li>
              </ul>
              <p>Med rätt <em>skötsel av återvunnet glas</em> kan bänkskivan hålla sig vacker under många år.</p>
            `,
          }),
          images: [
            {
              src: "/images/materials/Glas/glas-care.jpg",
              alt: t("materialPages.recycledGlass.sections.care.images.0.alt", {
                defaultValue: "Skötsel av återvunnet glas",
              }),
            },
          ],
        },
      ]}
    />
  );
}
