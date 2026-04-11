// src/admin/AnalyticsView.jsx — Enhanced analytics with period filter, funnel, geo, visual charts
import { useState, useEffect, useCallback } from "react";

const FLAG_BASE = "https://flagcdn.com/16x12";
function CountryFlag({ code }) {
  if (!code) return null;
  return <img src={`${FLAG_BASE}/${code.toLowerCase()}.png`} alt={code} width={16} height={12} style={{ marginRight: 6, borderRadius: 2, verticalAlign: "middle" }} onError={(e) => { e.target.style.display = "none"; }} />;
}

function DrilldownModal({ kpi, label, period, headers, apiBase, onClose }) {
  const [rows, setRows] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${apiBase}/api/admin/analytics/drilldown?kpi=${kpi}&period=${period}`, { headers })
      .then(r => r.json())
      .then(d => { setColumns(d.columns || []); setRows(d.rows || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [kpi, period]);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  function fmtCell(val, colName) {
    if (val === null || val === undefined || val === "—") return <span style={{ color: "var(--muted)" }}>—</span>;
    if (colName === "Tid") {
      const d = new Date(val);
      return d.toLocaleString("sv-SE", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    }
    if (colName === "Taggar") {
      try {
        const tags = JSON.parse(val);
        if (!tags.length) return <span style={{ color: "var(--muted)" }}>—</span>;
        return tags.map(t => <span key={t} style={{ background: "var(--border)", borderRadius: 4, padding: "1px 6px", fontSize: 11, marginRight: 3 }}>{t}</span>);
      } catch { return val; }
    }
    return String(val);
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}>
      <div style={{ background: "var(--surface)", borderRadius: 16, width: "100%", maxWidth: 900, maxHeight: "85vh", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid var(--border)", flexShrink: 0 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{label} — detaljer</div>
            <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>{rows?.length ?? "…"} rader, senaste {period}</div>
          </div>
          <button onClick={onClose} style={{ background: "var(--border)", border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 16, color: "var(--text)" }}>✕</button>
        </div>
        <div style={{ overflow: "auto", flex: 1 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Laddar…</div>
          ) : !rows || rows.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "var(--muted)" }}>Ingen data för perioden</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "var(--border)", position: "sticky", top: 0 }}>
                  {columns.map(c => <th key={c} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 600, whiteSpace: "nowrap" }}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "var(--border)" + "33" }}>
                    {row.map((cell, j) => (
                      <td key={j} style={{ padding: "7px 12px", whiteSpace: j === 0 ? "nowrap" : "normal", maxWidth: j === 1 ? 200 : "none", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {fmtCell(cell, columns[j])}
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

function StatCard({ icon, value, label, color, onClick }) {
  return (
    <div className="admin-kpi-card" onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default", transition: "transform 0.1s, box-shadow 0.1s" }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 16px " + color + "33"; } }}
      onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
      <div className="admin-kpi-icon" style={{ background: color + "22", color }}>{icon}</div>
      <div className="admin-kpi-body">
        <div className="admin-kpi-value">{Number(value || 0).toLocaleString("sv-SE")}</div>
        <div className="admin-kpi-label">{label}</div>
        {onClick && <div style={{ fontSize: 10, color: color, marginTop: 2, opacity: 0.8 }}>Klicka för detaljer →</div>}
      </div>
    </div>
  );
}

function BarList({ items, valueKey, labelKey, maxValue }) {
  const max = maxValue || Math.max(...(items || []).map((i) => Number(i[valueKey])), 1);
  return (
    <ul className="analytics-list bar-list">
      {(items || []).map((item, i) => (
        <li key={i} style={{ flexDirection: "column", gap: 4, padding: "8px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
            <span style={{ fontSize: 12, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>
              {item[labelKey]}
            </span>
            <span className="count">{Number(item[valueKey]).toLocaleString("sv-SE")}</span>
          </div>
          <div style={{ height: 4, background: "var(--border)", borderRadius: 2 }}>
            <div style={{
              height: 4,
              background: "var(--green)",
              borderRadius: 2,
              width: `${Math.round(Number(item[valueKey]) / max * 100)}%`,
              transition: "width 0.4s ease",
            }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function FunnelViz({ funnel }) {
  if (!funnel?.length) return <div style={{ color: "var(--muted)", fontSize: 13 }}>Ingen data</div>;
  const colors = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981"];
  return (
    <div className="funnel-wrap">
      {funnel.map((step, i) => (
        <div key={step.label} className="funnel-step">
          <div className="funnel-bar-wrap">
            <div
              className="funnel-bar"
              style={{ width: `${Math.max(step.pct, 2)}%`, background: colors[i] }}
            />
          </div>
          <div className="funnel-labels">
            <span className="funnel-label">{step.label}</span>
            <span className="funnel-value">
              {Number(step.value).toLocaleString("sv-SE")}
              {i > 0 && <span className="funnel-pct"> — {step.pct}%</span>}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Linear regression helper ──
function linReg(points) {
  // points: [{x, y}]
  const n = points.length;
  if (n < 2) return null;
  const sumX = points.reduce((a, p) => a + p.x, 0);
  const sumY = points.reduce((a, p) => a + p.y, 0);
  const sumXY = points.reduce((a, p) => a + p.x * p.y, 0);
  const sumX2 = points.reduce((a, p) => a + p.x * p.x, 0);
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return null;
  const slope = (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept, predict: (x) => slope * x + intercept };
}

// ── Z-score anomaly detection ──
function zScoreAnomalies(values, threshold = 2.0) {
  if (values.length < 3) return [];
  const mean = values.reduce((a, v) => a + v, 0) / values.length;
  const std = Math.sqrt(values.reduce((a, v) => a + (v - mean) ** 2, 0) / values.length);
  if (std === 0) return [];
  return values.map((v, i) => ({ index: i, value: v, z: (v - mean) / std })).filter((p) => Math.abs(p.z) >= threshold);
}

// ── AI Insights generator (client-side, from analytics data) ──
function generateInsights(data) {
  if (!data) return [];
  const insights = [];
  const pv = Number(data.totalPageViews || 0);
  const chats = Number(data.chatSessions || 0);
  const offers = Number(data.offerSubmits || 0);
  const contacts = Number(data.totalContacts || 0);
  const calc = Number(data.calculatorOpens || 0);
  const handovers = Number(data.handoverSessions || 0);

  // ── Traffic prediction (linear regression on dailyPageViews) ──
  if (data.dailyPageViews?.length >= 5) {
    const sorted = [...data.dailyPageViews].reverse(); // oldest first
    const pts = sorted.map((d, i) => ({ x: i, y: Number(d.views) }));
    const reg = linReg(pts);
    if (reg) {
      const nextWeek = Math.max(0, Math.round(reg.predict(pts.length + 6)));
      const trend = reg.slope;
      if (trend > 1) {
        insights.push({ icon: "📈", text: `Trafiken ökar — prognos för nästa 7 dagar: ~${nextWeek.toLocaleString("sv-SE")} sidvisningar. Bra momentum!` });
      } else if (trend < -1) {
        insights.push({ icon: "📉", text: `Trafiken minskar (${Math.round(trend)} vis/dag). Prognos nästa 7 dagar: ~${nextWeek.toLocaleString("sv-SE")} visningar. Överväg en kampanj.` });
      }
    }
  }

  // ── Anomaly detection on daily pageviews ──
  if (data.dailyPageViews?.length >= 5) {
    const sorted = [...data.dailyPageViews].reverse();
    const values = sorted.map((d) => Number(d.views));
    const anomalies = zScoreAnomalies(values);
    const spikes = anomalies.filter((a) => a.z > 0);
    const drops  = anomalies.filter((a) => a.z < 0);
    if (spikes.length > 0) {
      const spike = spikes[spikes.length - 1];
      const day = sorted[spike.index]?.day;
      const label = day ? new Date(day).toLocaleDateString("sv-SE", { day: "numeric", month: "short" }) : "okänt datum";
      insights.push({ icon: "⚡", text: `Trafiktopp detekterad: ${spike.value.toLocaleString("sv-SE")} visningar ${label} (${Math.round(spike.z * 10) / 10}σ över snitt). Vad hände den dagen?` });
    }
    if (drops.length > 0 && !spikes.length) {
      const drop = drops[drops.length - 1];
      const day = sorted[drop.index]?.day;
      const label = day ? new Date(day).toLocaleDateString("sv-SE", { day: "numeric", month: "short" }) : "okänt datum";
      insights.push({ icon: "⚠️", text: `Trafiktapp detekterat ${label} (${Math.round(Math.abs(drop.z) * 10) / 10}σ under snitt). Kolla om sidan var nere eller om en länk försvann.` });
    }
  }

  // ── User segmentation ──
  if (pv > 0) {
    const bounced      = Math.max(0, pv - calc - chats);
    const browsers     = Math.max(0, calc - offers);
    const engaged      = Math.max(0, offers - contacts);
    const converters   = contacts;
    const bounceRate   = Math.round(bounced / pv * 100);
    const convRate2    = pv > 0 ? Math.round(converters / pv * 100) : 0;
    if (pv >= 10) {
      insights.push({
        icon: "👥",
        text: `Besökarsegment: ${bounceRate}% lämnar direkt (${bounced}), ${Math.round(browsers/pv*100)}% surfar (${browsers}), ${Math.round(engaged/pv*100)}% engageras (${engaged}), ${convRate2}% konverterar (${converters}).`,
      });
    }
    if (bounceRate > 60) {
      insights.push({ icon: "💡", text: `Hög avhoppsfrekvens (${bounceRate}%). Försök förbättra hero-sektionen och laddningstiden för att hålla kvar fler besökare.` });
    }
  }

  // ── Peak hour insight ──
  if (data.peakHours?.length) {
    const topHour = [...data.peakHours].sort((a, b) => Number(b.visits) - Number(a.visits))[0];
    if (topHour) {
      insights.push({ icon: "🕐", text: `Flest besök klockan ${Math.floor(Number(topHour.hour))}:00 (Stockholm-tid). Schemalägg kampanjer och sociala inlägg runt denna tid.` });
    }
  }

  // ── Chat engagement rate ──
  if (pv > 0 && chats > 0) {
    const chatRate = Math.round(chats / pv * 100);
    if (chatRate >= 10) insights.push({ icon: "🚀", text: `Hög chattengagemang — ${chatRate}% av besökarna startar en chatt. Branschsnitt är ~5%.` });
    else if (chatRate < 3) insights.push({ icon: "💡", text: `Låg chattengagemang (${chatRate}%). Prova att ändra hälsningsmeddelandet eller visa chatten mer proaktivt.` });
  }

  // ── Funnel drop-offs ──
  if (calc > 0 && offers === 0) {
    insights.push({ icon: "⚠️", text: `${calc} öppnade kalkylatorn men ingen skickade offert. Trolig friktion — kolla om offertformuläret är tydligt.` });
  } else if (calc > 0 && offers > 0) {
    const convRate = Math.round(offers / calc * 100);
    if (convRate >= 20) insights.push({ icon: "✅", text: `Stark kalkylator-till-offert-konvertering: ${convRate}%. Kalkylatorn fungerar bra som lead-generator.` });
    else if (convRate < 8) insights.push({ icon: "💡", text: `Låg konvertering kalkylator → offert (${convRate}%). Prova ett mer synligt CTA-steg i kalkylatorn.` });
  }

  // ── Handover ratio ──
  if (chats > 0 && handovers > 0) {
    const hRate = Math.round(handovers / chats * 100);
    if (hRate > 30) insights.push({ icon: "🤝", text: `${hRate}% av chattar eskaleras till human agent. AI:n kanske inte täcker alla vanliga frågor — utöka kunskapsbasen.` });
  }

  // ── Contact quality ──
  if (contacts > 0 && offers > 0) {
    const quality = Math.round(contacts / offers * 100);
    if (quality >= 50) insights.push({ icon: "📞", text: `${quality}% av offertintresserade lämnar kontaktuppgifter — stark köpintention.` });
  }

  // ── Top referrer insight ──
  if (data.referrers?.length > 0) {
    const top = data.referrers[0];
    if (top && Number(top.visits) > 1) {
      insights.push({ icon: "🔗", text: `Starkaste trafikkälla: "${top.source}" med ${Number(top.visits).toLocaleString("sv-SE")} besök. Investera mer i den kanalen.` });
    }
  }

  // ── Top geo insight ──
  if (data.geoCountries?.length > 0) {
    const top = data.geoCountries[0];
    if (top && Number(top.sessions) > 1) insights.push({ icon: "🌍", text: `Majoriteten av besökarna (${Number(top.sessions).toLocaleString("sv-SE")}) kommer från ${top.country}. Vill du rikta content mot dem?` });
  }

  // ── Top page insight ──
  if (data.topPages?.length > 0) {
    const top = data.topPages[0];
    if (top) insights.push({ icon: "📄", text: `Populäraste sidan: "${top.page}" med ${Number(top.views).toLocaleString("sv-SE")} visningar. Bra plats för CTA eller specialerbjudande.` });
  }

  if (!insights.length) insights.push({ icon: "📊", text: "Inte tillräckligt med data ännu för automatiska insikter. Kom tillbaka när trafiken ökat." });
  return insights;
}

// ── Visitors detail view ──────────────────────────────────────────
function VisitorsView({ headers, apiBase, period }) {
  const [visitors, setVisitors] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch]     = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(`${apiBase}/api/admin/analytics/visitors?period=${period}&limit=200`, { headers })
      .then(r => r.json())
      .then(d => { setVisitors(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period, apiBase, JSON.stringify(headers)]);

  if (loading) return <div style={{ color: "var(--muted)", padding: 24 }}>Laddar besökare…</div>;
  if (!visitors?.length) return <div style={{ color: "var(--muted)", padding: 24 }}>Ingen besökardata ännu.</div>;

  const q = search.toLowerCase();
  const filtered = visitors.filter(v =>
    !q ||
    v.ip?.includes(q) ||
    v.city?.toLowerCase().includes(q) ||
    v.region?.toLowerCase().includes(q) ||
    v.district?.toLowerCase().includes(q) ||
    v.country?.toLowerCase().includes(q) ||
    v.isp?.toLowerCase().includes(q)
  );

  function parseUA(ua) {
    if (!ua) return "Okänd enhet";
    let browser = "Okänd webbläsare";
    if (ua.includes("Edg/")) browser = "Edge";
    else if (ua.includes("Chrome/")) browser = "Chrome";
    else if (ua.includes("Firefox/")) browser = "Firefox";
    else if (ua.includes("Safari/") && !ua.includes("Chrome")) browser = "Safari";
    else if (ua.includes("OPR/")) browser = "Opera";

    let os = "Okänt OS";
    if (ua.includes("Windows NT 10")) os = "Windows 10/11";
    else if (ua.includes("Windows NT 6")) os = "Windows 7/8";
    else if (ua.includes("Mac OS X")) os = "macOS";
    else if (ua.includes("iPhone")) os = "iPhone";
    else if (ua.includes("iPad")) os = "iPad";
    else if (ua.includes("Android")) os = "Android";
    else if (ua.includes("Linux")) os = "Linux";

    return `${browser} · ${os}`;
  }

  function fmtTime(ts) {
    if (!ts) return "–";
    return new Date(ts).toLocaleString("sv-SE", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  function fmtSource(ref) {
    if (!ref) return "Direkt";
    if (ref.includes("google")) return "🔍 Google";
    if (ref.includes("bing")) return "🔍 Bing";
    if (ref.includes("facebook") || ref.includes("fb.com")) return "📘 Facebook";
    if (ref.includes("instagram")) return "📸 Instagram";
    if (ref.includes("marmorskivan.se")) return "🔁 Intern";
    return "🌐 " + ref.replace(/https?:\/\//, "").split("/")[0];
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, alignItems: "center" }}>
        <input
          className="admin-input"
          style={{ width: 280, marginBottom: 0 }}
          placeholder="Sök IP, stad, region, ISP…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <span style={{ color: "var(--muted)", fontSize: 13 }}>{filtered.length} besökare</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((v, i) => {
          const isOpen = expanded === i;
          const locationParts = [v.district, v.city, v.region, v.country].filter(Boolean);
          const locationStr = locationParts.join(" › ");
          return (
            <div key={i} style={{ background: "var(--card)", borderRadius: 10, border: "1px solid var(--border)", overflow: "hidden" }}>
              {/* Summary row */}
              <div
                onClick={() => setExpanded(isOpen ? null : i)}
                style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", cursor: "pointer", userSelect: "none" }}
              >
                <CountryFlag code={v.country_code} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontFamily: "monospace", fontSize: 12, color: "var(--text)", fontWeight: 600 }}>{v.ip}</span>
                    {v.isp && <span style={{ fontSize: 11, color: "var(--muted)", background: "var(--surface2)", padding: "1px 6px", borderRadius: 4 }}>{v.isp}</span>}
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{v.mobile ? "📱" : "🖥️"} {parseUA(v.user_agent)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
                    📍 {locationStr || "Okänd plats"}
                    {v.zip && <span style={{ marginLeft: 6 }}>({v.zip})</span>}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 12, color: "var(--text)", fontWeight: 600 }}>{v.event_count} events · {v.pages_visited} sidor</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{fmtTime(v.last_seen)}</div>
                </div>
                <span style={{ color: "var(--muted)", fontSize: 14, flexShrink: 0 }}>{isOpen ? "▲" : "▼"}</span>
              </div>

              {/* Expanded detail */}
              {isOpen && (
                <div style={{ borderTop: "1px solid var(--border)", padding: "14px 16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px 24px", fontSize: 13 }}>
                  {/* Geo */}
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 8, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>📍 Plats</div>
                    {[
                      ["Land", v.country],
                      ["Region/Län", v.region],
                      ["Stad", v.city],
                      ["Stadsdel/Distrikt", v.district],
                      ["Postnummer", v.zip],
                      ["Koordinater", v.lat && v.lon ? `${Number(v.lat).toFixed(4)}, ${Number(v.lon).toFixed(4)}` : null],
                      ["Tidszon", v.timezone],
                      ["ISP / Operatör", v.isp],
                    ].map(([label, val]) => val ? (
                      <div key={label} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                        <span style={{ color: "var(--muted)", minWidth: 140 }}>{label}:</span>
                        <span style={{ color: "var(--text)" }}>
                          {label === "Koordinater"
                            ? <a href={`https://maps.google.com/?q=${val}`} target="_blank" rel="noreferrer" style={{ color: "var(--green)" }}>{val} 🗺️</a>
                            : val
                          }
                        </span>
                      </div>
                    ) : null)}
                  </div>

                  {/* Enhet & beteende */}
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 8, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>💻 Enhet & Beteende</div>
                    {[
                      ["Enhet", v.mobile ? "📱 Mobil" : "🖥️ Desktop"],
                      ["Webbläsare/OS", parseUA(v.user_agent)],
                      ["Skärmupplösning", v.screen],
                      ["Språk", v.lang],
                      ["Källa", fmtSource(v.first_referrer)],
                      ["Första besök", fmtTime(v.first_seen)],
                      ["Senaste besök", fmtTime(v.last_seen)],
                      ["Totalt events", v.event_count],
                    ].map(([label, val]) => val ? (
                      <div key={label} style={{ display: "flex", gap: 8, marginBottom: 4 }}>
                        <span style={{ color: "var(--muted)", minWidth: 140 }}>{label}:</span>
                        <span style={{ color: "var(--text)" }}>{val}</span>
                      </div>
                    ) : null)}
                  </div>

                  {/* Besökta sidor */}
                  {v.pages?.length > 0 && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>🔗 Besökta sidor</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {v.pages.map((p, pi) => (
                          <span key={pi} style={{ background: "var(--surface2)", border: "1px solid var(--border)", borderRadius: 6, padding: "2px 8px", fontSize: 11, color: "var(--text)" }}>{p}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Events */}
                  {v.events?.length > 0 && (
                    <div style={{ gridColumn: "1 / -1" }}>
                      <div style={{ fontWeight: 700, color: "var(--text)", marginBottom: 6, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>⚡ Events</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {v.events.map((e, ei) => (
                          <span key={ei} style={{ background: "rgba(5,150,105,0.1)", border: "1px solid rgba(5,150,105,0.3)", borderRadius: 6, padding: "2px 8px", fontSize: 11, color: "var(--green)" }}>{e}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function AnalyticsView({ headers, apiBase }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");
  const [drilldown, setDrilldown] = useState(null); // { kpi, label }
  const [activeTab, setActiveTab] = useState("overview");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/admin/analytics?period=${period}`, { headers });
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [apiBase, period, JSON.stringify(headers)]);

  useEffect(() => { load(); }, [load]);

  const PERIODS = [
    { value: "24h", label: "24 tim" },
    { value: "7d",  label: "7 dagar" },
    { value: "30d", label: "30 dagar" },
    { value: "90d", label: "90 dagar" },
  ];

  const dd = (kpi, label) => setDrilldown({ kpi, label });

  return (
    <>
      {drilldown && (
        <DrilldownModal
          kpi={drilldown.kpi}
          label={drilldown.label}
          period={period}
          headers={headers}
          apiBase={apiBase}
          onClose={() => setDrilldown(null)}
        />
      )}
      <div className="admin-topbar">
        <h1>📊 Analytics</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {PERIODS.map((p) => (
            <button
              key={p.value}
              className={`period-btn${period === p.value ? " active" : ""}`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
          <button className="btn-refresh" onClick={load}>↻</button>
          <button
            className="btn-refresh"
            style={{ fontSize: 11, color: "var(--green)", borderColor: "var(--green)", whiteSpace: "nowrap" }}
            onClick={async () => {
              if (!window.confirm("Seeda in 30 dagars testdata? (Kan dupliceras om du kör igen)")) return;
              const r = await fetch(`${apiBase}/api/admin/seed-analytics`, { method: "POST", headers });
              const j = await r.json();
              alert(j.message || (j.ok ? "Klart!" : j.error));
              load();
            }}
          >
            🌱 Seeda testdata
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 4, borderBottom: "2px solid var(--border)", padding: "0 24px", background: "var(--surface)" }}>
        {[
          { key: "overview", label: "📊 Översikt" },
          { key: "visitors", label: "👤 Besökare" },
        ].map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            padding: "10px 20px", border: "none", background: "none",
            borderBottom: activeTab === t.key ? "2px solid var(--green)" : "2px solid transparent",
            color: activeTab === t.key ? "var(--green)" : "var(--muted)",
            fontWeight: activeTab === t.key ? 700 : 400,
            cursor: "pointer", fontSize: 14, marginBottom: -2,
          }}>{t.label}</button>
        ))}
      </div>

      <div className="admin-content">
        {activeTab === "visitors" ? (
          <VisitorsView headers={headers} apiBase={apiBase} period={period} />
        ) : loading ? (
          <div style={{ color: "var(--muted)" }}>Laddar…</div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="admin-kpi-grid">
              <StatCard icon="👁️" value={data?.totalPageViews}    label="Sidvisningar"        color="#3b82f6" onClick={() => dd("pageviews", "Sidvisningar")} />
              <StatCard icon="🧑" value={data?.uniqueSessions}    label="Unika sessioner"     color="#6366f1" onClick={() => dd("sessions",  "Unika sessioner")} />
              <StatCard icon="💬" value={data?.chatSessions}      label="Chattsessioner"      color="#8b5cf6" onClick={() => dd("chats",     "Chattsessioner")} />
              <StatCard icon="🧮" value={data?.calculatorOpens}   label="Kalkylator öppnad"   color="#f59e0b" onClick={() => dd("calculator","Kalkylator öppnad")} />
              <StatCard icon="📋" value={data?.offerSubmits}      label="Offerter begärda"    color="#ef4444" onClick={() => dd("offers",    "Offerter begärda")} />
              <StatCard icon="📞" value={data?.totalContacts}     label="Kontaktbegäran"      color="#10b981" onClick={() => dd("contacts",  "Kontaktbegäran")} />
              <StatCard icon="🤝" value={data?.handoverSessions}  label="Handover till agent" color="#06b6d4" onClick={() => dd("handover",  "Handover till agent")} />
              <StatCard icon="✨" value={data?.kitchenRenders}    label="Köksrenderingar"     color="#a855f7" onClick={() => dd("renders",   "Köksrenderingar")} />
            </div>

            {/* Funnel + Top pages */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="admin-card">
                <div className="admin-card-title">📈 Konverteringstratt</div>
                <FunnelViz funnel={data?.funnel} />
              </div>

              <div className="admin-card">
                <div className="admin-card-title">📄 Populäraste sidor</div>
                {data?.topPages?.length ? (
                  <BarList items={data.topPages} labelKey="page" valueKey="views" />
                ) : <div style={{ color: "var(--muted)", fontSize: 13 }}>Ingen data</div>}
              </div>
            </div>

            {/* Top materials + Accessories grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {data?.topMaterials?.length > 0 && (
                <div className="admin-card" style={{ cursor: "pointer" }} onClick={() => dd("materials_detail", "Material — detaljer")}>
                  <div className="admin-card-title">🪨 Top 20 — mest valda material <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400 }}>klicka för detaljer</span></div>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                    {(() => {
                      const max = Math.max(...data.topMaterials.map((m) => Number(m.selections)), 1);
                      return data.topMaterials.map((m, i) => (
                        <li key={m.material} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
                          <span style={{ color: "var(--muted)", fontSize: 12, width: 20, flexShrink: 0 }}>#{i + 1}</span>
                          <span style={{ flex: 1, fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.material}</span>
                          <div style={{ width: 80, height: 6, background: "var(--border)", borderRadius: 3, flexShrink: 0 }}>
                            <div style={{ width: `${Math.round(Number(m.selections) / max * 100)}%`, height: "100%", background: "#10b981", borderRadius: 3 }} />
                          </div>
                          <span style={{ color: "var(--muted)", fontSize: 12, width: 28, textAlign: "right", flexShrink: 0 }}>{m.selections}</span>
                        </li>
                      ));
                    })()}
                  </ul>
                </div>
              )}

              {/* Accessories — sink, faucet, hob */}
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                {[
                  { type: "sink",   label: "🚰 Diskhoar",  kpi: "accessories_sink",   color: "#3b82f6" },
                  { type: "faucet", label: "🔧 Kranar",     kpi: "accessories_faucet", color: "#8b5cf6" },
                  { type: "hob",    label: "🔥 Hällar",     kpi: "accessories_hob",    color: "#f59e0b" },
                ].map(({ type, label, kpi: accKpi, color }) => {
                  const items = (data?.topAccessories || []).filter(a => a.type === type);
                  if (!items.length) return null;
                  const max = Math.max(...items.map(a => Number(a.selections)), 1);
                  return (
                    <div key={type} className="admin-card" style={{ cursor: "pointer" }} onClick={() => dd(accKpi, label)}>
                      <div className="admin-card-title">{label} <span style={{ fontSize: 11, color: "var(--muted)", fontWeight: 400 }}>klicka för detaljer</span></div>
                      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                        {items.slice(0, 8).map((a, i) => (
                          <li key={a.name} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
                            <span style={{ color: "var(--muted)", fontSize: 12, width: 20, flexShrink: 0 }}>#{i + 1}</span>
                            <span style={{ flex: 1, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{a.name}</span>
                            <div style={{ width: 60, height: 5, background: "var(--border)", borderRadius: 3, flexShrink: 0 }}>
                              <div style={{ width: `${Math.round(Number(a.selections) / max * 100)}%`, height: "100%", background: color, borderRadius: 3 }} />
                            </div>
                            <span style={{ color: "var(--muted)", fontSize: 12, width: 24, textAlign: "right", flexShrink: 0 }}>{a.selections}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Daily chats bar chart (CSS) */}
            <div className="admin-card">
              <div className="admin-card-title">📅 Chattsessioner per dag</div>
              {data?.dailyChats?.length ? (
                <div className="bar-chart">
                  {(() => {
                    const max = Math.max(...data.dailyChats.map((d) => Number(d.sessions)), 1);
                    return [...data.dailyChats].reverse().map((d) => (
                      <div key={d.day} className="bar-col">
                        <div
                          className="bar-col-bar"
                          style={{ height: `${Math.round(Number(d.sessions) / max * 100)}%` }}
                          title={`${d.sessions} chattar`}
                        />
                        <div className="bar-col-label">
                          {new Date(d.day).toLocaleDateString("sv-SE", { day: "numeric", month: "numeric" })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              ) : <div style={{ color: "var(--muted)", fontSize: 13 }}>Ingen data ännu</div>}
            </div>

            {/* Events + Questions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="admin-card">
                <div className="admin-card-title">⚡ Händelsetyper</div>
                {data?.topEvents?.length ? (
                  <BarList items={data.topEvents} labelKey="event" valueKey="count" />
                ) : <div style={{ color: "var(--muted)", fontSize: 13 }}>Ingen data</div>}
              </div>

              <div className="admin-card">
                <div className="admin-card-title">❓ Vanligaste frågor</div>
                {data?.popularQuestions?.length ? (
                  <ul className="analytics-list">
                    {data.popularQuestions.map((q, i) => (
                      <li key={i}>
                        <span style={{ fontSize: 12, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 240 }}>
                          {q.content}
                        </span>
                        <span className="count">{q.count}×</span>
                      </li>
                    ))}
                  </ul>
                ) : <div style={{ color: "var(--muted)", fontSize: 13 }}>Ingen data</div>}
              </div>
            </div>

            {/* Geo analytics */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="admin-card">
                <div className="admin-card-title">🌍 Besökare per land</div>
                {data?.geoCountries?.length ? (
                  <ul className="analytics-list bar-list">
                    {data.geoCountries.map((g, i) => {
                      const max = Math.max(...data.geoCountries.map((x) => Number(x.sessions)), 1);
                      return (
                        <li key={i} style={{ flexDirection: "column", gap: 4, padding: "8px 0" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                            <span style={{ fontSize: 12, color: "var(--text)", display: "flex", alignItems: "center" }}>
                              <CountryFlag code={g.country_code} />
                              {g.country}
                            </span>
                            <span className="count">{Number(g.sessions).toLocaleString("sv-SE")}</span>
                          </div>
                          <div style={{ height: 4, background: "var(--border)", borderRadius: 2 }}>
                            <div style={{ height: 4, background: "var(--green)", borderRadius: 2, width: `${Math.round(Number(g.sessions) / max * 100)}%`, transition: "width 0.4s ease" }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : <div style={{ color: "var(--muted)", fontSize: 13 }}>Ingen geo-data ännu (kräver aktiva chattar)</div>}
              </div>

              <div className="admin-card">
                <div className="admin-card-title">🏙️ Populäraste städer</div>
                {data?.geoCities?.length ? (
                  <ul className="analytics-list bar-list">
                    {data.geoCities.map((g, i) => {
                      const max = Math.max(...data.geoCities.map((x) => Number(x.sessions)), 1);
                      return (
                        <li key={i} style={{ flexDirection: "column", gap: 4, padding: "8px 0" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                            <span style={{ fontSize: 12, color: "var(--text)" }}>
                              {g.city} <span style={{ color: "var(--muted)" }}>· {g.country}</span>
                            </span>
                            <span className="count">{Number(g.sessions).toLocaleString("sv-SE")}</span>
                          </div>
                          <div style={{ height: 4, background: "var(--border)", borderRadius: 2 }}>
                            <div style={{ height: 4, background: "#6366f1", borderRadius: 2, width: `${Math.round(Number(g.sessions) / max * 100)}%`, transition: "width 0.4s ease" }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : <div style={{ color: "var(--muted)", fontSize: 13 }}>Ingen geo-data ännu</div>}
              </div>
            </div>

            {/* Device breakdown */}
            {data?.deviceStats && (data.deviceStats.mobile > 0 || data.deviceStats.desktop > 0) && (
              <div className="admin-card">
                <div className="admin-card-title">📱 Enheter</div>
                <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
                  {[
                    { label: "📱 Mobil", value: data.deviceStats.mobile, color: "#8b5cf6" },
                    { label: "🖥️ Desktop", value: data.deviceStats.desktop, color: "#3b82f6" },
                    { label: "🔑 Unika enheter", value: data.deviceStats.uniqueDevices, color: "#10b981" },
                  ].map((d) => (
                    <div key={d.label} style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: d.color }}>{Number(d.value).toLocaleString("sv-SE")}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>{d.label}</div>
                    </div>
                  ))}
                  {(data.deviceStats.mobile + data.deviceStats.desktop) > 0 && (
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 4 }}>Mobil vs Desktop</div>
                      <div style={{ height: 8, background: "var(--border)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{
                          height: "100%",
                          width: `${Math.round(data.deviceStats.mobile / (data.deviceStats.mobile + data.deviceStats.desktop) * 100)}%`,
                          background: "#8b5cf6",
                          borderRadius: 4,
                        }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--muted)", marginTop: 3 }}>
                        <span>📱 {Math.round(data.deviceStats.mobile / (data.deviceStats.mobile + data.deviceStats.desktop) * 100)}%</span>
                        <span>{Math.round(data.deviceStats.desktop / (data.deviceStats.mobile + data.deviceStats.desktop) * 100)}% 🖥️</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Daily pageviews bar chart */}
            <div className="admin-card">
              <div className="admin-card-title">📈 Sidvisningar per dag</div>
              {data?.dailyPageViews?.length ? (
                <div className="bar-chart">
                  {(() => {
                    const max = Math.max(...data.dailyPageViews.map((d) => Number(d.views)), 1);
                    return [...data.dailyPageViews].reverse().map((d) => (
                      <div key={d.day} className="bar-col">
                        <div
                          className="bar-col-bar"
                          style={{ height: `${Math.round(Number(d.views) / max * 100)}%`, background: "#3b82f6" }}
                          title={`${d.views} visningar`}
                        />
                        <div className="bar-col-label">
                          {new Date(d.day).toLocaleDateString("sv-SE", { day: "numeric", month: "numeric" })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              ) : <div style={{ color: "var(--muted)", fontSize: 13 }}>Ingen data ännu</div>}
            </div>

            {/* Referrers + Peak hours */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="admin-card">
                <div className="admin-card-title">🔗 Trafikkällor</div>
                {data?.referrers?.length ? (
                  <BarList items={data.referrers} labelKey="source" valueKey="visits" />
                ) : <div style={{ color: "var(--muted)", fontSize: 13 }}>Ingen data</div>}
              </div>

              <div className="admin-card">
                <div className="admin-card-title">🕐 All aktivitet per timme (Stockholm)</div>
                {(data?.activityByHour || data?.peakHours)?.length ? (
                  <div className="bar-chart" style={{ height: 90 }}>
                    {(() => {
                      const hours = data.activityByHour || data.peakHours;
                      const max = Math.max(...hours.map((h) => Number(h.visits)), 1);
                      return Array.from({ length: 24 }, (_, i) => {
                        const entry = hours.find((h) => Math.floor(Number(h.hour)) === i);
                        const val = entry ? Number(entry.visits) : 0;
                        const isTop = val === max && val > 0;
                        return (
                          <div key={i} className="bar-col">
                            <div
                              className="bar-col-bar"
                              style={{ height: `${Math.round(val / max * 100)}%`, background: isTop ? "#f59e0b" : "#3b82f6" }}
                              title={`${i}:00 — ${val} händelser`}
                            />
                            <div className="bar-col-label" style={{ fontSize: 8 }}>
                              {i % 3 === 0 ? `${i}h` : ""}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : <div style={{ color: "var(--muted)", fontSize: 13 }}>Ingen data</div>}
              </div>
            </div>

            {/* Tid på sida */}
            {data?.timeOnPage?.length > 0 && (
              <div className="admin-card">
                <div className="admin-card-title">⏱️ Genomsnittlig tid på sida</div>
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {(() => {
                    const max = Math.max(...data.timeOnPage.map(r => Number(r.avg_sec)), 1);
                    return data.timeOnPage.map((r, i) => {
                      const sec = Math.round(Number(r.avg_sec));
                      const mm = Math.floor(sec / 60);
                      const ss = sec % 60;
                      return (
                        <li key={r.page} style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
                          <span style={{ flex: 1, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.page || "/"}</span>
                          <div style={{ width: 100, height: 6, background: "var(--border)", borderRadius: 3, flexShrink: 0 }}>
                            <div style={{ width: `${Math.round(Number(r.avg_sec) / max * 100)}%`, height: "100%", background: "#6366f1", borderRadius: 3 }} />
                          </div>
                          <span style={{ color: "var(--muted)", fontSize: 12, width: 48, textAlign: "right", flexShrink: 0 }}>
                            {mm > 0 ? `${mm}m ${ss}s` : `${ss}s`}
                          </span>
                          <span style={{ color: "var(--muted)", fontSize: 11, width: 40, textAlign: "right", flexShrink: 0 }}>({r.exits} ex.)</span>
                        </li>
                      );
                    });
                  })()}
                </ul>
              </div>
            )}

            {/* AI Insights */}
            <div className="admin-card">
              <div className="admin-card-title">🤖 AI-insikter</div>
              <ul className="insights-list">
                {generateInsights(data).map((ins, i) => (
                  <li key={i} className="insight-item">
                    <span style={{ fontSize: 16, marginRight: 8 }}>{ins.icon}</span>
                    {ins.text}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}
      </div>
    </>
  );
}
