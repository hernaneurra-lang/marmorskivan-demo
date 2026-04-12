// Path: src/pages/BlogListPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import SiteFooter from "../components/SiteFooter";

const API_BASE = import.meta.env.VITE_CHAT_API_BASE || "";

const CATEGORY_COLORS = {
  "Jämförelse": "bg-blue-100 text-blue-800",
  "Guide":       "bg-emerald-100 text-emerald-800",
  "Skötsel":     "bg-amber-100 text-amber-800",
  "Inspiration": "bg-purple-100 text-purple-800",
  "Material":    "bg-stone-100 text-stone-800",
  "Region":      "bg-teal-100 text-teal-800",
  "Mässa":       "bg-rose-100 text-rose-800",
};

function CategoryBadge({ category }) {
  const cls = CATEGORY_COLORS[category] || "bg-gray-100 text-gray-700";
  return (
    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full ${cls}`}>
      {category}
    </span>
  );
}

function FeaturedCard({ post }) {
  return (
    <Link
      to={`/blogg/${post.slug}`}
      className="group relative block w-full rounded-3xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
      style={{ minHeight: 400 }}
    >
      <img
        src={post.hero_image}
        alt={post.h1}
        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="relative h-full flex flex-col justify-end p-8 text-white" style={{ minHeight: 400 }}>
        <div className="flex items-center gap-3 mb-3">
          <CategoryBadge category={post.category} />
          <span className="text-xs text-white/70">{post.read_time} läsning</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold leading-tight mb-3 drop-shadow">
          {post.h1}
        </h2>
        <p className="text-sm text-white/80 line-clamp-2 max-w-xl mb-4">
          {post.meta_description}
        </p>
        <div className="inline-flex items-center gap-2 text-sm font-semibold text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-full w-fit transition">
          Läs artikel →
        </div>
      </div>
    </Link>
  );
}

function PostCard({ post }) {
  return (
    <Link
      to={`/blogg/${post.slug}`}
      className="group bg-white border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow flex flex-col"
    >
      {post.hero_image && (
        <div className="overflow-hidden h-48">
          <img
            src={post.hero_image}
            alt={post.h1}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        </div>
      )}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-center gap-2 mb-3">
          <CategoryBadge category={post.category} />
          <span className="text-xs text-gray-400">{post.read_time}</span>
        </div>
        <h2 className="font-bold text-gray-900 leading-snug flex-1 text-[15px]">
          {post.h1}
        </h2>
        <p className="mt-2 text-sm text-gray-500 line-clamp-2">
          {post.meta_description}
        </p>
        <div className="mt-4 text-sm font-semibold text-emerald-700 group-hover:underline">
          Läs mer →
        </div>
      </div>
    </Link>
  );
}

export default function BlogListPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("Alla");

  useEffect(() => {
    fetch(`${API_BASE}/api/blog/posts`)
      .then((r) => r.json())
      .then((data) => { setPosts(data); setLoading(false); })
      .catch(() => {
        // Fallback to JSON file
        fetch("/data/blog-posts.json").then(r => r.json()).then(data => {
          // Normalize keys
          setPosts(data.map(p => ({ ...p, hero_image: p.heroImage, meta_description: p.metaDescription })));
          setLoading(false);
        }).catch(() => setLoading(false));
      });
  }, []);

  const categories = ["Alla", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))];
  const filtered = category === "Alla" ? posts : posts.filter((p) => p.category === category);
  const [featured, ...rest] = filtered;

  return (
    <div className="min-h-screen bg-[#f8f7f5] flex flex-col">
      <Helmet>
        <title>Blogg – guider och inspiration om bänkskivor | Marmorskivan.se</title>
        <meta name="description" content="Guider, jämförelser och inspiration om bänkskivor i sten. Vi skriver om marmor, granit, kvartsit, skötsel, trender och hur du väljer rätt material." />
      </Helmet>

      <header className="bg-white/80 border-b backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900 hover:text-emerald-700 tracking-tight">
            marmorskivan.se
          </Link>
          <nav className="flex items-center gap-2">
            <Link to="/bankskiva-sten" className="hidden sm:block px-3 py-1.5 rounded-lg border text-sm bg-white hover:bg-gray-50 text-gray-700">
              Material
            </Link>
            <Link to="/blogg" className="hidden sm:block px-3 py-1.5 rounded-lg border text-sm bg-gray-900 text-white">
              Blogg
            </Link>
            <Link to="/app" className="ml-1 px-4 py-1.5 rounded-lg text-sm bg-emerald-600 text-white hover:bg-emerald-700 font-semibold">
              Beräkna pris
            </Link>
          </nav>
        </div>
      </header>

      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <nav className="text-sm text-gray-400 mb-4 flex items-center gap-2">
            <Link to="/" className="hover:text-gray-600">Hem</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium">Blogg</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Guider &amp; inspiration
          </h1>
          <p className="mt-3 text-lg text-gray-500 max-w-xl">
            Allt du behöver veta om bänkskivor i natursten — material, skötsel, pris och trender.
          </p>
        </div>
      </div>

      <main className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full">
        <div className="flex gap-2 flex-wrap mb-8">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition border ${
                category === c
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-24 text-gray-400">Laddar inlägg…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-gray-400">Inga publicerade inlägg ännu.</div>
        ) : (
          <>
            {featured && <div className="mb-10"><FeaturedCard post={featured} /></div>}
            {rest.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((post) => <PostCard key={post.slug} post={post} />)}
              </div>
            )}
          </>
        )}
      </main>

      <div className="bg-emerald-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="flex-1">
            <div className="text-xl font-bold">Redo att räkna pris?</div>
            <div className="text-emerald-100 mt-1 text-sm">Välj material, ange dina mått och få ett exakt pris direkt.</div>
          </div>
          <Link to="/app" className="shrink-0 px-7 py-3 rounded-xl bg-white text-emerald-800 font-bold hover:bg-emerald-50 shadow transition">
            Öppna kalkylatorn →
          </Link>
        </div>
      </div>

      <SiteFooter />
    </div>
  );
}
