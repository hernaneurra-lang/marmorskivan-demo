// src/admin/StoreView.jsx — Product management: stenar, tillval, kampanjer
import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "./AdminPage.jsx";

// Image field with preview — paste URL after FTP upload to Loopia
function ImageUploader({ value, onChange }) {
  const src = value || null;
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text)", opacity: 0.75, display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        Bild
      </label>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{
          width: 100, height: 76, borderRadius: 8, border: "1px solid var(--border)",
          background: "var(--surface2)", flexShrink: 0, overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          {src
            ? <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
            : <span style={{ fontSize: 28, opacity: 0.25 }}>🖼️</span>
          }
        </div>
        <div style={{ flex: 1 }}>
          <input
            className="admin-input"
            style={{ marginBottom: 4, fontSize: 12 }}
            placeholder="/materials/Bild.jpg  eller  /products/Bild.jpg"
            value={src || ""}
            onChange={e => onChange(e.target.value)}
          />
          <div style={{ fontSize: 11, color: "var(--muted)" }}>
            Ladda upp via FTP till Loopia → klistra in sökvägen ovan
          </div>
        </div>
      </div>
    </div>
  );
}

const STATUS_LABELS = {
  available: { label: "Aktiv",      color: "#22c55e" },
  paused:    { label: "Pausad",     color: "#f59e0b" },
  inactive:  { label: "Inaktiv",    color: "#6b7280" },
};

const SORT_OPTIONS = [
  { value: "smart",        label: "Smart (rekommenderat)" },
  { value: "search_count", label: "Mest sökt" },
  { value: "price",        label: "Pris stigande" },
  { value: "name",         label: "Namn A–Ö" },
  { value: "sort_order",   label: "Manuell ordning" },
];

const TYPE_LABELS = { sink: "Diskho", faucet: "Kran", hob: "Häll" };

// ── Shared helpers ──────────────────────────────────────────────

function Badge({ color, children }) {
  return (
    <span style={{
      display: "inline-block", padding: "2px 8px", borderRadius: 10,
      fontSize: 11, fontWeight: 600, background: color + "22", color,
    }}>
      {children}
    </span>
  );
}

function Confirm({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.88)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
    }}>
      <div style={{ background: "var(--card)", borderRadius: 12, padding: 28, maxWidth: 380, textAlign: "center" }}>
        <p style={{ marginBottom: 20, color: "var(--text)" }}>{message}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button className="btn-danger" onClick={onConfirm}>Ja, ta bort</button>
          <button className="admin-btn-secondary" onClick={onCancel}>Avbryt</button>
        </div>
      </div>
    </div>
  );
}

// ── STONES TAB ──────────────────────────────────────────────────

function StonesTab({ headers, apiBase }) {
  const toast = useToast();
  const [products, setProducts]   = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(false);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters]     = useState({ category: "", status: "", search: "", sort: "smart", has_price: "", has_image: "" });
  const [page, setPage]           = useState(0);
  const [editing, setEditing]     = useState(null); // product object or null
  const [adding, setAdding]       = useState(false);
  const [confirm, setConfirm]     = useState(null); // { id, name }
  const PAGE_SIZE = 50;

  const load = useCallback(async (f = filters, p = page) => {
    setLoading(true);
    try {
      const q = new URLSearchParams({
        ...f, limit: PAGE_SIZE, offset: p * PAGE_SIZE,
      });
      const res = await fetch(`${apiBase}/api/admin/products?${q}`, { headers });
      const data = await res.json();
      setProducts(data.products || []);
      setTotal(data.total || 0);
    } catch (e) {
      toast("Kunde inte ladda produkter", "error", "❌");
    } finally {
      setLoading(false);
    }
  }, [filters, page, apiBase, headers, toast]);

  useEffect(() => {
    load();
    fetch(`${apiBase}/api/admin/products/categories`, { headers })
      .then(r => r.json()).then(setCategories).catch(() => {});
  }, []);

  function applyFilters(f) {
    setFilters(f);
    setPage(0);
    load(f, 0);
  }

  async function patchProduct(id, patch) {
    try {
      const res = await fetch(`${apiBase}/api/admin/products/${id}`, {
        method: "PATCH", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setProducts(prev => prev.map(p => p.id === id ? updated : p));
      toast("Sparad", "success", "✅");
      setEditing(null);
    } catch (e) {
      toast(e.message, "error", "❌");
    }
  }

  async function deleteProduct(id) {
    try {
      await fetch(`${apiBase}/api/admin/products/${id}`, { method: "DELETE", headers });
      setProducts(prev => prev.filter(p => p.id !== id));
      setTotal(t => t - 1);
      toast("Produkt borttagen", "success", "🗑️");
    } catch (e) {
      toast(e.message, "error", "❌");
    } finally {
      setConfirm(null);
    }
  }

  async function createProduct(data) {
    try {
      const res = await fetch(`${apiBase}/api/admin/products`, {
        method: "POST", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        let msg;
        try { msg = (await res.json()).error; } catch { msg = await res.text(); }
        if (msg?.includes("unique") && msg?.includes("slug")) {
          msg = `Slug "${data.slug}" används redan — ändra slug-fältet till något unikt.`;
        }
        throw new Error(msg);
      }
      toast("Produkt skapad", "success", "✅");
      setAdding(false);
      load();
    } catch (e) {
      toast(e.message, "error", "❌");
    }
  }

  return (
    <div>
      {/* Filters bar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        <input
          className="admin-input"
          style={{ width: 200, marginBottom: 0 }}
          placeholder="Sök material…"
          value={filters.search}
          onChange={e => applyFilters({ ...filters, search: e.target.value })}
        />
        <select
          className="admin-input"
          style={{ width: 160, marginBottom: 0 }}
          value={filters.category}
          onChange={e => applyFilters({ ...filters, category: e.target.value })}
        >
          <option value="">Alla kategorier</option>
          {categories.map(c => (
            <option key={c.category} value={c.category}>{c.category} ({c.n})</option>
          ))}
        </select>
        <select
          className="admin-input"
          style={{ width: 140, marginBottom: 0 }}
          value={filters.status}
          onChange={e => applyFilters({ ...filters, status: e.target.value })}
        >
          <option value="">Alla statusar</option>
          <option value="available">Aktiv</option>
          <option value="paused">Pausad</option>
          <option value="inactive">Inaktiv</option>
        </select>
        <select
          className="admin-input"
          style={{ width: 190, marginBottom: 0 }}
          value={filters.sort}
          onChange={e => applyFilters({ ...filters, sort: e.target.value })}
        >
          {SORT_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          className="admin-input"
          style={{ width: 150, marginBottom: 0 }}
          value={filters.has_price}
          onChange={e => applyFilters({ ...filters, has_price: e.target.value })}
        >
          <option value="">Alla priser</option>
          <option value="yes">Har pris</option>
          <option value="no">Saknar pris</option>
        </select>
        <select
          className="admin-input"
          style={{ width: 150, marginBottom: 0 }}
          value={filters.has_image}
          onChange={e => applyFilters({ ...filters, has_image: e.target.value })}
        >
          <option value="">Alla bilder</option>
          <option value="yes">Har bild</option>
          <option value="no">Saknar bild</option>
        </select>
        <button className="btn-primary" onClick={() => setAdding(true)}>+ Lägg till sten</button>
      </div>

      <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 8 }}>
        {loading ? "Laddar…" : `${total} produkter totalt — visar ${products.length}`}
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--muted)" }}>
              <th style={{ textAlign: "left", padding: "6px 8px", width: 48 }}>Bild</th>
              <th style={{ textAlign: "left", padding: "6px 8px" }}>Namn</th>
              <th style={{ textAlign: "left", padding: "6px 8px" }}>Kategori</th>
              <th style={{ textAlign: "left", padding: "6px 8px" }}>Tjocklek</th>
              <th style={{ textAlign: "left", padding: "6px 8px" }}>Pris</th>
              <th style={{ textAlign: "left", padding: "6px 8px" }}>Status</th>
              <th style={{ textAlign: "left", padding: "6px 8px" }}>⭐ Utv.</th>
              <th style={{ textAlign: "left", padding: "6px 8px" }}>Ordning</th>
              <th style={{ textAlign: "left", padding: "6px 8px" }}>Sök</th>
              <th style={{ textAlign: "right", padding: "6px 8px" }}>Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "4px 8px" }}>
                  {p.image ? (
                    <div style={{ position: "relative", width: 40, height: 32 }}>
                      <img
                        src={p.image} alt=""
                        style={{ width: 40, height: 32, objectFit: "cover", borderRadius: 4 }}
                        onError={e => {
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextSibling.style.display = "flex";
                        }}
                      />
                      <div style={{ display: "none", position: "absolute", inset: 0, background: "#fef2f2", borderRadius: 4, alignItems: "center", justifyContent: "center", fontSize: 10, color: "#dc2626", border: "1px solid #fca5a5" }}>
                        404
                      </div>
                    </div>
                  ) : (
                    <div style={{ width: 40, height: 32, background: "var(--border)", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "var(--muted)" }}>
                      saknas
                    </div>
                  )}
                </td>
                <td style={{ padding: "4px 8px", color: "var(--text)", maxWidth: 200 }}>
                  <div style={{ fontWeight: 500 }}>{p.name}</div>
                  <div style={{ color: "var(--muted)", fontSize: 11 }}>{p.slug}</div>
                </td>
                <td style={{ padding: "4px 8px", color: "var(--muted)" }}>{p.category}</td>
                <td style={{ padding: "4px 8px", color: "var(--muted)" }}>{p.thickness_mm} mm</td>
                <td style={{ padding: "4px 8px", color: "var(--text)", whiteSpace: "nowrap" }}>
                  {p.price ? `${Math.round(p.price)} kr` : <span style={{ color: "var(--muted)" }}>—</span>}
                </td>
                <td style={{ padding: "4px 8px" }}>
                  <StatusSelect
                    value={p.status}
                    onChange={v => patchProduct(p.id, { status: v })}
                  />
                </td>
                <td style={{ padding: "4px 8px", textAlign: "center" }}>
                  <button
                    onClick={() => patchProduct(p.id, { featured: !p.featured })}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18 }}
                    title={p.featured ? "Ta bort utvald" : "Markera som utvald"}
                  >
                    {p.featured ? "⭐" : "☆"}
                  </button>
                </td>
                <td style={{ padding: "4px 8px" }}>
                  <InlineNumber
                    value={p.sort_order}
                    onSave={v => patchProduct(p.id, { sort_order: v })}
                  />
                </td>
                <td style={{ padding: "4px 8px", color: "var(--muted)" }}>{p.search_count}</td>
                <td style={{ padding: "4px 8px", textAlign: "right", whiteSpace: "nowrap" }}>
                  <button
                    className="admin-btn-secondary"
                    style={{ fontSize: 12, padding: "3px 10px" }}
                    onClick={() => setEditing(p)}
                  >
                    Redigera
                  </button>
                  <button
                    className="btn-danger"
                    style={{ fontSize: 12, padding: "3px 10px", marginLeft: 4 }}
                    onClick={() => setConfirm({ id: p.id, name: p.name })}
                  >
                    Ta bort
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > PAGE_SIZE && (
        <div style={{ display: "flex", gap: 8, marginTop: 16, justifyContent: "center" }}>
          {page > 0 && (
            <button className="admin-btn-secondary" onClick={() => { const p = page - 1; setPage(p); load(filters, p); }}>
              ← Föregående
            </button>
          )}
          <span style={{ color: "var(--muted)", lineHeight: "36px", fontSize: 13 }}>
            Sida {page + 1} av {Math.ceil(total / PAGE_SIZE)}
          </span>
          {(page + 1) * PAGE_SIZE < total && (
            <button className="admin-btn-secondary" onClick={() => { const p = page + 1; setPage(p); load(filters, p); }}>
              Nästa →
            </button>
          )}
        </div>
      )}

      {/* Edit modal */}
      {editing && (
        <ProductModal
          product={editing}
          onSave={patch => patchProduct(editing.id, patch)}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Add modal */}
      {adding && (
        <ProductModal
          product={null}
          onSave={createProduct}
          onClose={() => setAdding(false)}
        />
      )}

      {/* Delete confirm */}
      {confirm && (
        <Confirm
          message={`Ta bort "${confirm.name}"? Det går inte att ångra.`}
          onConfirm={() => deleteProduct(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

function StatusSelect({ value, onChange }) {
  const s = STATUS_LABELS[value] || STATUS_LABELS.available;
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        background: s.color + "22", color: s.color,
        border: `1px solid ${s.color}44`, borderRadius: 8,
        padding: "2px 6px", fontSize: 11, fontWeight: 600, cursor: "pointer",
      }}
    >
      {Object.entries(STATUS_LABELS).map(([v, { label }]) => (
        <option key={v} value={v}>{label}</option>
      ))}
    </select>
  );
}

function InlineNumber({ value, onSave }) {
  const [editing, setEditing] = useState(false);
  const [v, setV] = useState(value);
  if (!editing) {
    return (
      <span
        style={{ cursor: "pointer", color: "var(--muted)", textDecoration: "underline dotted" }}
        onClick={() => { setV(value); setEditing(true); }}
        title="Klicka för att ändra"
      >
        {value}
      </span>
    );
  }
  return (
    <input
      type="number"
      value={v}
      autoFocus
      style={{ width: 60, padding: "1px 4px", background: "var(--input)", color: "var(--text)", border: "1px solid var(--green)", borderRadius: 4, fontSize: 12 }}
      onChange={e => setV(e.target.value)}
      onBlur={() => { onSave(parseInt(v)); setEditing(false); }}
      onKeyDown={e => { if (e.key === "Enter") { onSave(parseInt(v)); setEditing(false); } if (e.key === "Escape") setEditing(false); }}
    />
  );
}

function toSlug(str) {
  return str.toLowerCase().trim()
    .replace(/[åä]/g, "a").replace(/ö/g, "o")
    .replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

const PRODUCT_LABEL_STYLE = { fontSize: 12, fontWeight: 600, color: "var(--text)", opacity: 0.75, display: "block", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.04em" };

function ProductField({ label, field, type, multiline, fullWidth, form, setForm }) {
  return (
    <div style={{ marginBottom: 14, gridColumn: fullWidth ? "1 / -1" : undefined }}>
      <label style={PRODUCT_LABEL_STYLE}>{label}</label>
      {multiline ? (
        <textarea
          className="reply-input"
          style={{ minHeight: 80, marginBottom: 0, width: "100%", boxSizing: "border-box" }}
          value={form[field]}
          onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        />
      ) : (
        <input
          className="admin-input"
          style={{ marginBottom: 0 }}
          type={type || "text"}
          value={form[field]}
          onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        />
      )}
    </div>
  );
}

function ProductModal({ product, onSave, onClose }) {
  const isNew = !product;
  const [form, setForm] = useState({
    slug:         product?.slug        || "",
    name:         product?.name        || "",
    base_name:    product?.base_name   || "",
    category:     product?.category    || "okänd",
    thickness_mm: product?.thickness_mm || 20,
    price:        product?.price        || "",
    edge_price:   product?.edge_price   || "",
    discount:     product?.discount     || 0,
    status:       product?.status       || "available",
    description:  product?.description  || "",
    pros:         product?.pros         || "",
    care:         product?.care         || "",
    supplier:     product?.supplier     || "",
    image:        product?.image        || "",
    featured:     product?.featured     || false,
    sort_order:   product?.sort_order   || 9999,
  });

  const labelStyle = PRODUCT_LABEL_STYLE;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.88)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9000,
    }}>
      <div style={{
        background: "var(--card)", borderRadius: 14, padding: 28,
        width: "min(96vw, 780px)", maxHeight: "92vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: "var(--text)" }}>
            {isNew ? "Lägg till sten" : `Redigera — ${product.name}`}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 22 }}>×</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
          <ProductField label="Namn" field="name" form={form} setForm={setForm} />
          <ProductField label="Basnamn" field="base_name" form={form} setForm={setForm} />
          {/* Slug — auto-genereras men visas alltid så användaren kan redigera vid konflikt */}
          <div style={{ marginBottom: 14, gridColumn: "1 / -1" }}>
            <label style={{ ...labelStyle, display: "flex", justifyContent: "space-between" }}>
              <span>Slug (unik ID)</span>
              {isNew && (
                <span
                  style={{ fontSize: 11, fontWeight: 400, cursor: "pointer", color: "var(--accent, #059669)", textTransform: "none" }}
                  onClick={() => setForm(f => ({ ...f, slug: `${toSlug(f.name || "produkt")}__${f.thickness_mm || 20}` }))}
                >↺ Auto-generera</span>
              )}
            </label>
            <input
              className="admin-input"
              style={{ marginBottom: 0, fontFamily: "monospace", fontSize: 13 }}
              value={form.slug || `${toSlug(form.name || "produkt")}__${form.thickness_mm || 20}`}
              onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
              placeholder="auto-genereras från namn + tjocklek"
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Kategori</label>
            {(() => {
              const CATS = ["marmor","granit","kvartsit","kvarts/komposit","keramik","porslin","kalksten","travertin","onyx","terrazzo","soapstone","dolomite"];
              const isCustom = form.category && !CATS.includes(form.category);
              return (
                <>
                  <select
                    className="admin-input" style={{ marginBottom: isCustom ? 6 : 0 }}
                    value={isCustom ? "__custom__" : (form.category || "")}
                    onChange={e => {
                      if (e.target.value === "__custom__") setForm(f => ({ ...f, category: "" }));
                      else setForm(f => ({ ...f, category: e.target.value }));
                    }}
                  >
                    <option value="">— Välj kategori —</option>
                    {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="__custom__">Annan (skriv eget)…</option>
                  </select>
                  {isCustom && (
                    <input
                      className="admin-input" style={{ marginBottom: 0 }}
                      value={form.category}
                      autoFocus
                      placeholder="Skriv kategorinamn"
                      onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    />
                  )}
                </>
              );
            })()}
          </div>
          <ProductField label="Tjocklek (mm)" field="thickness_mm" type="number" form={form} setForm={setForm} />
          <ProductField label="Pris (kr/m²)" field="price" type="number" form={form} setForm={setForm} />
          <ProductField label="Kantpris (kr/lm)" field="edge_price" type="number" form={form} setForm={setForm} />
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Status</label>
            <select
              className="admin-input" style={{ marginBottom: 0 }}
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            >
              {Object.entries(STATUS_LABELS).map(([v, { label }]) => (
                <option key={v} value={v}>{label}</option>
              ))}
            </select>
          </div>
          <ProductField label="Sorteringsordning" field="sort_order" type="number" form={form} setForm={setForm} />
          <div style={{ gridColumn: "1 / -1" }}>
            <ImageUploader
              value={form.image}
              onChange={v => setForm(f => ({ ...f, image: v }))}
            />
          </div>
          <ProductField label="Beskrivning" field="description" multiline fullWidth form={form} setForm={setForm} />
          <ProductField label="Fördelar" field="pros" multiline fullWidth form={form} setForm={setForm} />
          <ProductField label="Skötsel" field="care" multiline fullWidth form={form} setForm={setForm} />
          <ProductField label="Leverantör" field="supplier" fullWidth form={form} setForm={setForm} />
        </div>

        <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            id="feat-cb"
            checked={form.featured}
            onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
          />
          <label htmlFor="feat-cb" style={{ color: "var(--text)", fontSize: 13 }}>Utvald (visas överst)</label>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <button className="admin-btn-secondary" onClick={onClose}>Avbryt</button>
          <button className="btn-primary" onClick={() => {
            const numericFields = ["price", "edge_price", "discount", "thickness_mm", "sort_order"];
            const cleaned = { ...form };
            for (const f of numericFields) {
              if (cleaned[f] === "" || cleaned[f] === null || cleaned[f] === undefined) {
                cleaned[f] = null;
              }
            }
            // Ensure slug — fall back to auto-generate if field is empty
            if (!cleaned.slug) {
              cleaned.slug = `${toSlug(cleaned.name || "produkt")}__${cleaned.thickness_mm || 20}`;
            }
            onSave(cleaned);
          }}>
            {isNew ? "Skapa" : "Spara ändringar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ACCESSORIES TAB ─────────────────────────────────────────────

function AccessoriesTab({ headers, apiBase }) {
  const toast = useToast();
  const [tab, setTab]         = useState("sink");
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [adding, setAdding]   = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [search, setSearch]   = useState("");
  const [hasPrice, setHasPrice] = useState("");
  const [hasImage, setHasImage] = useState("");
  const [showActive, setShowActive] = useState("");

  const load = useCallback(async (t = tab) => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/admin/accessories?type=${t}`, { headers });
      setItems(await res.json());
    } finally {
      setLoading(false);
    }
  }, [tab, apiBase, headers]);

  useEffect(() => { load(); }, [tab]);

  const filtered = items.filter(item => {
    if (search) {
      const q = search.toLowerCase();
      if (!item.title?.toLowerCase().includes(q) && !item.brand?.toLowerCase().includes(q)) return false;
    }
    if (hasPrice === "yes" && !item.price) return false;
    if (hasPrice === "no"  &&  item.price) return false;
    if (hasImage === "yes" && !item.image) return false;
    if (hasImage === "no"  &&  item.image) return false;
    if (showActive === "yes" && !item.active) return false;
    if (showActive === "no"  &&  item.active) return false;
    return true;
  });

  async function patch(id, data) {
    try {
      const res = await fetch(`${apiBase}/api/admin/accessories/${id}`, {
        method: "PATCH", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      const updated = await res.json();
      setItems(prev => prev.map(i => i.id === id ? updated : i));
      toast("Sparad", "success", "✅");
      setEditing(null);
    } catch (e) {
      toast(e.message, "error", "❌");
    }
  }

  async function create(data) {
    try {
      const res = await fetch(`${apiBase}/api/admin/accessories`, {
        method: "POST", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, type: tab }),
      });
      if (!res.ok) throw new Error(await res.text());
      toast("Tillagd", "success", "✅");
      setAdding(false);
      load();
    } catch (e) {
      toast(e.message, "error", "❌");
    }
  }

  async function remove(id) {
    try {
      await fetch(`${apiBase}/api/admin/accessories/${id}`, { method: "DELETE", headers });
      setItems(prev => prev.filter(i => i.id !== id));
      toast("Borttagen", "success", "🗑️");
    } finally {
      setConfirm(null);
    }
  }

  return (
    <div>
      {/* Type tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => { setTab(key); setSearch(""); setHasPrice(""); setHasImage(""); setShowActive(""); }}
            style={{
              padding: "6px 18px", borderRadius: 8, border: "1px solid var(--border)",
              background: tab === key ? "var(--green)" : "var(--card)",
              color: tab === key ? "#fff" : "var(--text)",
              cursor: "pointer", fontWeight: 600, fontSize: 14,
            }}
          >
            {label}
          </button>
        ))}
        <button className="btn-primary" style={{ marginLeft: "auto" }} onClick={() => setAdding(true)}>
          + Lägg till {TYPE_LABELS[tab].toLowerCase()}
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
        <input
          className="admin-input"
          style={{ width: 220, marginBottom: 0 }}
          placeholder={`Sök ${TYPE_LABELS[tab].toLowerCase()}…`}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="admin-input" style={{ width: 150, marginBottom: 0 }} value={hasPrice} onChange={e => setHasPrice(e.target.value)}>
          <option value="">Alla priser</option>
          <option value="yes">Har pris</option>
          <option value="no">Saknar pris</option>
        </select>
        <select className="admin-input" style={{ width: 150, marginBottom: 0 }} value={hasImage} onChange={e => setHasImage(e.target.value)}>
          <option value="">Alla bilder</option>
          <option value="yes">Har bild</option>
          <option value="no">Saknar bild</option>
        </select>
        <select className="admin-input" style={{ width: 140, marginBottom: 0 }} value={showActive} onChange={e => setShowActive(e.target.value)}>
          <option value="">Alla statusar</option>
          <option value="yes">Aktiva</option>
          <option value="no">Inaktiva</option>
        </select>
      </div>

      <div style={{ color: "var(--muted)", fontSize: 13, marginBottom: 8 }}>
        {loading ? "Laddar…" : `${items.length} totalt — visar ${filtered.length}`}
      </div>

      {loading ? null : (
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--muted)" }}>
              <th style={{ textAlign: "left", padding: "6px 8px", width: 52 }}>Bild</th>
              <th style={{ textAlign: "left", padding: "6px 8px" }}>Namn</th>
              <th style={{ textAlign: "left", padding: "6px 8px" }}>Märke</th>
              <th style={{ textAlign: "left", padding: "6px 8px" }}>Pris</th>
              <th style={{ textAlign: "left", padding: "6px 8px" }}>Aktiv</th>
              <th style={{ textAlign: "left", padding: "6px 8px" }}>Ordning</th>
              <th style={{ textAlign: "right", padding: "6px 8px" }}>Åtgärder</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "4px 8px" }}>
                  {item.image
                    ? <img src={item.image} alt="" style={{ width: 44, height: 36, objectFit: "contain", borderRadius: 4, background: "var(--bg)" }} />
                    : <div style={{ width: 44, height: 36, background: "var(--border)", borderRadius: 4 }} />
                  }
                </td>
                <td style={{ padding: "4px 8px", color: "var(--text)", fontWeight: 500 }}>{item.title}</td>
                <td style={{ padding: "4px 8px", color: "var(--muted)" }}>{item.brand || "—"}</td>
                <td style={{ padding: "4px 8px", color: "var(--text)" }}>
                  {item.price ? `${Math.round(item.price)} kr` : "—"}
                </td>
                <td style={{ padding: "4px 8px" }}>
                  <button
                    onClick={() => patch(item.id, { active: !item.active })}
                    style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18 }}
                  >
                    {item.active ? "✅" : "⛔"}
                  </button>
                </td>
                <td style={{ padding: "4px 8px" }}>
                  <InlineNumber value={item.sort_order} onSave={v => patch(item.id, { sort_order: v })} />
                </td>
                <td style={{ padding: "4px 8px", textAlign: "right" }}>
                  <button
                    className="admin-btn-secondary"
                    style={{ fontSize: 12, padding: "3px 10px" }}
                    onClick={() => setEditing(item)}
                  >
                    Redigera
                  </button>
                  <button
                    className="btn-danger"
                    style={{ fontSize: 12, padding: "3px 10px", marginLeft: 4 }}
                    onClick={() => setConfirm({ id: item.id, name: item.title })}
                  >
                    Ta bort
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing && (
        <AccessoryModal item={editing} type={tab} onSave={d => patch(editing.id, d)} onClose={() => setEditing(null)} />
      )}
      {adding && (
        <AccessoryModal item={null} type={tab} onSave={create} onClose={() => setAdding(false)} />
      )}
      {confirm && (
        <Confirm
          message={`Ta bort "${confirm.name}"?`}
          onConfirm={() => remove(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

function AccessoryModal({ item, type, onSave, onClose }) {
  const isNew = !item;
  const [form, setForm] = useState({
    slug:       item?.slug       || "",
    title:      item?.title      || "",
    brand:      item?.brand      || "",
    image:      item?.image      || "",
    price:      item?.price      || "",
    active:     item?.active !== false,
    sort_order: item?.sort_order || 9999,
    intro_text: item?.intro_text || "",
  });

  function Field({ label, field, type: t = "text" }) {
    return (
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>{label}</label>
        <input
          className="admin-input" style={{ marginBottom: 0 }}
          type={t} value={form[field]}
          onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        />
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.88)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9000,
    }}>
      <div style={{
        background: "var(--card)", borderRadius: 14, padding: 28,
        width: "min(96vw, 480px)", maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: "var(--text)" }}>
            {isNew ? `Ny ${TYPE_LABELS[type]?.toLowerCase()}` : `Redigera — ${item.title}`}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 22 }}>×</button>
        </div>
        <Field label="Namn" field="title" />
        <Field label="Märke / Tillverkare" field="brand" />
        <ImageUploader
          value={form.image}
          onChange={v => setForm(f => ({ ...f, image: v }))}
        />
        <Field label="Pris (kr)" field="price" type="number" />
        <Field label="Sorteringsordning" field="sort_order" type="number" />
        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>Beskrivning</label>
          <textarea
            className="reply-input"
            style={{ minHeight: 60, marginBottom: 0, width: "100%" }}
            value={form.intro_text}
            onChange={e => setForm(f => ({ ...f, intro_text: e.target.value }))}
          />
        </div>
        <div style={{ marginBottom: 12, display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" id="acc-active" checked={form.active} onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
          <label htmlFor="acc-active" style={{ color: "var(--text)", fontSize: 13 }}>Aktiv i katalogen</label>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
          <button className="admin-btn-secondary" onClick={onClose}>Avbryt</button>
          <button className="btn-primary" onClick={() => {
            const saved = { ...form };
            if (isNew && !saved.slug) {
              saved.slug = `${type}-${toSlug(saved.title || "tillval")}-${Date.now()}`;
            }
            if (saved.price === "") saved.price = null;
            onSave(saved);
          }}>
            {isNew ? "Skapa" : "Spara"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CAMPAIGNS TAB ───────────────────────────────────────────────

function CampaignsTab({ headers, apiBase }) {
  const toast = useToast();
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading]    = useState(false);
  const [adding, setAdding]      = useState(false);
  const [editing, setEditing]    = useState(null);
  const [confirm, setConfirm]    = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/admin/campaigns`, { headers });
      setCampaigns(await res.json());
    } finally {
      setLoading(false);
    }
  }, [apiBase, headers]);

  useEffect(() => { load(); }, []);

  async function save(data, id) {
    try {
      const url    = id ? `${apiBase}/api/admin/campaigns/${id}` : `${apiBase}/api/admin/campaigns`;
      const method = id ? "PATCH" : "POST";
      const res = await fetch(url, {
        method, headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error(await res.text());
      toast(id ? "Uppdaterad" : "Kampanj skapad", "success", "✅");
      setAdding(false);
      setEditing(null);
      load();
    } catch (e) {
      toast(e.message, "error", "❌");
    }
  }

  async function remove(id) {
    try {
      await fetch(`${apiBase}/api/admin/campaigns/${id}`, { method: "DELETE", headers });
      setCampaigns(prev => prev.filter(c => c.id !== id));
      toast("Kampanj borttagen", "success", "🗑️");
    } finally {
      setConfirm(null);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
        <button className="btn-primary" onClick={() => setAdding(true)}>+ Ny kampanj</button>
      </div>

      {loading ? <p style={{ color: "var(--muted)" }}>Laddar…</p> : (
        campaigns.length === 0
          ? <p style={{ color: "var(--muted)", textAlign: "center", marginTop: 40 }}>Inga kampanjer ännu.</p>
          : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--muted)" }}>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Namn</th>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Rabatt</th>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Gäller</th>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Period</th>
                  <th style={{ textAlign: "left", padding: "6px 8px" }}>Aktiv</th>
                  <th style={{ textAlign: "right", padding: "6px 8px" }}>Åtgärder</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map(c => {
                  const now = new Date();
                  const from = c.valid_from ? new Date(c.valid_from) : null;
                  const to   = c.valid_to   ? new Date(c.valid_to)   : null;
                  const live = c.active && (!from || from <= now) && (!to || to >= now);
                  return (
                    <tr key={c.id} style={{ borderBottom: "1px solid var(--border)" }}>
                      <td style={{ padding: "6px 8px", color: "var(--text)", fontWeight: 500 }}>
                        {c.name}
                        {c.description && <div style={{ color: "var(--muted)", fontSize: 11 }}>{c.description}</div>}
                      </td>
                      <td style={{ padding: "6px 8px" }}>
                        <Badge color="#22c55e">{c.discount_pct}%</Badge>
                      </td>
                      <td style={{ padding: "6px 8px", color: "var(--muted)" }}>{c.applies_to}</td>
                      <td style={{ padding: "6px 8px", color: "var(--muted)", fontSize: 11 }}>
                        {from ? from.toLocaleDateString("sv-SE") : "—"} →{" "}
                        {to   ? to.toLocaleDateString("sv-SE")   : "∞"}
                      </td>
                      <td style={{ padding: "6px 8px" }}>
                        {live
                          ? <Badge color="#22c55e">Aktiv</Badge>
                          : c.active
                            ? <Badge color="#f59e0b">Schemalagd</Badge>
                            : <Badge color="#6b7280">Inaktiv</Badge>
                        }
                      </td>
                      <td style={{ padding: "6px 8px", textAlign: "right" }}>
                        <button
                          className="admin-btn-secondary"
                          style={{ fontSize: 12, padding: "3px 10px" }}
                          onClick={() => setEditing(c)}
                        >
                          Redigera
                        </button>
                        <button
                          className="btn-danger"
                          style={{ fontSize: 12, padding: "3px 10px", marginLeft: 4 }}
                          onClick={() => setConfirm({ id: c.id, name: c.name })}
                        >
                          Ta bort
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )
      )}

      {(adding || editing) && (
        <CampaignModal
          campaign={editing}
          onSave={data => save(data, editing?.id)}
          onClose={() => { setAdding(false); setEditing(null); }}
        />
      )}
      {confirm && (
        <Confirm
          message={`Ta bort kampanjen "${confirm.name}"?`}
          onConfirm={() => remove(confirm.id)}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}

function CampaignModal({ campaign, onSave, onClose }) {
  const isNew = !campaign;
  const [form, setForm] = useState({
    name:         campaign?.name         || "",
    description:  campaign?.description  || "",
    discount_pct: campaign?.discount_pct || 0,
    applies_to:   campaign?.applies_to   || "all",
    valid_from:   campaign?.valid_from ? campaign.valid_from.split("T")[0] : "",
    valid_to:     campaign?.valid_to   ? campaign.valid_to.split("T")[0]   : "",
    active:       campaign?.active !== false,
  });

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.88)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9000,
    }}>
      <div style={{
        background: "var(--card)", borderRadius: 14, padding: 28,
        width: "min(96vw, 440px)", maxHeight: "90vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: "var(--text)" }}>
            {isNew ? "Ny kampanj" : `Redigera — ${campaign.name}`}
          </h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 22 }}>×</button>
        </div>

        {[
          { label: "Kampanjnamn", field: "name" },
          { label: "Beskrivning", field: "description" },
        ].map(({ label, field }) => (
          <div key={field} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>{label}</label>
            <input className="admin-input" style={{ marginBottom: 0 }} value={form[field]}
              onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
          </div>
        ))}

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>Rabatt (%)</label>
          <input className="admin-input" style={{ marginBottom: 0 }} type="number" min="0" max="100" step="0.5"
            value={form.discount_pct} onChange={e => setForm(f => ({ ...f, discount_pct: e.target.value }))} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>Gäller för</label>
          <select className="admin-input" style={{ marginBottom: 0 }} value={form.applies_to}
            onChange={e => setForm(f => ({ ...f, applies_to: e.target.value }))}>
            <option value="all">Alla produkter</option>
            <option value="marmor">Marmor</option>
            <option value="granit">Granit</option>
            <option value="kvartsit">Kvartsit</option>
            <option value="kvarts/komposit">Kvarts/komposit</option>
            <option value="keramik">Keramik</option>
            <option value="accessories">Tillval</option>
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
          {[["Giltig från", "valid_from"], ["Giltig till", "valid_to"]].map(([label, field]) => (
            <div key={field}>
              <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>{label}</label>
              <input className="admin-input" style={{ marginBottom: 0 }} type="date"
                value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
          <input type="checkbox" id="camp-active" checked={form.active}
            onChange={e => setForm(f => ({ ...f, active: e.target.checked }))} />
          <label htmlFor="camp-active" style={{ color: "var(--text)", fontSize: 13 }}>Aktiv</label>
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="admin-btn-secondary" onClick={onClose}>Avbryt</button>
          <button className="btn-primary" onClick={() => onSave(form)}>
            {isNew ? "Skapa kampanj" : "Spara ändringar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ROOT COMPONENT ──────────────────────────────────────────────

const TABS = [
  { key: "stones",      label: "🪨 Stenar" },
  { key: "accessories", label: "🔧 Tillval" },
  { key: "campaigns",   label: "🏷️ Kampanjer" },
];

export default function StoreView({ headers, apiBase }) {
  const [tab, setTab] = useState("stones");
  return (
    <div className="admin-view">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0, color: "var(--text)" }}>Produkthantering</h2>
      </div>

      {/* Image upload instruction banner */}
      <div style={{
        background: "rgba(245,158,11,0.10)",
        border: "1px solid rgba(245,158,11,0.35)",
        borderRadius: 10,
        padding: "12px 16px",
        marginBottom: 20,
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
        fontSize: 13,
        color: "var(--text)",
        lineHeight: 1.55,
      }}>
        <span style={{ fontSize: 20, flexShrink: 0 }}>📂</span>
        <div>
          <strong>Bilder måste laddas upp till servern via FTP innan du lägger till dem här.</strong>
          {" "}Använd WinSCP och ladda upp bildfilen till mappen{" "}
          <code style={{ background: "rgba(245,158,11,0.15)", padding: "1px 5px", borderRadius: 4, fontSize: 12 }}>/materials/</code>
          {" "}(stenar) eller{" "}
          <code style={{ background: "rgba(245,158,11,0.15)", padding: "1px 5px", borderRadius: 4, fontSize: 12 }}>/products/</code>
          {" "}(diskhoar, kranar, hällar) på Loopia-servern.
          {" "}Ange sedan sökvägen i bildrutafältet, t.ex.{" "}
          <code style={{ background: "rgba(245,158,11,0.15)", padding: "1px 5px", borderRadius: 4, fontSize: 12 }}>/materials/Adamina.jpg</code>.
          {" "}Bilder som inte finns på servern kommer att visas som tomma.
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "2px solid var(--border)", paddingBottom: 0 }}>
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              padding: "8px 20px", border: "none", background: "none",
              borderBottom: tab === t.key ? "2px solid var(--green)" : "2px solid transparent",
              color: tab === t.key ? "var(--green)" : "var(--muted)",
              fontWeight: tab === t.key ? 700 : 400,
              cursor: "pointer", fontSize: 14, marginBottom: -2,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "stones"      && <StonesTab      headers={headers} apiBase={apiBase} />}
      {tab === "accessories" && <AccessoriesTab  headers={headers} apiBase={apiBase} />}
      {tab === "campaigns"   && <CampaignsTab    headers={headers} apiBase={apiBase} />}
    </div>
  );
}
