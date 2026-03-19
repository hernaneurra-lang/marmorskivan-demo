# marmorskivan-demo — Claude Guide

## Stack
- **Frontend**: Vite + React SPA → FTP deploy till Loopia (statisk)
- **Backend**: Express.js + SQLite → Railway (auto-deploy från GitHub `main`)
- **Build**: `npm run build` (Vite + prerender ~10 min) | `npm run build:justvite` (bara Vite, ~15s, för snabb kompilkontroll)

## Deploy
1. `npm run build` → genererar `dist/`
2. FTP via **WinSCP**: ta bort `assets/` på servern först, sedan Synchronize (Remote) — laddar bara upp ändrade filer
3. PHP-filer (`api/`, `boka-tid/`, `PHPMailer/`, `includes/`, `storage/`, `vendor/`) ska **aldrig** raderas — de ligger på samma Loopia-server

## Settings (ingen rebuild krävs)
Alla inställningar hämtas via `/api/settings` vid runtime. Ändringar i admin-panelen slår igenom direkt utan ny build.

Nyckel-inställningar:
- `accent_color` — accentfärg (knappar, CTA)
- `nav_cta_text` — text på CTA-knapp i navbar
- `company`, `tagline`, `phone`, `email`, `address`, `hours` — visas i SiteFooter

## Knappdesign (kalkylator)
- **Aktiv**: `bg-emerald-600 border-emerald-600 text-white shadow-md`
- **Inaktiv**: `bg-white border-gray-300 text-gray-900 hover:border-emerald-400`
- Alltid explicit `text-gray-900` — inga knappar utan textfärg

## Viktigt
- **recharts är borttaget** — inkompatibelt med Vite manual chunk splitting. Använd CSS bar charts (klasser: `.bar-chart`, `.bar-col`, `.bar-col-bar` i `admin.css`)
- Admin-token: env var `ADMIN_TOKEN` på Railway (default: `marmorskivan-admin`)
