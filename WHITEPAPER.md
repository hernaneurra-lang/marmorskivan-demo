# Whitepaper — Marmorskivan AI-plattform

**Version**: 2.0 — April 2026

---

## Sammanfattning

Marmorskivan-plattformen är en fullstack digital försäljningskanal för natursten och bänkskivor. Den kombinerar ett prisberäkningsverktyg, AI-driven visualisering, realtidschatt med handover-funktion och ett komplett analytics-system — allt i en deploybar enhet.

---

## Arkitektur

```
[Besökare]
    │
    ├── Vite + React SPA (Loopia / statisk hosting)
    │       ├── Landing (CTA → kalkylator)
    │       ├── CalculatorPage (form, mått, material)
    │       ├── KitchenVisualizer (AI-rendering)
    │       ├── ChatWidget (AI + handover)
    │       └── /admin (dashboard, analytics, chatt)
    │
    └── Express.js API (Railway)
            ├── /api/chat           — GPT-4o chatt
            ├── /api/ai-render      — gpt-image-1 inpaint + DALL·E 3
            ├── /api/contact        — kontaktformulär
            ├── /api/analytics      — event-insamling
            ├── /api/admin/*        — admin-API (token-skyddat)
            └── PostgreSQL (Railway managed)
```

---

## AI-visualisering — teknisk genomgång

### Flöde med användarbild + markering (inpaint-läge)

1. **Upload & resize**: Bild skalas ner till max 1024px bredd i webbläsaren
2. **Pixeldata**: `canvas.getImageData()` sparar råpixlar i minnet
3. **Flood fill**: Klick på canvas → BFS flood fill med RGB-tolerans 38 → `Uint8Array`-mask
4. **Rengöring**: Mask dilateras 2px (stänger hål) + `fillHoles()` fyller slutna hålrum ≤2% av bilden
5. **Inpaint PNG**: Markerade pixlar → alpha=0 (transparent hål), resten original → PNG med alpha
6. **API-anrop**: PNG + materialbild + prompt → `POST /api/ai-render`
7. **Server**: gpt-image-1 `images.edit()` med 2 bilder (kök + material) + prompt
8. **Compositing**: AI-result skalas till originalets dimensioner → markerade pixlar ersätts → JPEG returneras

### Varför client-side compositing?

AI:n ändrar ibland mer än den ska. Genom att composita i webbläsaren garanteras matematiskt att **exakt noll pixlar utanför masken ändras** — oavsett vad AI:n producerade.

### Outputstorlek

Servern väljer outputstorlek baserat på originalets aspect ratio:
- Landskap (>1.2): `1536×1024`
- Porträtt (<0.85): `1024×1536`
- Kvadrat: `1024×1024`

---

## Analytics-system

### Arkitektur

Client-side tracking via `src/lib/analytics.js`:
- Browser fingerprint (canvas + WebGL + device) för unik sessionsidentifiering utan cookies
- Sessioner cachas i `localStorage` med 30 min TTL
- Events skickas via `navigator.sendBeacon()` — blockerar aldrig UI

### Events

| Event | Beskrivning |
|---|---|
| `page_view` | Varje route-byte |
| `page_exit` | Tid på sida + maximal scroll-djup |
| `cta_click` | Landing-sidans konverteringsknappar |
| `calculator_open` | Kalkylatorvyn aktiveras |
| `material_selected` | Material väljs (med namn och pris) |
| `kitchen_render` | AI-rendering körs (mode, material, shape, thickness) |
| `chat_open` | Widget öppnas |
| `chat_message` | Meddelande skickat |
| `contact_form_open` | Kontaktformulär öppnas |
| `contact_form_submit` | Formulär skickat |
| `booking_open` | Bokningsmodal öppnas |
| `offert_open` | Offertformulär öppnas |
| `offert_submit_success` | Offert inskickad |

### AI-insikter (client-side)

Admin-panelen genererar automatiska insikter från analytics-data:
- **Besökarsegment**: Avhoppar / Surfar / Engageras / Konverterar
- **Anomali-detection**: Identifierar dagar med onormal trafik (>2× medelvärde)
- **Peak hour**: Bästa tid för kampanjer
- **Chattengagemang**: Andel sessioner som öppnar chatten
- **Handover-rate**: Andel chattar som eskaleras till mänsklig agent

---

## Chatt & Handover

### AI-flöde

```
Inkommande meddelande
    │
    ├── session.mode === "agent" → returnera ingenting (agent svarar)
    │
    ├── Knowledge base keyword-match (≥2 matchningar)
    │       └── returnera KB-svar direkt (0 OpenAI-tokens)
    │
    └── OpenAI GPT-4o
            ├── System prompt med KB-kontext (max 30 poster)
            └── Konversationshistorik (max 10 meddelanden)
```

### Handover

Agent klickar "Ta över" i admin → `session.mode = "agent"` → AI slutar svara → Kunden ser automatiskt meddelande → Agenten chattar direkt via admin-panelen med live-polling (2s interval).

---

## Säkerhet

- Admin-API skyddat med `ADMIN_TOKEN` i Authorization-header
- Rate limiting på `/api/ai-render`: cooldown 60s per IP + max 1 aktiv rendering per IP
- Bilduppladdning: max 10MB, valideras som `image/*`, skalas ner i webbläsaren före sändning
- Inga känsliga env vars exponeras i frontend-bygget

---

## Deploy-pipeline

```
git push origin main
    │
    ├── Railway: auto-detect → npm install → node server.mjs
    │       └── migrate() kör saknade kolumner vid start
    │
    └── Frontend (manuell):
            npm run build → dist/
            WinSCP: ta bort assets/ → Synchronize Remote
```

---

## Skalbarhet

- **Frontend**: Statisk SPA → CDN-ready, ingen serverbelastning
- **Backend**: Railway skalas horisontellt, PostgreSQL hanteras av Railway
- **AI-rendering**: Rate-limitad per IP, asynkron, timeout 90s
- **Analytics**: Beacon-baserat, tappar aldrig UI-performance
- **Geo**: IP-lookup cachas 1h i minnet, ej i DB per request
