// src/components/SEO.jsx — Dynamic per-page SEO meta tags + structured data
import { Helmet } from "react-helmet-async";

const SITE_NAME = "marmorskivan.se";
const SITE_URL  = "https://marmorskivan.se";
const DEFAULT_IMG = `${SITE_URL}/hero/stone-kitchen.jpg`;

// FAQ schema for rich snippets — shared across site
const FAQ_SCHEMA = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    { "@type": "Question", "name": "Hur lång är leveranstiden för en bänkskiva?", "acceptedAnswer": { "@type": "Answer", "text": "Normalt 2–4 veckor för standardmaterial. Vi levererar och monterar i Storstockholm och Mälardalen." } },
    { "@type": "Question", "name": "Erbjuder ni mätning på plats?", "acceptedAnswer": { "@type": "Answer", "text": "Ja, vi erbjuder professionell mätning på plats i Storstockholm och Mälardalen. Boka tid via vår bokningskalender." } },
    { "@type": "Question", "name": "Vilket material är bäst för kök?", "acceptedAnswer": { "@type": "Answer", "text": "Kvartskomposit är populärast — hårt, repbeständigt och lättsköt. Granit är ett naturligt alternativ. Keramik/Dekton är extremt tåligt. Marmor är vackrast men kräver mer skötsel." } },
    { "@type": "Question", "name": "Ingår montering i priset?", "acceptedAnswer": { "@type": "Answer", "text": "Ja, vi erbjuder kompletta paket inkl. mätning, tillverkning och montage. Begär en offert via vår kalkylator." } },
    { "@type": "Question", "name": "Vad kostar en bänkskiva?", "acceptedAnswer": { "@type": "Answer", "text": "Priset beror på material, mått, kantprofil och bearbetning. Vi skickar alltid en kostnadsfri offert anpassad till ditt projekt." } },
    { "@type": "Question", "name": "Har ni garanti på monteringen?", "acceptedAnswer": { "@type": "Answer", "text": "Ja, vi erbjuder 10 års garanti på montering och montagearbete." } },
  ],
};

const PAGE_CONFIG = {
  "/": {
    title: `${SITE_NAME} – Bänkskivor i sten | Granit, Marmor & Kvartskomposit`,
    description: "Måttbeställda bänkskivor i granit, marmor, kvartskomposit och keramik. Egna montörer i Storstockholm och Mälardalen. Gratis offert online.",
    keywords: "bänkskiva sten, granitkiva, marmorskiva, kvartskomposit, köksbänkskiva, Storstockholm",
    faq: true,
  },
  "/app": {
    title: `Beräkna din bänkskiva – ${SITE_NAME}`,
    description: "Beräkna pris och begär offert på din måttbeställda bänkskiva. Välj material, ange mått — få svar inom 24h.",
    keywords: "bänkskiva kalkylator, offert bänkskiva, beräkna pris sten",
  },
  "/bankskiva-sten": {
    title: `Bänkskiva i sten – ${SITE_NAME} | Granit, Marmor, Kvartskomposit`,
    description: "Allt om bänkskivor i sten. Jämför granit, marmor, kvartskomposit och keramik. Expertguide + gratis offert.",
    keywords: "bänkskiva sten, stenbänkskiva, granit marmor komposit",
    faq: true,
  },
  "/bankskiva-online": {
    title: `Bänkskiva online – Beräkna & Beställ | ${SITE_NAME}`,
    description: "Beställ din bänkskiva online. Beräkna pris direkt, boka mätning och få professionell montage i Storstockholm.",
    keywords: "bänkskiva online beställa, köksbänkskiva online, offert bänkskiva",
  },
  "/bankskiva-marmor": {
    title: `Bänkskiva Marmor – ${SITE_NAME} | Carrara & Lyxig Marmor`,
    description: "Marmorskivor för kök och badrum. Carrara, Calacatta och mer. Professionell mätning och montage i Storstockholm.",
    keywords: "marmorskiva, bänkskiva marmor, marmor kök, Carrara marmor",
  },
  "/bankskiva-granit": {
    title: `Bänkskiva Granit – ${SITE_NAME} | Hård & Hållbar Natursten`,
    description: "Granitskivor för kök — extremt hårda, repbeständiga och tidlösa. Professionell mätning och montage.",
    keywords: "granitskiva, bänkskiva granit, granit kök, natursten bänkskiva",
  },
  "/bankskiva-komposit": {
    title: `Bänkskiva Kvartskomposit – ${SITE_NAME} | Silestone & Caesarstone`,
    description: "Kvartskomposit bänkskivor — lättskötta, hårda och i hundratals färger. Silestone, Caesarstone och mer.",
    keywords: "kvartskomposit, Silestone, Caesarstone, komposit bänkskiva",
  },
  "/bankskiva-keramik": {
    title: `Bänkskiva Keramik/Dekton – ${SITE_NAME} | Extremt Tålig`,
    description: "Keramik och Dekton bänkskivor — värmetåliga, repbeständiga, perfekta för utomhuskök och intensive use.",
    keywords: "keramisk bänkskiva, Dekton, Porcelanico, keramik kök",
  },
  "/bankskiva-travertin": {
    title: `Bänkskiva Travertin – ${SITE_NAME} | Naturlig Lyx`,
    description: "Travertin bänkskivor — naturlig lyx med unik karaktär. Perfekt för badrum och exklusiva kök.",
    keywords: "travertin, travertinskiva, travertin bänkskiva",
  },
  "/material/marmor":    { title: `Marmor – ${SITE_NAME}`,          description: "Allt om marmor som bänkskiva. Egenskaper, skötsel, sorter och priser. Begär offert direkt." },
  "/material/granit":    { title: `Granit – ${SITE_NAME}`,          description: "Allt om granit som bänkskiva. Extrem hårdhet, naturlig ådring, hållbar i decennier." },
  "/material/komposit":  { title: `Kvartskomposit – ${SITE_NAME}`,  description: "Allt om kvartskomposit. Silestone, Caesarstone, lättskött och hållbart." },
  "/material/onyx":      { title: `Onyx – ${SITE_NAME}`,            description: "Lyxiga onskivor för exklusiva interiörer. Unik genomlysning och mönstring." },
  "/material/kalksten":  { title: `Kalksten – ${SITE_NAME}`,        description: "Kalksten bänkskivor — mjuk, naturlig karaktär. Kräver impregnering." },
  "/material/terrazzo":  { title: `Terrazzo – ${SITE_NAME}`,        description: "Terrazzo bänkskivor — trendigt material med mångfärgat mönster." },
  "/material/kvartsit":  { title: `Kvartsit – ${SITE_NAME}`,        description: "Kvartsit — marmorns estetik med graniets tålighet." },
  "/material/travertin": { title: `Travertin – ${SITE_NAME}`,       description: "Travertin — naturlig lyx med unik porig karaktär." },
  "/material/semiprecious":   { title: `Halvädelstensskivor – ${SITE_NAME}`, description: "Exklusiva skivor i halvädelssten — agatit, amasonit och mer." },
  "/material/atervunnetglas": { title: `Återvunnet Glas – ${SITE_NAME}`,    description: "Bänkskivor i återvunnet glas — hållbart, unikt och färgglatt." },
};

export default function SEO({ path, image }) {
  const cfg = PAGE_CONFIG[path] || PAGE_CONFIG["/"];
  const canonical = `${SITE_URL}${path}`;
  const ogImage = image || DEFAULT_IMG;

  return (
    <Helmet>
      <title>{cfg.title}</title>
      <meta name="description" content={cfg.description} />
      {cfg.keywords && <meta name="keywords" content={cfg.keywords} />}
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:title"       content={cfg.title} />
      <meta property="og:description" content={cfg.description} />
      <meta property="og:url"         content={canonical} />
      <meta property="og:image"       content={ogImage} />
      <meta property="og:type"        content="website" />
      <meta property="og:locale"      content="sv_SE" />
      <meta property="og:site_name"   content={SITE_NAME} />

      {/* Twitter */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={cfg.title} />
      <meta name="twitter:description" content={cfg.description} />
      <meta name="twitter:image"       content={ogImage} />

      {/* FAQ schema for relevant pages */}
      {cfg.faq && (
        <script type="application/ld+json">{JSON.stringify(FAQ_SCHEMA)}</script>
      )}
    </Helmet>
  );
}
