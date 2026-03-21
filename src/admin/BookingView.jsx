// src/admin/BookingView.jsx — Bokningsöversikt i admin
import { useState, useEffect, useCallback } from "react";

const STATUS_LABELS = { pending: "Ej bekräftad", confirmed: "Bekräftad", cancelled: "Avbokad" };
const STATUS_COLORS = { pending: "#f59e0b", confirmed: "var(--green)", cancelled: "var(--muted)" };

function fmt(dateStr) {
  return new Date(dateStr).toLocaleDateString("sv-SE", { weekday: "short", year: "numeric", month: "short", day: "numeric" });
}

export default function BookingView({ headers, apiBase }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      if (selectedDate) params.set("date", selectedDate);
      const res = await fetch(`${apiBase}/api/admin/bookings?${params}`, { headers });
      const json = await res.json();
      setBookings(json.bookings || []);
    } finally { setLoading(false); }
  }, [apiBase, filter, selectedDate, JSON.stringify(headers)]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (id, status) => {
    await fetch(`${apiBase}/api/admin/bookings/${id}`, {
      method: "PATCH",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  };

  const FILTERS = [
    { value: "all",       label: "Alla" },
    { value: "pending",   label: "Ej bekräftade" },
    { value: "confirmed", label: "Bekräftade" },
    { value: "cancelled", label: "Avbokade" },
  ];

  return (
    <>
      <div className="admin-topbar">
        <h1>📅 Bokningar</h1>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flex: 1, maxWidth: 700 }}>
          <input
            type="date"
            className="admin-input"
            style={{ marginBottom: 0, width: 160, fontSize: 12 }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          {selectedDate && (
            <button className="btn-refresh" style={{ fontSize: 12 }} onClick={() => setSelectedDate("")}>✕ Rensa datum</button>
          )}
          {FILTERS.map((f) => (
            <button
              key={f.value}
              className={`period-btn${filter === f.value ? " active" : ""}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
          <button className="btn-refresh" onClick={load}>↻</button>
        </div>
      </div>

      <div className="admin-content">
        {loading ? (
          <div style={{ color: "var(--muted)" }}>Laddar…</div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📅</div>
            <div>Inga bokningar hittades</div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {bookings.map((b) => (
              <div
                key={b.id}
                className="admin-card"
                style={{ display: "flex", alignItems: "center", gap: 16, padding: "14px 20px" }}
              >
                {/* Date + time */}
                <div style={{ minWidth: 130, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 700 }}>{b.booking_time}</div>
                  <div style={{ fontSize: 11, color: "var(--muted)" }}>{fmt(b.booking_date)}</div>
                </div>

                {/* Customer info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{b.name}</div>
                  <div style={{ fontSize: 12, color: "var(--muted)" }}>
                    <a href={`tel:${b.phone}`} style={{ color: "var(--green)" }}>{b.phone}</a>
                    {b.email && <> · <a href={`mailto:${b.email}`} style={{ color: "var(--green)" }}>{b.email}</a></>}
                  </div>
                  {b.message && (
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4, fontStyle: "italic" }}>
                      "{b.message}"
                    </div>
                  )}
                </div>

                {/* Status */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                  <span style={{
                    fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 12,
                    background: STATUS_COLORS[b.status] + "22",
                    color: STATUS_COLORS[b.status],
                    border: `1px solid ${STATUS_COLORS[b.status]}44`,
                  }}>
                    {STATUS_LABELS[b.status] || b.status}
                  </span>

                  {b.status === "pending" && (
                    <button
                      className="btn-refresh"
                      style={{ fontSize: 12, color: "var(--green)", borderColor: "var(--green)" }}
                      onClick={() => updateStatus(b.id, "confirmed")}
                    >
                      ✓ Bekräfta
                    </button>
                  )}
                  {b.status !== "cancelled" && (
                    <button
                      className="btn-refresh"
                      style={{ fontSize: 12, color: "var(--red)", borderColor: "var(--red)" }}
                      onClick={() => updateStatus(b.id, "cancelled")}
                    >
                      ✕ Avboka
                    </button>
                  )}
                </div>

                {/* Booking ID */}
                <div style={{ fontSize: 10, color: "var(--muted)", fontFamily: "monospace", flexShrink: 0 }}>
                  #{b.id}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
