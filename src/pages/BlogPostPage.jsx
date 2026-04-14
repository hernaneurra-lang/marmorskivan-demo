// Path: src/pages/BlogPostPage.jsx
import { useState, useEffect } from "react";
import { useParams, useSearchParams, Navigate } from "react-router-dom";
import StoneDetailPage from "../components/StoneDetailPage";

const API_BASE = import.meta.env.VITE_CHAT_API_BASE || "";

export default function BlogPostPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const isPreview = !!searchParams.get("preview");
  const [post, setPost] = useState(undefined); // undefined=loading, null=not found

  useEffect(() => {
    const adminToken = typeof localStorage !== "undefined"
      ? (localStorage.getItem("adminToken") || "marmorskivan-admin")
      : "marmorskivan-admin";
    const url = isPreview
      ? `${API_BASE}/api/blog/preview/${slug}?token=${encodeURIComponent(adminToken)}`
      : `${API_BASE}/api/blog/posts/${slug}`;

    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then(setPost)
      .catch(() => {
        if (isPreview) { setPost(null); return; }
        // Fallback: try static JSON
        fetch("/data/blog-posts.json")
          .then(r => r.json())
          .then(data => {
            const found = data.find(p => p.slug === slug);
            setPost(found ? { ...found, hero_image: found.heroImage, meta_description: found.metaDescription } : null);
          })
          .catch(() => setPost(null));
      });
  }, [slug, isPreview]);

  if (post === undefined) {
    return <div className="min-h-[40vh] grid place-items-center text-sm text-gray-500">Laddar…</div>;
  }
  if (post === null) {
    if (isPreview) {
      return (
        <div style={{ minHeight: "40vh", display: "grid", placeItems: "center", textAlign: "center", padding: 40 }}>
          <div>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🔒</div>
            <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>Inlägget hittades inte</div>
            <div style={{ color: "#666", fontSize: 14 }}>Kontrollera att slugen stämmer eller att Railway-deployen är klar.</div>
          </div>
        </div>
      );
    }
    return <Navigate to="/blogg" replace />;
  }

  return (
    <>
      {isPreview && (
        <div style={{ background: "#fbbf24", color: "#78350f", padding: "8px 20px", fontSize: 13, fontWeight: 600, textAlign: "center" }}>
          👁 Förhandsvisning – inte publicerad än (v.{post.week_number} {post.publish_year})
        </div>
      )}
      <StoneDetailPage
        title={post.title}
        metaDescription={post.meta_description || post.metaDescription}
        h1={post.h1}
        heroImage={post.hero_image || post.heroImage}
        sections={post.sections || []}
        breadcrumbMiddleLabel="Blogg"
        breadcrumbMiddleTo="/blogg"
        textSize="base"
      />
    </>
  );
}
