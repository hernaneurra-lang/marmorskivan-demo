// src/admin/AnalyticsView.jsx
import { useState, useEffect, useCallback } from "react";

function StatCard({ value, label }) {
  return (
    <div className="admin-stat">
      <div className="admin-stat-value">{Number(value).toLocaleString("sv-SE")}</div>
      <div className="admin-stat-label">{label}</div>
    </div>
  );
}

export default function AnalyticsView({ headers, apiBase }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/api/admin/analytics`, { headers });
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [apiBase, JSON.stringify(headers)]);

  useEffect(() => { load(); }, [load]);

  const totalChats = data?.dailyChats?.reduce((sum, d) => sum + Number(d.sessions), 0) || 0;

  return (
    <>
      <div className="admin-topbar">
        <h1>📊 Analytics</h1>
        <button className="btn-refresh" onClick={load}>Uppdatera</button>
      </div>
      <div className="admin-content">
        {loading ? (
          <div style={{ color: "var(--muted)" }}>Laddar…</div>
        ) : (
          <>
            {/* Stat cards */}
            <div className="admin-stats">
              <StatCard value={data?.totalPageViews || 0} label="Sidvisningar totalt" />
              <StatCard value={totalChats} label="Chattsessioner (30 dagar)" />
              <StatCard value={data?.topPages?.length || 0} label="Unika sidor" />
            </div>

            <div className="analytics-grid">
              {/* Top pages */}
              <div className="admin-card">
                <div className="admin-card-title">Populäraste sidorna</div>
                {data?.topPages?.length ? (
                  <ul className="analytics-list">
                    {data.topPages.map((p) => (
                      <li key={p.page}>
                        <span style={{ color: "var(--text)" }}>{p.page}</span>
                        <span className="count">{Number(p.views).toLocaleString("sv-SE")}</span>
                      </li>
                    ))}
                  </ul>
                ) : <div className="text-muted">Ingen data</div>}
              </div>

              {/* Popular questions */}
              <div className="admin-card">
                <div className="admin-card-title">Vanligaste frågor</div>
                {data?.popularQuestions?.length ? (
                  <ul className="analytics-list">
                    {data.popularQuestions.map((q, i) => (
                      <li key={i}>
                        <span style={{ color: "var(--text)", maxWidth: 260, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {q.content}
                        </span>
                        <span className="count">{q.count}×</span>
                      </li>
                    ))}
                  </ul>
                ) : <div className="text-muted">Ingen data</div>}
              </div>

              {/* Events */}
              <div className="admin-card">
                <div className="admin-card-title">Event-typer</div>
                {data?.topEvents?.length ? (
                  <ul className="analytics-list">
                    {data.topEvents.map((e) => (
                      <li key={e.event}>
                        <span style={{ color: "var(--text)", fontFamily: "monospace", fontSize: 12 }}>{e.event}</span>
                        <span className="count">{Number(e.count).toLocaleString("sv-SE")}</span>
                      </li>
                    ))}
                  </ul>
                ) : <div className="text-muted">Ingen data</div>}
              </div>

              {/* Daily chats */}
              <div className="admin-card">
                <div className="admin-card-title">Chattsessioner per dag (30 dagar)</div>
                {data?.dailyChats?.length ? (
                  <ul className="analytics-list">
                    {data.dailyChats.slice(0, 14).map((d) => (
                      <li key={d.day}>
                        <span style={{ color: "var(--text)" }}>
                          {new Date(d.day).toLocaleDateString("sv-SE", { weekday: "short", month: "short", day: "numeric" })}
                        </span>
                        <span className="count">{d.sessions} sessioner</span>
                      </li>
                    ))}
                  </ul>
                ) : <div className="text-muted">Ingen data ännu</div>}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
