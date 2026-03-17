// api-dev/server.mjs — Marmorskivan API server (Railway-ready)
import express from "express";
import cors from "cors";
import { OpenAI } from "openai";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

// ── CORS — allow marmorskivan.se + localhost dev ──
const ALLOWED_ORIGINS = [
  "https://marmorskivan.se",
  "https://www.marmorskivan.se",
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
];

const app = express();
app.use(cors({
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // curl / server-to-server
    const ok = ALLOWED_ORIGINS.some((o) => typeof o === "string" ? o === origin : o.test(origin));
    cb(ok ? null : new Error("CORS blocked"), ok);
  },
  methods: ["GET", "POST", "OPTIONS"],
}));
app.use(express.json({ limit: "16kb" }));

// ── Simple in-memory rate limiter (per IP, per minute) ──
const rateLimits = new Map();
function rateLimit(maxPerMin) {
  return (req, res, next) => {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const key = `${ip}`;
    const entry = rateLimits.get(key) || { count: 0, reset: now + 60_000 };
    if (now > entry.reset) { entry.count = 0; entry.reset = now + 60_000; }
    entry.count++;
    rateLimits.set(key, entry);
    if (entry.count > maxPerMin) return res.status(429).json({ error: "too_many_requests" });
    next();
  };
}

let openai = null;
function getOpenAI() {
  if (!openai) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai;
}

const SYSTEM_PROMPT = `Du är en hjälpsam kundtjänstassistent för marmorskivan.se — en svensk e-handel för steniga bänkskivor (marmor, granit, kvartskomposit, kalksten, travertin, terrazzo, onyx m.m.).

Svara alltid på svenska. Var kort och konkret — max 3-4 meningar per svar om inget annat krävs.

Du kan hjälpa kunder med:
- Material: egenskaper, underhåll, lämplighet för kök/badrum
- Priser: bänkskivor kostar vanligtvis 1 500–6 000 kr/m² beroende på material
- Mätning: vi erbjuder professionell mätning på plats i Storstockholm
- Leverans: 2–6 veckors ledtid beroende på material och montering
- Offert: hänvisa till vår kalkylator på /app eller att de lämnar kontaktuppgifter

Om du inte vet svaret, hänvisa kunden till att ringa eller lämna sina kontaktuppgifter.`;

// ── Health check (Railway uses this) ──
app.get("/health", (_req, res) => res.json({ ok: true }));

// ── Chat ──
app.post("/api/chat", rateLimit(20), async (req, res) => {
  const { message, history = [] } = req.body || {};
  if (!message?.trim()) return res.status(400).json({ error: "message required" });
  if (message.length > 1000) return res.status(400).json({ error: "message too long" });

  try {
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 300,
      temperature: 0.7,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...history.slice(-8).map((m) => ({ role: m.role, content: String(m.content).slice(0, 500) })),
        { role: "user", content: message },
      ],
    });
    const reply = completion.choices[0]?.message?.content?.trim() || "Tyvärr kan jag inte svara just nu.";
    res.json({ reply });
  } catch (e) {
    console.error("OpenAI error:", e?.message);
    res.status(500).json({ error: "ai_error" });
  }
});

// ── Contact form ──
app.post("/api/contact", rateLimit(5), async (req, res) => {
  const { name, phone, email, message } = req.body || {};
  if (!name || !phone) return res.status(400).json({ error: "name and phone required" });

  // Log for now — wire up nodemailer / Resend in production
  console.log(`[contact] ${name} | ${phone} | ${email || "-"} | ${message || "-"}`);

  // Optional: forward to existing send-quote endpoint or email service
  res.json({ ok: true });
});

// ── Analytics (fire-and-forget, never fails) ──
app.post("/api/analytics", (req, res) => {
  try {
    const { event, session, page, ts } = req.body || {};
    console.log(`[analytics] ${event} | ${page} | session=${session} | ts=${ts}`);
  } catch {}
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`✅ API server on port ${PORT}`);
});
