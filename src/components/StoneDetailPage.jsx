import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import SiteFooter from "../components/SiteFooter";

const MATERIALS = [
  { id: "marble",        to: "/material/marmor",         img: "/images/materials/marmor-hero.jpg" },
  { id: "granite",       to: "/material/granit",         img: "/images/materials/granit-hero.jpg" },
  { id: "limestone",     to: "/material/kalksten",       img: "/images/materials/kalksten-hero.jpg" },
  { id: "quartzite",     to: "/material/kvartsit",       img: "/images/materials/kvartsit-hero.jpg" },
  { id: "composite",     to: "/material/komposit",       img: "/images/materials/komposit-hero.jpg" },
  { id: "terrazzo",      to: "/material/terrazzo",       img: "/images/materials/terrazzo-hero.jpg" },
  { id: "travertine",    to: "/material/travertin",      img: "/images/materials/travertin-hero.jpg" },
  { id: "onyx",          to: "/material/onyx",           img: "/images/materials/onyx-hero.jpg" },
  { id: "semiPrecious",  to: "/material/semiprecious",   img: "/images/materials/semiprecious-hero.jpg" },
  { id: "recycledGlass", to: "/material/atervunnetglas", img: "/images/materials/glas-hero.jpg" },
];

function slugify(str, fallback) {
  if (!str) return fallback;
  return (
    str
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .trim() || fallback
  );
}

function htmlToText(html) {
  if (!html) return "";
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractFaqFromHtml(html) {
  if (!html) return [];
  const faqs = [];
  const parts = html.split(/<p[^>]*>/i).slice(1);

  for (const part of parts) {
    const inner = part.split(/<\/p>/i)[0];
    if (!inner) continue;

    const strongMatch = inner.match(/<strong>([\s\S]*?)<\/strong>/i);
    if (!strongMatch) continue;

    const question = htmlToText(strongMatch[1] || "");
    if (!question) continue;

    const restHtml = inner.replace(strongMatch[0], "");
    const answer = htmlToText(restHtml);
    if (!answer) continue;

    faqs.push({ question, answer });
  }

  return faqs;
}

function safeJsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

export default function StoneDetailPage({
  title,
  metaDescription,
  h1,
  sections = [],
  heroImage,
  backgroundImage,
  textSize = "base",
  onPickMaterial,
  breadcrumbMiddleLabel,
  breadcrumbMiddleTo,
  heroMode,
  heroVariant = "cover",
  heroHeightClass = "h-80",
}) {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  const resolveAssetUrl = (p) => {
    if (!p) return null;
    if (/^https?:\/\//i.test(p)) return p;
    const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
    const path = p.startsWith("/") ? p : `/${p}`;
    return `${base}${path}`;
  };

  const getMaterialLabel = (id, fallback) =>
    t(`materials.names.${id}`, { defaultValue: fallback || id });

  const currentMaterial = MATERIALS.find((m) => m.to === pathname) || null;
  const otherMaterials = MATERIALS.filter((m) => m.to !== pathname);

  const currentMaterialName = currentMaterial
    ? getMaterialLabel(currentMaterial.id, currentMaterial.id)
    : null;

  const hasPickHandler = typeof onPickMaterial === "function";

  const enhancedSections = sections.map((section, index) => ({
    ...section,
    id: slugify(section.heading, `sektion-${index}`),
  }));

  const faqSection = enhancedSections.find(
    (s) =>
      s.heading &&
      s.heading.toLowerCase().includes(
        t("stoneDetail.faqHeadingIncludes", { defaultValue: "vanliga frågor" }).toLowerCase()
      )
  );
  const faqItems = faqSection ? extractFaqFromHtml(faqSection.content) : [];
  const hasFaq = faqItems.length > 0;

  const faqJsonLd = hasFaq
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: faqItems.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      }
    : null;

  const baseUrl = (import.meta.env.VITE_SITE_URL || "").replace(/\/+$/, "");
  const urlFor = (path) => (baseUrl ? `${baseUrl}${path}` : path);

  const breadcrumbHomeLabel = t("stoneDetail.breadcrumb.home", { defaultValue: "Hem" });
  const defaultMiddleLabel = t("stoneDetail.breadcrumb.materials", { defaultValue: "Material" });
  const middleLabel = breadcrumbMiddleLabel || defaultMiddleLabel;
  const middleTo = breadcrumbMiddleTo || "/app";

  const materialName =
    currentMaterialName ||
    (h1 ? h1.split("–")[0].trim() : t("stoneDetail.materialFallback", { defaultValue: "material" }));

  const breadcrumbItems = [
    { name: breadcrumbHomeLabel, item: urlFor("/") },
    { name: middleLabel, item: urlFor(middleTo) },
    { name: materialName, item: urlFor(pathname) },
  ];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((b, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: b.name,
      item: b.item,
    })),
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: h1,
    description: metaDescription,
    mainEntityOfPage: urlFor(pathname),
    image: heroImage ? urlFor(resolveAssetUrl(heroImage)) : undefined,
    author: { "@type": "Organization", name: "Marmorskivan.se" },
    publisher: { "@type": "Organization", name: "Marmorskivan.se" },
  };

  const tocTitle = t("stoneDetail.toc.title", { defaultValue: "Innehåll på sidan" });
  const exploreTitle = t("stoneDetail.exploreMore.title", { defaultValue: "Utforska fler material" });
  const ctaLabel = t("stoneDetail.cta.label", { defaultValue: "Fyll i offertförfrågan →" });

  const heroUrl = heroImage ? resolveAssetUrl(heroImage) : null;
  const effectiveHeroVariant =
    heroMode === "contain" ? "contain-bg" : heroMode === "cover" ? "cover" : heroVariant;

  return (
    <div className="flex relative min-h-screen flex-col">
      {backgroundImage && (
        <div
          aria-hidden
          className="absolute inset-0 -z-10 opacity-10"
          style={{
            backgroundImage: `url(${resolveAssetUrl(backgroundImage)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      )}

      <div className="flex-1">
        <main className="flex-1 max-w-5xl mx-auto p-6 pb-40">
          <Helmet>
            <title>{title}</title>
            <meta name="description" content={metaDescription} />
            <script type="application/ld+json">{safeJsonLd(breadcrumbJsonLd)}</script>
            <script type="application/ld+json">{safeJsonLd(articleJsonLd)}</script>
            {faqJsonLd && <script type="application/ld+json">{safeJsonLd(faqJsonLd)}</script>}
          </Helmet>

          <nav
            aria-label={t("stoneDetail.breadcrumb.aria", { defaultValue: "Brödsmulor" })}
            className="mb-4 text-sm text-gray-600"
          >
            <ol className="flex flex-wrap gap-2">
              <li>
                <Link to="/" className="hover:underline">
                  {breadcrumbHomeLabel}
                </Link>
                <span className="mx-2">/</span>
              </li>
              <li>
                <Link to={middleTo} className="hover:underline">
                  {middleLabel}
                </Link>
                <span className="mx-2">/</span>
              </li>
              <li className="font-medium text-gray-900">{materialName}</li>
            </ol>
          </nav>

          {heroUrl && effectiveHeroVariant === "contain-bg" ? (
            <div className={`w-full ${heroHeightClass} rounded-xl mb-8 overflow-hidden relative bg-emerald-50`}>
              <div
                aria-hidden
                className="absolute inset-0 scale-110 blur-xl opacity-40"
                style={{
                  backgroundImage: `url(${heroUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <img
                src={heroUrl}
                alt={h1}
                className="relative z-10 w-full h-full object-contain"
                loading="eager"
              />
            </div>
          ) : heroUrl ? (
            <img
              src={heroUrl}
              alt={h1}
              className={`w-full ${heroHeightClass} object-cover rounded-xl mb-8`}
              loading="eager"
            />
          ) : null}

          <h1 className="text-3xl font-bold mb-6">{h1}</h1>

          {enhancedSections.length > 0 && (
            <nav className="mb-8 border rounded-xl p-4 bg-white/80">
              <h2 className="font-semibold mb-2">{tocTitle}</h2>
              <ul className="flex flex-wrap gap-2">
                {enhancedSections.map((s) => (
                  <li key={s.id}>
                    <a href={`#${s.id}`} className="text-sm underline">
                      {s.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}

          <div className={`prose prose-${textSize} max-w-none`}>
            {enhancedSections.map((s, i) => (
              <section key={i} className="mb-12">
                <h2 id={s.id} className="scroll-mt-24">
                  {s.heading}
                </h2>
                <div dangerouslySetInnerHTML={{ __html: s.content }} />
                {s.images && (
                  <div className="grid md:grid-cols-2 gap-6 mt-6">
                    {s.images.map((img, j) => (
                      <img
                        key={j}
                        src={resolveAssetUrl(img.src)}
                        alt={img.alt}
                        className="rounded-xl"
                      />
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>

          {otherMaterials.length > 0 && (
            <section className="mt-12">
              <h2 className="text-xl font-semibold mb-4">{exploreTitle}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {otherMaterials.map((m) => (
                  <Link key={m.to} to={m.to} className="border rounded-lg overflow-hidden">
                    <img src={resolveAssetUrl(m.img)} alt={getMaterialLabel(m.id)} />
                    <div className="p-2 text-sm font-medium">{getMaterialLabel(m.id)}</div>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </main>
      </div>

      <div className="fixed bottom-0 left-0 w-full py-4 flex justify-center z-50 pointer-events-none">
        <div className="pointer-events-auto">
          {hasPickHandler ? (
            <button
              onClick={onPickMaterial}
              className="bg-white px-10 py-4 text-xl font-bold rounded-lg shadow"
            >
              {ctaLabel}
            </button>
          ) : (
            <Link to="/app" className="bg-white px-10 py-4 text-xl font-bold rounded-lg shadow">
              {ctaLabel}
            </Link>
          )}
        </div>
      </div>

      <div className="mt-auto">
        <SiteFooter />
      </div>
    </div>
  );
}
