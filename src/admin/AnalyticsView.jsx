// src/admin/AnalyticsView.jsx — Enhanced analytics with period filter, funnel, visual charts
import { useState, useEffect, useCallback } from "react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from "recharts";

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
              <StatCard icon="👁️" value={data?.totalPageViews}  label="Sidvisningar"       color="#3b82f6" />
              <StatCard icon="🧑" value={data?.uniqueSessions}  label="Unika sessioner"    color="#6366f1" />
              <StatCard icon="💬" value={data?.chatSessions}    label="Chattsessioner"     color="#8b5cf6" />
              <StatCard icon="🧮" value={data?.calculatorOpens} label="Kalkylator öppnad"  color="#f59e0b" />
              <StatCard icon="📋" value={data?.offerSubmits}    label="Offerter begärda"   color="#ef4444" />
              <StatCard icon="📞" value={data?.totalContacts}   label="Kontaktbegäran"     color="#10b981" />
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

            {/* Daily chats line chart */}
            <div className="admin-card">
              <div className="admin-card-title">📅 Chattsessioner per dag</div>
              {data?.dailyChats?.length ? (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={[...data.dailyChats].reverse()} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 10, fill: "var(--muted)" }}
                      tickFormatter={(v) => new Date(v).toLocaleDateString("sv-SE", { day: "numeric", month: "numeric" })}
                    />
                    <YAxis tick={{ fontSize: 10, fill: "var(--muted)" }} allowDecimals={false} />
                    <Tooltip
                      formatter={(v) => [v, "Chattar"]}
                      labelFormatter={(v) => new Date(v).toLocaleDateString("sv-SE", { weekday: "short", day: "numeric", month: "short" })}
                    />
                    <Line type="monotone" dataKey="sessions" stroke="var(--green)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : <div style={{ color: "var(--muted)", fontSize: 13 }}>Ingen data ännu</div>}
            </div>

            {/* Events pie chart + Questions */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              <div className="admin-card">
                <div className="admin-card-title">⚡ Händelsetyper</div>
                {data?.topEvents?.length ? (
                  <>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={data.topEvents.slice(0, 6)}
                          dataKey="count"
                          nameKey="event"
                          cx="50%"
                          cy="50%"
                          outerRadius={65}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          {data.topEvents.slice(0, 6).map((_, i) => (
                            <Cell key={i} fill={["#3b82f6","#8b5cf6","#f59e0b","#10b981","#ef4444","#6366f1"][i % 6]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v, n) => [v, n]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <BarList items={data.topEvents} labelKey="event" valueKey="count" />
                  </>
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
          </>
        )}
      </div>
    </>
  );
}
