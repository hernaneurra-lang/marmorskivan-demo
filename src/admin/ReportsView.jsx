// src/admin/ReportsView.jsx — CSV export hub
import { useState } from "react";

const REPORTS = [
  {
    type: "contacts",
    icon: "📞",
    title: "Kontakter",
    desc: "Alla inlämnade kontaktbegäran med namn, telefon, e-post och meddelande.",
    color: "#10b981",
  },
  {
    type: "sessions",
    icon: "💬",
    title: "Chattsessioner",
    desc: "Alla chattsessioner med status, prioritet, antal meddelanden och lead-flagga.",
    color: "#8b5cf6",
  },
  {
    type: "events",
    icon: "⚡",
    title: "Händelselogg",
    desc: "Alla analytics-händelser (page_view, calculator_open, offer_submit m.m.).",
    color: "#3b82f6",
  },
];

const PERIODS = [
  { value: "7d",  label: "7 dagar" },
  { value: "30d", label: "30 dagar" },
  { value: "90d", label: "90 dagar" },
  { value: "365d", label: "1 år" },
];

export default function ReportsView({ headers, apiBase }) {
  const [period, setPeriod] = useState("30d");
  const [loading, setLoading] = useState({});

  const download = async (type) => {
    setLoading((p) => ({ ...p, [type]: true }));
    try {
      const url = `${apiBase}/api/admin/export/${type}?period=${period}&token=${headers["x-admin-token"]}`;
      const res = await fetch(url, { headers });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      const cd = res.headers.get("Content-Disposition") || "";
      const fname = cd.match(/filename="(.+?)"/)?.[1] || `export_${type}.csv`;
      a.download = fname;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (e) {
      alert("Export misslyckades: " + e.message);
    } finally {
      setLoading((p) => ({ ...p, [type]: false }));
    }
  };

  return (
    <>
      <div className="admin-topbar">
        <h1>📥 Rapporter & Export</h1>
        <div style={{ display: "flex", gap: 8 }}>
          {PERIODS.map((p) => (
            <button
              key={p.value}
              className={`period-btn${period === p.value ? " active" : ""}`}
              onClick={() => setPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="admin-content">
        <div style={{ marginBottom: 20, padding: "12px 16px", background: "var(--surface2)", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, color: "var(--muted)" }}>
          ℹ️ Ladda ner data som CSV-fil. Välj tidsperiod ovan och klicka på Ladda ner. Filen öppnas i Excel med korrekt UTF-8-kodning.
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {REPORTS.map((r) => (
            <div key={r.type} className="admin-card report-card">
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 10,
                  background: r.color + "22", color: r.color,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                }}>
                  {r.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 15 }}>{r.title}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>Senaste {period}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16, lineHeight: 1.5 }}>
                {r.desc}
              </div>
              <button
                className="btn-primary"
                style={{ width: "100%", justifyContent: "center", background: r.color }}
                onClick={() => download(r.type)}
                disabled={loading[r.type]}
              >
                {loading[r.type] ? "Exporterar…" : "⬇ Ladda ner CSV"}
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 24 }}>
          <div className="admin-card-title" style={{ marginBottom: 12 }}>⚡ Snabblänkar</div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            {[
              { href: `${apiBase}/api/admin/export/contacts?period=30d&token=${headers["x-admin-token"]}`, label: "📞 Kontakter 30d" },
              { href: `${apiBase}/api/admin/export/sessions?period=30d&token=${headers["x-admin-token"]}`, label: "💬 Chattar 30d" },
              { href: `${apiBase}/api/admin/export/events?period=7d&token=${headers["x-admin-token"]}`,   label: "⚡ Events 7d" },
            ].map((l) => (
              <a key={l.href} href={l.href} className="quick-link-btn" style={{ textDecoration: "none" }}>
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
