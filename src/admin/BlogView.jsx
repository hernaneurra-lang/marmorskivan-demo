// Path: src/admin/BlogView.jsx
import { useState, useEffect, useCallback } from "react";
import { useToast } from "./AdminPage.jsx";

const CATEGORY_OPTIONS = ["Jämförelse","Guide","Skötsel","Inspiration","Material","Region","Mässa"];

const CATEGORY_COLORS = {
  "Jämförelse": "#3b82f6", "Guide": "#059669", "Skötsel": "#d97706",
  "Inspiration": "#7c3aed", "Material": "#78716c", "Region": "#0d9488", "Mässa": "#e11d48",
};

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
  return { week: Math.ceil((((day - yearStart) / 86400000) + 1) / 7), year: day.getUTCFullYear() };
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

// ── Label style (same as ProductModal) ──
const L = { fontSize: 12, fontWeight: 600, color: "var(--text)", opacity: 0.75, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" };

// ── Image picker with preview ──
function ImageField({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={L}>{label}</label>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ width: 100, height: 70, borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface2)", flexShrink: 0, overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {value
            ? <img src={value} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
            : <span style={{ fontSize: 24, opacity: 0.25 }}>🖼️</span>
          }
        </div>
        <div style={{ flex: 1 }}>
          <input className="admin-input" style={{ marginBottom: 4, fontSize: 12 }}
            placeholder="/images/materials/... eller /edges/..."
            value={value || ""}
            onChange={e => onChange(e.target.value)}
          />
          <div style={{ fontSize: 11, color: "var(--muted)" }}>
            Ladda upp via FTP → /images/materials/ eller /edges/ → klistra in sökväg
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Single section editor ──
function SectionEditor({ section, index, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast }) {
  const images = section.images || [];

  const setField = (field, val) => onChange({ ...section, [field]: val });

  const setImage = (imgIdx, field, val) => {
    const next = images.map((img, i) => i === imgIdx ? { ...img, [field]: val } : img);
    onChange({ ...section, images: next });
  };
  const addImage = () => onChange({ ...section, images: [...images, { src: "", alt: "" }] });
  const removeImage = (imgIdx) => onChange({ ...section, images: images.filter((_, i) => i !== imgIdx) });

  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 14, marginBottom: 12, background: "var(--surface2)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", minWidth: 24 }}>#{index + 1}</span>
        <input
          className="admin-input"
          style={{ flex: 1, marginBottom: 0, fontWeight: 600 }}
          placeholder="Rubrik på sektion…"
          value={section.heading || ""}
          onChange={e => setField("heading", e.target.value)}
        />
        <div style={{ display: "flex", gap: 4 }}>
          <button onClick={onMoveUp} disabled={isFirst} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "3px 8px", cursor: isFirst ? "default" : "pointer", opacity: isFirst ? 0.3 : 1, color: "var(--text)" }}>↑</button>
          <button onClick={onMoveDown} disabled={isLast} style={{ background: "none", border: "1px solid var(--border)", borderRadius: 6, padding: "3px 8px", cursor: isLast ? "default" : "pointer", opacity: isLast ? 0.3 : 1, color: "var(--text)" }}>↓</button>
          <button onClick={onRemove} style={{ background: "none", border: "1px solid #ef4444", borderRadius: 6, padding: "3px 8px", cursor: "pointer", color: "#ef4444" }}>✕</button>
        </div>
      </div>

      <div style={{ marginBottom: 10 }}>
        <label style={L}>Innehåll (HTML)</label>
        <textarea
          className="admin-input"
          rows={4}
          style={{ fontFamily: "monospace", fontSize: 12, width: "100%", boxSizing: "border-box", marginBottom: 0 }}
          value={section.content || ""}
          onChange={e => setField("content", e.target.value)}
        />
      </div>

      {/* Images */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <label style={{ ...L, marginBottom: 0 }}>Bilder i sektionen ({images.length})</label>
          <button onClick={addImage} style={{ fontSize: 11, padding: "3px 10px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 6, cursor: "pointer" }}>+ Lägg till bild</button>
        </div>
        {images.map((img, imgIdx) => (
          <div key={imgIdx} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8, padding: 8, background: "var(--card)", borderRadius: 8, border: "1px solid var(--border)" }}>
            <div style={{ width: 72, height: 52, borderRadius: 6, overflow: "hidden", flexShrink: 0, background: "var(--surface2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {img.src
                ? <img src={img.src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                : <span style={{ fontSize: 18, opacity: 0.3 }}>🖼️</span>
              }
            </div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              <input className="admin-input" style={{ marginBottom: 0, fontSize: 12 }} placeholder="Sökväg: /images/materials/..." value={img.src || ""} onChange={e => setImage(imgIdx, "src", e.target.value)} />
              <input className="admin-input" style={{ marginBottom: 0, fontSize: 12 }} placeholder="Alt-text (SEO)" value={img.alt || ""} onChange={e => setImage(imgIdx, "alt", e.target.value)} />
            </div>
            <button onClick={() => removeImage(imgIdx)} style={{ background: "none", border: "1px solid #ef4444", borderRadius: 6, padding: "4px 8px", cursor: "pointer", color: "#ef4444", flexShrink: 0 }}>✕</button>
          </div>
        ))}
        {images.length === 0 && (
          <div style={{ fontSize: 12, color: "var(--muted)", fontStyle: "italic" }}>Inga bilder i denna sektion ännu.</div>
        )}
      </div>
    </div>
  );
}

// ── Edit Modal ──
function BlogEditModal({ post, onSave, onClose }) {
  const [form, setForm] = useState({
    h1: post.h1 || "",
    title: post.title || "",
    meta_description: post.meta_description || "",
    hero_image: post.hero_image || "",
    title_color: post.title_color || "white",
    category: post.category || "Guide",
    read_time: post.read_time || "5 min",
    week_number: post.week_number || 1,
    status: post.status || "scheduled",
    sections: Array.isArray(post.sections) ? post.sections : [],
  });
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  const setField = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const updateSection = (idx, val) => setForm(f => ({ ...f, sections: f.sections.map((s, i) => i === idx ? val : s) }));
  const removeSection = (idx) => setForm(f => ({ ...f, sections: f.sections.filter((_, i) => i !== idx) }));
  const addSection = () => setForm(f => ({ ...f, sections: [...f.sections, { heading: "", content: "", images: [] }] }));
  const moveSection = (idx, dir) => {
    const next = [...form.sections];
    const swap = idx + dir;
    if (swap < 0 || swap >= next.length) return;
    [next[idx], next[swap]] = [next[swap], next[idx]];
    setForm(f => ({ ...f, sections: next }));
  };

  const submit = async () => {
    setSaving(true);
    try {
      await onSave({ ...form, week_number: parseInt(form.week_number) });
    } finally { setSaving(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.88)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9000 }}>
      <div style={{ background: "var(--card)", borderRadius: 14, padding: 28, width: "min(96vw, 860px)", maxHeight: "92vh", overflowY: "auto" }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: "var(--text)" }}>Redigera — v.{post.week_number}: {post.h1}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 22 }}>×</button>
        </div>

        {/* Top meta grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
          <div style={{ marginBottom: 14, gridColumn: "1 / -1" }}>
            <label style={L}>Rubrik (H1)</label>
            <input className="admin-input" style={{ marginBottom: 0, fontWeight: 600 }} value={form.h1} onChange={e => setField("h1", e.target.value)} />
          </div>
          <div style={{ marginBottom: 14, gridColumn: "1 / -1" }}>
            <label style={L}>Sidtitel (meta title)</label>
            <input className="admin-input" style={{ marginBottom: 0 }} value={form.title} onChange={e => setField("title", e.target.value)} />
          </div>
          <div style={{ marginBottom: 14, gridColumn: "1 / -1" }}>
            <label style={L}>Meta-beskrivning</label>
            <textarea className="admin-input" rows={2} style={{ marginBottom: 0 }} value={form.meta_description} onChange={e => setField("meta_description", e.target.value)} />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={L}>Kategori</label>
            <select className="admin-input" style={{ marginBottom: 0 }} value={form.category} onChange={e => setField("category", e.target.value)}>
              {CATEGORY_OPTIONS.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={L}>Lästid</label>
            <input className="admin-input" style={{ marginBottom: 0 }} value={form.read_time} onChange={e => setField("read_time", e.target.value)} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={L}>Vecka (1–52)</label>
            <input className="admin-input" type="number" min={1} max={52} style={{ marginBottom: 0 }} value={form.week_number} onChange={e => setField("week_number", e.target.value)} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={L}>Status</label>
            <select className="admin-input" style={{ marginBottom: 0 }} value={form.status} onChange={e => setField("status", e.target.value)}>
              <option value="scheduled">Planerad (auto-publiceras)</option>
              <option value="draft">Utkast (dölj)</option>
            </select>
          </div>

          <div style={{ gridColumn: "1 / -1" }}>
            <ImageField label="Hero-bild" value={form.hero_image} onChange={v => setField("hero_image", v)} />
            <div style={{ marginTop: 12 }}>
              <label style={L}>Textfärg på hero-bild</label>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {["#ffffff","#cccccc","#999999","#666666","#444444","#222222","#000000"].map((hex, i) => {
                  const labels = ["Vit","Ljusgrå","Grå","Mörkgrå","Antracit","Nästan svart","Svart"];
                  const isSelected = (form.title_color || "#ffffff") === hex;
                  return (
                    <button key={hex} title={labels[i]} onClick={() => setField("title_color", hex)} style={{
                      width: 32, height: 32, borderRadius: "50%", cursor: "pointer", flexShrink: 0,
                      background: hex,
                      border: isSelected ? "3px solid var(--accent)" : "2px solid var(--border)",
                      boxShadow: isSelected ? "0 0 0 2px var(--accent)" : "none",
                      transition: "box-shadow 0.15s",
                    }} />
                  );
                })}
                <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: 8 }}>
                  Vald: <strong>{form.title_color || "#ffffff"}</strong>
                </span>
              </div>
              <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>Ljus bild → välj mörkare text. Mörk bild → välj vit text.</p>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <label style={{ ...L, marginBottom: 0, fontSize: 13 }}>SEKTIONER ({form.sections.length})</label>
            <button onClick={addSection} style={{ fontSize: 12, padding: "5px 14px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>+ Ny sektion</button>
          </div>
          {form.sections.length === 0 && (
            <div style={{ padding: "20px 0", textAlign: "center", color: "var(--muted)", fontSize: 13 }}>Inga sektioner ännu. Klicka "+ Ny sektion" för att börja.</div>
          )}
          {form.sections.map((section, idx) => (
            <SectionEditor
              key={idx}
              section={section}
              index={idx}
              onChange={val => updateSection(idx, val)}
              onRemove={() => removeSection(idx)}
              onMoveUp={() => moveSection(idx, -1)}
              onMoveDown={() => moveSection(idx, 1)}
              isFirst={idx === 0}
              isLast={idx === form.sections.length - 1}
            />
          ))}
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
          <button className="admin-btn-secondary" onClick={onClose}>Avbryt</button>
          <button className="btn-primary" onClick={submit} disabled={saving}>
            {saving ? "Sparar…" : "Spara ändringar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main BlogView ──
export default function BlogView({ headers, apiBase }) {
  const toast = useToast();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPost, setEditPost] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("alla");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${apiBase}/api/admin/blog/posts`, { headers });
      setPosts(await r.json());
    } catch { toast("Kunde inte ladda bloggposter", "error"); }
    finally { setLoading(false); }
  }, [apiBase, headers]);

  useEffect(() => { load(); }, [load]);

  const save = async (data) => {
    const r = await fetch(`${apiBase}/api/admin/blog/posts/${editPost.id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (r.ok) { toast("Sparat!", "success", "✅"); setEditPost(null); load(); }
    else toast("Kunde inte spara", "error");
  };

  const syncFromJson = async (post) => {
    try {
      const r = await fetch("/data/blog-posts.json");
      const all = await r.json();
      const found = all.find(p => p.slug === post.slug);
      if (!found || !found.sections?.length) { toast("Hittade inga sektioner i JSON", "error"); return; }
      const pr = await fetch(`${apiBase}/api/admin/blog/posts/${post.id}`, {
        method: "PATCH",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ sections: found.sections }),
      });
      if (pr.ok) { toast(`Synkat ${found.sections.length} sektioner från JSON!`, "success", "✅"); load(); }
      else toast("Kunde inte synka", "error");
    } catch (e) { toast("Fel: " + e.message, "error"); }
  };

  const { week: cw, year: cy } = currentISOWeek();

  const filtered = posts.filter(p => {
    if (search && !p.h1.toLowerCase().includes(search.toLowerCase()) && !p.slug.includes(search.toLowerCase()) && !p.category.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterStatus === "publicerad") { const py = p.publish_year || 2026; return py < cy || (py === cy && p.week_number <= cw); }
    if (filterStatus === "kommande")   { const py = p.publish_year || 2026; return py > cy || (py === cy && p.week_number > cw); }
    if (filterStatus === "utkast") return p.status === "draft";
    return true;
  });

  return (
    <div className="admin-view">
      <div className="admin-topbar">
        <h1 className="admin-title">Blogg</h1>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>52 inlägg · v.{cw}/{cy}</span>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <input className="admin-input" style={{ width: 220 }} placeholder="Sök titel, kategori…" value={search} onChange={e => setSearch(e.target.value)} />
        {["alla","publicerad","kommande","utkast"].map(s => (
          <button key={s} onClick={() => setFilterStatus(s)} className={filterStatus === s ? "btn-primary" : "btn-secondary"} style={{ padding: "6px 14px" }}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Laddar…</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--muted)", fontWeight: 600, width: 55 }}>Vecka</th>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--muted)", fontWeight: 600 }}>Titel</th>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--muted)", fontWeight: 600, width: 100 }}>Kategori</th>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--muted)", fontWeight: 600, width: 110 }}>Publiceras</th>
                <th style={{ textAlign: "left", padding: "8px 12px", color: "var(--muted)", fontWeight: 600, width: 110 }}>Status</th>
                <th style={{ width: 90 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(post => {
                const st = statusInfo(post);
                const publishDate = weekToMonday(post.publish_year || 2026, post.week_number);
                const isThisWeek = (post.publish_year || 2026) === cy && post.week_number === cw;
                const catColor = CATEGORY_COLORS[post.category] || "#6b7280";
                const hasSections = Array.isArray(post.sections) && post.sections.length > 0;

                return (
                  <tr key={post.id} style={{ borderBottom: "1px solid var(--border)", background: isThisWeek ? "rgba(251,191,36,0.06)" : "transparent" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 700, color: "var(--muted)", fontSize: 15 }}>{post.week_number}</td>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {post.hero_image && <img src={post.hero_image} alt="" style={{ width: 44, height: 32, objectFit: "cover", borderRadius: 5, flexShrink: 0 }} onError={e => e.target.style.display = "none"} />}
                        <div>
                          <div style={{ fontWeight: 600, color: "var(--text)", lineHeight: 1.4 }}>{post.h1}</div>
                          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>
                            {post.slug} · {hasSections ? `${post.sections.length} sektioner` : <span style={{ color: "#ef4444" }}>Inget innehåll</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: catColor + "18", color: catColor }}>
                        {post.category}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", color: "var(--muted)", fontSize: 12 }}>
                      {new Date(publishDate).toLocaleDateString("sv-SE", { weekday: "short", day: "numeric", month: "short" })}
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: st.bg, color: st.color, border: `1px solid ${st.color}40` }}>
                        {st.label}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right", display: "flex", gap: 6, justifyContent: "flex-end", alignItems: "center" }}>
                      <button
                        onClick={() => {
                          const token = localStorage.getItem("adminToken") || "marmorskivan-admin";
                          window.open(`/blogg/${post.slug}?preview=${encodeURIComponent(token)}`, "_blank");
                        }}
                        style={{ fontSize: 12, padding: "4px 10px", borderRadius: 8, border: "1px solid var(--border)", color: "var(--text)", background: "var(--surface)", cursor: "pointer", whiteSpace: "nowrap" }}
                        title="Förhandsgranska utan att publicera">
                        👁 Visa
                      </button>
                      <button className="btn-secondary" style={{ fontSize: 12, padding: "4px 10px" }} title="Synka sektioner från blog-posts.json" onClick={() => syncFromJson(post)}>
                        ↻ Synka
                      </button>
                      <button className="btn-secondary" style={{ fontSize: 12, padding: "4px 12px" }} onClick={() => setEditPost(post)}>
                        Redigera
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Inga inlägg matchar filtret.</div>}
        </div>
      )}

      {editPost && <BlogEditModal post={editPost} onSave={save} onClose={() => setEditPost(null)} />}
    </div>
  );
}
