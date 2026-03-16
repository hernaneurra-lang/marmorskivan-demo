// src/smartQuery.js
import {
  norm,
  tokens,
  computeBaseKey,
  parseNumberLoose,
  FINISH_WORDS_REGEX
} from "./lib/materialUtils";

/**
 * STOPWORDS – förhindrar att generiska ord dominerar namnmatchningen.
 * För-normaliserade så att matchning alltid blir konsekvent.
 */
const STOPWORDS = new Set(
  ["sten", "stone", "kitchen", "kok", "marmor", "granit", "kvarts"].map(norm)
);

/**
 * RÅ-DATA FÖR INTENTS
 */
const RAW_BRAND_INTENTS = {
  silestone: ["silestone", "cosentino"],
  dekton: ["dekton"],
  caesarstone: ["caesarstone"],
  sensa: ["sensa"],
  vicostone: ["vicostone"],
  intra: ["intra"],
  gattoni: ["gattoni"]
};

const RAW_CATEGORY_INTENTS = {
  composite: ["komposit", "kvarts", "quartz", "composite", "engineered"],
  quartzite: ["kvartsit", "quartzite"],
  marble: ["marmor", "marble", "calacatta", "carrara"],
  granite: ["granit", "granite"],
  ceramic: ["keramik", "ceramic", "porcelain", "dekton", "neolith"],
  limestone: ["kalksten", "limestone"],
  travertine: ["travertin", "travertine"],
  terrazzo: ["terrazzo"],
  onyx: ["onyx"],
  "semi-precious": ["semi precious", "semiprecious", "halvadel", "gemstone"]
};

const RAW_INTENT_TO_CATEGORY = {
  composite: ["kvarts", "komposit"],
  quartzite: ["kvartsit"],
  marble: ["marmor"],
  granite: ["granit"],
  ceramic: ["keramik"],
  limestone: ["kalksten"],
  travertine: ["travertin"],
  terrazzo: ["terrazzo"],
  onyx: ["onyx"],
  "semi-precious": ["semi", "precious", "halvadel"]
};

/**
 * ✅ PRE-NORMALISERING (körs en gång vid laddning)
 * - Vi arbetar med entries direkt för att slippa Object.entries i score-loopen
 * - Alla keywords är norm():ade, så scoreMaterial kan göra enkla includes
 */
const BRAND_INTENTS_ENTRIES = Object.entries(
  Object.fromEntries(Object.entries(RAW_BRAND_INTENTS).map(([k, arr]) => [k, arr.map(norm)]))
);

const CATEGORY_INTENTS_ENTRIES = Object.entries(
  Object.fromEntries(Object.entries(RAW_CATEGORY_INTENTS).map(([k, arr]) => [k, arr.map(norm)]))
);

const INTENT_TO_CATEGORY_WORDS_NORM = Object.fromEntries(
  Object.entries(RAW_INTENT_TO_CATEGORY).map(([k, arr]) => [k, arr.map(norm)])
);

/**
 * Lexikon-state (byggs från materials)
 */
let DYNAMIC_DICT = { color: new Set(), pattern: new Set(), finish: new Set() };

/**
 * ✅ SJÄLVGÅENDE LEXIKON (Set => inga dubbletter)
 */
export function buildDynamicLexicon(materials = []) {
  DYNAMIC_DICT = { color: new Set(), pattern: new Set(), finish: new Set() };

  (materials || []).forEach(m => {
    if (m?.color) DYNAMIC_DICT.color.add(norm(m.color));
    if (m?.pattern) DYNAMIC_DICT.pattern.add(norm(m.pattern));
    if (m?.finish) DYNAMIC_DICT.finish.add(norm(m.finish));

    if (m?.search_tags) {
      String(m.search_tags)
        .split(/[;,]/)
        .forEach(t => {
          const tn = norm(t);
          if (tn.length >= 3) DYNAMIC_DICT.color.add(tn);
        });
    }
  });
}

function findTags(qNorm) {
  const out = { color: [], pattern: [], finish: [] };

  for (const [group, set] of Object.entries(DYNAMIC_DICT)) {
    set.forEach(val => {
      if (val && qNorm.includes(val)) out[group].push(val);
    });
  }

  return out;
}

export function parseSmartQuery(query) {
  const raw = String(query ?? "");
  const qNorm = norm(raw);

  const mmMatch = qNorm.match(/(\d+(?:[.,]\d+)?)\s*mm/);
  const cmMatch = qNorm.match(/(\d+(?:[.,]\d+)?)\s*cm/);

  // ✅ Konsistent via parseNumberLoose (cm->mm hanteras där)
  const targetThickness = mmMatch
    ? parseNumberLoose(`${mmMatch[1]} mm`)
    : (cmMatch ? parseNumberLoose(`${cmMatch[1]} cm`) : null);

  // Basfråga utan mått + finish-ord
  const qBase = qNorm
    .replace(/(\d+(?:[.,]\d+)?)\s*(mm|cm)/g, " ")
    .replace(FINISH_WORDS_REGEX, " ")
    .replace(/\s+/g, " ")
    .trim();

  // ✅ Beräkna baseKey en gång
  const qBaseKey = qBase ? computeBaseKey({ name: qBase }) : "";
  const qBaseKeyParts = qBaseKey ? qBaseKey.split("-").filter(Boolean) : [];

  return {
    qNorm,
    qTokens: tokens(raw),
    targetThickness,
    qBase,
    qBaseKey,
    qBaseKeyParts,
    ...findTags(qNorm)
  };
}

function scoreMaterial(m, smart) {
  let s = 0;

  // Prioritera webName om det finns (leverantörs-id / filnamn / bild-matchning)
  const mName = norm(m?.webName || m?.webname || m?.name || "");
  const mCat = norm(m?.category || "");
  const mBrand = norm(m?.brand || "");

  // ✅ Lazy caches (endast om vi behöver dem)
  let _mText;
  const getMText = () => {
    if (_mText !== undefined) return _mText;
    _mText = norm([
      m?.name,
      m?.webName,
      m?.webname,
      m?.category,
      m?.description,
      m?.color,
      m?.pattern,
      m?.finish,
      m?.search_tags,
      m?.brand,
      m?.collection
    ].filter(Boolean).join(" "));
    return _mText;
  };

  let _mBaseKey;
  const getMBaseKey = () => {
    if (_mBaseKey !== undefined) return _mBaseKey;
    _mBaseKey = computeBaseKey(m) || "";
    return _mBaseKey;
  };

  let _mBaseKeySet;
  const getMBaseKeySet = () => {
    if (_mBaseKeySet !== undefined) return _mBaseKeySet;
    const bk = getMBaseKey();
    _mBaseKeySet = new Set(String(bk || "").split("-").filter(Boolean));
    return _mBaseKeySet;
  };

  let _mTh;
  const getMTh = () => {
    if (_mTh !== undefined) return _mTh;
    _mTh = parseNumberLoose(`${m?.thickness_mm ?? m?.thicknessMm ?? ""} mm`);
    return _mTh;
  };

  // 1) Tjocklek (40p)
  if (typeof smart.targetThickness === "number" && smart.targetThickness > 0) {
    if (getMTh() === smart.targetThickness) s += 40;
  }

  // 2) Namnmatch (20p / 10p)
  // - Filtrera stopwords
  // - Primärt tokens >= 3, fallback >= 2
  const qTokensPrimary = tokens(smart.qBase).filter(t => t.length >= 3 && !STOPWORDS.has(t));
  let activeTokens = qTokensPrimary.length
    ? qTokensPrimary
    : tokens(smart.qBase).filter(t => t.length >= 2 && !STOPWORDS.has(t));

  // Sista fallback: om allt blev stopwords, tillåt >=3 utan stopwords-filter (låg risk men räddar “tomt”)
  if (!activeTokens.length) {
    activeTokens = tokens(smart.qBase).filter(t => t.length >= 3);
  }

  if (activeTokens.length) {
    const hitCount = activeTokens.filter(t => mName.includes(t)).length;
    if (hitCount === activeTokens.length) s += 20;
    else if (hitCount >= 1 && activeTokens.length > 1) s += 10;
  }

  // 3) BaseKey-symmetri (+10p)
  if (smart.qBaseKeyParts.length > 0) {
    const mSet = getMBaseKeySet();
    if (smart.qBaseKeyParts.every(p => mSet.has(p))) s += 10;
  }

  // 4) Varumärkes-boost (25p / 10p)
  for (const [, keywords] of BRAND_INTENTS_ENTRIES) {
    if (keywords.some(k => smart.qNorm.includes(k))) {
      // stark match om materialet själv tydligt innehåller brand-signal
      if (keywords.some(k => mName.includes(k) || mBrand.includes(k))) s += 25;
      // svag match om det bara nämns i beskrivning/taggar/etc
      else if (keywords.some(k => getMText().includes(k))) s += 10;
    }
  }

  // 5) Kategori-intent (15p)
  for (const [intent, keywords] of CATEGORY_INTENTS_ENTRIES) {
    if (keywords.some(kw => smart.qNorm.includes(kw))) {
      const svWords = INTENT_TO_CATEGORY_WORDS_NORM[intent] || [];
      if (svWords.some(sw => mCat.includes(sw))) s += 15;
    }
  }

  // 6) Tagg-match (Max 15p)
  const combinedTags = [...smart.color, ...smart.pattern, ...smart.finish];
  if (combinedTags.length > 0) {
    const fullText = getMText();
    let tagScore = 0;
    for (const tag of combinedTags) {
      if (tag && fullText.includes(tag)) tagScore += 5;
    }
    s += Math.min(tagScore, 15);
  }

  return s;
}

export function smartFilterAndSort(materials, query) {
  const raw = String(query ?? "");
  if (!norm(raw)) return materials || [];

  if (DYNAMIC_DICT.color.size === 0) buildDynamicLexicon(materials || []);
  const smart = parseSmartQuery(raw);

  return (materials || [])
    .map(m => ({ m, s: scoreMaterial(m, smart) }))
    .filter(x => x.s > 0)
    .sort((a, b) => b.s - a.s)
    .map(x => x.m);
}
