// ===== FIL: src/pages/material/SemiPrecious.jsx =====
import { useTranslation } from "react-i18next";
import StoneDetailPage from "../../components/StoneDetailPage";

export default function SemiPrecious() {
  const { t } = useTranslation();

  return (
    <StoneDetailPage
      title={t("materialPages.semiPrecious.seo.title", {
        defaultValue: "Semiprecious stone bänkskivor – Lyxigt & unikt material | Marmorskivan.se",
      })}
      metaDescription={t("materialPages.semiPrecious.seo.metaDescription", {
        defaultValue:
          "Semiprecious stone bänkskivor består av halvädelstenar som agat, ametist och jaspis, sammanfogade till exklusiva skivor. Lär dig mer om semiprecious – ursprung, användning, fördelar, nackdelar och skötsel.",
      })}
      h1={t("materialPages.semiPrecious.h1", {
        defaultValue: "Semiprecious – Allt om exklusiva bänkskivor i halvädelsten",
      })}
      heroImage="/images/materials/Semiprecious/semiprecious-hero.jpg"
      backgroundImage="/images/materials/semiprecious-hero.jpg"
      textSize="lg"
      sections={[
        {
          heading: t("materialPages.semiPrecious.sections.what.heading", {
            defaultValue: "Vad är semiprecious stone?",
          }),
          content: t("materialPages.semiPrecious.sections.what.content", {
            defaultValue: `
              <p><strong>Semiprecious stone</strong> är ett exklusivt material som består av <strong>halvädelstenar</strong> som 
              <em>agat, ametist, jaspis, kvarts och lapis lazuli</em>, vilka sammanfogas med resin till skivor. 
              Dessa bänkskivor är <strong>unika, lyxiga och ofta transparenta</strong>, vilket gör att de kan <strong>bakbelysas</strong> för dramatisk effekt.</p>

              <p>Materialet används främst i <strong>exklusiva miljöer</strong> där estetik är lika viktigt som funktionalitet. 
              Varje skiva är <strong>unik</strong> och betraktas ofta mer som ett <em>konstverk</em> än en vanlig bänkskiva.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.semiPrecious.sections.whereToday.heading", {
            defaultValue: "Var finns semiprecious stone idag?",
          }),
          content: t("materialPages.semiPrecious.sections.whereToday.content", {
            defaultValue: `
              <p>Halvädelstenar som används i semiprecious-skivor bryts över hela världen. Några av de mest kända förekomsterna är:</p>
              <ul>
                <li><strong>Brasilien</strong> – känd för agat och ametist av hög kvalitet.</li>
                <li><strong>Indien</strong> – levererar jaspis och kvarts i många färger.</li>
                <li><strong>Afrika</strong> – källor till unika stenar som tigeröga och lapis lazuli.</li>
                <li><strong>Madagaskar</strong> – speciella varianter av agat och rosenkvarts.</li>
              </ul>
              <p>Varje region bidrar med <strong>unika färger, mönster och transparens</strong>, vilket gör semiprecious-bänkskivor till något helt unikt.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.semiPrecious.sections.manufacturing.heading", {
            defaultValue: "Hur tillverkas semiprecious-skivor?",
          }),
          content: t("materialPages.semiPrecious.sections.manufacturing.content", {
            defaultValue: `
              <p>Processen är mycket <strong>manuell och tidskrävande</strong>. Halvädelstenarna <strong>sågas i tunna skivor</strong>, 
              sorteras efter färg och mönster och <strong>sammanfogas med resin</strong> till stora plattor. 
              Ytan <strong>poleras</strong> för att framhäva stenarnas naturliga lyster.</p>

              <p>I vissa fall tillverkas semiprecious-skivor i <strong>transparent form</strong>, vilket gör det möjligt att använda 
              <strong>bakbelysning</strong> för en spektakulär visuell effekt – något som är populärt i barer, hotell och exklusiva hem.</p>
            `,
          }),
          images: [
            {
              src: "/images/materials/Semiprecious/semiprecious-slabs.jpg",
              alt: t("materialPages.semiPrecious.sections.manufacturing.images.0.alt", {
                defaultValue: "Semiprecious slabs",
              }),
            },
            {
              src: "/images/materials/Semiprecious/semiprecious-closeup.jpg",
              alt: t("materialPages.semiPrecious.sections.manufacturing.images.1.alt", {
                defaultValue: "Detalj av semiprecious",
              }),
            },
          ],
        },
        {
          heading: t("materialPages.semiPrecious.sections.pros.heading", {
            defaultValue: "Fördelar med semiprecious-bänkskivor",
          }),
          content: t("materialPages.semiPrecious.sections.pros.content", {
            defaultValue: `
              <ul>
                <li>✅ <strong>Extremt exklusivt</strong> – varje skiva är unik och handgjord.</li>
                <li>✅ <strong>Unika färger och mönster</strong> – från djupt blå ametist till gnistrande agat.</li>
                <li>✅ <strong>Kan belysas</strong> – transparensen ger möjlighet till bakbelysning.</li>
                <li>✅ <strong>Lyxig känsla</strong> – används i premiumprojekt världen över.</li>
              </ul>
            `,
          }),
        },
        {
          heading: t("materialPages.semiPrecious.sections.cons.heading", { defaultValue: "Nackdelar att känna till" }),
          content: t("materialPages.semiPrecious.sections.cons.content", {
            defaultValue: `
              <ul>
                <li>⚠️ <strong>Mycket dyrt</strong> – ett av de mest exklusiva materialen på marknaden.</li>
                <li>⚠️ <strong>Kräver specialbeställning</strong> – längre leveranstid än vanliga stensorter.</li>
                <li>⚠️ <strong>Mindre praktiskt</strong> – mer lämpat för exklusiva projekt än vardagsbruk.</li>
              </ul>
            `,
          }),
        },
        {
          heading: t("materialPages.semiPrecious.sections.uses.heading", { defaultValue: "Användningsområden" }),
          content: t("materialPages.semiPrecious.sections.uses.content", {
            defaultValue: `
              <p>Semiprecious används främst där <strong>design och exklusivitet</strong> är i fokus:</p>
              <ul>
                <li>🏡 <strong>Exklusiva kök</strong> – köksöar eller bänkskivor som blickfång.</li>
                <li>💡 <strong>Barer och hotell</strong> – bakbelysta ytor för spektakulära effekter.</li>
                <li>🎨 <strong>Lyxig inredning</strong> – bordsskivor, väggpaneler och konstnärliga projekt.</li>
              </ul>
            `,
          }),
          images: [
            {
              src: "/images/materials/Semiprecious/semiprecious-kitchen.jpg",
              alt: t("materialPages.semiPrecious.sections.uses.images.0.alt", {
                defaultValue: "Kök med semiprecious",
              }),
            },
            {
              src: "/images/materials/Semiprecious/semiprecious-bar.jpg",
              alt: t("materialPages.semiPrecious.sections.uses.images.1.alt", {
                defaultValue: "Bar med semiprecious",
              }),
            },
          ],
        },
        {
          heading: t("materialPages.semiPrecious.sections.faq.heading", { defaultValue: "Vanliga frågor" }),
          content: t("materialPages.semiPrecious.sections.faq.content", {
            defaultValue: `
              <p><strong>Är semiprecious dyrt?</strong><br/> Ja, det är ett av de mest exklusiva och kostsamma materialen.</p>
              <p><strong>Är det praktiskt i kök?</strong><br/> Det kan användas i kök, men rekommenderas främst i exklusiva projekt där estetik är viktigare än dagligt slitage.</p>
              <p><strong>Kan semiprecious belysas?</strong><br/> Ja, transparensen gör det möjligt att skapa spektakulära bakbelysta installationer.</p>
            `,
          }),
        },
        {
          heading: t("materialPages.semiPrecious.sections.care.heading", { defaultValue: "Skötsel & underhåll" }),
          content: t("materialPages.semiPrecious.sections.care.content", {
            defaultValue: `
              <p>Semiprecious är ett <strong>hållbart men exklusivt material</strong> som kräver rätt skötsel:</p>
              <ul>
                <li>🧽 <strong>Rengör med milda medel</strong> – undvik slipande rengöringsprodukter.</li>
                <li>🧽 <strong>Undvik starka kemikalier</strong> – kan skada stenens yta.</li>
                <li>🧽 <strong>Impregnera vid behov</strong> – för extra skydd mot vätskor.</li>
                <li>🧽 <strong>Torka upp spill direkt</strong> – särskilt syror och färgstarka vätskor.</li>
              </ul>
              <p>Med rätt <em>skötsel av semiprecious</em> kan bänkskivan behålla sin unika lyster under lång tid.</p>
            `,
          }),
          images: [
            {
              src: "/images/materials/Semiprecious/semiprecious-care.jpg",
              alt: t("materialPages.semiPrecious.sections.care.images.0.alt", {
                defaultValue: "Skötsel av semiprecious",
              }),
            },
          ],
        },
      ]}
    />
  );
}
