// src/admin/SettingsView.jsx — Site settings admin panel
import { useState, useEffect, useCallback } from "react";

const LOGO_SIZES = [
  { value: "small",  label: "Liten (100px)" },
  { value: "normal", label: "Normal (140px)" },
  { value: "large",  label: "Stor (200px)" },
];

function ColorPicker({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 48, height: 40, border: "none", borderRadius: 6, cursor: "pointer", padding: 2 }}
        />
        <input
          className="admin-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ width: 120, marginBottom: 0 }}
          placeholder="#059669"
        />
        <div style={{ width: 40, height: 40, borderRadius: 8, background: value, border: "1px solid var(--border)" }} />
      </div>
    </div>
  );
}

function RangeField({ label, value, onChange, min = 0, max = 100, unit = "%" }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
        {label} — <span style={{ color: "var(--text)" }}>{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min} max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", accentColor: "var(--green)" }}
      />
    </div>
  );
}

function TextField({ label, value, onChange, multiline }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
        {label}
      </div>
      {multiline ? (
        <textarea
          className="reply-input"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          style={{ width: "100%" }}
        />
      ) : (
        <input className="admin-input" value={value} onChange={(e) => onChange(e.target.value)} style={{ marginBottom: 0 }} />
      )}
    </div>
  );
}

export default function SettingsView({ headers, apiBase }) {
  const [settings, setSettings] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`${apiBase}/api/admin/settings`, { headers });
    const data = await res.json();
    setSettings(data);
  }, [apiBase, JSON.stringify(headers)]);

  useEffect(() => { load(); }, [load]);

  const set = (key) => (value) => setSettings((s) => ({ ...s, [key]: value }));

  const save = async () => {
    setSaving(true);
    try {
      await fetch(`${apiBase}/api/admin/settings`, {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (!settings) return <div style={{ padding: 24, color: "var(--muted)" }}>Laddar…</div>;

  return (
    <>
      <div className="admin-topbar">
        <h1>⚙️ Sidinställningar</h1>
        <button
          className="btn-send"
          onClick={save}
          disabled={saving}
          style={{ minWidth: 120 }}
        >
          {saving ? "Sparar…" : saved ? "✓ Sparat!" : "Spara ändringar"}
        </button>
      </div>

      <div className="admin-content">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 24 }}>

          {/* Hero content */}
          <div className="admin-card">
            <div className="admin-card-title">🏠 Hero-sektion</div>
            <TextField label="Rubrik" value={settings.hero_title || ""} onChange={set("hero_title")} />
            <TextField label="Undertext" value={settings.hero_subtitle || ""} onChange={set("hero_subtitle")} multiline />
            <TextField label="CTA-knapptext" value={settings.hero_cta || ""} onChange={set("hero_cta")} />

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                Deal-banner
              </div>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={settings.deal_visible === "true"}
                  onChange={(e) => set("deal_visible")(e.target.checked ? "true" : "false")}
                  style={{ accentColor: "var(--green)", width: 16, height: 16 }}
                />
                <span style={{ fontSize: 13 }}>Visa deal-banner</span>
              </label>
              <input
                className="admin-input"
                value={settings.deal_text || ""}
                onChange={(e) => set("deal_text")(e.target.value)}
                style={{ marginBottom: 0 }}
                placeholder="Veckans deal: …"
              />
            </div>
          </div>

          {/* Colors */}
          <div className="admin-card">
            <div className="admin-card-title">🎨 Färger & Estetik</div>
            <ColorPicker
              label="Accentfärg (knappar, länkar)"
              value={settings.accent_color || "#059669"}
              onChange={set("accent_color")}
            />
            <ColorPicker
              label="Rubrikfärg"
              value={settings.heading_color || "#111827"}
              onChange={set("heading_color")}
            />
            <ColorPicker
              label="Brödtextfärg"
              value={settings.body_color || "#374151"}
              onChange={set("body_color")}
            />
            <RangeField
              label="Hero-ljusstyrka"
              value={settings.hero_brightness || "100"}
              onChange={set("hero_brightness")}
              min={30} max={120}
            />
          </div>

          {/* Logo & Branding */}
          <div className="admin-card">
            <div className="admin-card-title">🪨 Logotyp & Varumärke</div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
                Logotyp-storlek
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {LOGO_SIZES.map((s) => (
                  <button
                    key={s.value}
                    onClick={() => set("logo_size")(s.value)}
                    style={{
                      padding: "8px 14px", borderRadius: 8, border: "1px solid",
                      borderColor: settings.logo_size === s.value ? "var(--green)" : "var(--border)",
                      background: settings.logo_size === s.value ? "rgba(5,150,105,0.1)" : "var(--surface2)",
                      color: settings.logo_size === s.value ? "var(--green)" : "var(--muted)",
                      cursor: "pointer", fontSize: 13,
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live preview */}
            <div style={{ marginTop: 24, padding: 20, background: "var(--surface2)", borderRadius: 10, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: 12 }}>FÖRHANDSGRANSKNING</div>
              <div style={{
                background: settings.accent_color, color: "white",
                borderRadius: 8, padding: "10px 20px", display: "inline-block",
                fontWeight: 600, fontSize: 14
              }}>
                {settings.hero_cta || "Beräkna & begär offert"}
              </div>
              <div style={{ marginTop: 12, fontSize: 20, fontWeight: 700, color: settings.heading_color }}>
                {settings.hero_title || "Rubrik"}
              </div>
              <div style={{ fontSize: 13, color: settings.body_color, marginTop: 4 }}>
                {settings.hero_subtitle || "Undertext"}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 16, padding: "12px 16px", background: "var(--surface2)", borderRadius: 8, border: "1px solid var(--border)", fontSize: 13, color: "var(--muted)" }}>
          ℹ️ Ändringar visas på siten efter att du byggt och laddat upp på nytt (npm run build → FTP). Färger och hero-text uppdateras direkt för besökare som har en aktiv session.
        </div>
      </div>
    </>
  );
}
