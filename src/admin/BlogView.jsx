// Path: src/admin/BlogView.jsx
import { useState, useEffect, useCallback } from "react";
import { useToast } from "./AdminPage.jsx";

const CATEGORY_OPTIONS = ["Jämförelse","Guide","Skötsel","Inspiration","Material","Region","Mässa"];

// Compute ISO week for a given year+week → Monday date string
function weekToMonday(year, week) {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dow = jan4.getUTCDay() || 7;
  const monday = new Date(jan4);
  monday.setUTCDate(jan4.getUTCDate() - dow + 1 + (week - 1) * 7);
  return monday.toISOString().slice(0, 10);
}

function currentISOWeek() {
  const d = new Date();
  const day = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  day.setUTCDate(day.getUTCDate() + 4 - (day.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  return {
    week: Math.ceil((((day - yearStart) / 86400000) + 1) / 7),
    year: day.getUTCFullYear(),
  };
}

function statusInfo(post) {
  const { week: cw, year: cy } = currentISOWeek();
  if (post.status === "draft") return { label: "Utkast", color: "#6b7280", bg: "#f3f4f6" };
  const py = post.publish_year || 2026;
  const pw = post.week_number;
  if (py < cy || (py === cy && pw < cw)) return { label: "Publicerad", color: "#059669", bg: "#ecfdf5" };
  if (py === cy && pw === cw)            return { label: "Denna vecka", color: "#d97706", bg: "#fffbeb" };
  return { label: `v.${pw} ${py}`, color: "#6366f1", bg: "#eef2ff" };
}

const CATEGORY_COLORS = {
  "Jämförelse": "#3b82f6",
  "Guide":       "#059669",
  "Skötsel":     "#d97706",
  "Inspiration": "#7c3aed",
  "Material":    "#78716c",
  "Region":      "#0d9488",
  "Mässa":       "#e11d48",
};

export default function BlogView({ headers, apiBase }) {
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPost, setEditPost] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("alla");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${apiBase}/api/admin/blog/posts`, { headers });
      const data = await r.json();
      setPosts(data);
    } catch { toast("Kunde inte ladda bloggposter", "error"); }
    finally { setLoading(false); }
  }, [apiBase, headers]);

  useEffect(() => { load(); }, [load]);

  const openEdit = (post) => {
    setEditPost({
      ...post,
      sectionsJson: JSON.stringify(post.sections || [], null, 2),
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      let sections;
      try { sections = JSON.parse(editPost.sectionsJson); }
      catch { toast("Ogiltig JSON i sektioner", "error"); setSaving(false); return; }

      const r = await fetch(`${apiBase}/api/admin/blog/posts/${editPost.id}`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editPost.title,
          meta_description: editPost.meta_description,
          h1: editPost.h1,
          hero_image: editPost.hero_image,
          category: editPost.category,
          read_time: editPost.read_time,
          week_number: parseInt(editPost.week_number),
          status: editPost.status,
          sections,
        }),
      });
      if (r.ok) {
        toast("Sparat!", "success", "✅");
        setEditPost(null);
        load();
      } else {
        toast("Kunde inte spara", "error");
      }
    } finally { setSaving(false); }
  };

  const { week: cw, year: cy } = currentISOWeek();

  const filtered = posts.filter(p => {
    if (search && !p.h1.toLowerCase().includes(search.toLowerCase()) &&
        !p.slug.includes(search.toLowerCase()) &&
        !p.category.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus === "publicerad") {
      const py = p.publish_year || 2026;
      return py < cy || (py === cy && p.week_number <= cw);
    }
    if (filterStatus === "kommande") {
      const py = p.publish_year || 2026;
      return py > cy || (py === cy && p.week_number > cw);
    }
    if (filterStatus === "utkast") return p.status === "draft";
    return true;
  });

  return (
    <div className="admin-view">
      <div className="admin-topbar">
        <h1 className="admin-title">Blogg</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            52 inlägg · v.{cw}/{cy}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          className="admin-input"
          style={{ width: 220 }}
          placeholder="Sök titel, kategori…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {["alla","publicerad","kommande","utkast"].map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className={filterStatus === s ? "btn-primary" : "btn-secondary"}
            style={{ textTransform: "capitalize", padding: "6px 14px" }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Timeline table */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Laddar…</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--muted)", fontWeight: 600, width: 60 }}>Vecka</th>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--muted)", fontWeight: 600 }}>Titel</th>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--muted)", fontWeight: 600, width: 100 }}>Kategori</th>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--muted)", fontWeight: 600, width: 100 }}>Publiceringsdatum</th>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--muted)", fontWeight: 600, width: 110 }}>Status</th>
                <th style={{ width: 80 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(post => {
                const st = statusInfo(post);
                const publishDate = weekToMonday(post.publish_year || 2026, post.week_number);
                const isThisWeek = (post.publish_year || 2026) === cy && post.week_number === cw;
                const catColor = CATEGORY_COLORS[post.category] || "#6b7280";

                return (
                  <tr
                    key={post.id}
                    style={{
                      borderBottom: "1px solid var(--border)",
                      background: isThisWeek ? "rgba(251,191,36,0.06)" : "transparent",
                    }}
                  >
                    {/* Week */}
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: "var(--muted)", fontSize: 15 }}>
                      {post.week_number}
                    </td>
                    {/* Title */}
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ fontWeight: 600, color: "var(--text)", lineHeight: 1.4 }}>{post.h1}</div>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{post.slug}</div>
                    </td>
                    {/* Category */}
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99,
                        background: catColor + "18", color: catColor,
                      }}>
                        {post.category}
                      </span>
                    </td>
                    {/* Date */}
                    <td style={{ padding: "10px 12px", color: "var(--muted)", fontSize: 12 }}>
                      {new Date(publishDate).toLocaleDateString("sv-SE", { weekday: "short", day: "numeric", month: "short" })}
                    </td>
                    {/* Status */}
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{
                        fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                        background: st.bg, color: st.color,
                        border: `1px solid ${st.color}40`,
                      }}>
                        {st.label}
                      </span>
                    </td>
                    {/* Actions */}
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <button
                        className="btn-secondary"
                        style={{ fontSize: 12, padding: "4px 12px" }}
                        onClick={() => openEdit(post)}
                      >
                        Redigera
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Inga inlägg matchar filtret.</div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editPost && (
        <div className="admin-modal-overlay" onClick={() => setEditPost(null)}>
          <div className="admin-modal" style={{ maxWidth: 700, width: "95vw" }} onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <span>Redigera — v.{editPost.week_number}: {editPost.h1}</span>
              <button className="admin-modal-close" onClick={() => setEditPost(null)}>×</button>
            </div>
            <div className="admin-modal-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

              <label className="admin-label">
                Rubrik (H1)
                <input className="admin-input" value={editPost.h1}
                  onChange={e => setEditPost(p => ({ ...p, h1: e.target.value }))} />
              </label>

              <label className="admin-label">
                Sidtitel (meta title)
                <input className="admin-input" value={editPost.title}
                  onChange={e => setEditPost(p => ({ ...p, title: e.target.value }))} />
              </label>

              <label className="admin-label">
                Meta-beskrivning
                <textarea className="admin-input" rows={2} value={editPost.meta_description}
                  onChange={e => setEditPost(p => ({ ...p, meta_description: e.target.value }))} />
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px 80px", gap: 10 }}>
                <label className="admin-label">
                  Kategori
                  <select className="admin-input" value={editPost.category}
                    onChange={e => setEditPost(p => ({ ...p, category: e.target.value }))}>
                    {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
                  </select>
                </label>
                <label className="admin-label">
                  Hero-bild URL
                  <input className="admin-input" value={editPost.hero_image}
                    onChange={e => setEditPost(p => ({ ...p, hero_image: e.target.value }))} />
                </label>
                <label className="admin-label">
                  Vecka
                  <input className="admin-input" type="number" min={1} max={52}
                    value={editPost.week_number}
                    onChange={e => setEditPost(p => ({ ...p, week_number: e.target.value }))} />
                </label>
                <label className="admin-label">
                  Status
                  <select className="admin-input" value={editPost.status}
                    onChange={e => setEditPost(p => ({ ...p, status: e.target.value }))}>
                    <option value="scheduled">Planerad</option>
                    <option value="draft">Utkast</option>
                  </select>
                </label>
              </div>

              <label className="admin-label">
                Sektioner (JSON)
                <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: 6 }}>
                  Array av {`{heading, content, images?}`}
                </span>
                <textarea
                  className="admin-input"
                  rows={14}
                  style={{ fontFamily: "monospace", fontSize: 12 }}
                  value={editPost.sectionsJson}
                  onChange={e => setEditPost(p => ({ ...p, sectionsJson: e.target.value }))}
                />
              </label>

              {editPost.hero_image && (
                <img src={editPost.hero_image} alt="" style={{ height: 80, objectFit: "cover", borderRadius: 8 }} />
              )}
            </div>
            <div className="admin-modal-footer">
              <button className="btn-secondary" onClick={() => setEditPost(null)}>Avbryt</button>
              <button className="btn-primary" onClick={save} disabled={saving}>
                {saving ? "Sparar…" : "Spara ändringar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
