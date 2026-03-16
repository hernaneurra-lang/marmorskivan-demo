// ===== FIL: src/components/MaterialLinks.jsx =====
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function MaterialLinks() {
  const { t } = useTranslation();

  const materials = [
    { key: "marble", path: "/material/marmor", img: "/images/materials/marmor-hero.jpg" },
    { key: "granite", path: "/material/granit", img: "/images/materials/granit-hero.jpg" },
    { key: "composite", path: "/material/komposit", img: "/images/materials/komposit-hero.jpg" },
    { key: "onyx", path: "/material/onyx", img: "/images/materials/onyx-hero.jpg" },
    { key: "limestone", path: "/material/kalksten", img: "/images/materials/kalksten-hero.jpg" },
    { key: "terrazzo", path: "/material/terrazzo", img: "/images/materials/terrazzo-hero.jpg" },
    { key: "quartzite", path: "/material/kvartsit", img: "/images/materials/kvartsit-hero.jpg" },
    { key: "travertine", path: "/material/travertin", img: "/images/materials/travertin-hero.jpg" },
    { key: "semiPrecious", path: "/material/semiprecious", img: "/images/materials/semiprecious-hero.jpg" },
    { key: "recycledGlass", path: "/material/atervunnetglas", img: "/images/materials/glas-hero.jpg" },
  ];

  return (
    <section className="relative z-10 bg-white/85 backdrop-blur border-t">
      <div className="max-w-6xl mx-auto px-6 py-12 text-center">
        <h2 className="text-xl font-semibold mb-4">
          {t("materials.links.title", { defaultValue: "Läs mer om materialen" })}
        </h2>

        <p className="text-gray-600 mb-8">
          {t("materials.links.desc", {
            defaultValue:
              "Upptäck skillnaderna mellan marmor, granit, komposit och andra stensorter.",
          })}
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {materials.map((mat) => {
            const label = t(`materials.names.${mat.key}`, { defaultValue: mat.key });

            return (
              <Link
                key={mat.path}
                to={mat.path}
                className="group block rounded-xl overflow-hidden border bg-white shadow-sm hover:shadow-md transition"
                aria-label={label}
                title={label}
              >
                <div className="aspect-[4/3] bg-gray-100">
                  <img
                    src={mat.img}
                    alt={label}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>

                <div className="p-3">
                  <span className="text-gray-800 font-medium">{label}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
