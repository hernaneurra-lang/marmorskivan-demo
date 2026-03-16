import { Link, useLocation } from "react-router-dom";

const MATERIALS = [
  { name: "Marmor", to: "/material/marmor", img: "/images/materials/Marmor/marmor-hero.jpg", alt: "Marmor" },
  { name: "Granit", to: "/material/granit", img: "/images/materials/Granit/granit-hero.jpg", alt: "Granit" },
  { name: "Kalksten", to: "/material/kalksten", img: "/images/materials/Kalksten/kalksten-hero.jpg", alt: "Kalksten" },
  { name: "Kvartsit", to: "/material/kvartsit", img: "/images/materials/Kvartsit/kvartsit-hero.jpg", alt: "Kvartsit" },
  { name: "Komposit", to: "/material/komposit", img: "/images/materials/Komposit/komposit-hero.jpg", alt: "Komposit" },
  { name: "Terrazzo", to: "/material/terrazzo", img: "/images/materials/Terrazzo/terrazzo-hero.jpg", alt: "Terrazzo" },
  { name: "Travertin", to: "/material/travertin", img: "/images/materials/Travertin/travertin-hero.jpg", alt: "Travertin" },
  { name: "Onyx", to: "/material/onyx", img: "/images/materials/Onyx/onyx-hero.jpg", alt: "Onyx" },
  { name: "Semiprecious", to: "/material/semiprecious", img: "/images/materials/Semiprecious/semiprecious-hero.jpg", alt: "Semiprecious" },
  { name: "Återvunnet glas", to: "/material/atervunnet-glas", img: "/images/materials/Glas/glas-hero.jpg", alt: "Återvunnet glas" },
];

export default function MaterialsSidebar() {
  const { pathname } = useLocation();

  return (
    <aside
      className="block sticky top-6 self-start w-full md:w-auto"
      aria-label="Utforska fler material"
    >
      <div className="font-semibold text-gray-900 mb-3">Utforska fler material</div>

      <nav className="space-y-3 pr-1 overflow-y-auto max-h-[calc(100vh-120px)]">
        {MATERIALS.map((m) => {
          const active = pathname === m.to;
          return (
            <Link
              key={m.to}
              to={m.to}
              className={`group block rounded-xl border overflow-hidden shadow-sm hover:shadow-md transition ${
                active ? "border-black" : "border-gray-200"
              }`}
            >
              <div className="aspect-[16/10] overflow-hidden bg-gray-100">
                <img
                  src={m.img}
                  alt={m.alt}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
              <div className="p-3 flex items-center justify-between">
                <span className={`text-sm font-medium ${active ? "text-black" : "text-gray-800"}`}>
                  {m.name}
                </span>
                <span className="text-gray-400 group-hover:text-gray-600 transition">→</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
