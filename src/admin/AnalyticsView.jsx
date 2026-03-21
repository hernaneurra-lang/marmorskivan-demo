// src/admin/AnalyticsView.jsx — Enhanced analytics with period filter, funnel, geo, visual charts
import { useState, useEffect, useCallback } from "react";

const FLAG_BASE = "https://flagcdn.com/16x12";
function CountryFlag({ code }) {
  if (!code) return null;
  return <img src={`${FLAG_BASE}/${code.toLowerCase()}.png`} alt={code} width={16} height={12} style={{ marginRight: 6, borderRadius: 2, verticalAlign: "middle" }} onError={(e) => { e.target.style.display = "none"; }} />;
}

function StatCard({ icon, value, label, color }) {
  return (
    <div className="admin-kpi-card">
      <div className="admin-kpi-icon" style={{ background: color + "22", color }}>{icon}</div>
      <div className="admin-kpi-body">
        <div className="admin-kpi-value">{Number(value || 0).toLocaleString("sv-SE")}</div>
        <div className="admin-kpi-label">{label}</div>
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
      insights.push({ icon: "🕐", text: `Flest besök klockan ${topHour.hour}:00 (Stockholm-tid). Schemalägg kampanjer och sociala inlägg runt denna tid.` });
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

export default function AnalyticsView({ headers, apiBase }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30d");

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

  return (
    <>
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
        </div>
      </div>

      <div className="admin-content">
        {loading ? (
          <div style={{ color: "var(--muted)" }}>Laddar…</div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="admin-kpi-grid">
              <StatCard icon="👁️" value={data?.totalPageViews}    label="Sidvisningar"       color="#3b82f6" />
              <StatCard icon="🧑" value={data?.uniqueSessions}    label="Unika sessioner"    color="#6366f1" />
              <StatCard icon="💬" value={data?.chatSessions}      label="Chattsessioner"     color="#8b5cf6" />
              <StatCard icon="🧮" value={data?.calculatorOpens}   label="Kalkylator öppnad"  color="#f59e0b" />
              <StatCard icon="📋" value={data?.offerSubmits}      label="Offerter begärda"   color="#ef4444" />
              <StatCard icon="📞" value={data?.totalContacts}     label="Kontaktbegäran"     color="#10b981" />
              <StatCard icon="🤝" value={data?.handoverSessions}  label="Handover till agent" color="#06b6d4" />
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
                <div className="admin-card-title">🕐 Trafik per timme (Stockholm)</div>
                {data?.peakHours?.length ? (
                  <div className="bar-chart" style={{ height: 80 }}>
                    {(() => {
                      const max = Math.max(...data.peakHours.map((h) => Number(h.visits)), 1);
                      return Array.from({ length: 24 }, (_, i) => {
                        const entry = data.peakHours.find((h) => Number(h.hour) === i);
                        const val = entry ? Number(entry.visits) : 0;
                        return (
                          <div key={i} className="bar-col">
                            <div
                              className="bar-col-bar"
                              style={{ height: `${Math.round(val / max * 100)}%`, background: "#f59e0b" }}
                              title={`${i}:00 — ${val} besök`}
                            />
                            <div className="bar-col-label" style={{ fontSize: 8 }}>
                              {i % 4 === 0 ? `${i}h` : ""}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                ) : <div style={{ color: "var(--muted)", fontSize: 13 }}>Ingen data</div>}
              </div>
            </div>

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
