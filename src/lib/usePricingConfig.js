// Path: src/lib/usePricingConfig.js
import { useEffect, useState } from "react";
import { CONFIG as DEFAULT_CONFIG } from "./CostCalculation";

export function usePricingConfig() {
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Nu alltid i public/config/prices.json
  const url = "/config/prices.json";

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const remote = await res.json();

        // Merge remote + default
        const merged = {
          ...DEFAULT_CONFIG,
          ...remote,
          EDGE_PRICE_PER_MM_BENCH: {
            ...DEFAULT_CONFIG.EDGE_PRICE_PER_MM_BENCH,
            ...(remote.EDGE_PRICE_PER_MM_BENCH || {}),
          },
          EDGE_PRICE_PER_MM_ISLAND: {
            ...DEFAULT_CONFIG.EDGE_PRICE_PER_MM_ISLAND,
            ...(remote.EDGE_PRICE_PER_MM_ISLAND || {}),
          },
          HOB_PRICE_PER_HOLE: {
            ...DEFAULT_CONFIG.HOB_PRICE_PER_HOLE,
            ...(remote.HOB_PRICE_PER_HOLE || {}),
          },
          SINK_PRICE_PER_HOLE: {
            ...DEFAULT_CONFIG.SINK_PRICE_PER_HOLE,
            ...(remote.SINK_PRICE_PER_HOLE || {}),
          },
          SERVICE: {
            ...DEFAULT_CONFIG.SERVICE,
            ...(remote.SERVICE || {}),
          },
          LIMITS: {
            ...DEFAULT_CONFIG.LIMITS,
            ...(remote.LIMITS || {}),
          },
        };

        if (alive) setConfig(merged);
      } catch (e) {
        if (alive) setError(String(e));
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => { alive = false; };
  }, [url]);

  return { config, loading, error };
}
