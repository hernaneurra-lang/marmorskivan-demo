// src/components/BookingModal.jsx — Bokningsmodal med kalender, tider och formulär
import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_CHAT_API_BASE || "";

const TIME_SLOTS = [
  "08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30",
  "12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30",
];

function toISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

function isWeekend(date) { return date.getDay() === 0 || date.getDay() === 6; }
function isPast(date) {
  const today = new Date(); today.setHours(0,0,0,0);
  return date < today;
}

export default function BookingModal({ onClose, sessionId }) {
  const [step, setStep] = useState(1); // 1=kalender, 2=tid, 3=formulär, 4=klar
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sending, setSending] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [error, setError] = useState("");

  // Calendar state
  const today = new Date(); today.setHours(0,0,0,0);
  const [calMonth, setCalMonth] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  // Fetch booked slots when date selected
  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    fetch(`${API_BASE}/api/bookings/slots?date=${toISO(selectedDate)}`)
      .then((r) => r.json())
      .then((d) => setBookedSlots(d.booked || []))
      .catch(() => setBookedSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate]);

  // Build calendar grid
  const buildCalendar = () => {
    const days = [];
    const firstDay = new Date(calMonth.getFullYear(), calMonth.getMonth(), 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1; // Mon=0
    const daysInMonth = new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 0).getDate();
    for (let i = 0; i < offset; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(new Date(calMonth.getFullYear(), calMonth.getMonth(), d));
    }
    return days;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setSending(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/api/bookings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: toISO(selectedDate),
          time: selectedTime,
          ...form,
          sessionId: sessionId || null,
        }),
      });
      const json = await res.json();
      if (res.status === 409) { setError("Den valda tiden är tagen. Välj en annan."); setSending(false); return; }
      if (!res.ok) throw new Error(json.error);
      setBookingId(json.id);
      setStep(4);
    } catch (err) {
      setError(err.message || "Något gick fel. Försök igen.");
    } finally { setSending(false); }
  };

  const WEEKDAYS = ["Mån","Tis","Ons","Tor","Fre","Lör","Sön"];

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 9000,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: "white", borderRadius: 20, padding: 28, maxWidth: 460, width: "100%",
        maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        color: "#1a1d27",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>📅 Boka mätningsbesök</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
              {step === 1 && "Välj datum"}
              {step === 2 && selectedDate && `${selectedDate.toLocaleDateString("sv-SE", { weekday:"long", day:"numeric", month:"long" })} — välj tid`}
              {step === 3 && `${toISO(selectedDate)} kl ${selectedTime} — dina uppgifter`}
              {step === 4 && "Bokningsbekräftelse"}
            </div>
          </div>
          <button onClick={onClose} style={{ fontSize: 22, border: "none", background: "none", cursor: "pointer", color: "#6b7280" }}>×</button>
        </div>

        {/* Progress */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
          {["Datum","Tid","Uppgifter","Klart"].map((label, i) => (
            <div key={label} style={{ flex: 1, textAlign: "center" }}>
              <div style={{
                height: 4, borderRadius: 2, marginBottom: 4,
                background: step > i ? "#059669" : step === i + 1 ? "#059669" : "#e5e7eb",
              }} />
              <div style={{ fontSize: 10, color: step === i + 1 ? "#059669" : "#9ca3af", fontWeight: step === i+1 ? 700 : 400 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Step 1: Calendar */}
        {step === 1 && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <button
                onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() - 1, 1))}
                style={{ fontSize: 18, border: "none", background: "none", cursor: "pointer", color: "#374151" }}
              >‹</button>
              <div style={{ fontWeight: 700, fontSize: 15 }}>
                {calMonth.toLocaleDateString("sv-SE", { month: "long", year: "numeric" })}
              </div>
              <button
                onClick={() => setCalMonth(new Date(calMonth.getFullYear(), calMonth.getMonth() + 1, 1))}
                style={{ fontSize: 18, border: "none", background: "none", cursor: "pointer", color: "#374151" }}
              >›</button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
              {WEEKDAYS.map((d) => (
                <div key={d} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: "#9ca3af", padding: "4px 0" }}>{d}</div>
              ))}
              {buildCalendar().map((date, i) => {
                if (!date) return <div key={i} />;
                const disabled = isPast(date) || isWeekend(date);
                const isSelected = selectedDate && toISO(date) === toISO(selectedDate);
                return (
                  <button
                    key={i}
                    disabled={disabled}
                    onClick={() => { setSelectedDate(date); setSelectedTime(null); setStep(2); }}
                    style={{
                      padding: "8px 4px", borderRadius: 8, border: "none", cursor: disabled ? "default" : "pointer",
                      background: isSelected ? "#059669" : disabled ? "transparent" : "#f9fafb",
                      color: isSelected ? "white" : disabled ? "#d1d5db" : "#374151",
                      fontWeight: isSelected ? 700 : 400, fontSize: 13,
                    }}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
            <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 12, textAlign: "center" }}>
              Mätningsbesök erbjuds måndag–fredag
            </div>
          </div>
        )}

        {/* Step 2: Time slots */}
        {step === 2 && (
          <div>
            <button onClick={() => setStep(1)} style={{ fontSize: 12, color: "#059669", background: "none", border: "none", cursor: "pointer", marginBottom: 12 }}>← Byt datum</button>
            {loadingSlots ? (
              <div style={{ textAlign: "center", color: "#9ca3af", padding: 20 }}>Kontrollerar tillgängliga tider…</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {TIME_SLOTS.map((slot) => {
                  const taken = bookedSlots.includes(slot);
                  return (
                    <button
                      key={slot}
                      disabled={taken}
                      onClick={() => { setSelectedTime(slot); setStep(3); }}
                      style={{
                        padding: "10px 8px", borderRadius: 10, border: "2px solid",
                        borderColor: taken ? "#e5e7eb" : "#059669",
                        background: taken ? "#f9fafb" : "white",
                        color: taken ? "#d1d5db" : "#059669",
                        cursor: taken ? "default" : "pointer",
                        fontWeight: 600, fontSize: 14,
                        textDecoration: taken ? "line-through" : "none",
                      }}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Contact form */}
        {step === 3 && (
          <form onSubmit={submit}>
            <button type="button" onClick={() => setStep(2)} style={{ fontSize: 12, color: "#059669", background: "none", border: "none", cursor: "pointer", marginBottom: 16 }}>← Byt tid</button>
            <div style={{ background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 10, padding: "10px 14px", marginBottom: 16, fontSize: 13, color: "#166534" }}>
              📅 {selectedDate?.toLocaleDateString("sv-SE", { weekday:"long", day:"numeric", month:"long" })} kl {selectedTime}
            </div>
            {[
              { key: "name",    label: "Namn *",    type: "text",  required: true },
              { key: "phone",   label: "Telefon *", type: "tel",   required: true },
              { key: "email",   label: "E-post",    type: "email", required: false },
              { key: "message", label: "Övrigt (adress, antal löpmeter m.m.)", type: "textarea", required: false },
            ].map(({ key, label, type, required }) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>{label}</label>
                {type === "textarea" ? (
                  <textarea
                    value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    rows={3} style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 12px", fontSize: 13, resize: "vertical", fontFamily: "inherit" }}
                  />
                ) : (
                  <input
                    type={type} required={required} value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                    style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "8px 12px", fontSize: 13 }}
                  />
                )}
              </div>
            ))}
            {error && <div style={{ color: "#dc2626", fontSize: 12, marginBottom: 12 }}>⚠️ {error}</div>}
            <button type="submit" disabled={sending} style={{
              width: "100%", background: "#059669", color: "white", border: "none",
              borderRadius: 10, padding: "12px", fontSize: 15, fontWeight: 700, cursor: "pointer",
            }}>
              {sending ? "Skickar…" : "Bekräfta bokning →"}
            </button>
          </form>
        )}

        {/* Step 4: Confirmation */}
        {step === 4 && (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>✅</div>
            <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 8 }}>Bokning mottagen!</div>
            <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.5, marginBottom: 16 }}>
              Vi bekräftar din tid via telefon. Kom ihåg:<br />
              <strong>{selectedDate?.toLocaleDateString("sv-SE", { weekday:"long", day:"numeric", month:"long" })}</strong> kl <strong>{selectedTime}</strong>
            </div>
            {bookingId && <div style={{ fontSize: 11, color: "#9ca3af" }}>Bokningsnr: #{bookingId}</div>}
            <button onClick={onClose} style={{
              marginTop: 20, background: "#059669", color: "white", border: "none",
              borderRadius: 10, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: "pointer",
            }}>Stäng</button>
          </div>
        )}
      </div>
    </div>
  );
}
