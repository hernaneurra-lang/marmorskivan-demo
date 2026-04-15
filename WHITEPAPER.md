# Whitepaper — Marmorskivan AI-plattform

**Version**: 3.1 — April 2026

---

## Sammanfattning

Marmorskivan-plattformen är en fullstack digital försäljningskanal för natursten och bänkskivor. Den kombinerar ett prisberäkningsverktyg, AI-driven visualisering, realtidschatt med handover-funktion och ett komplett analytics-system med produkt- och konverteringsspårning — allt i en deploybar enhet.

---

## Arkitektur

```
[Besökare]
    │
    ├── Vite + React SPA (Loopia / statisk hosting)
    │       ├── Landing (CTA → kalkylator)
    │       ├── CalculatorPage (form, mått, material, tillval)
    │       ├── KitchenVisualizer (AI-rendering med flood fill-markering)
    │       ├── ChatWidget (AI + handover)
    │       └── /admin (8 vyer: Dashboard, Chattar, Kontakter,
    │                   Analytics, Produkter, Rapporter, Kunskapsbas,
    │                   Bokningar, Inställningar)
    │
    └── Express.js API (Railway)
            ├── /api/chat                      — GPT-4o chatt
            ├── /api/ai-render                 — gpt-image-1 inpaint + DALL·E 3
            ├── /api/contact                   — kontaktformulär
            ├── /api/analytics                 — event-insamling (beacon)
            ├── /api/materials                 — publikt materialregister (ingen auth)
            ├── /api/admin/analytics           — aggregerad analytics
            ├── /api/admin/analytics/drilldown — rad-för-rad detaljer per KPI
            ├── /api/admin/products            — CRUD materialregister (admin)
            └── PostgreSQL (Railway managed)
```

---

## AI-visualisering — teknisk genomgång

### Flöde med användarbild + markering (inpaint-läge)

1. **Upload & resize**: Bild skalas ner till max 1024px bredd i webbläsaren
2. **Pixeldata**: `canvas.getImageData()` sparar råpixlar i minnet
3. **Flood fill**: Klick på canvas → BFS flood fill med RGB-tolerans 38 → `Uint8Array`-mask
4. **Rengöring**: Mask dilateras 2px (stänger hål) + `fillHoles()` fyller slutna hålrum ≤2% av bilden
5. **Erase-läge**: Penselbaserad borttagning (radius 20px) via Pointer Events API
6. **Inpaint PNG**: Markerade pixlar → alpha=0 (transparent hål), resten original → PNG med alpha
7. **API-anrop**: PNG + materialbild + prompt → `POST /api/ai-render`
8. **Server**: gpt-image-1 `images.edit()` med 2 bilder (kök + material) + prompt
9. **Compositing**: AI-result skalas till originalets exakta dimensioner med `drawImage()` → markerade pixlar ersätts pixel för pixel → JPEG returneras

### Varför client-side compositing?

AI:n ändrar ibland mer än den ska. Genom att composita i webbläsaren garanteras matematiskt att **exakt noll pixlar utanför masken ändras** — oavsett vad AI:n producerade. AI-bilden skalas till originalets dimensioner före compositing för att undvika koordinatförskjutning.

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
- Geo-lookup (ip-api.com) per event server-side — land + stad lagras på varje rad

### Fullständig event-lista

| Event | Trigger | Data |
|---|---|---|
| `page_view` | Varje route-byte | path, referrer |
| `page_exit` | Lämnar sida | time_ms, max_scroll |
| `cta_click` | Landing-CTA klickas | source |
| `calculator_open` | Kalkylatorn visas | — |
| `material_selected` | Material väljs | material, price |
| `price_viewed` | Pris visas i 3s (debounced) | material, total, shape |
| `accessory_selected` | Diskho/kran/häll väljs | type, name, price |
| `kitchen_render` | AI-rendering körs | mode, material, shape, thicknessMm |
| `offert_open` | Offertformulär öppnas | material, shape |
| `offert_submit_success` | Offert skickad | material, shape, total |
| `chat_open` | Chattwidget öppnas | — |
| `chat_message` | Meddelande skickat | session |
| `contact_form_open` | Kontaktformulär öppnas | session |
| `contact_form_submit` | Formulär skickat | session |
| `booking_open` | Bokningsmodal öppnas | session |

### Konverteringstratt (7 steg)

```
Sidvisningar
  → Kalkylator öppnad
    → Material valt
      → Pris sett (ej skickat)        ← identifierar leads som tvekar
        → Offert öppnad
          → Offert skickad
            → Kontaktuppgifter lämnade
```

Varje steg visar absolut antal + procentandel av föregående steg.

### Drill-down per KPI

Varje KPI-kort i admin är klickbart → modal med upp till 200 rader rådata:

| KPI | Kolumner |
|---|---|
| Sidvisningar | Tid, sida, land, stad, källa, enhet |
| Unika sessioner | Tid, sida, land, stad, enhet, skärm |
| Chattsessioner | Tid, land, stad, status, prioritet, taggar |
| Kalkylator | Tid, sida, land, enhet |
| Offerter | Tid, material, form, land, enhet |
| Kontakter | Tid, namn, telefon, e-post |
| Handover | Tid, land, stad, agent, taggar |
| Renderingar | Tid, material, läge, form, tjocklek, land |
| Diskhoar/kranar/hällar | Tid, produkt, pris, land |

### AI-insikter (client-side)

Automatiska insikter genereras från analytics-data:
- **Besökarsegment**: Avhoppar / Surfar / Engageras / Konverterar
- **Anomali-detection**: Dagar med >2× normal trafik flaggas
- **Peak hour**: Bästa tid för kampanjer (all aktivitet per timme)
- **Tid på sida**: Genomsnitt per sida med exit-count
- **Chattengagemang** + **Handover-rate**

---

## Produkter & Konvertering (admin-vy)

Dedikerad vy med:
- **SVG donut-ringar** per funnel-steg med % och antal
- **Konverteringsnyckeltal**: avhopp, kalkylator→material, pris sett→ej offert, offert→skickad (färgkodade)
- **Top 20 klickade material** med horisontell bar + drill-down
- **Top diskhoar / kranar / hällar** var för sig med drill-down
- **Köksrenderingar** med % av kalkylatorsessioner

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

## Admin-panelens 9 vyer

| Vy | Innehåll |
|---|---|
| Dashboard | KPI-kort, tratt, dagliga chattar, toppfrågor |
| Chattar | Live-sessioner, handover, snabbsvar, KB-sökning, anteckningar |
| Kontakter | Inlämnade kontaktförfrågningar |
| Analytics | Sidvisningar, geo, peak hour, tid på sida, AI-insikter |
| Produkter | Donut-grafer, top material, top tillval, konvertering |
| Rapporter | CSV-export av analytics, chattar, kontakter |
| Kunskapsbas | FAQ som AI:n använder som kontext |
| Bokningar | Inkomna bokningsförfrågningar |
| Inställningar | Runtime-inställningar utan rebuild |

---

## Säkerhet

- Admin-API skyddat med `ADMIN_TOKEN` i `x-admin-token`-header
- Rate limiting på `/api/ai-render`: cooldown 60s per IP + max 1 aktiv rendering per IP
- Bilduppladdning: max 10MB, valideras som `image/*`, skalas ner i webbläsaren
- Inga känsliga env vars exponeras i frontend-bygget

---

## Deploy-pipeline

```
git push origin main
    │
    ├── Railway: auto-detect → npm install → node server.mjs
    │       └── migrate() kör saknade DB-kolumner vid start
    │
    └── Frontend (manuell):
            npm run build:noprerender   (~2 min, utan prerender)
            npm run build               (~10 min, med prerender + sitemap)
            WinSCP: ta bort assets/ → Synchronize Remote
```

---

## Materialregister — live utan rebuild

Från och med version 3.1 hämtar frontend materialdata direkt från Railway-API:t (`GET /api/materials`) i stället för den statiska `materials.csv`. Ändringar i admin-panelen (pris, beskrivning, status, nya material) slår igenom på hemsidan direkt utan ny build eller FTP-deploy. CSV:n kvarstår som fallback om API:t är otillgängligt.

---

## Skalbarhet

- **Frontend**: Statisk SPA → CDN-ready, ingen serverbelastning
- **Backend**: Railway auto-skalas, PostgreSQL hanteras av Railway
- **AI-rendering**: Rate-limitad per IP, asynkron, max 1 aktiv per IP
- **Analytics**: Beacon-baserat, tappar aldrig UI-performance
- **Geo**: IP-lookup cachas 1h i minnet per IP
- **Drill-down**: Max 200 rader per query, index på `event` + `created_at`
- **Materialregister**: API-first med CSV-fallback — inga byggen krävs för innehållsändringar
