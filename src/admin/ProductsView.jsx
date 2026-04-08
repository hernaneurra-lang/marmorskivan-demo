// src/admin/ProductsView.jsx — Produkt-analytics: material, tillval, konvertering
import { useState, useEffect } from "react";

// ── SVG Donut chart ──────────────────────────────────────────────────────────
function Donut({ value, max, color, label, sublabel, size = 110 }) {
  const r = 40;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? Math.min(value / max, 1) : 0;
  const dash = pct * circ;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="var(--border)" strokeWidth="12" />
        <circle
          cx="50" cy="50" r={r} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={`${dash} ${circ}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.6s ease" }}
        />
        <text x="50" y="46" textAnchor="middle" fill="var(--text)" fontSize="16" fontWeight="700">{Math.round(pct * 100)}%</text>
        <text x="50" y="60" textAnchor="middle" fill="var(--muted)" fontSize="8">{value.toLocaleString("sv-SE")}</text>
      </svg>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{label}</div>
        {sublabel && <div style={{ fontSize: 11, color: "var(--muted)" }}>{sublabel}</div>}
      </div>
    </div>
  );
}

// ── Horisontell rankingslista med bar ────────────────────────────────────────
function RankList({ items, nameKey, countKey, color, onDrilldown, emptyText = "Ingen data ännu" }) {
  if (!items?.length) return <div style={{ color: "var(--muted)", fontSize: 13, padding: "12px 0" }}>{emptyText}</div>;
  const max = Math.max(...items.map(i => Number(i[countKey])), 1);
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
      {items.map((item, i) => (
        <li key={item[nameKey] + i}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid var(--border)", cursor: onDrilldown ? "pointer" : "default" }}
          onClick={() => onDrilldown?.(item)}>
          <span style={{ color: "var(--muted)", fontSize: 12, width: 22, flexShrink: 0, fontWeight: 600 }}>#{i + 1}</span>
          <span style={{ flex: 1, fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item[nameKey]}</span>
          <div style={{ width: 80, height: 6, background: "var(--border)", borderRadius: 3, flexShrink: 0 }}>
            <div style={{ width: `${Math.round(Number(item[countKey]) / max * 100)}%`, height: "100%", background: color, borderRadius: 3, transition: "width 0.4s" }} />
          </div>
          <span style={{ color: "var(--muted)", fontSize: 12, width: 30, textAlign: "right", flexShrink: 0 }}>{item[countKey]}</span>
        </li>
      ))}
    </ul>
  );
}

// ── Drilldown modal ──────────────────────────────────────────────────────────
function DrillModal({ kpi, label, period, headers, apiBase, onClose }) {
  const [rows, setRows] = useState(null);
  const [cols, setCols] = useState([]);

  useEffect(() => {
    fetch(`${apiBase}/api/admin/analytics/drilldown?kpi=${kpi}&period=${period}`, { headers })
      .then(r => r.json())
      .then(d => { setCols(d.columns || []); setRows(d.rows || []); })
      .catch(() => setRows([]));
  }, [kpi, period]);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.65)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}>
      <div style={{ background: "var(--surface)", borderRadius: 16, width: "100%", maxWidth: 860, maxHeight: "82vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{label}</div>
            <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>{rows?.length ?? "…"} rader · senaste {period}</div>
          </div>
          <button onClick={onClose} style={{ background: "var(--border)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "var(--text)" }}>✕</button>
        </div>
        <div style={{ overflow: "auto", flex: 1 }}>
          {!rows ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Laddar…</div>
          ) : rows.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Ingen data för perioden</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--border)", position: "sticky", top: 0 }}>
                  {cols.map(c => <th key={c} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, whiteSpace: "nowrap" }}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "var(--border)" + "22" }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: "7px 12px", whiteSpace: j === 0 ? "nowrap" : "normal" }}>
                        {j === 0 && cell
                          ? new Date(cell).toLocaleString("sv-SE", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
                          : cell ?? "—"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Huvud-vy ─────────────────────────────────────────────────────────────────
export default function ProductsView({ headers, apiBase }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  const [drill, setDrill] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch(`${apiBase}/api/admin/analytics?period=${period}`, { headers })
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  const PERIODS = [
    { value: "24h", label: "24 tim" },
    { value: "7d",  label: "7 dagar" },
    { value: "30d", label: "30 dagar" },
    { value: "90d", label: "90 dagar" },
  ];

  const pv        = Number(data?.totalPageViews || 0);
  const calc      = Number(data?.calculatorOpens || 0);
  const matSel    = (data?.topMaterials || []).reduce((s, r) => s + Number(r.selections), 0);
  const offerOpen = Number(data?.offerOpens || 0);
  const offer     = Number(data?.offerSubmits || 0);
  const pvSeen    = Number(data?.priceViews || 0);

  // Bounce = pageviews with no further action
  const bounced   = Math.max(0, pv - calc - Number(data?.chatSessions || 0));
  const bounceRate = pv > 0 ? Math.round(bounced / pv * 100) : 0;
  const offerConv  = offerOpen > 0 ? Math.round(offer / offerOpen * 100) : 0;
  const calcConv   = calc > 0 ? Math.round(matSel / calc * 100) : 0;
  const priceDropoff = pvSeen > 0 ? Math.round((pvSeen - offerOpen) / pvSeen * 100) : 0;

  return (
    <>
      {drill && (
        <DrillModal
          kpi={drill.kpi} label={drill.label}
          period={period} headers={headers} apiBase={apiBase}
          onClose={() => setDrill(null)}
        />
      )}

      <div className="admin-topbar">
        <h1>🛍️ Produkter & Konvertering</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {PERIODS.map(p => (
            <button key={p.value} className={`period-btn${period === p.value ? " active" : ""}`} onClick={() => setPeriod(p.value)}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-content">
        {loading ? (
          <div style={{ color: "var(--muted)", padding: 40, textAlign: "center" }}>Laddar…</div>
        ) : (
          <>
            {/* ── Konverteringsringar ── */}
            <div className="admin-card">
              <div className="admin-card-title">📈 Konverteringsringar</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 32, justifyContent: "space-around", padding: "12px 0" }}>
                <Donut value={calc}      max={pv}        color="#f59e0b" label="Kalkylator" sublabel={`av ${pv.toLocaleString("sv-SE")} besökare`} />
                <Donut value={matSel}    max={calc}       color="#10b981" label="Material valt" sublabel={`av ${calc.toLocaleString("sv-SE")} kalkylatorer`} />
                <Donut value={pvSeen}    max={matSel}     color="#6366f1" label="Pris sett" sublabel={`av ${matSel.toLocaleString("sv-SE")} materialval`} />
                <Donut value={offerOpen} max={pvSeen}     color="#3b82f6" label="Offert öppnad" sublabel={`av ${pvSeen.toLocaleString("sv-SE")} prissedda`} />
                <Donut value={offer}     max={offerOpen}  color="#ef4444" label="Offert skickad" sublabel={`av ${offerOpen.toLocaleString("sv-SE")} öppnade`} />
              </div>
            </div>

            {/* ── Nyckeltal avhopp/konvertering ── */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
              {[
                { label: "Avhoppsfrekvens",        value: `${bounceRate}%`,    color: bounceRate > 60 ? "#ef4444" : "#10b981", sub: `${bounced} av ${pv}` },
                { label: "Kalkylator → Material",   value: `${calcConv}%`,      color: "#10b981",  sub: `${matSel} val` },
                { label: "Pris sett → Ej offert",   value: `${priceDropoff}%`,  color: priceDropoff > 70 ? "#ef4444" : "#f59e0b", sub: "tappad lead" },
                { label: "Offert → Skickad",        value: `${offerConv}%`,     color: offerConv > 50 ? "#10b981" : "#f59e0b", sub: `${offer} av ${offerOpen}` },
              ].map(kv => (
                <div key={kv.label} className="admin-kpi-card" style={{ flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
                  <div style={{ fontSize: 26, fontWeight: 800, color: kv.color }}>{kv.value}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{kv.label}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{kv.sub}</div>
                </div>
              ))}
            </div>

            {/* ── Top material + tillval ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>

              {/* Top 20 material */}
              <div className="admin-card" style={{ cursor: "pointer" }} onClick={() => setDrill({ kpi: "offers", label: "Material — offerter" })}>
                <div className="admin-card-title">🪨 Top 20 klickade material
                  <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400, marginLeft: 8 }}>klicka för detaljer</span>
                </div>
                <RankList
                  items={data?.topMaterials || []}
                  nameKey="material" countKey="selections"
                  color="#10b981"
                />
              </div>

              {/* Tillval kolumn */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

                <div className="admin-card" style={{ cursor: "pointer" }} onClick={() => setDrill({ kpi: "accessories_sink", label: "Diskhoar — detaljer" })}>
                  <div className="admin-card-title">🚰 Top diskhoar
                    <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400, marginLeft: 8 }}>klicka för detaljer</span>
                  </div>
                  <RankList
                    items={(data?.topAccessories || []).filter(a => a.type === "sink")}
                    nameKey="name" countKey="selections"
                    color="#3b82f6"
                    emptyText="Inga diskhoar valda ännu"
                  />
                </div>

                <div className="admin-card" style={{ cursor: "pointer" }} onClick={() => setDrill({ kpi: "accessories_faucet", label: "Kranar — detaljer" })}>
                  <div className="admin-card-title">🔧 Top kranar
                    <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400, marginLeft: 8 }}>klicka för detaljer</span>
                  </div>
                  <RankList
                    items={(data?.topAccessories || []).filter(a => a.type === "faucet")}
                    nameKey="name" countKey="selections"
                    color="#8b5cf6"
                    emptyText="Inga kranar valda ännu"
                  />
                </div>

                <div className="admin-card" style={{ cursor: "pointer" }} onClick={() => setDrill({ kpi: "accessories_hob", label: "Hällar — detaljer" })}>
                  <div className="admin-card-title">🔥 Top hällar
                    <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400, marginLeft: 8 }}>klicka för detaljer</span>
                  </div>
                  <RankList
                    items={(data?.topAccessories || []).filter(a => a.type === "hob")}
                    nameKey="name" countKey="selections"
                    color="#f59e0b"
                    emptyText="Inga hällar valda ännu"
                  />
                </div>

              </div>
            </div>

            {/* ── Köksrenderingar per material ── */}
            {data?.kitchenRenders > 0 && (
              <div className="admin-card" style={{ cursor: "pointer" }} onClick={() => setDrill({ kpi: "renders", label: "Köksrenderingar — detaljer" })}>
                <div className="admin-card-title">✨ Köksrenderingar
                  <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400, marginLeft: 8 }}>klicka för detaljer</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "8px 0" }}>
                  <div style={{ fontSize: 36, fontWeight: 800, color: "#a855f7" }}>{data.kitchenRenders}</div>
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>
                    renderingar gjorda · {calc > 0 ? Math.round(data.kitchenRenders / calc * 100) : 0}% av kalkylatorsessioner
                  </div>
                </div>
              </div>
            )}

          </>
        )}
      </div>
    </>
  );
}
