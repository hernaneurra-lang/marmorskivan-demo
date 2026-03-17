// src/admin/DashboardView.jsx — Main dashboard with KPIs, funnel, realtime
import { useState, useEffect, useCallback } from "react";

function KpiCard({ icon, value, label, sub, color }) {
  return (
    <div className="admin-kpi-card">
      <div className="admin-kpi-icon" style={{ background: color + "22", color }}>{icon}</div>
      <div className="admin-kpi-body">
        <div className="admin-kpi-value">{typeof value === "number" ? value.toLocaleString("sv-SE") : value}</div>
        <div className="admin-kpi-label">{label}</div>
        {sub && <div className="admin-kpi-sub">{sub}</div>}
      </div>
    </div>
  );
}

function FunnelStep({ label, value, pct, isFirst }) {
  return (
    <div className="funnel-step">
      <div className="funnel-bar-wrap">
        <div
          className="funnel-bar"
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
      <div className="funnel-labels">
        <span className="funnel-label">{label}</span>
        <span className="funnel-value">
          {value.toLocaleString("sv-SE")}
          {!isFirst && <span className="funnel-pct"> ({pct}%)</span>}
        </span>
      </div>
    </div>
  );
}

function RealtimePulse({ active }) {
  return (
    <div className="realtime-row">
      <span className={`realtime-dot${active > 0 ? " pulse" : ""}`} />
      <span style={{ fontSize: 13 }}>
        {active > 0
          ? <><strong style={{ color: "var(--green)" }}>{active}</strong> aktiv chatt{active !== 1 ? "ar" : ""} just nu</>
          : "Inga aktiva chattar just nu"}
      </span>
    </div>
  );
}

export default function DashboardView({ headers, apiBase, onNavigate }) {
  const [analytics, setAnalytics] = useState(null);
  const [realtime, setRealtime] = useState({ active_chats: 0, recent_events: 0 });
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState(true);

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/admin/analytics?period=${period}`, { headers });
      const json = await res.json();
      setAnalytics(json);
    } finally {
      setLoading(false);
    }
  }, [apiBase, period, JSON.stringify(headers)]);

  const loadRealtime = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/admin/realtime`, { headers });
      const json = await res.json();
      setRealtime(json);
    } catch {}
  }, [apiBase, JSON.stringify(headers)]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);
  useEffect(() => {
    loadRealtime();
    const t = setInterval(loadRealtime, 30_000);
    return () => clearInterval(t);
  }, [loadRealtime]);

  const PERIODS = [
    { value: "24h", label: "24 tim" },
    { value: "7d",  label: "7 dagar" },
    { value: "30d", label: "30 dagar" },
    { value: "90d", label: "90 dagar" },
  ];

  return (
    <>
      <div className="admin-topbar">
        <h1>🏠 Dashboard</h1>
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
          <button className="btn-refresh" onClick={loadAnalytics}>↻</button>
        </div>
      </div>

      <div className="admin-content">
        {/* Realtime bar */}
        <div className="realtime-banner">
          <RealtimePulse active={realtime.active_chats} />
          <span style={{ fontSize: 12, color: "var(--muted)", marginLeft: "auto" }}>
            {realtime.recent_events} händelser senaste 5 min
          </span>
        </div>

        {loading ? (
          <div style={{ color: "var(--muted)", padding: "24px 0" }}>Laddar…</div>
        ) : (
          <>
            {/* KPI cards */}
            <div className="admin-kpi-grid">
              <KpiCard icon="👁️" value={analytics?.totalPageViews || 0}  label="Sidvisningar"      color="#3b82f6" sub={`senaste ${period}`} />
              <KpiCard icon="💬" value={analytics?.chatSessions    || 0}  label="Chattsessioner"   color="#8b5cf6" sub={`senaste ${period}`} />
              <KpiCard icon="🧮" value={analytics?.calculatorOpens || 0}  label="Kalkylator öppnad" color="#f59e0b" sub={`senaste ${period}`} />
              <KpiCard icon="📞" value={analytics?.totalContacts   || 0}  label="Kontaktbegäran"   color="#10b981" sub={`senaste ${period}`} />
            </div>

            {/* Conversion funnel */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="admin-card">
                <div className="admin-card-title">📈 Konverteringstratt</div>
                {analytics?.funnel?.length ? (
                  <div className="funnel-wrap">
                    {analytics.funnel.map((step, i) => (
                      <FunnelStep key={step.label} {...step} isFirst={i === 0} />
                    ))}
                  </div>
                ) : (
                  <div style={{ color: "var(--muted)", fontSize: 13 }}>Ingen data ännu</div>
                )}
              </div>

              {/* Top pages */}
              <div className="admin-card">
                <div className="admin-card-title">📄 Populäraste sidor</div>
                {analytics?.topPages?.length ? (
                  <ul className="analytics-list">
                    {analytics.topPages.slice(0, 8).map((p) => {
                      const max = analytics.topPages[0]?.views || 1;
                      return (
                        <li key={p.page} style={{ flexDirection: "column", gap: 3 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 12, color: "var(--text)" }}>{p.page}</span>
                            <span className="count">{Number(p.views).toLocaleString("sv-SE")}</span>
                          </div>
                          <div style={{ height: 4, background: "var(--border)", borderRadius: 2 }}>
                            <div style={{ height: 4, background: "var(--green)", borderRadius: 2, width: `${Math.round(p.views / max * 100)}%` }} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : <div style={{ color: "var(--muted)", fontSize: 13 }}>Ingen data</div>}
              </div>
            </div>

            {/* Bottom row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Daily chats chart */}
              <div className="admin-card">
                <div className="admin-card-title">📅 Chattar per dag</div>
                {analytics?.dailyChats?.length ? (
                  <div className="bar-chart">
                    {(() => {
                      const max = Math.max(...analytics.dailyChats.map((d) => Number(d.sessions)), 1);
                      return analytics.dailyChats.slice(0, 14).reverse().map((d) => (
                        <div key={d.day} className="bar-col">
                          <div className="bar-col-bar" style={{ height: `${Math.round(Number(d.sessions) / max * 100)}%` }} title={`${d.sessions} chattar`} />
                          <div className="bar-col-label">
                            {new Date(d.day).toLocaleDateString("sv-SE", { day: "numeric", month: "numeric" })}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                ) : <div style={{ color: "var(--muted)", fontSize: 13 }}>Ingen data ännu</div>}
              </div>

              {/* Popular questions */}
              <div className="admin-card">
                <div className="admin-card-title">❓ Vanligaste frågor</div>
                {analytics?.popularQuestions?.length ? (
                  <ul className="analytics-list">
                    {analytics.popularQuestions.slice(0, 6).map((q, i) => (
                      <li key={i}>
                        <span style={{ fontSize: 12, color: "var(--text)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 220 }}>
                          {q.content}
                        </span>
                        <span className="count">{q.count}×</span>
                      </li>
                    ))}
                  </ul>
                ) : <div style={{ color: "var(--muted)", fontSize: 13 }}>Ingen data</div>}
              </div>
            </div>

            {/* Quick links */}
            <div className="admin-card" style={{ marginTop: 0 }}>
              <div className="admin-card-title">⚡ Snabblänkar</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {[
                  { key: "sessions",       icon: "💬", label: "Visa chattar" },
                  { key: "contacts",       icon: "📞", label: "Kontakter" },
                  { key: "reports",        icon: "📥", label: "Exportera data" },
                  { key: "knowledge",      icon: "📚", label: "Kunskapsbas" },
                  { key: "settings",       icon: "⚙️", label: "Inställningar" },
                ].map((item) => (
                  <button
                    key={item.key}
                    className="quick-link-btn"
                    onClick={() => onNavigate?.(item.key)}
                  >
                    {item.icon} {item.label}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
