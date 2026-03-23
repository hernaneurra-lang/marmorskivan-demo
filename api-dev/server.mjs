// api-dev/server.mjs — Marmorskivan API server (Railway-ready)
import express from "express";
import cors from "cors";
import { OpenAI, toFile } from "openai";
import { fileURLToPath } from "url";
import path from "path";
import nodemailer from "nodemailer";
import { query, migrate } from "./db.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "marmorskivan-admin";
const HAS_DB = Boolean(process.env.DATABASE_URL);
const COMPANY_EMAIL = process.env.COMPANY_EMAIL || "";
const HAS_EMAIL = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

// ── Email transporter (nodemailer) ──
let mailer = null;
function getMailer() {
  if (!HAS_EMAIL) return null;
  if (!mailer) {
    mailer = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  return mailer;
}

async function sendMail(opts) {
  const t = getMailer();
  if (!t) return;
  try {
    await t.sendMail({ from: `Marmorskivan <${process.env.SMTP_USER}>`, ...opts });
  } catch (e) {
    console.error("[email] send failed:", e.message);
  }
}

function makeIcs(date, time, name) {
  const [y, m, d] = date.split("-").map(Number);
  const [h, mi] = time.split(":").map(Number);
  const pad = (n) => String(n).padStart(2, "0");
  const dt  = `${y}${pad(m)}${pad(d)}T${pad(h)}${pad(mi)}00`;
  const dt2 = `${y}${pad(m)}${pad(d)}T${pad(h + 1)}${pad(mi)}00`;
  return [
    "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Marmorskivan//SE",
    "BEGIN:VEVENT",
    `DTSTART:${dt}`,
    `DTEND:${dt2}`,
    `SUMMARY:Mätningsbesök – Marmorskivan`,
    `DESCRIPTION:Mätningsbesök bokat för ${name}`,
    `LOCATION:Marmorskivan`,
    "END:VEVENT", "END:VCALENDAR",
  ].join("\r\n");
}

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
    if (!origin) return cb(null, true);
    const ok = ALLOWED_ORIGINS.some((o) => typeof o === "string" ? o === origin : o.test(origin));
    cb(ok ? null : new Error("CORS blocked"), ok);
  },
  methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
}));
app.use(express.json({ limit: "20mb" }));
app.use(express.text({ limit: "16kb", type: "text/plain" }));

// ── Simple in-memory rate limiter (per IP, per minute) ──
const rateLimits = new Map();
function rateLimit(maxPerMin) {
  return (req, res, next) => {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const key = `${ip}:${req.path}`;
    const entry = rateLimits.get(key) || { count: 0, reset: now + 60_000 };
    if (now > entry.reset) { entry.count = 0; entry.reset = now + 60_000; }
    entry.count++;
    rateLimits.set(key, entry);
    if (entry.count > maxPerMin) return res.status(429).json({ error: "too_many_requests" });
    next();
  };
}

// ── Admin auth middleware ──
function adminAuth(req, res, next) {
  const token = req.headers["x-admin-token"] || req.query.token;
  if (token !== ADMIN_TOKEN) return res.status(401).json({ error: "unauthorized" });
  next();
}

// ── Period helper ──
function periodInterval(period) {
  switch (period) {
    case "24h": return "24 hours";
    case "7d":  return "7 days";
    case "90d": return "90 days";
    default:    return "30 days";
  }
}

let openai = null;
function getOpenAI() {
  if (!openai) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai;
}

// ── Geo lookup (ip-api.com free, no key needed) ──
const geoCache = new Map(); // ip → { country, countryCode, city, region, ts }
async function lookupGeo(ip) {
  if (!ip || ip === "::1" || ip === "127.0.0.1" || ip.startsWith("192.168") || ip.startsWith("10.")) return null;
  if (geoCache.has(ip)) {
    const c = geoCache.get(ip);
    if (Date.now() - c.ts < 3_600_000) return c; // cache 1h
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,zip,lat,lon`);
    if (!res.ok) return null;
    const d = await res.json();
    if (d.status !== "success") return null;
    const geo = { country: d.country, countryCode: d.countryCode, city: d.city, region: d.regionName, zip: d.zip, lat: d.lat, lon: d.lon, ts: Date.now() };
    geoCache.set(ip, geo);
    return geo;
  } catch { return null; }
}

// ── In-memory typing state ──
const typingState = new Map(); // sessionId → { ts }

const SYSTEM_PROMPT = `Du är en hjälpsam kundtjänstassistent för marmorskivan.se — en svensk e-handel för steniga bänkskivor (marmor, granit, kvartskomposit, kalksten, travertin, terrazzo, onyx m.m.).

Svara alltid på svenska. Var kort och konkret — max 3-4 meningar per svar om inget annat krävs.

Du kan hjälpa kunder med:
- Material: egenskaper, underhåll, lämplighet för kök/badrum
- Priser: nämn ALDRIG specifika priser, kr/m² eller prisintervall — priset beror på aktuella råmaterialpriser, mått, kantprofil, antal urtag och bearbetning. Hänvisa alltid till gratis offert via info@marmorskivan.se eller kalkylatorn på /app
- Mätning: vi erbjuder professionell mätning på plats i Storstockholm
- Leverans: 2–6 veckors ledtid beroende på material och montering
- Offert: hänvisa till kalkylatorn på /app eller att de lämnar kontaktuppgifter

VIKTIGT: Ge aldrig konkreta priser eller prisintervall. Förklara gärna vad som påverkar priset, men säg alltid att vi gärna skickar en offert anpassad efter kundens specifika projekt.
Om du inte vet svaret, hänvisa kunden till info@marmorskivan.se eller att lämna sina kontaktuppgifter.`;

// ── DB helpers ──
async function ensureSession(sessionId, page, ip) {
  if (!HAS_DB || !sessionId) return;
  try {
    const geo = await lookupGeo(ip);
    await query(
      `INSERT INTO chat_sessions (id, page, ip, country, country_code, city, region)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (id) DO UPDATE SET last_message_at = NOW()`,
      [sessionId, page || null, ip || null, geo?.country || null, geo?.countryCode || null, geo?.city || null, geo?.region || null]
    );
  } catch (e) {
    console.error("[db] ensureSession:", e.message);
  }
}

async function saveMessage(sessionId, role, content) {
  if (!HAS_DB || !sessionId) return;
  try {
    await query(
      `INSERT INTO chat_messages (session_id, role, content) VALUES ($1, $2, $3)`,
      [sessionId, role, content]
    );
  } catch (e) {
    console.error("[db] saveMessage:", e.message);
  }
}

// ── Health check (Railway uses this) ──
app.get("/health", (_req, res) => res.json({ ok: true, db: HAS_DB }));

// ── Knowledge base keyword matcher ──
async function findKbMatch(message) {
  if (!HAS_DB) return null;
  try {
    const { rows } = await query(`SELECT question, answer FROM knowledge_base WHERE active = true`);
    if (!rows.length) return null;
    const lower = message.toLowerCase();
    // Score each entry by how many words from the question appear in the message
    let best = null, bestScore = 0;
    for (const row of rows) {
      const words = row.question.toLowerCase().replace(/[?!.,]/g, "").split(/\s+/).filter((w) => w.length > 3);
      const score = words.filter((w) => lower.includes(w)).length;
      const ratio = words.length ? score / words.length : 0;
      if (score >= 2 && ratio >= 0.5 && score > bestScore) { best = row; bestScore = score; }
    }
    return best;
  } catch { return null; }
}

// ── Chat ──
app.post("/api/chat", rateLimit(20), async (req, res) => {
  const { message, history = [], sessionId, page, lang = "sv" } = req.body || {};
  if (!message?.trim()) return res.status(400).json({ error: "message required" });
  if (message.length > 1000) return res.status(400).json({ error: "message too long" });

  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
  await ensureSession(sessionId, page, ip);
  await saveMessage(sessionId, "user", message);

  // ── First-message alert to company ──
  if (COMPANY_EMAIL && HAS_DB && sessionId) {
    try {
      const { rows: msgRows } = await query(`SELECT COUNT(*) AS cnt FROM chat_messages WHERE session_id = $1 AND sender = 'user'`, [sessionId]);
      if (parseInt(msgRows[0]?.cnt) === 1) {
        sendMail({
          to: COMPANY_EMAIL,
          subject: `Ny chatt på Marmorskivan`,
          text: `En ny kund har startat en chatt.\n\nSida: ${page || "-"}\nMeddelande: ${message}\n\nLogga in i admin-panelen för att svara.`,
        });
      }
    } catch {}
  }

  // ── If session is in agent mode, don't call AI — agent replies manually ──
  if (HAS_DB && sessionId) {
    try {
      const { rows } = await query(`SELECT mode FROM chat_sessions WHERE id = $1`, [sessionId]);
      if (rows[0]?.mode === "agent") {
        return res.json({ reply: null, mode: "agent" });
      }
    } catch {}
  }

  // ── Try knowledge base keyword match first ──
  const kbMatch = await findKbMatch(message);
  if (kbMatch) {
    await saveMessage(sessionId, "assistant", kbMatch.answer);
    return res.json({ reply: kbMatch.answer, source: "kb" });
  }

  // ── Fall back to OpenAI ──
  try {
    // Enrich system prompt with active knowledge base entries
    let kbContext = "";
    if (HAS_DB) {
      try {
        const { rows: kbRows } = await query(`SELECT question, answer FROM knowledge_base WHERE active = true LIMIT 30`);
        if (kbRows.length) {
          kbContext = "\n\nKunskapsbas (använd dessa svar när de är relevanta):\n" +
            kbRows.map((r) => `F: ${r.question}\nS: ${r.answer}`).join("\n\n");
        }
      } catch {}
    }
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 300,
      temperature: 0.7,
      messages: [
        { role: "system", content: SYSTEM_PROMPT + kbContext + (lang === "en" ? "\n\nIMPORTANT: The user is browsing in English. Respond in English." : "") },
        ...history.slice(-8).map((m) => ({ role: m.role, content: String(m.content).slice(0, 500) })),
        { role: "user", content: message },
      ],
    });
    const reply = completion.choices[0]?.message?.content?.trim() || "Tyvärr kan jag inte svara just nu.";
    await saveMessage(sessionId, "assistant", reply);
    res.json({ reply });
  } catch (e) {
    console.error("OpenAI error:", e?.message);
    res.status(500).json({ error: "ai_error" });
  }
});

// ── Contact form ──
app.post("/api/contact", rateLimit(5), async (req, res) => {
  const { name, phone, email, message, sessionId } = req.body || {};
  if (!name || !phone) return res.status(400).json({ error: "name and phone required" });

  console.log(`[contact] ${name} | ${phone} | ${email || "-"} | ${message || "-"}`);

  if (HAS_DB) {
    try {
      await query(
        `INSERT INTO contacts (session_id, name, phone, email, message) VALUES ($1, $2, $3, $4, $5)`,
        [sessionId || null, name, phone, email || null, message || null]
      );
    } catch (e) {
      console.error("[db] contact:", e.message);
    }
  }

  res.json({ ok: true });
});

// ── Public: site settings ──
app.get("/api/settings", async (_req, res) => {
  if (!HAS_DB) return res.json({});
  try {
    const { rows } = await query(`SELECT key, value FROM site_settings`);
    const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    res.json(settings);
  } catch (e) {
    res.json({});
  }
});

// ── Public: fetch messages for a session (customer polls for agent replies) ──
app.get("/api/chat/messages/:sessionId", rateLimit(60), async (req, res) => {
  if (!HAS_DB) return res.json({ messages: [] });
  try {
    const { after } = req.query;
    let sql = `SELECT id, role, content, created_at FROM chat_messages WHERE session_id = $1`;
    const params = [req.params.sessionId];
    if (after) { params.push(after); sql += ` AND created_at > $2`; }
    sql += ` ORDER BY created_at ASC`;
    const { rows } = await query(sql, params);
    res.json({ messages: rows });
  } catch (e) {
    res.json({ messages: [] });
  }
});

// ── Customer typing ──
app.post("/api/chat/typing", rateLimit(120), (req, res) => {
  const { sessionId } = req.body || {};
  if (sessionId) typingState.set(sessionId, { ts: Date.now() });
  res.json({ ok: true });
});

// ── Customer polls for session mode (bot → agent handover) ──
app.get("/api/chat/sessions/:sessionId/mode", rateLimit(60), async (req, res) => {
  if (!HAS_DB) return res.json({ mode: "bot" });
  try {
    const { rows } = await query(`SELECT mode, agent_name, agent_avatar_url FROM chat_sessions WHERE id = $1`, [req.params.sessionId]);
    const row = rows[0] || {};
    res.json({ mode: row.mode || "bot", agent_name: row.agent_name || null, agent_avatar_url: row.agent_avatar_url || null });
  } catch { res.json({ mode: "bot" }); }
});

// ── Analytics ──
app.post("/api/analytics", async (req, res) => {
  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : (req.body || {});
    const { event, session, page, ts, fp, referrer, ...rest } = body;
    if (HAS_DB && event) {
      const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress;
      const geo = await lookupGeo(ip);
      await query(
        `INSERT INTO analytics_events (event, session_id, page, data, country, city, fp_hash, screen, lang, mobile, referrer)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          event,
          session || null,
          page || null,
          JSON.stringify({ ts, ...rest }),
          geo?.country || null,
          geo?.city || null,
          fp?.hash || null,
          fp?.screen || null,
          fp?.lang || null,
          fp?.mobile ?? null,
          referrer || null,
        ]
      );
    }
  } catch (e) {
    console.error("[analytics] error:", e.message);
  }
  res.json({ ok: true });
});

// ── AI Kitchen Render (DALL-E 3 HD) ──
function buildKitchenPrompt(materialName, shape) {
  const n = (materialName || "").toLowerCase();

  // Material type
  let stoneDesc = "natural stone countertop";
  if (n.includes("granit") || n.includes("granite"))
    stoneDesc = "polished granite with natural crystalline structure and mineral flecks";
  else if (n.includes("marmor") || n.includes("marble") || n.includes("calacatta") || n.includes("carrara") || n.includes("statuario"))
    stoneDesc = "polished marble with elegant natural veining";
  else if (n.includes("kvartskomposit") || n.includes("quartz") || n.includes("komposit") || n.includes("composite"))
    stoneDesc = "engineered quartz with precise, consistent surface pattern";
  else if (n.includes("keramik") || n.includes("dekton") || n.includes("ceramic") || n.includes("sintered"))
    stoneDesc = "ultra-compact sintered ceramic surface, matte or polished";
  else if (n.includes("kvartsit") || n.includes("quartzite"))
    stoneDesc = "natural quartzite with dramatic movement and depth";
  else if (n.includes("travertin") || n.includes("travertine"))
    stoneDesc = "travertine with characteristic natural pores and warm texture";
  else if (n.includes("kalksten") || n.includes("limestone"))
    stoneDesc = "honed limestone with a sophisticated matte finish";

  // Color
  let colorDesc = "";
  if (n.includes("absolute") || n.includes("nero") || n.includes("black") || n.includes("svart"))
    colorDesc = "deep jet-black";
  else if (n.includes("calacatta") || n.includes("statuario"))
    colorDesc = "pure white with bold gold and grey veining";
  else if (n.includes("carrara"))
    colorDesc = "bright white with soft grey veining";
  else if (n.includes("bianco") || n.includes("white") || n.includes("vit") || n.includes("snow"))
    colorDesc = "brilliant white";
  else if (n.includes("grey") || n.includes("gray") || n.includes("grå") || n.includes("grigio"))
    colorDesc = "sophisticated medium grey";
  else if (n.includes("beige") || n.includes("sand") || n.includes("cream") || n.includes("ivory"))
    colorDesc = "warm ivory-beige";
  else if (n.includes("brown") || n.includes("brun") || n.includes("cognac") || n.includes("walnut") || n.includes("wenge"))
    colorDesc = "rich warm brown";
  else if (n.includes("blue") || n.includes("blå") || n.includes("azul") || n.includes("sodalite"))
    colorDesc = "deep ocean blue";
  else if (n.includes("green") || n.includes("grön") || n.includes("verde") || n.includes("emerald"))
    colorDesc = "rich forest green";
  else if (n.includes("gold") || n.includes("guld") || n.includes("amber") || n.includes("honey"))
    colorDesc = "warm amber-gold";

  // Kitchen layout
  let layoutDesc = "long straight countertop running along one wall";
  if (shape === "L" || shape === "L+Island") layoutDesc = "elegant L-shaped countertop configuration";
  else if (shape === "U" || shape === "U+Island") layoutDesc = "spacious U-shaped kitchen with countertops on three sides";
  else if (shape === "Island") layoutDesc = "freestanding kitchen island as the centerpiece";
  if (shape && shape.includes("Island") && shape !== "Island")
    layoutDesc += ", plus a matching kitchen island in the center of the room";

  const fullMaterial = [colorDesc, stoneDesc].filter(Boolean).join(" ").trim();
  const cleanName = (materialName || "").replace(/_/g, " ");

  return `Hyperrealistic architectural interior photograph of a luxury contemporary kitchen.

EVERY single countertop surface in the kitchen — wall countertops, island top, and any other horizontal stone surface — is covered with ${fullMaterial} (${cleanName}). All countertops use the exact same stone material with no exceptions.

CRITICAL: Each countertop is a single continuous stone slab — NOT tiles, NOT panels, NOT segments. One unbroken piece of stone per surface, just like real premium stone countertops. The slab edges are sharp and clean with a slight polished bevel. No grout lines, no joints, no seams from tiling.

Kitchen layout: ${layoutDesc}.

The stone texture, veining, and surface character are photorealistic and prominently visible. Correct light reflection for this material type.

Design details: handleless flat-front cabinetry in matte white or warm oak, integrated flush appliances, large-format floor tiles (NOT stone — plain concrete or porcelain), statement pendant lights, floor-to-ceiling windows with soft Nordic daylight.

Technical: Phase One IQ4 150MP, 23mm tilt-shift, f/8, ISO 200. No people, no text, no watermarks.

Style: Architectural Digest, Elle Decoration Scandinavia — the image makes someone immediately want this exact kitchen.`;
}

// Track active renders and cooldowns per IP
const activeRenders = new Set();
const renderCooldowns = new Map(); // ip → timestamp when cooldown expires
const RENDER_COOLDOWN_MS = 60_000; // 60 sec between renders per IP

app.post("/api/ai-render", async (req, res) => {
  if (!process.env.OPENAI_API_KEY)
    return res.status(503).json({ error: "OpenAI inte konfigurerat" });

  const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  const { materialName, shape } = req.body || {};
  if (!materialName) return res.status(400).json({ error: "materialName krävs" });

  // Block if already rendering
  if (activeRenders.has(ip))
    return res.status(429).json({ error: "render_in_progress", message: "En rendering pågår redan, vänta tills den är klar." });

  // Enforce cooldown between renders
  const cooldownUntil = renderCooldowns.get(ip) || 0;
  const now = Date.now();
  if (now < cooldownUntil) {
    const secsLeft = Math.ceil((cooldownUntil - now) / 1000);
    return res.status(429).json({ error: "cooldown", message: `Vänta ${secsLeft} sekunder innan nästa rendering.`, secsLeft });
  }

  const { materialName, shape, materialImageUrl, kitchenPhotoBase64 } = req.body || {};

  activeRenders.add(ip);
  try {
    let imageUrl;

    if (materialImageUrl) {
      // ── gpt-image-1: use actual material texture image ──
      const images = [];

      // Fetch material texture from our CDN
      const matAbsUrl = materialImageUrl.startsWith("http")
        ? materialImageUrl
        : `https://marmorskivan.se${materialImageUrl}`;
      const matRes = await fetch(matAbsUrl);
      if (matRes.ok) {
        const matBuf = Buffer.from(await matRes.arrayBuffer());
        const ext = matAbsUrl.split(".").pop()?.split("?")[0]?.toLowerCase() || "jpg";
        const mime = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
        images.push(await toFile(matBuf, `material.${ext}`, { type: mime }));
      }

      // Optional: user's own kitchen photo
      if (kitchenPhotoBase64) {
        const b64 = kitchenPhotoBase64.replace(/^data:[^;]+;base64,/, "");
        const kitBuf = Buffer.from(b64, "base64");
        images.push(await toFile(kitBuf, "kitchen.jpg", { type: "image/jpeg" }));
      }

      if (images.length === 0) throw new Error("Kunde inte hämta materialbild");

      const hasKitchen = Boolean(kitchenPhotoBase64);
      const cleanName = (materialName || "").replace(/_/g, " ");
      const prompt = hasKitchen
        ? `Replace ALL countertop surfaces in the kitchen photo (last image) with the EXACT stone texture from the first image. Match the stone color, veining, and surface character precisely. Keep the kitchen layout, cabinets, appliances, lighting, walls and floor completely unchanged. Only the countertop material changes.`
        : `Generate a hyperrealistic luxury kitchen interior featuring countertops made of the EXACT stone shown in the reference image — same color, same veining pattern, same surface texture. Material: ${cleanName}. All countertops are one continuous slab (no tiles or joints). Modern Scandinavian kitchen, white handleless cabinetry, natural daylight. Photorealistic, Architectural Digest quality.`;

      const result = await getOpenAI().images.edit({
        model: "gpt-image-1",
        image: images.length === 1 ? images[0] : images,
        prompt,
        size: "1536x1024",
        quality: "high",
        input_fidelity: "high",
      });

      const b64out = result.data[0].b64_json;
      imageUrl = `data:image/png;base64,${b64out}`;

    } else {
      // ── Fallback: DALL-E 3 text-only ──
      const prompt = buildKitchenPrompt(materialName, shape);
      const result = await getOpenAI().images.generate({
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1792x1024",
        quality: "hd",
        style: "natural",
      });
      imageUrl = result.data[0].url;
    }

    renderCooldowns.set(ip, Date.now() + RENDER_COOLDOWN_MS);
    res.json({ imageUrl });
  } catch (e) {
    console.error("[ai-render]", e.message);
    res.status(500).json({ error: e.message });
  } finally {
    activeRenders.delete(ip);
  }
});

// ══════════════════════════════════════════
//  ADMIN API
// ══════════════════════════════════════════

// ── Admin: verify token ──
app.post("/api/admin/login", (req, res) => {
  const { token } = req.body || {};
  if (token === ADMIN_TOKEN) return res.json({ ok: true });
  res.status(401).json({ error: "unauthorized" });
});

// ── Admin: list chat sessions ──
app.get("/api/admin/sessions", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ sessions: [] });
  const { filter, search } = req.query;
  try {
    let where = "1=1";
    const params = [];
    if (filter === "leads")    { where += ` AND EXISTS(SELECT 1 FROM contacts WHERE session_id = s.id)`; }
    if (filter === "open")     { where += ` AND s.status = 'open'`; }
    if (filter === "resolved") { where += ` AND s.status = 'resolved'`; }
    if (filter === "archive")  { where += ` AND s.status = 'resolved'`; }
    if (search) {
      params.push(`%${search}%`);
      where += ` AND (s.id ILIKE $${params.length} OR s.page ILIKE $${params.length} OR s.note ILIKE $${params.length})`;
    }
    const { rows } = await query(`
      SELECT
        s.id,
        s.page,
        s.ip,
        s.status,
        s.priority,
        s.note,
        s.mode,
        s.country,
        s.country_code,
        s.city,
        s.tags,
        s.created_at,
        s.last_message_at,
        COUNT(m.id) AS message_count,
        (SELECT content FROM chat_messages WHERE session_id = s.id ORDER BY created_at DESC LIMIT 1) AS last_message,
        EXISTS(SELECT 1 FROM contacts WHERE session_id = s.id) AS has_contact
      FROM chat_sessions s
      LEFT JOIN chat_messages m ON m.session_id = s.id
      WHERE ${where}
      GROUP BY s.id
      ORDER BY s.last_message_at DESC
      LIMIT ${filter === "archive" ? 20 : 200}
    `, params);
    res.json({ sessions: rows });
  } catch (e) {
    console.error("[admin] sessions:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: get messages for a session ──
app.get("/api/admin/sessions/:id/messages", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ messages: [], contact: null, session: null });
  try {
    const { rows: messages } = await query(
      `SELECT id, role, content, created_at FROM chat_messages WHERE session_id = $1 ORDER BY created_at ASC`,
      [req.params.id]
    );
    const { rows: contacts } = await query(
      `SELECT name, phone, email, message, created_at FROM contacts WHERE session_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [req.params.id]
    );
    const { rows: sessions } = await query(
      `SELECT id, page, ip, status, priority, note, mode, country, country_code, city, region, tags, agent_name, agent_avatar_url, created_at FROM chat_sessions WHERE id = $1`,
      [req.params.id]
    );
    res.json({ messages, contact: contacts[0] || null, session: sessions[0] || null });
  } catch (e) {
    console.error("[admin] messages:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: send agent reply ──
app.post("/api/admin/sessions/:id/reply", adminAuth, async (req, res) => {
  const { content } = req.body || {};
  if (!content?.trim()) return res.status(400).json({ error: "content required" });
  if (!HAS_DB) return res.json({ ok: true });
  try {
    await query(
      `INSERT INTO chat_messages (session_id, role, content) VALUES ($1, 'agent', $2)`,
      [req.params.id, content.trim()]
    );
    await query(`UPDATE chat_sessions SET last_message_at = NOW() WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    console.error("[admin] reply:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: handover (bot → agent) — accepts optional agent_name + agent_avatar_url ──
app.post("/api/admin/sessions/:id/handover", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ ok: true });
  const { agent_name, agent_avatar_url } = req.body || {};
  try {
    await query(
      `UPDATE chat_sessions SET mode = 'agent', agent_name = $2, agent_avatar_url = $3 WHERE id = $1`,
      [req.params.id, agent_name || null, agent_avatar_url || null]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Admin: check if customer is typing ──
app.get("/api/admin/sessions/:id/typing", adminAuth, (req, res) => {
  const state = typingState.get(req.params.id);
  const typing = Boolean(state && Date.now() - state.ts < 5000);
  res.json({ typing });
});

// ── Admin: set agent typing indicator (customer will see) ──
const agentTypingState = new Map(); // sessionId → { ts }
app.post("/api/admin/sessions/:id/typing", adminAuth, (req, res) => {
  agentTypingState.set(req.params.id, { ts: Date.now() });
  res.json({ ok: true });
});

// ── Public: customer polls if agent is typing ──
app.get("/api/chat/sessions/:sessionId/agent-typing", rateLimit(120), (req, res) => {
  const state = agentTypingState.get(req.params.sessionId);
  const typing = Boolean(state && Date.now() - state.ts < 5000);
  res.json({ typing });
});

// ── Admin: update session tags ──
app.patch("/api/admin/sessions/:id/tags", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ ok: true });
  const { tags } = req.body || {};
  try {
    await query(`UPDATE chat_sessions SET tags = $1 WHERE id = $2`, [JSON.stringify(tags || []), req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Admin: update session status/priority/note ──
app.patch("/api/admin/sessions/:id", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ ok: true });
  const { status, priority, note } = req.body || {};
  const sets = [];
  const params = [];
  if (status   !== undefined) { params.push(status);   sets.push(`status = $${params.length}`); }
  if (priority !== undefined) { params.push(priority); sets.push(`priority = $${params.length}`); }
  if (note     !== undefined) { params.push(note);     sets.push(`note = $${params.length}`); }
  if (!sets.length) return res.json({ ok: true });
  params.push(req.params.id);
  try {
    await query(`UPDATE chat_sessions SET ${sets.join(", ")} WHERE id = $${params.length}`, params);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: delete single session ──
app.delete("/api/admin/sessions/:id", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ ok: true });
  try {
    await query(`DELETE FROM chat_messages WHERE session_id = $1`, [req.params.id]);
    await query(`DELETE FROM chat_sessions WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: bulk delete old resolved sessions ──
app.delete("/api/admin/sessions", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ ok: true, deleted: 0 });
  const days = Math.max(1, parseInt(req.query.days) || 30);
  try {
    const old = await query(
      `SELECT id FROM chat_sessions WHERE status = 'resolved' AND created_at < NOW() - ($1 || ' days')::INTERVAL`,
      [days]
    );
    const ids = old.rows.map((r) => r.id);
    if (ids.length) {
      await query(`DELETE FROM chat_messages WHERE session_id = ANY($1)`, [ids]);
      await query(`DELETE FROM chat_sessions WHERE id = ANY($1)`, [ids]);
    }
    res.json({ ok: true, deleted: ids.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: contacts list ──
app.get("/api/admin/contacts", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ contacts: [] });
  try {
    const { rows } = await query(
      `SELECT id, session_id, name, phone, email, message, created_at FROM contacts ORDER BY created_at DESC LIMIT 200`
    );
    res.json({ contacts: rows });
  } catch (e) {
    console.error("[admin] contacts:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: realtime (active sessions last 5 min) ──
app.get("/api/admin/realtime", adminAuth, async (_req, res) => {
  if (!HAS_DB) return res.json({ active: 0, recent_events: 0 });
  try {
    const [sessions, events] = await Promise.all([
      query(`SELECT COUNT(*) AS cnt FROM chat_sessions WHERE last_message_at > NOW() - INTERVAL '5 minutes'`),
      query(`SELECT COUNT(*) AS cnt FROM analytics_events WHERE created_at > NOW() - INTERVAL '5 minutes'`),
    ]);
    res.json({
      active_chats: Number(sessions.rows[0]?.cnt || 0),
      recent_events: Number(events.rows[0]?.cnt || 0),
    });
  } catch (e) {
    res.json({ active_chats: 0, recent_events: 0 });
  }
});

// ── Admin: analytics (with period + funnel) ──
app.get("/api/admin/analytics", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({});
  const interval = periodInterval(req.query.period);
  try {
    const [
      pageViews, uniqueSessions, chatSessions, contacts,
      calculatorOpens, offerSubmits,
      topPages, topEvents, dailyChats, popularQuestions,
      geoCountries, geoCities, handoverSessions, deviceStats,
      referrers, peakHours, dailyPageViews,
    ] = await Promise.all([
      query(`SELECT COUNT(*) AS total FROM analytics_events WHERE event = 'page_view' AND created_at > NOW() - INTERVAL '${interval}'`),
      query(`SELECT COUNT(DISTINCT session_id) AS total FROM analytics_events WHERE created_at > NOW() - INTERVAL '${interval}' AND session_id IS NOT NULL`),
      query(`SELECT COUNT(*) AS total FROM chat_sessions WHERE created_at > NOW() - INTERVAL '${interval}'`),
      query(`SELECT COUNT(*) AS total FROM contacts WHERE created_at > NOW() - INTERVAL '${interval}'`),
      query(`SELECT COUNT(*) AS total FROM analytics_events WHERE event IN ('calculator_open', 'app_open') AND created_at > NOW() - INTERVAL '${interval}'`),
      query(`SELECT COUNT(*) AS total FROM analytics_events WHERE event IN ('offer_submit', 'offer_request') AND created_at > NOW() - INTERVAL '${interval}'`),
      query(`
        SELECT page, COUNT(*) AS views
        FROM analytics_events WHERE event = 'page_view' AND page IS NOT NULL AND created_at > NOW() - INTERVAL '${interval}'
        GROUP BY page ORDER BY views DESC LIMIT 10
      `),
      query(`
        SELECT event, COUNT(*) AS count
        FROM analytics_events WHERE created_at > NOW() - INTERVAL '${interval}'
        GROUP BY event ORDER BY count DESC LIMIT 15
      `),
      query(`
        SELECT DATE(created_at) AS day, COUNT(*) AS sessions
        FROM chat_sessions
        WHERE created_at > NOW() - INTERVAL '${interval}'
        GROUP BY day ORDER BY day DESC
      `),
      query(`
        SELECT content, COUNT(*) AS count
        FROM chat_messages WHERE role = 'user' AND created_at > NOW() - INTERVAL '${interval}'
        GROUP BY content ORDER BY count DESC LIMIT 10
      `),
      query(`
        SELECT country, country_code, COUNT(*) AS sessions
        FROM chat_sessions
        WHERE created_at > NOW() - INTERVAL '${interval}' AND country IS NOT NULL
        GROUP BY country, country_code ORDER BY sessions DESC LIMIT 15
      `),
      query(`
        SELECT city, country, COUNT(*) AS sessions
        FROM chat_sessions
        WHERE created_at > NOW() - INTERVAL '${interval}' AND city IS NOT NULL
        GROUP BY city, country ORDER BY sessions DESC LIMIT 15
      `),
      query(`SELECT COUNT(*) AS total FROM chat_sessions WHERE mode = 'agent' AND created_at > NOW() - INTERVAL '${interval}'`),
      query(`
        SELECT
          CASE
            WHEN referrer IS NULL OR referrer = '' THEN 'Direkt'
            WHEN referrer ILIKE '%google%' THEN 'Google'
            WHEN referrer ILIKE '%bing%' THEN 'Bing'
            WHEN referrer ILIKE '%facebook%' OR referrer ILIKE '%fb.com%' THEN 'Facebook'
            WHEN referrer ILIKE '%instagram%' THEN 'Instagram'
            WHEN referrer ILIKE '%linkedin%' THEN 'LinkedIn'
            WHEN referrer ILIKE '%marmorskivan.se%' THEN 'Intern'
            ELSE 'Övrigt'
          END AS source,
          COUNT(*) AS visits
        FROM analytics_events
        WHERE event = 'page_view' AND created_at > NOW() - INTERVAL '${interval}'
        GROUP BY source ORDER BY visits DESC
      `),
      query(`
        SELECT EXTRACT(HOUR FROM created_at AT TIME ZONE 'Europe/Stockholm') AS hour, COUNT(*) AS visits
        FROM analytics_events WHERE event = 'page_view' AND created_at > NOW() - INTERVAL '${interval}'
        GROUP BY hour ORDER BY hour ASC
      `),
      query(`
        SELECT DATE(created_at AT TIME ZONE 'Europe/Stockholm') AS day, COUNT(*) AS views
        FROM analytics_events WHERE event = 'page_view' AND created_at > NOW() - INTERVAL '${interval}'
        GROUP BY day ORDER BY day DESC LIMIT 30
      `),
      query(`
        SELECT
          SUM(CASE WHEN mobile = true THEN 1 ELSE 0 END) AS mobile_count,
          SUM(CASE WHEN mobile = false THEN 1 ELSE 0 END) AS desktop_count,
          COUNT(DISTINCT fp_hash) AS unique_devices
        FROM analytics_events
        WHERE created_at > NOW() - INTERVAL '${interval}' AND fp_hash IS NOT NULL
      `),
    ]);

    const pv   = Number(pageViews.rows[0]?.total || 0);
    const calc = Number(calculatorOpens.rows[0]?.total || 0);
    const offer = Number(offerSubmits.rows[0]?.total || 0);
    const cont  = Number(contacts.rows[0]?.total || 0);
    const chats = Number(chatSessions.rows[0]?.total || 0);

    res.json({
      totalPageViews:    pv,
      uniqueSessions:    Number(uniqueSessions.rows[0]?.total || 0),
      chatSessions:      chats,
      totalContacts:     cont,
      calculatorOpens:   calc,
      offerSubmits:      offer,
      handoverSessions:  Number(handoverSessions.rows[0]?.total || 0),
      funnel: [
        { label: "Sidvisningar",          value: pv,    pct: 100 },
        { label: "Kalkylator öppnad",      value: calc,  pct: pv  ? Math.round(calc  / pv  * 100) : 0 },
        { label: "Offert begärd",          value: offer, pct: calc ? Math.round(offer / calc * 100) : 0 },
        { label: "Kontaktuppgifter lämnade", value: cont, pct: offer ? Math.round(cont / offer * 100) : 0 },
      ],
      topPages:          topPages.rows,
      topEvents:         topEvents.rows,
      dailyChats:        dailyChats.rows,
      popularQuestions:  popularQuestions.rows,
      geoCountries:      geoCountries.rows,
      geoCities:         geoCities.rows,
      referrers:         referrers.rows,
      peakHours:         peakHours.rows,
      dailyPageViews:    dailyPageViews.rows,
      deviceStats: {
        mobile:        Number(deviceStats.rows[0]?.mobile_count || 0),
        desktop:       Number(deviceStats.rows[0]?.desktop_count || 0),
        uniqueDevices: Number(deviceStats.rows[0]?.unique_devices || 0),
      },
    });
  } catch (e) {
    console.error("[admin] analytics:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: seed test analytics data ──
app.post("/api/admin/seed-analytics", adminAuth, async (_req, res) => {
  if (!HAS_DB) return res.json({ ok: false, error: "no db" });
  try {
    const uid = () => Math.random().toString(36).slice(2, 10);
    const daysAgo = (d, jitter = 0) => {
      const t = new Date();
      t.setDate(t.getDate() - d);
      t.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
      if (jitter) t.setMinutes(t.getMinutes() + jitter);
      return t.toISOString();
    };

    const geoData = [
      { country: "Sverige", country_code: "SE", city: "Stockholm" },
      { country: "Sverige", country_code: "SE", city: "Göteborg" },
      { country: "Sverige", country_code: "SE", city: "Malmö" },
      { country: "Sverige", country_code: "SE", city: "Uppsala" },
      { country: "Norge", country_code: "NO", city: "Oslo" },
      { country: "Danmark", country_code: "DK", city: "Köpenhamn" },
      { country: "Finland", country_code: "FI", city: "Helsingfors" },
    ];
    const pages = ["/", "/app", "/material/marmor", "/material/granit", "/bankskiva-sten", "/boka-tid"];
    const questions = [
      "Vad kostar en bänkskiva?", "Hur lång är leveranstiden?",
      "Vilket material rekommenderar ni?", "Kan ni mäta upp hemma hos mig?",
      "Vad är skillnaden på marmor och granit?", "Hur underhåller jag stenen?",
    ];

    // Insert 30 days of page_view events
    for (let day = 0; day < 30; day++) {
      const count = Math.floor(Math.random() * 15) + 5;
      for (let i = 0; i < count; i++) {
        const geo = geoData[Math.floor(Math.random() * geoData.length)];
        const page = pages[Math.floor(Math.random() * pages.length)];
        const sessionId = uid();
        await query(
          `INSERT INTO analytics_events (event, session_id, page, country, city, created_at) VALUES ($1,$2,$3,$4,$5,$6)`,
          ["page_view", sessionId, page, geo.country, geo.city, daysAgo(day)]
        );
        // Calculator opens (40% of visits)
        if (Math.random() < 0.4) {
          await query(
            `INSERT INTO analytics_events (event, session_id, page, country, city, created_at) VALUES ($1,$2,$3,$4,$5,$6)`,
            ["calculator_open", sessionId, "/app", geo.country, geo.city, daysAgo(day, 3)]
          );
        }
        // Offer submits (10% of visits)
        if (Math.random() < 0.1) {
          await query(
            `INSERT INTO analytics_events (event, session_id, page, country, city, created_at) VALUES ($1,$2,$3,$4,$5,$6)`,
            ["offer_submit", sessionId, "/app", geo.country, geo.city, daysAgo(day, 8)]
          );
        }
      }
    }

    // Insert 20 chat sessions with messages
    for (let i = 0; i < 20; i++) {
      const geo = geoData[Math.floor(Math.random() * geoData.length)];
      const day = Math.floor(Math.random() * 30);
      const sessionId = uid();
      const status = Math.random() < 0.4 ? "resolved" : "open";
      const mode = Math.random() < 0.2 ? "agent" : "bot";
      await query(
        `INSERT INTO chat_sessions (id, page, ip, status, mode, country, country_code, city) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [sessionId, "/app", "127.0.0.1", status, mode, geo.country, geo.country_code, geo.city]
      );
      const msgCount = Math.floor(Math.random() * 6) + 2;
      for (let m = 0; m < msgCount; m++) {
        const role = m % 2 === 0 ? "user" : "assistant";
        const content = role === "user"
          ? questions[Math.floor(Math.random() * questions.length)]
          : "Tack för din fråga! Vi hjälper dig gärna med det.";
        await query(
          `INSERT INTO chat_messages (session_id, role, content, created_at) VALUES ($1,$2,$3,$4)`,
          [sessionId, role, content, daysAgo(day, m * 2)]
        );
      }
      // 30% have contact
      if (Math.random() < 0.3) {
        const names = ["Anna Svensson", "Erik Lindgren", "Maria Johansson", "Lars Eriksson"];
        await query(
          `INSERT INTO contacts (session_id, name, phone, email, message, created_at) VALUES ($1,$2,$3,$4,$5,$6)`,
          [sessionId, names[Math.floor(Math.random() * names.length)], "070-123 45 67", "kund@example.se", "Intresserad av offert", daysAgo(day)]
        );
      }
    }

    res.json({ ok: true, message: "Testdata inlagt (30 dagar sidvisningar + 20 chattsessioner)" });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: get settings ──
app.get("/api/admin/settings", adminAuth, async (_req, res) => {
  if (!HAS_DB) return res.json({});
  try {
    const { rows } = await query(`SELECT key, value, updated_at FROM site_settings ORDER BY key`);
    res.json(Object.fromEntries(rows.map((r) => [r.key, r.value])));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: update settings ──
app.post("/api/admin/settings", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ ok: true });
  const updates = req.body || {};
  try {
    for (const [key, value] of Object.entries(updates)) {
      await query(
        `INSERT INTO site_settings (key, value, updated_at) VALUES ($1, $2, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`,
        [key, String(value)]
      );
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: canned responses ──
app.get("/api/admin/canned-responses", adminAuth, async (_req, res) => {
  if (!HAS_DB) return res.json({ responses: [] });
  try {
    const { rows } = await query(`SELECT id, shortcut, content, created_at FROM canned_responses ORDER BY shortcut`);
    res.json({ responses: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/canned-responses", adminAuth, async (req, res) => {
  const { shortcut, content } = req.body || {};
  if (!shortcut?.trim() || !content?.trim()) return res.status(400).json({ error: "shortcut and content required" });
  if (!HAS_DB) return res.json({ ok: true });
  try {
    const { rows } = await query(
      `INSERT INTO canned_responses (shortcut, content) VALUES ($1, $2) RETURNING id`,
      [shortcut.trim(), content.trim()]
    );
    res.json({ ok: true, id: rows[0].id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/admin/canned-responses/:id", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ ok: true });
  try {
    await query(`DELETE FROM canned_responses WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: knowledge base ──
app.get("/api/admin/knowledge-base", adminAuth, async (_req, res) => {
  if (!HAS_DB) return res.json({ items: [] });
  try {
    const { rows } = await query(`SELECT id, question, answer, active, created_at FROM knowledge_base ORDER BY created_at DESC`);
    res.json({ items: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/knowledge-base", adminAuth, async (req, res) => {
  const { question, answer } = req.body || {};
  if (!question?.trim() || !answer?.trim()) return res.status(400).json({ error: "question and answer required" });
  if (!HAS_DB) return res.json({ ok: true });
  try {
    const { rows } = await query(
      `INSERT INTO knowledge_base (question, answer) VALUES ($1, $2) RETURNING id`,
      [question.trim(), answer.trim()]
    );
    res.json({ ok: true, id: rows[0].id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.patch("/api/admin/knowledge-base/:id", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ ok: true });
  const { question, answer, active } = req.body || {};
  const sets = [];
  const params = [];
  if (question !== undefined) { params.push(question); sets.push(`question = $${params.length}`); }
  if (answer   !== undefined) { params.push(answer);   sets.push(`answer = $${params.length}`); }
  if (active   !== undefined) { params.push(active);   sets.push(`active = $${params.length}`); }
  if (!sets.length) return res.json({ ok: true });
  params.push(req.params.id);
  try {
    await query(`UPDATE knowledge_base SET ${sets.join(", ")} WHERE id = $${params.length}`, params);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/admin/knowledge-base/:id", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ ok: true });
  try {
    await query(`DELETE FROM knowledge_base WHERE id = $1`, [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Public: create booking ──
app.post("/api/bookings", rateLimit(5), async (req, res) => {
  const { date, time, name, phone, email, message, sessionId } = req.body || {};
  if (!date || !time || !name || !phone) return res.status(400).json({ error: "date, time, name and phone required" });

  let bookingId = null;
  if (HAS_DB) {
    try {
      const { rows } = await query(`SELECT id FROM bookings WHERE booking_date = $1 AND booking_time = $2 AND status != 'cancelled'`, [date, time]);
      if (rows.length) return res.status(409).json({ error: "time_taken" });
      const { rows: created } = await query(
        `INSERT INTO bookings (booking_date, booking_time, name, phone, email, message, session_id) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
        [date, time, name, phone, email || null, message || null, sessionId || null]
      );
      bookingId = created[0].id;
    } catch (e) { console.error("[booking] create:", e.message); return res.status(500).json({ error: e.message }); }
  }

  // Send emails (fire-and-forget)
  const ics = makeIcs(date, time, name);
  const dateLabel = new Date(date + "T12:00:00").toLocaleDateString("sv-SE", { weekday: "long", day: "numeric", month: "long" });
  const attachments = [{ filename: "bokning.ics", content: ics, contentType: "text/calendar" }];

  // Confirmation to customer
  if (email) {
    sendMail({
      to: email,
      subject: `Bokningsbekräftelse – ${dateLabel} kl ${time}`,
      text: `Hej ${name}!\n\nDin bokning för mätningsbesök är mottagen.\n\nDatum: ${dateLabel}\nTid: ${time}\n\nVi bekräftar din tid via telefon (${phone}). Välkommen!\n\nMarmorskivan`,
      html: `<p>Hej <strong>${name}</strong>!</p><p>Din bokning för mätningsbesök är mottagen.</p><p><strong>Datum:</strong> ${dateLabel}<br><strong>Tid:</strong> ${time}</p><p>Vi bekräftar din tid via telefon (${phone}). Välkommen!</p><p>— Marmorskivan</p>`,
      attachments,
    });
  }

  // Notification to company
  if (COMPANY_EMAIL) {
    sendMail({
      to: COMPANY_EMAIL,
      subject: `Ny bokning: ${name} – ${dateLabel} kl ${time}`,
      text: `Ny mätningsbokning:\n\nNamn: ${name}\nTelefon: ${phone}\nE-post: ${email || "-"}\nDatum: ${dateLabel}\nTid: ${time}${message ? `\nÖvrigt: ${message}` : ""}\n\nBoknings-ID: #${bookingId || "-"}`,
      attachments,
    });
  }

  res.json({ ok: true, id: bookingId });
});

// ── Public: get booked slots for a date ──
app.get("/api/bookings/slots", rateLimit(30), async (req, res) => {
  const { date } = req.query;
  if (!date) return res.status(400).json({ error: "date required" });
  if (!HAS_DB) return res.json({ booked: [] });
  try {
    const { rows } = await query(`SELECT booking_time FROM bookings WHERE booking_date = $1 AND status != 'cancelled'`, [date]);
    res.json({ booked: rows.map((r) => r.booking_time) });
  } catch { res.json({ booked: [] }); }
});

// ── Admin: list bookings ──
app.get("/api/admin/bookings", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ bookings: [] });
  const { status, date } = req.query;
  try {
    let where = "1=1"; const params = [];
    if (status) { params.push(status); where += ` AND status = $${params.length}`; }
    if (date)   { params.push(date);   where += ` AND booking_date = $${params.length}`; }
    const { rows } = await query(`SELECT * FROM bookings WHERE ${where} ORDER BY booking_date ASC, booking_time ASC LIMIT 200`, params);
    res.json({ bookings: rows });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Admin: update booking status ──
app.patch("/api/admin/bookings/:id", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ ok: true });
  const { status } = req.body || {};
  try {
    await query(`UPDATE bookings SET status = $1 WHERE id = $2`, [status, req.params.id]);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Admin: CSV exports ──
app.get("/api/admin/export/:type", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.status(503).json({ error: "no_db" });
  const period = req.query.period || "30d";
  const interval = periodInterval(period);
  const type = req.params.type;

  try {
    let rows, headers, filename;

    if (type === "contacts") {
      ({ rows } = await query(`
        SELECT id, name, phone, email, message, session_id, created_at
        FROM contacts WHERE created_at > NOW() - INTERVAL '${interval}'
        ORDER BY created_at DESC
      `));
      headers = ["id", "name", "phone", "email", "message", "session_id", "created_at"];
      filename = `kontakter_${period}_${new Date().toISOString().slice(0,10)}.csv`;

    } else if (type === "sessions") {
      ({ rows } = await query(`
        SELECT s.id, s.page, s.ip, s.status, s.priority,
               COUNT(m.id) AS messages,
               EXISTS(SELECT 1 FROM contacts WHERE session_id = s.id) AS has_contact,
               s.created_at, s.last_message_at
        FROM chat_sessions s
        LEFT JOIN chat_messages m ON m.session_id = s.id
        WHERE s.created_at > NOW() - INTERVAL '${interval}'
        GROUP BY s.id ORDER BY s.created_at DESC
      `));
      headers = ["id", "page", "ip", "status", "priority", "messages", "has_contact", "created_at", "last_message_at"];
      filename = `chattar_${period}_${new Date().toISOString().slice(0,10)}.csv`;

    } else if (type === "events") {
      ({ rows } = await query(`
        SELECT id, event, session_id, page, data, created_at
        FROM analytics_events WHERE created_at > NOW() - INTERVAL '${interval}'
        ORDER BY created_at DESC LIMIT 10000
      `));
      headers = ["id", "event", "session_id", "page", "data", "created_at"];
      filename = `events_${period}_${new Date().toISOString().slice(0,10)}.csv`;

    } else {
      return res.status(400).json({ error: "unknown export type" });
    }

    const escape = (v) => {
      if (v == null) return "";
      const s = typeof v === "object" ? JSON.stringify(v) : String(v);
      return s.includes(",") || s.includes('"') || s.includes("\n")
        ? `"${s.replace(/"/g, '""')}"` : s;
    };

    const csv = [
      headers.join(","),
      ...rows.map((r) => headers.map((h) => escape(r[h])).join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.send("\uFEFF" + csv); // BOM for Excel UTF-8
  } catch (e) {
    console.error("[admin] export:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Start ──
async function start() {
  if (HAS_DB) {
    try { await migrate(); } catch (e) { console.error("[db] migrate failed:", e.message); }
  } else {
    console.warn("⚠️  No DATABASE_URL — running without persistence");
  }
  app.listen(PORT, () => console.log(`✅ API server on port ${PORT}`));
}

start();
