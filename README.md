# Marmorskivan – prisberäknare + AI-visualisering (demo)

En Vite + React + Tailwind-demo som återskapar och förbättrar funktionerna från en typisk bänkskivekalkylator.

## Kör lokalt
```bash
npm install
npm run dev
```
Öppna sedan adressen som visas i terminalen.

## Bygg produktion
```bash
npm run build
npm run preview
```

## Anmärkning
- Alla priser och materialdata är dummyvärden.
- AI-visualisering är förberedd via en prompt-text. Koppla till ditt bild-API i `visual`-fliken.


## Snabb onboarding (minsta möjliga handpåläggning)
1. Kör `npm install && npm run dev`.
2. Vill du ta emot offertdata? Skapa ett Formspree-formulär och lägg URL i `.env` som `VITE_FORMS_ENDPOINT=...`.
3. Lägg dina materialbilder i `public/images/materials/` och uppdatera `src/data/materials.json`.
4. Deploya till Vercel/Netlify. Klart!
