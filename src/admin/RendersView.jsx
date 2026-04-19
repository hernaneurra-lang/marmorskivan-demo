// src/admin/RendersView.jsx
import { useState, useEffect } from "react";

const MODE_LABEL = { mask: "Mask (målad)", edit: "Foto (AI)", generate: "Genererad" };
const FLAG = (cc) => cc ? String.fromCodePoint(...[...cc.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65)) : "";

function parseBrowser(ua) {
  if (!ua) return null;
  if (/Edg\//.test(ua)) return "Edge";
  if (/OPR\/|Opera/.test(ua)) return "Opera";
  if (/Chrome\//.test(ua) && /Safari\//.test(ua)) return "Chrome";
  if (/Firefox\//.test(ua)) return "Firefox";
  if (/Safari\//.test(ua) && !/Chrome/.test(ua)) return "Safari";
  return "Övrigt";
}
function parseOS(ua) {
  if (!ua) return null;
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  if (/Android/.test(ua)) return "Android";
  if (/Windows/.test(ua)) return "Windows";
  if (/Mac OS X/.test(ua)) return "macOS";
  if (/Linux/.test(ua)) return "Linux";
  return null;
}

function fmt(ts) {
  if (!ts) return "–";
  const d = new Date(ts);
  return d.toLocaleDateString("sv-SE") + " " + d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
}

function StatCard({ label, value, sub }) {
  return (
    <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 12, padding: "16px 20px", minWidth: 120 }}>
      <div style={{ fontSize: 24, fontWeight: 700, color: "var(--accent)" }}>{value}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)", marginTop: 2 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

export default function RendersView({ headers, apiBase }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all | mask | edit | generate

  useEffect(() => {
    fetch(`${apiBase}/api/admin/renders?limit=300`, { headers })
      .then(r => r.json())
      .then(data => { setRows(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const filtered = filter === "all" ? rows : rows.filter(r => r.mode === filter);

  // Stats
  const total = rows.length;
  const withPhoto = rows.filter(r => r.mode !== "generate").length;
  const withGps = rows.filter(r => r.gps_lat).length;
  const orientFixed = rows.filter(r => r.orientation_corrected).length;

  // Top devices
  const deviceCount = {};
  rows.forEach(r => { if (r.device) deviceCount[r.device] = (deviceCount[r.device] || 0) + 1; });
  const topDevices = Object.entries(deviceCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Top cities
  const cityCount = {};
  rows.forEach(r => { if (r.city) { const k = `${r.city}||${r.country_code}`; cityCount[k] = (cityCount[k] || 0) + 1; } });
  const topCities = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  // Top browsers
  const browserCount = {};
  rows.forEach(r => { const b = parseBrowser(r.user_agent); if (b) browserCount[b] = (browserCount[b] || 0) + 1; });
  const topBrowsers = Object.entries(browserCount).sort((a, b) => b[1] - a[1]);

  // Unique IPs
  const uniqueIps = new Set(rows.map(r => r.ip).filter(Boolean)).size;

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ margin: "0 0 20px", fontSize: 22, fontWeight: 700 }}>🖼️ Renderingar</h2>

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard label="Totalt" value={total} />
        <StatCard label="Unika besökare" value={uniqueIps} sub="unika IP-adresser" />
        <StatCard label="Med foto" value={withPhoto} sub={`${total ? Math.round(withPhoto/total*100) : 0}%`} />
        <StatCard label="Med GPS" value={withGps} sub="EXIF-koordinater" />
        <StatCard label="Rotation fixad" value={orientFixed} sub="Auto-korrigerade foton" />
      </div>

      {/* Top devices + cities + browsers */}
      {(topDevices.length > 0 || topCities.length > 0 || topBrowsers.length > 0) && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
          {topDevices.length > 0 && (
            <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 14 }}>📱 Vanligaste enheter</div>
              {topDevices.map(([dev, cnt]) => (
                <div key={dev} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--fg)" }}>{dev}</span>
                  <span style={{ fontWeight: 600, color: "var(--accent)" }}>{cnt}</span>
                </div>
              ))}
            </div>
          )}
          {topCities.length > 0 && (
            <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 14 }}>📍 Städer (IP/GPS)</div>
              {topCities.map(([key, cnt]) => {
                const [city, cc] = key.split("||");
                return (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
                    <span style={{ color: "var(--fg)" }}>{FLAG(cc)} {city}</span>
                    <span style={{ fontWeight: 600, color: "var(--accent)" }}>{cnt}</span>
                  </div>
                );
              })}
            </div>
          )}
          {topBrowsers.length > 0 && (
            <div style={{ background: "var(--card-bg)", border: "1px solid var(--border)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 10, fontSize: 14 }}>🌐 Webbläsare</div>
              {topBrowsers.map(([br, cnt]) => (
                <div key={br} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
                  <span style={{ color: "var(--fg)" }}>{br}</span>
                  <span style={{ fontWeight: 600, color: "var(--accent)" }}>{cnt}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {["all", "mask", "edit", "generate"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, fontWeight: filter === f ? 700 : 400,
              background: filter === f ? "var(--accent)" : "var(--card-bg)", color: filter === f ? "#fff" : "var(--fg)", cursor: "pointer" }}>
            {f === "all" ? "Alla" : MODE_LABEL[f] || f}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--muted)" }}>Laddar…</div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, color: "var(--muted)" }}>Inga renderingar ännu.</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", textAlign: "left" }}>
                {["Tid", "Material", "Läge", "Enhet", "Webbläsare / OS", "Plats (IP/GPS)", "Bildstorlek", "Rotation fixad"].map(h => (
                  <th key={h} style={{ padding: "8px 12px", color: "var(--muted)", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "9px 12px", color: "var(--muted)", whiteSpace: "nowrap" }}>{fmt(r.created_at)}</td>
                  <td style={{ padding: "9px 12px", fontWeight: 500 }}>{r.material || "–"}</td>
                  <td style={{ padding: "9px 12px" }}>
                    <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: r.mode === "mask" ? "#d1fae5" : r.mode === "edit" ? "#dbeafe" : "#f3f4f6",
                      color: r.mode === "mask" ? "#065f46" : r.mode === "edit" ? "#1d4ed8" : "#374151" }}>
                      {MODE_LABEL[r.mode] || r.mode || "–"}
                    </span>
                  </td>
                  <td style={{ padding: "9px 12px", color: "var(--fg)" }}>{r.device || <span style={{ color: "var(--muted)" }}>–</span>}</td>
                  <td style={{ padding: "9px 12px", color: "var(--fg)" }}>
                    {parseBrowser(r.user_agent)
                      ? <span>{parseBrowser(r.user_agent)}{parseOS(r.user_agent) ? ` / ${parseOS(r.user_agent)}` : ""}</span>
                      : <span style={{ color: "var(--muted)" }}>–</span>}
                  </td>
                  <td style={{ padding: "9px 12px" }}>
                    {r.city
                      ? <span title={r.gps_lat ? "GPS (EXIF)" : "IP-baserad"}>{FLAG(r.country_code)} {r.city}, {r.country}{r.gps_lat ? " 📍" : ""}</span>
                      : <span style={{ color: "var(--muted)" }}>–</span>}
                  </td>
                  <td style={{ padding: "9px 12px", color: "var(--muted)" }}>
                    {r.photo_width ? `${r.photo_width}×${r.photo_height}` : "–"}
                  </td>
                  <td style={{ padding: "9px 12px", textAlign: "center" }}>
                    {r.orientation_corrected ? "✅" : <span style={{ color: "var(--muted)" }}>–</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
