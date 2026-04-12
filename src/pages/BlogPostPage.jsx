// Path: src/pages/BlogPostPage.jsx
import { useState, useEffect } from "react";
import { useParams, Navigate } from "react-router-dom";
import StoneDetailPage from "../components/StoneDetailPage";

const API_BASE = import.meta.env.VITE_CHAT_API_BASE || "";

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(undefined); // undefined=loading, null=not found

  useEffect(() => {
    fetch(`${API_BASE}/api/blog/posts/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then(setPost)
      .catch(() => {
        // Fallback: try static JSON
        fetch("/data/blog-posts.json")
          .then(r => r.json())
          .then(data => {
            const found = data.find(p => p.slug === slug);
            setPost(found ? { ...found, hero_image: found.heroImage, meta_description: found.metaDescription } : null);
          })
          .catch(() => setPost(null));
      });
  }, [slug]);

  if (post === undefined) {
    return <div className="min-h-[40vh] grid place-items-center text-sm text-gray-500">Laddar…</div>;
  }
  if (post === null) return <Navigate to="/blogg" replace />;

  return (
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
  );
}
