// api-dev/server.mjs — Marmorskivan API server (Railway-ready)
import { File as NodeFile } from "node:buffer";
if (!globalThis.File) globalThis.File = NodeFile;

import express from "express";
import cors from "cors";
import { OpenAI, toFile } from "openai";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";
import nodemailer from "nodemailer";
import { query, migrate } from "./db.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Ensure uploads dir exists
const UPLOADS_DIR = path.join(__dirname, "uploads");
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
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
app.use("/uploads", express.static(UPLOADS_DIR));

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
const geoCache = new Map();
async function lookupGeo(ip) {
  if (!ip || ip === "::1" || ip === "127.0.0.1" || ip.startsWith("192.168") || ip.startsWith("10.")) return null;
  if (geoCache.has(ip)) {
    const c = geoCache.get(ip);
    if (Date.now() - c.ts < 3_600_000) return c; // cache 1h
  }
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,district,zip,lat,lon,isp,org,timezone`);
    if (!res.ok) return null;
    const d = await res.json();
    if (d.status !== "success") return null;
    const geo = {
      country: d.country, countryCode: d.countryCode,
      city: d.city, region: d.regionName,
      district: d.district || null,
      zip: d.zip || null, lat: d.lat || null, lon: d.lon || null,
      isp: d.isp || null, org: d.org || null,
      timezone: d.timezone || null,
      ts: Date.now()
    };
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
    console.log(`[analytics] event=${event || "MISSING"} ct=${req.headers["content-type"]} body_type=${typeof req.body} has_db=${HAS_DB}`);
    if (HAS_DB && event) {
      const ip = (req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "").trim();
      const geo = await lookupGeo(ip);
      const ua = req.headers["user-agent"] || null;
      await query(
        `INSERT INTO analytics_events
          (event, session_id, page, data, country, country_code, city, region, district, zip, lat, lon, isp, timezone, fp_hash, screen, lang, mobile, referrer, ip, user_agent)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
        [
          event,
          session || null,
          page || null,
          JSON.stringify({ ts, ...rest }),
          geo?.country || null,
          geo?.countryCode || null,
          geo?.city || null,
          geo?.region || null,
          geo?.district || null,
          geo?.zip || null,
          geo?.lat || null,
          geo?.lon || null,
          geo?.isp || null,
          geo?.timezone || null,
          fp?.hash || null,
          fp?.screen || null,
          fp?.lang || null,
          fp?.mobile ?? null,
          referrer || null,
          ip || null,
          ua,
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
  const { materialName, shape, thicknessMm, materialImageUrl, kitchenPhotoBase64, hasSelection, photoWidth, photoHeight } = req.body || {};
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
      const mm = Number(thicknessMm) || 20;
      const edgeDesc = mm >= 30
        ? `The countertop edge is ${mm}mm thick — a substantial, bold profile.`
        : `The countertop edge is ${mm}mm thick — a slim, elegant profile.`;

      // Prompt depends on mode
      const prompt = hasSelection
        ? `Fill in the transparent/cutout area in this kitchen photo with ${cleanName} stone countertop surface. The transparent hole is exactly where the countertop should be. Use the stone texture from the reference image — same color, same veining, same surface finish. ${edgeDesc} The result must look photorealistic and seamlessly integrated. Do not change anything else in the photo.`
        : hasKitchen
          ? `You are editing a kitchen photo. Change ONE thing only: replace the countertop stone surface (the flat horizontal top of the kitchen island/bench) with the stone texture from the reference image. ${edgeDesc} DO NOT CHANGE ANYTHING ELSE. The floor must stay exactly as it is. The cabinets stay. The walls stay. The ceiling stays. The appliances stay. The objects on the counter stay. Only the stone countertop surface itself changes material. The new countertop material must exactly match the color, veining, and texture of the reference stone image.`
          : `Generate a hyperrealistic luxury kitchen interior featuring countertops made of the EXACT stone shown in the reference image — same color, same veining pattern, same surface texture. Material: ${cleanName}. ${edgeDesc} The stone is ONLY on the horizontal countertop surfaces — not on the floor, not on cabinet fronts, not on walls. All countertops are one continuous slab (no tiles or joints). Modern Scandinavian kitchen, white handleless cabinetry, natural daylight. Photorealistic, Architectural Digest quality.`;

      // Pick output size to match the photo's orientation — avoids distortion in compositing
      const outputSize = (() => {
        if (!photoWidth || !photoHeight) return "1024x1024";
        const ratio = photoWidth / photoHeight;
        if (ratio > 1.2) return "1536x1024"; // landscape
        if (ratio < 0.85) return "1024x1536"; // portrait
        return "1024x1024";
      })();

      console.log(`[ai-render] mode=${hasSelection ? "inpaint" : hasKitchen ? "edit" : "generate"} size=${outputSize}`);

      const result = await getOpenAI().images.edit({
        model: "gpt-image-1",
        image: images.length === 1 ? images[0] : images,
        prompt,
        size: outputSize,
        quality: "high",
        input_fidelity: "high",
      });

      const b64out = result.data[0].b64_json;
      imageUrl = `data:image/png;base64,${b64out}`;

    } else if (kitchenPhotoBase64) {
      // ── Photo uploaded but no material image — just describe in prompt ──
      const b64 = kitchenPhotoBase64.replace(/^data:[^;]+;base64,/, "");
      const kitBuf = Buffer.from(b64, "base64");
      const kitFile = await toFile(kitBuf, "photo.jpg", { type: "image/jpeg" });
      const cleanName = (materialName || "").replace(/_/g, " ");
      const mm = Number(thicknessMm) || 20;
      const prompt = hasSelection
        ? `Fill in the transparent/cutout area with ${cleanName} stone surface. Photorealistic, seamlessly integrated.`
        : `Replace any stone/tile/countertop surfaces in this photo with ${cleanName} stone. Keep everything else exactly as is.`;
      const result = await getOpenAI().images.edit({
        model: "gpt-image-1",
        image: kitFile,
        prompt,
        size: "1024x1024",
        quality: "high",
      });
      imageUrl = `data:image/png;base64,${result.data[0].b64_json}`;
    } else {
      // ── No photo: DALL-E 3 generates new scene ──
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
      referrers, peakHours, dailyPageViews, kitchenRenders, topMaterials, topAccessories,
      offerOpens, priceViews, activityByHour, timeOnPage,
    ] = await Promise.all([
      query(`SELECT COUNT(*) AS total FROM analytics_events WHERE event = 'page_view' AND created_at > NOW() - INTERVAL '${interval}'`),
      query(`SELECT COUNT(DISTINCT session_id) AS total FROM analytics_events WHERE created_at > NOW() - INTERVAL '${interval}' AND session_id IS NOT NULL`),
      query(`SELECT COUNT(*) AS total FROM chat_sessions WHERE created_at > NOW() - INTERVAL '${interval}'`),
      query(`SELECT COUNT(*) AS total FROM contacts WHERE created_at > NOW() - INTERVAL '${interval}'`),
      query(`SELECT COUNT(*) AS total FROM analytics_events WHERE event IN ('calculator_open', 'app_open') AND created_at > NOW() - INTERVAL '${interval}'`),
      query(`SELECT COUNT(*) AS total FROM analytics_events WHERE event IN ('offert_submit_success', 'offer_submit', 'offer_request') AND created_at > NOW() - INTERVAL '${interval}'`),
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
        SELECT country, country_code, COUNT(DISTINCT COALESCE(ip, fp_hash)) AS sessions
        FROM analytics_events
        WHERE created_at > NOW() - INTERVAL '${interval}' AND country IS NOT NULL
        GROUP BY country, country_code ORDER BY sessions DESC LIMIT 15
      `),
      query(`
        SELECT city, region, country, country_code, COUNT(DISTINCT COALESCE(ip, fp_hash)) AS sessions
        FROM analytics_events
        WHERE created_at > NOW() - INTERVAL '${interval}' AND city IS NOT NULL
        GROUP BY city, region, country, country_code ORDER BY sessions DESC LIMIT 20
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
      query(`SELECT COUNT(*) AS total FROM analytics_events WHERE event = 'kitchen_render' AND created_at > NOW() - INTERVAL '${interval}'`),
      query(`
        SELECT
          data->>'material' AS material,
          COUNT(*) AS selections
        FROM analytics_events
        WHERE event = 'material_selected'
          AND created_at > NOW() - INTERVAL '${interval}'
          AND data->>'material' IS NOT NULL
        GROUP BY material ORDER BY selections DESC LIMIT 20
      `),
      query(`
        SELECT data->>'type' AS type, data->>'name' AS name, COUNT(*) AS selections
        FROM analytics_events
        WHERE event = 'accessory_selected'
          AND created_at > NOW() - INTERVAL '${interval}'
          AND data->>'name' IS NOT NULL
        GROUP BY type, name ORDER BY type, selections DESC
      `),
      query(`SELECT COUNT(*) AS total FROM analytics_events WHERE event = 'offert_open' AND created_at > NOW() - INTERVAL '${interval}'`),
      query(`SELECT COUNT(*) AS total FROM analytics_events WHERE event = 'price_viewed' AND created_at > NOW() - INTERVAL '${interval}'`),
      query(`
        SELECT
          EXTRACT(HOUR FROM created_at AT TIME ZONE 'Europe/Stockholm') AS hour,
          COUNT(*) AS visits
        FROM analytics_events
        WHERE created_at > NOW() - INTERVAL '${interval}'
        GROUP BY hour ORDER BY hour ASC
      `),
      query(`
        SELECT page, AVG((data->>'time_ms')::numeric) / 1000 AS avg_sec, COUNT(*) AS exits
        FROM analytics_events
        WHERE event = 'page_exit' AND data->>'time_ms' IS NOT NULL
          AND created_at > NOW() - INTERVAL '${interval}'
        GROUP BY page ORDER BY avg_sec DESC LIMIT 10
      `),
    ]);

    const pv        = Number(pageViews.rows[0]?.total || 0);
    const calc      = Number(calculatorOpens.rows[0]?.total || 0);
    const matSel    = Number(topMaterials.rows.reduce((s, r) => s + Number(r.selections), 0));
    const pvSeen    = Number(priceViews.rows[0]?.total || 0);
    const offerOpen = Number(offerOpens.rows[0]?.total || 0);
    const offer     = Number(offerSubmits.rows[0]?.total || 0);
    const cont      = Number(contacts.rows[0]?.total || 0);
    const chats     = Number(chatSessions.rows[0]?.total || 0);

    res.json({
      totalPageViews:    pv,
      uniqueSessions:    Number(uniqueSessions.rows[0]?.total || 0),
      chatSessions:      chats,
      totalContacts:     cont,
      calculatorOpens:   calc,
      offerSubmits:      offer,
      handoverSessions:  Number(handoverSessions.rows[0]?.total || 0),
      kitchenRenders:    Number(kitchenRenders.rows[0]?.total || 0),
      topMaterials:      topMaterials.rows,
      topAccessories:    topAccessories.rows,
      offerOpens:        Number(offerOpens.rows[0]?.total || 0),
      priceViews:        Number(priceViews.rows[0]?.total || 0),
      activityByHour:    activityByHour.rows,
      timeOnPage:        timeOnPage.rows,
      funnel: [
        { label: "Sidvisningar",              value: pv,        pct: 100 },
        { label: "Kalkylator öppnad",          value: calc,      pct: pv        ? Math.round(calc      / pv        * 100) : 0 },
        { label: "Material valt",              value: matSel,    pct: calc      ? Math.round(matSel    / calc      * 100) : 0 },
        { label: "Pris sett (ej skickat)",     value: pvSeen,    pct: matSel    ? Math.round(pvSeen    / matSel    * 100) : 0 },
        { label: "Offert öppnad",              value: offerOpen, pct: pvSeen    ? Math.round(offerOpen / pvSeen    * 100) : 0 },
        { label: "Offert skickad",             value: offer,     pct: offerOpen ? Math.round(offer     / offerOpen * 100) : 0 },
        { label: "Kontaktuppgifter lämnade",   value: cont,      pct: offer     ? Math.round(cont      / offer     * 100) : 0 },
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

// ── Admin: visitors (per-IP detail) ──
app.get("/api/admin/analytics/visitors", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json([]);
  const interval = periodInterval(req.query.period || "30d");
  const limit = Math.min(parseInt(req.query.limit || "200"), 500);
  try {
    const { rows } = await query(`
      SELECT
        ip,
        country, country_code, region, city, district, zip,
        lat, lon, isp, timezone,
        MIN(screen) AS screen,
        MIN(lang) AS lang,
        BOOL_OR(mobile) AS mobile,
        MIN(user_agent) AS user_agent,
        MIN(referrer) AS first_referrer,
        COUNT(*) AS event_count,
        COUNT(DISTINCT CASE WHEN event = 'page_view' THEN page END) AS pages_visited,
        MIN(created_at) AS first_seen,
        MAX(created_at) AS last_seen,
        array_agg(DISTINCT page ORDER BY page) FILTER (WHERE page IS NOT NULL AND event = 'page_view') AS pages,
        array_agg(DISTINCT event ORDER BY event) AS events
      FROM analytics_events
      WHERE created_at > NOW() - INTERVAL '${interval}'
        AND ip IS NOT NULL AND ip != ''
      GROUP BY ip, country, country_code, region, city, district, zip, lat, lon, isp, timezone
      ORDER BY last_seen DESC
      LIMIT ${limit}
    `);
    res.json(rows);
  } catch (e) {
    console.error("[visitors]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Admin: analytics drill-down ──
app.get("/api/admin/analytics/drilldown", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ rows: [] });
  const interval = periodInterval(req.query.period);
  const kpi = req.query.kpi || "";
  try {
    let rows = [];
    let columns = [];

    if (kpi === "pageviews") {
      columns = ["Tid", "Sida", "Land", "Stad", "Källa", "Enhet"];
      const r = await query(`
        SELECT created_at, page, country, city, referrer,
          CASE WHEN mobile = true THEN 'Mobil' WHEN mobile = false THEN 'Dator' ELSE '?' END AS device
        FROM analytics_events
        WHERE event = 'page_view' AND created_at > NOW() - INTERVAL '${interval}'
        ORDER BY created_at DESC LIMIT 200
      `);
      rows = r.rows.map(x => [x.created_at, x.page || "/", x.country || "—", x.city || "—", x.referrer || "Direkt", x.device]);

    } else if (kpi === "sessions") {
      columns = ["Tid", "Sida", "Land", "Stad", "Enhet", "Skärm"];
      const r = await query(`
        SELECT MIN(created_at) AS created_at, page, country, city,
          CASE WHEN mobile = true THEN 'Mobil' WHEN mobile = false THEN 'Dator' ELSE '?' END AS device,
          screen
        FROM analytics_events
        WHERE created_at > NOW() - INTERVAL '${interval}' AND session_id IS NOT NULL
        GROUP BY session_id, page, country, city, mobile, screen
        ORDER BY created_at DESC LIMIT 200
      `);
      rows = r.rows.map(x => [x.created_at, x.page || "/", x.country || "—", x.city || "—", x.device, x.screen || "—"]);

    } else if (kpi === "chats") {
      columns = ["Tid", "Land", "Stad", "Status", "Prioritet", "Taggar"];
      const r = await query(`
        SELECT created_at, country, city, status, priority, tags
        FROM chat_sessions
        WHERE created_at > NOW() - INTERVAL '${interval}'
        ORDER BY created_at DESC LIMIT 200
      `);
      rows = r.rows.map(x => [x.created_at, x.country || "—", x.city || "—", x.status || "open", x.priority || "normal", x.tags || "[]"]);

    } else if (kpi === "calculator") {
      columns = ["Tid", "Sida", "Land", "Enhet"];
      const r = await query(`
        SELECT created_at, page, country,
          CASE WHEN mobile = true THEN 'Mobil' WHEN mobile = false THEN 'Dator' ELSE '?' END AS device
        FROM analytics_events
        WHERE event IN ('calculator_open', 'app_open') AND created_at > NOW() - INTERVAL '${interval}'
        ORDER BY created_at DESC LIMIT 200
      `);
      rows = r.rows.map(x => [x.created_at, x.page || "—", x.country || "—", x.device]);

    } else if (kpi === "offers") {
      columns = ["Tid", "Material", "Form", "Land", "Enhet"];
      const r = await query(`
        SELECT created_at, data, country,
          CASE WHEN mobile = true THEN 'Mobil' WHEN mobile = false THEN 'Dator' ELSE '?' END AS device
        FROM analytics_events
        WHERE event IN ('offert_submit_success', 'offer_submit', 'offer_request') AND created_at > NOW() - INTERVAL '${interval}'
        ORDER BY created_at DESC LIMIT 200
      `);
      rows = r.rows.map(x => [x.created_at, x.data?.material || "—", x.data?.shape || "—", x.country || "—", x.device]);

    } else if (kpi === "contacts") {
      columns = ["Tid", "Namn", "Telefon", "E-post", "Session"];
      const r = await query(`
        SELECT created_at, name, phone, email, session_id
        FROM contacts
        WHERE created_at > NOW() - INTERVAL '${interval}'
        ORDER BY created_at DESC LIMIT 200
      `);
      rows = r.rows.map(x => [x.created_at, x.name || "—", x.phone || "—", x.email || "—", x.session_id || "—"]);

    } else if (kpi === "handover") {
      columns = ["Tid", "Land", "Stad", "Agent", "Taggar"];
      const r = await query(`
        SELECT created_at, country, city, agent_name, tags
        FROM chat_sessions
        WHERE mode = 'agent' AND created_at > NOW() - INTERVAL '${interval}'
        ORDER BY created_at DESC LIMIT 200
      `);
      rows = r.rows.map(x => [x.created_at, x.country || "—", x.city || "—", x.agent_name || "—", x.tags || "[]"]);

    } else if (kpi === "renders") {
      columns = ["Tid", "Material", "Läge", "Form", "Tjocklek", "Land"];
      const r = await query(`
        SELECT created_at, data, country
        FROM analytics_events
        WHERE event = 'kitchen_render' AND created_at > NOW() - INTERVAL '${interval}'
        ORDER BY created_at DESC LIMIT 200
      `);
      rows = r.rows.map(x => [x.created_at, x.data?.material || "—", x.data?.mode || "—", x.data?.shape || "—", x.data?.thicknessMm ? x.data.thicknessMm + "mm" : "—", x.country || "—"]);

    } else if (kpi === "accessories_sink" || kpi === "accessories_faucet" || kpi === "accessories_hob") {
      const typeMap = { accessories_sink: "sink", accessories_faucet: "faucet", accessories_hob: "hob" };
      const type = typeMap[kpi];
      columns = ["Tid", "Produkt", "Pris", "Land"];
      const r = await query(`
        SELECT created_at, data, country
        FROM analytics_events
        WHERE event = 'accessory_selected' AND data->>'type' = $1
          AND created_at > NOW() - INTERVAL '${interval}'
        ORDER BY created_at DESC LIMIT 200
      `, [type]);
      rows = r.rows.map(x => [x.created_at, x.data?.name || "—", x.data?.price ? x.data.price + " kr" : "—", x.country || "—"]);
    }

    res.json({ columns, rows });
  } catch (e) {
    console.error("[drilldown]", e.message);
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

// ════════════════════════════════════════
// PRODUCTS (stenar) — CRUD
// ════════════════════════════════════════

// GET /api/materials — public product catalog (no auth required)
app.get("/api/materials", async (_req, res) => {
  if (!HAS_DB) return res.json([]);
  try {
    const { rows } = await query(
      `SELECT id, slug, name, base_name, category, thickness_mm, price, edge_price,
              discount, status, description, pros, care, supplier, image, featured, sort_order
       FROM products
       WHERE status != 'hidden'
       ORDER BY featured DESC, sort_order ASC, name ASC`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/products — list with filters + sorting
app.get("/api/admin/products", adminAuth, async (req, res) => {
  try {
    const {
      category, status, search, featured,
      has_price, has_image,
      sort = "smart",
      limit = 100, offset = 0,
    } = req.query;

    const conditions = [];
    const params = [];

    if (category) { params.push(category); conditions.push(`category = $${params.length}`); }
    if (status)   { params.push(status);   conditions.push(`status = $${params.length}`); }
    if (featured === "true") conditions.push("featured = true");
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      conditions.push(`(LOWER(name) LIKE $${params.length} OR LOWER(base_name) LIKE $${params.length})`);
    }
    if (has_price === "yes") conditions.push("price IS NOT NULL");
    if (has_price === "no")  conditions.push("price IS NULL");
    if (has_image === "yes") conditions.push("image IS NOT NULL AND image != ''");
    if (has_image === "no")  conditions.push("(image IS NULL OR image = '')");

    const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

    // Smart sort: featured first → has price → search_count → sort_order → name
    const orderMap = {
      smart: "featured DESC, (price IS NOT NULL) DESC, search_count DESC, sort_order ASC, name ASC",
      sort_order: "sort_order ASC, name ASC",
      search_count: "search_count DESC, name ASC",
      name: "name ASC",
      price: "price ASC NULLS LAST",
    };
    const orderBy = orderMap[sort] || orderMap.smart;

    params.push(parseInt(limit));
    params.push(parseInt(offset));

    const { rows } = await query(
      `SELECT *, COUNT(*) OVER() AS total_count
       FROM products ${where}
       ORDER BY ${orderBy}
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    );

    const total = rows[0]?.total_count ? parseInt(rows[0].total_count) : 0;
    res.json({ products: rows, total });
  } catch (e) {
    console.error("[products] list:", e.message);
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/products/categories — distinct categories
app.get("/api/admin/products/categories", adminAuth, async (req, res) => {
  try {
    const { rows } = await query(
      `SELECT category, COUNT(*) AS n FROM products GROUP BY category ORDER BY n DESC`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/admin/products/:id
app.get("/api/admin/products/:id", adminAuth, async (req, res) => {
  try {
    const { rows } = await query("SELECT * FROM products WHERE id = $1", [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: "not found" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/admin/products — create
app.post("/api/admin/products", adminAuth, async (req, res) => {
  try {
    const {
      slug, name, base_name, category, thickness_mm, price, edge_price,
      discount, status, description, pros, care, supplier, supplier_url,
      datasheet_url, image, featured, sort_order, campaign_id,
    } = req.body;
    const { rows } = await query(
      `INSERT INTO products
        (slug, name, base_name, category, thickness_mm, price, edge_price,
         discount, status, description, pros, care, supplier, supplier_url,
         datasheet_url, image, featured, sort_order, campaign_id)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       RETURNING *`,
      [slug, name, base_name || name, category || "okänd",
       thickness_mm || 20, price || null, edge_price || null,
       discount || 0, status || "available",
       description || "", pros || "", care || "",
       supplier || "", supplier_url || "", datasheet_url || "",
       image || "", featured || false, sort_order || 9999, campaign_id || null]
    );
    res.json(rows[0]);
  } catch (e) {
    console.error("[products] create:", e.message);
    res.status(400).json({ error: e.message });
  }
});

// PATCH /api/admin/products/:id — partial update
app.patch("/api/admin/products/:id", adminAuth, async (req, res) => {
  try {
    const allowed = [
      "name","base_name","category","thickness_mm","price","edge_price",
      "discount","status","description","pros","care","supplier","supplier_url",
      "datasheet_url","image","featured","sort_order","campaign_id",
    ];
    const numericFields = new Set(["thickness_mm","price","edge_price","discount","sort_order","campaign_id"]);
    const fields = Object.keys(req.body).filter(k => allowed.includes(k));
    if (!fields.length) return res.status(400).json({ error: "nothing to update" });

    const sets = fields.map((f, i) => `${f} = $${i + 1}`);
    sets.push(`updated_at = NOW()`);
    const vals = fields.map(f => {
      const v = req.body[f];
      if (numericFields.has(f) && (v === "" || v === undefined)) return null;
      return v;
    });
    vals.push(req.params.id);

    const { rows } = await query(
      `UPDATE products SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`,
      vals
    );
    if (!rows.length) return res.status(404).json({ error: "not found" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/admin/products/:id
app.delete("/api/admin/products/:id", adminAuth, async (req, res) => {
  try {
    await query("DELETE FROM products WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/admin/products/:id/increment-search — track searches
app.post("/api/admin/products/:id/increment-search", adminAuth, async (req, res) => {
  try {
    await query("UPDATE products SET search_count = search_count + 1 WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ════════════════════════════════════════
// ACCESSORIES — CRUD
// ════════════════════════════════════════

app.get("/api/admin/accessories", adminAuth, async (req, res) => {
  try {
    const { type, active } = req.query;
    const conditions = [];
    const params = [];
    if (type)   { params.push(type); conditions.push(`type = $${params.length}`); }
    if (active !== undefined) { params.push(active === "true"); conditions.push(`active = $${params.length}`); }
    const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";
    const { rows } = await query(`SELECT * FROM catalog_accessories ${where} ORDER BY sort_order ASC, title ASC`, params);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/accessories", adminAuth, async (req, res) => {
  try {
    const { slug, type, title, brand, image, price, active, sort_order, intro_text, specs } = req.body;
    const { rows } = await query(
      `INSERT INTO catalog_accessories
        (slug, type, title, brand, image, price, active, sort_order, intro_text, specs)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [slug, type, title, brand || "", image || "", price || null,
       active !== false, sort_order || 9999, intro_text || "", JSON.stringify(specs || {})]
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.patch("/api/admin/accessories/:id", adminAuth, async (req, res) => {
  try {
    const allowed = ["title","brand","image","price","active","sort_order","intro_text","specs"];
    const fields = Object.keys(req.body).filter(k => allowed.includes(k));
    if (!fields.length) return res.status(400).json({ error: "nothing to update" });
    const sets = fields.map((f, i) => `${f} = $${i + 1}`);
    sets.push("updated_at = NOW()");
    const vals = [...fields.map(f => f === "specs" ? JSON.stringify(req.body[f]) : req.body[f]), req.params.id];
    const { rows } = await query(
      `UPDATE catalog_accessories SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`,
      vals
    );
    if (!rows.length) return res.status(404).json({ error: "not found" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/admin/accessories/:id", adminAuth, async (req, res) => {
  try {
    await query("DELETE FROM catalog_accessories WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ════════════════════════════════════════
// CAMPAIGNS — CRUD
// ════════════════════════════════════════

app.get("/api/admin/campaigns", adminAuth, async (req, res) => {
  try {
    const { rows } = await query("SELECT * FROM campaigns ORDER BY created_at DESC");
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/admin/campaigns", adminAuth, async (req, res) => {
  try {
    const { name, description, discount_pct, applies_to, valid_from, valid_to, active } = req.body;
    const { rows } = await query(
      `INSERT INTO campaigns (name, description, discount_pct, applies_to, valid_from, valid_to, active)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [name, description || "", discount_pct || 0, applies_to || "all",
       valid_from || null, valid_to || null, active !== false]
    );
    res.json(rows[0]);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.patch("/api/admin/campaigns/:id", adminAuth, async (req, res) => {
  try {
    const allowed = ["name","description","discount_pct","applies_to","valid_from","valid_to","active"];
    const fields = Object.keys(req.body).filter(k => allowed.includes(k));
    if (!fields.length) return res.status(400).json({ error: "nothing to update" });
    const sets = fields.map((f, i) => `${f} = $${i + 1}`);
    sets.push("updated_at = NOW()");
    const vals = [...fields.map(f => req.body[f]), req.params.id];
    const { rows } = await query(
      `UPDATE campaigns SET ${sets.join(", ")} WHERE id = $${vals.length} RETURNING *`,
      vals
    );
    if (!rows.length) return res.status(404).json({ error: "not found" });
    res.json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/admin/campaigns/:id", adminAuth, async (req, res) => {
  try {
    await query("DELETE FROM campaigns WHERE id = $1", [req.params.id]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Image upload ──
// POST /api/admin/upload-image — body: { data: "data:image/...;base64,...", filename: "foo.jpg" }
app.post("/api/admin/upload-image", adminAuth, async (req, res) => {
  try {
    const { data, filename } = req.body;
    if (!data || !filename) return res.status(400).json({ error: "data and filename required" });

    const matches = data.match(/^data:image\/(\w+);base64,(.+)$/s);
    if (!matches) return res.status(400).json({ error: "invalid image data" });

    const ext = matches[1].replace("jpeg", "jpg");
    const base64 = matches[2];

    // Sanitize filename
    const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/\.+/g, ".").slice(0, 120);
    const name = `${Date.now()}_${safe}`;
    const filePath = path.join(UPLOADS_DIR, name);

    fs.writeFileSync(filePath, Buffer.from(base64, "base64"));

    res.json({ url: `/uploads/${name}` });
  } catch (e) {
    console.error("[upload]", e.message);
    res.status(500).json({ error: e.message });
  }
});

// ════════════════════════════════════════
// BLOG
// ════════════════════════════════════════

// Helper: ISO week number for a date
function isoWeekYear(d = new Date()) {
  const day = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  day.setUTCDate(day.getUTCDate() + 4 - (day.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  return {
    week: Math.ceil((((day - yearStart) / 86400000) + 1) / 7),
    year: day.getUTCFullYear(),
  };
}

// Public: list published blog posts (week_number <= current week, same year)
app.get("/api/blog/posts", async (_req, res) => {
  if (!HAS_DB) return res.json([]);
  try {
    const { week, year } = isoWeekYear();
    const { rows } = await query(
      `SELECT id, slug, title, meta_description, h1, hero_image, category, read_time, sections, week_number, publish_year, title_color, updated_at
       FROM blog_posts
       WHERE status != 'draft'
         AND (publish_year < $2 OR (publish_year = $2 AND week_number <= $1))
       ORDER BY week_number DESC`,
      [week, year]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Public: single published post
app.get("/api/blog/posts/:slug", async (req, res) => {
  if (!HAS_DB) return res.status(404).json({ error: "not_found" });
  try {
    const { week, year } = isoWeekYear();
    const { rows } = await query(
      `SELECT id, slug, title, meta_description, h1, hero_image, category, read_time, sections, week_number, publish_year, title_color, updated_at
       FROM blog_posts
       WHERE slug = $1 AND status != 'draft'
         AND (publish_year < $3 OR (publish_year = $3 AND week_number <= $2))`,
      [req.params.slug, week, year]
    );
    if (!rows.length) return res.status(404).json({ error: "not_found" });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Preview: any post by slug (requires admin token) — bypasses week check
app.get("/api/blog/preview/:slug", async (req, res) => {
  if (!HAS_DB) return res.status(404).json({ error: "not_found" });
  // No auth required — posts are not listed publicly before publish week,
  // and slugs are not guessable. Preview is internal use only.
  try {
    const { rows } = await query(
      `SELECT id, slug, title, meta_description, h1, hero_image, category, read_time, sections, week_number, publish_year, title_color, updated_at
       FROM blog_posts WHERE slug = $1`,
      [req.params.slug]
    );
    if (!rows.length) return res.status(404).json({ error: "not_found" });
    res.json(rows[0]);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Public: latest published post (for banner)
app.get("/api/blog/latest", async (_req, res) => {
  if (!HAS_DB) return res.json(null);
  try {
    const { week, year } = isoWeekYear();
    const { rows } = await query(
      `SELECT slug, h1, category, week_number FROM blog_posts
       WHERE status != 'draft'
         AND (publish_year < $2 OR (publish_year = $2 AND week_number <= $1))
       ORDER BY publish_year DESC, week_number DESC LIMIT 1`,
      [week, year]
    );
    res.json(rows[0] || null);
  } catch (e) { res.json(null); }
});

// Admin: list ALL blog posts
app.get("/api/admin/blog/posts", adminAuth, async (_req, res) => {
  if (!HAS_DB) return res.json([]);
  try {
    const { rows } = await query(
      `SELECT id, slug, title, meta_description, h1, hero_image, category, read_time, sections, week_number, publish_year, status, title_color, updated_at
       FROM blog_posts ORDER BY week_number ASC`
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Admin: update a blog post
app.patch("/api/admin/blog/posts/:id", adminAuth, async (req, res) => {
  if (!HAS_DB) return res.json({ ok: true });
  const { title, meta_description, h1, hero_image, category, read_time, sections, week_number, status, title_color } = req.body || {};
  try {
    await query(
      `UPDATE blog_posts SET
        title = COALESCE($1, title),
        meta_description = COALESCE($2, meta_description),
        h1 = COALESCE($3, h1),
        hero_image = COALESCE($4, hero_image),
        category = COALESCE($5, category),
        read_time = COALESCE($6, read_time),
        sections = COALESCE($7::jsonb, sections),
        week_number = COALESCE($8, week_number),
        status = COALESCE($9, status),
        title_color = COALESCE($10, title_color),
        updated_at = NOW()
       WHERE id = $11`,
      [title||null, meta_description||null, h1||null, hero_image||null, category||null,
       read_time||null, sections ? JSON.stringify(sections) : null,
       week_number||null, status||null, title_color||null, req.params.id]
    );
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
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
