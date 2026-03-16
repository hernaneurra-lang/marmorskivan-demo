import { Helmet } from "react-helmet-async";
import { Link, useLocation } from "react-router-dom";

function safeJsonLd(obj) {
  return JSON.stringify(obj).replace(/</g, "\\u003c");
}

function resolveSiteUrl() {
  // Rekommenderat: sätt VITE_SITE_URL=https://marmorskivan.se i .env
  const base = (import.meta.env.VITE_SITE_URL || "").replace(/\/+$/, "");
  return base || "";
}

function urlFor(path) {
  const base = resolveSiteUrl();
  return base ? `${base}${path}` : path;
}

export default function LegalSeoPage({
  title,
  metaDescription,
  h1,
  heroImage = "/hero/hero.jpg",
  toc = [], // [{ id, label }]
  breadcrumbLabel,
  children,
}) {
  const { pathname } = useLocation();

  const breadcrumbItems = [
    { name: "Hem", item: urlFor("/") },
    { name: breadcrumbLabel || h1, item: urlFor(pathname) },
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
    image: heroImage ? urlFor(heroImage) : undefined,
    author: { "@type": "Organization", name: "Marmorskivan.se" },
    publisher: { "@type": "Organization", name: "Marmorskivan.se" },
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={metaDescription} />

        <script type="application/ld+json">{safeJsonLd(breadcrumbJsonLd)}</script>
        <script type="application/ld+json">{safeJsonLd(articleJsonLd)}</script>
      </Helmet>

      {/* Hero */}
      <section
        className="relative border-b bg-cover bg-center"
        style={{ backgroundImage: `url(${heroImage})` }}
      >
        <div className="absolute inset-0 bg-white/85 backdrop-blur" />
        <div className="relative max-w-6xl mx-auto px-6 py-10">
          {/* Breadcrumb UI */}
          <nav aria-label="Brödsmulor" className="text-sm text-gray-600 mb-2">
            <ol className="flex flex-wrap gap-2">
              <li>
                <Link to="/" className="hover:underline">Hem</Link>
                <span className="mx-2 text-gray-400">/</span>
              </li>
              <li className="text-gray-900 font-medium">{breadcrumbLabel || h1}</li>
            </ol>
          </nav>

          <h1 className="text-3xl font-semibold">{h1}</h1>
          <p className="text-gray-700 mt-2 max-w-3xl">{metaDescription}</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 py-8">
        {/* TOC */}
        {toc?.length > 0 && (
          <nav
            className="mb-8 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-4"
            aria-label="Innehåll på sidan"
          >
            <h2 className="text-lg font-semibold mb-2">Innehåll på sidan</h2>
            <ul className="flex flex-wrap gap-2">
              {toc.map((item) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    className="text-sm text-gray-700 hover:text-black underline-offset-2 hover:underline"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        )}

        {children}
      </section>
    </main>
  );
}
