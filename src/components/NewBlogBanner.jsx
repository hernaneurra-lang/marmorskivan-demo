// Path: src/components/NewBlogBanner.jsx
// Floating bottom-left banner when a new blog post was published this week
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_CHAT_API_BASE || "";
const STORAGE_KEY = "ms_blog_banner_seen";

export default function NewBlogBanner() {
  const [post, setPost] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/blog/latest`)
      .then(r => r.json())
      .then(data => {
        if (!data) return;
        // Only show if this week (week_number matches current ISO week)
        const d = new Date();
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const currentWeek = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);

        if (data.week_number !== currentWeek) return;

        // Check if dismissed
        const seen = localStorage.getItem(STORAGE_KEY);
        if (seen === data.slug) return;

        setPost(data);
        // Delay slightly so page loads first
        setTimeout(() => setVisible(true), 1500);
      })
      .catch(() => {});
  }, []);

  if (!post || !visible) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, post.slug);
    setVisible(false);
  };

  const CATEGORY_COLORS = {
    "Jämförelse": "#3b82f6",
    "Guide":       "#059669",
    "Skötsel":     "#d97706",
    "Inspiration": "#7c3aed",
    "Material":    "#78716c",
    "Region":      "#0d9488",
    "Mässa":       "#e11d48",
  };
  const accent = CATEGORY_COLORS[post.category] || "#059669";

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        zIndex: 9999,
        maxWidth: 300,
        background: "#fff",
        borderRadius: 16,
        boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
        overflow: "hidden",
        animation: "slideUpFade 0.4s ease",
        border: "1px solid #e5e7eb",
      }}
    >
      <style>{`
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Top accent bar */}
      <div style={{ height: 4, background: accent }} />

      <div style={{ padding: "14px 16px 16px" }}>
        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.05em",
            background: accent + "18", color: accent,
            padding: "2px 8px", borderRadius: 99,
          }}>
            NYTT BLOGGINLÄGG
          </span>
          <button
            onClick={dismiss}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 18, lineHeight: 1, padding: "0 0 0 8px" }}
          >
            ×
          </button>
        </div>

        {/* Title */}
        <div style={{ fontSize: 13, fontWeight: 700, color: "#111827", lineHeight: 1.4, marginBottom: 12 }}>
          {post.h1}
        </div>

        {/* CTA */}
        <Link
          to={`/blogg/${post.slug}`}
          onClick={dismiss}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            fontSize: 12,
            fontWeight: 700,
            color: "#fff",
            background: accent,
            padding: "7px 14px",
            borderRadius: 8,
            textDecoration: "none",
          }}
        >
          Läs artikeln →
        </Link>
      </div>
    </div>
  );
}
