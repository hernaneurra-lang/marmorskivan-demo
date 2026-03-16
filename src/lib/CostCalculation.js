// Path: src/lib/CostCalculation.js
// ENDA priskälla. Här ändrar du allt som rör prislogik.
// – separata kantprislistor för bänkskiva vs köksö
// – öppningar (ho, häll, kran)
// – tjänster (måttning, montering per m², frakt)
// – spill (påverkar bara materialkostnaden om du vill)

export const CONFIG = {
  // Material / spill
  SPILL_PCT: 0.07,               // 7% spill – sätt till 0 om du vill stänga av
  APPLY_SPILL_TO_INSTALL: false, // spill påverkar inte montering

  // Kantpris per mm för BÄNK
  EDGE_PRICE_PER_MM_BENCH: {
    fasad:   1.5,
    avrundad:2.0,
    halvrund:2.0,
    rundad:  2.0,
  },

  // Kantpris per mm för KÖKSÖ (separat och lätt att ändra)
  EDGE_PRICE_PER_MM_ISLAND: {
    fasad:   1.25,  // ändra fritt (ex. lite högre än bänk om du vill)
    avrundad:1.5,
    halvrund:1.5,
    rundad:  2.0,
  },

  // Öppningar
  HOB_PRICE_PER_HOLE:  { over: 1000, flush: 2850 },
  SINK_PRICE_PER_HOLE: { over: 1000, flush: 2850, under: 2900, recess: 3050 },
  EXTRA_FAUCET_HOLE:   350,

  // Tjänster
  SERVICE: {
    measuring: 480,
    installPerM2: 2995,  // montering per m² (alla stenytor)
    freight: 995,
  },

  // Begränsningar / caps
  LIMITS: {
    sinksMax: 3,
    hobsMax:  2,
    faucetsMax: 3,
  },

  // Moms
  VAT: 0.25,
};

/**
 * computeTotals
 * In:   payload med ytor, kanter, öppningar, materialpris
 * Out:  detaljer + totaler
 */
export function computeTotals(input, cfg = CONFIG) {
  const c = cfg;

  // === 1) Extrahera indata (med defaults) ===
  const materialPricePerM2 = num(input.materialPricePerM2);
  const benchAreaM2        = num(input.benchAreaM2);
  const islandAreaM2       = num(input.islandAreaM2);
  const backsplashAreaM2   = num(input.backsplashAreaM2);
  const benchEdgesMm       = Math.max(0, num(input.benchEdgesMm));
  const islandPerimeterMm  = Math.max(0, num(input.islandPerimeterMm));
  const backsplashEdgesMm  = Math.max(0, num(input.backsplashEdgesMm || 0)); // normalt 0

  const edgeType           = (input.edgeType || "fasad");

  const open = {
    sinkCount:   clamp(num(input?.openings?.sinkCount),   0, c.LIMITS.sinksMax),
    sinkMount:   str(input?.openings?.sinkMount || "over"),
    hobCount:    clamp(num(input?.openings?.hobCount),    0, c.LIMITS.hobsMax),
    hobMount:    str(input?.openings?.hobMount || "over"),
    faucetCount: clamp(num(input?.openings?.faucetCount), 0, c.LIMITS.faucetsMax),
  };

  const service = {
    measuring:    pickNum(input?.serviceOverrides?.measuring,    c.SERVICE.measuring),
    installPerM2: pickNum(input?.serviceOverrides?.installPerM2, c.SERVICE.installPerM2),
    freight:      pickNum(input?.serviceOverrides?.freight,      c.SERVICE.freight),
  };

  // 💰 Tillval från katalog (diskho, häll, blandare) – summeras i CalculatorPage
  const accessoriesTotal   = Math.max(0, num(input.accessoriesTotal || 0));

  // === 2) Material-areor ===
  const totalStoneM2 = benchAreaM2 + islandAreaM2 + backsplashAreaM2;
  const areaForMaterial = totalStoneM2 * (1 + (c.SPILL_PCT || 0));   // spill bara på material
  const areaForInstall  = c.APPLY_SPILL_TO_INSTALL ? areaForMaterial : totalStoneM2;

  const materialCost =
    materialPricePerM2 * areaForMaterial;

  // === 3) Kanter ===
  const benchEdgeRate  = pickNum(c.EDGE_PRICE_PER_MM_BENCH[edgeType], 0);
  const islandEdgeRate = pickNum(c.EDGE_PRICE_PER_MM_ISLAND[edgeType], benchEdgeRate);

  const benchEdgeCost  = benchEdgesMm  * benchEdgeRate;
  const islandEdgeCost = islandPerimeterMm * islandEdgeRate;

  // (Om du vill ta betalt för stänkskyddskanter: lägg rate här)
  const backsplashEdgeRate = 0; // ex. 0 tills vidare
  const backsplashEdgeCost = backsplashEdgesMm * backsplashEdgeRate;

  const edgeCostTotal = benchEdgeCost + islandEdgeCost + backsplashEdgeCost;

  // === 4) Öppningar ===
  const hobCostPer = pickNum(c.HOB_PRICE_PER_HOLE[open.hobMount], 0);
  const sinkCostPer = pickNum(c.SINK_PRICE_PER_HOLE[open.sinkMount], 0);
  const hobCost = hobCostPer * open.hobCount;
  const sinkCost = sinkCostPer * open.sinkCount;
  const faucetCost = Math.max(0, open.faucetCount - 1) * c.EXTRA_FAUCET_HOLE;

  const openingsCost = hobCost + sinkCost + faucetCost;

  // === 5) Tjänster ===
  const installCost = Math.round(areaForInstall * service.installPerM2);
  const serviceCost = service.measuring + installCost + service.freight;

  // === 6) Subtotal + Moms + Total ===
  const subtotal =
    materialCost + edgeCostTotal + openingsCost + accessoriesTotal + serviceCost;

  const vat = subtotal * (c.VAT || 0.25);
  const total = subtotal + vat;

  // === 7) Returnera tydligt objekt (kan användas för breakdown) ===
  return {
    lines: {
      material:       round(materialCost),
      edges: {
        bench:        round(benchEdgeCost),
        island:       round(islandEdgeCost),
        backsplash:   round(backsplashEdgeCost),
        total:        round(edgeCostTotal),
        rates: {
          benchPerMm:  benchEdgeRate,
          islandPerMm: islandEdgeRate,
        },
      },
      openings: {
        hob:          round(hobCost),
        sink:         round(sinkCost),
        faucet:       round(faucetCost),
        accessories:  round(accessoriesTotal),
        total:        round(openingsCost + accessoriesTotal),
      },
      service: {
        measuring:    round(service.measuring),
        install:      round(installCost),
        freight:      round(service.freight),
        total:        round(serviceCost),
      },
    },
    meters: {
      benchAreaM2:      round2(benchAreaM2),
      islandAreaM2:     round2(islandAreaM2),
      backsplashAreaM2: round2(backsplashAreaM2),
      totalStoneM2:     round2(totalStoneM2),
      benchEdgesMm,
      islandPerimeterMm,
      backsplashEdgesMm,
      spillPct:         c.SPILL_PCT,
    },
    summary: {
      subtotal: round(subtotal),
      vat:      round(vat),
      total:    round(total),
    },
    configUsed: c,
  };
}

/* ---------------- helpers ---------------- */
const num = (v) => Number(v) || 0;
const str = (v) => String(v || "");
const clamp = (n, a, b) => Math.max(a, Math.min(b, Number(n) || 0));
const round = (n) => Math.round(Number(n) || 0);
const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;
const pickNum = (v, fallback) => (typeof v === "number" ? v : fallback);
