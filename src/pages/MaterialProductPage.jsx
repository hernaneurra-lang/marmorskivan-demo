// src/pages/MaterialProductPage.jsx — Individual material product page with full SEO
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { getMaterialsData } from "../utils/materialsData";

const SITE_URL  = "https://marmorskivan.se";
const SITE_NAME = "marmorskivan.se";

const CATEGORY_LABELS = {
  "kvarts/komposit": "Kvartskomposit",
  "marmor":          "Marmor",
  "granit":          "Granit",
  "keramik":         "Keramik",
  "kalksten":        "Kalksten",
  "travertin":       "Travertin",
  "onyx":            "Onyx",
  "terrazzo":        "Terrazzo",
  "kvartsit":        "Kvartsit",
  "halvädelssten":   "Halvädelssten",
  "återvunnet glas": "Återvunnet Glas",
};

function catLabel(cat) {
  if (!cat) return "Natursten";
  return CATEGORY_LABELS[cat.toLowerCase()] || cat;
}

function displayName(m) {
  const base = m.baseName || m.slug || "";
  return base ? base.charAt(0).toUpperCase() + base.slice(1) : m.name || "";
}

export default function MaterialProductPage() {
  const { slug } = useParams();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    getMaterialsData().then((data) => {
      setMaterial(data[slug] || null);
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-[40vh] grid place-items-center text-sm text-gray-500">
        Laddar…
      </div>
    );
  }

  if (!material) {
    return (
      <div className="p-10 text-center">
        <h1 className="text-2xl font-bold text-gray-900">Produkten hittades inte</h1>
        <p className="mt-4 text-gray-600">
          <Link to="/bankskiva-sten" className="text-emerald-600 underline">
            ← Tillbaka till bänkskivor
          </Link>
        </p>
      </div>
    );
  }

  const { category, thicknessMm, price, edgePrice, description, pros, care, image } = material;
  const name    = displayName(material);
  const cat     = catLabel(category);
  const canonical = `${SITE_URL}/material/produkt/${slug}`;
  const ogImage   = image ? `${SITE_URL}${image}` : `${SITE_URL}/hero/stone-kitchen.jpg`;

  const title   = `${name} ${thicknessMm}mm – ${cat} Bänkskiva | ${SITE_NAME}`;
  const priceSnippet = price ? `Pris från ${price.toLocaleString("sv-SE")} kr/m². ` : "";
  const metaDesc = `${name} – ${cat} bänkskiva ${thicknessMm}mm. ${priceSnippet}${description || "Måttbeställd bänkskiva med professionell mätning och montage i Storstockholm och Mälardalen."}`.slice(0, 160);

  const productSchema = {
    "@context": "https://schema.org",
    "@type":    "Product",
    "name":     `${name} ${thicknessMm}mm Bänkskiva`,
    "description": description || `${cat} bänkskiva i ${name}, ${thicknessMm}mm tjock.`,
    "image":    ogImage,
    "brand":    { "@type": "Brand", "name": "Marmorskivan" },
    "category": cat,
    ...(price
      ? {
          "offers": {
            "@type":         "Offer",
            "priceCurrency": "SEK",
            "price":         price,
            "priceSpecification": {
              "@type":             "UnitPriceSpecification",
              "price":             price,
              "priceCurrency":     "SEK",
              "referenceQuantity": { "@type": "QuantitativeValue", "value": 1, "unitCode": "MTK" },
            },
            "availability": "https://schema.org/InStock",
            "seller":        { "@type": "Organization", "name": "Marmorskivan" },
          },
        }
      : {}),
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
        <meta name="description"          content={metaDesc} />
        <link rel="canonical"             href={canonical} />
        <meta property="og:title"         content={title} />
        <meta property="og:description"   content={metaDesc} />
        <meta property="og:url"           content={canonical} />
        <meta property="og:image"         content={ogImage} />
        <meta property="og:type"          content="product" />
        <meta property="og:locale"        content="sv_SE" />
        <meta property="og:site_name"     content={SITE_NAME} />
        <meta name="twitter:card"         content="summary_large_image" />
        <meta name="twitter:title"        content={title} />
        <meta name="twitter:description"  content={metaDesc} />
        <meta name="twitter:image"        content={ogImage} />
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8" aria-label="Breadcrumb">
          <Link to="/" className="hover:text-emerald-600">Hem</Link>
          {" / "}
          <Link to="/bankskiva-sten" className="hover:text-emerald-600">Bänkskivor</Link>
          {" / "}
          <span className="text-gray-900 font-medium">{name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Image */}
          <div className="aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-sm">
            {image ? (
              <img
                src={image}
                alt={`${name} bänkskiva ${thicknessMm}mm`}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-gray-300 text-7xl">
                🪨
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-1">
              {cat}
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">{name}</h1>
            <p className="text-gray-500 mb-6">{thicknessMm} mm tjocklek</p>

            {price ? (
              <div className="mb-6">
                <span className="text-3xl font-bold text-gray-900">
                  {price.toLocaleString("sv-SE")} kr
                </span>
                <span className="text-gray-500 ml-1">/m²</span>
                {edgePrice && (
                  <p className="text-sm text-gray-500 mt-1">
                    Kantpris från {edgePrice.toLocaleString("sv-SE")} kr/lm
                  </p>
                )}
              </div>
            ) : (
              <p className="text-gray-500 mb-6">Begär offert för pris</p>
            )}

            {description && (
              <p className="text-gray-700 leading-relaxed mb-6">{description}</p>
            )}

            <Link
              to="/app"
              className="inline-block bg-emerald-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors text-center"
            >
              Beräkna pris &amp; begär offert →
            </Link>
          </div>
        </div>

        {/* Pros / Care */}
        {(pros || care) && (
          <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
            {pros && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="font-semibold text-gray-900 mb-3">Fördelar</h2>
                <p className="text-gray-700 text-sm leading-relaxed">{pros}</p>
              </div>
            )}
            {care && (
              <div className="bg-gray-50 rounded-xl p-6">
                <h2 className="font-semibold text-gray-900 mb-3">Skötsel</h2>
                <p className="text-gray-700 text-sm leading-relaxed">{care}</p>
              </div>
            )}
          </div>
        )}

        {/* Back + CTA */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex items-center justify-between flex-wrap gap-4">
          <Link to="/bankskiva-sten" className="text-emerald-600 hover:underline text-sm">
            ← Se alla bänkskivor
          </Link>
          <Link
            to="/app"
            className="text-sm text-gray-500 hover:text-emerald-600"
          >
            Gå till kalkylatorn →
          </Link>
        </div>
      </div>
    </>
  );
}
