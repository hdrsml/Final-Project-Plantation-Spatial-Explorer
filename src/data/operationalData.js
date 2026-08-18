import { MAPID_LAYERS } from "../config/env.js";
import { fetchLayerWithFallback } from "../services/mapidApi.js";

let operationalByBlock = {};
let availablePeriods = [];

function emptyBucket() {
  return { production: [], fertilizer: [], lsu: [] };
}

function indexByBlock(bucketKey, featureCollection) {
  for (const feature of featureCollection.features) {
    const block = feature.properties.BLOCK;

    if (!block) continue;

    if (!operationalByBlock[block]) {
      operationalByBlock[block] = emptyBucket();
    }

    operationalByBlock[block][bucketKey].push(feature);
  }
}

// Loads production, fertilizer and LSU records and indexes them by block_id,
// mirroring the spatial layer's BLOCK code so the map can join spatial <-> operational data.
export async function loadOperationalData() {
  operationalByBlock = {};

  const [production, fertilizer, lsu] = await Promise.all([
    fetchLayerWithFallback("Production", MAPID_LAYERS.production, "data/production.json"),
    fetchLayerWithFallback("Fertilizer", MAPID_LAYERS.fertilizer, "data/fertilizer.json"),
    fetchLayerWithFallback("LSU", MAPID_LAYERS.lsu, "data/lsu.json"),
  ]);

  indexByBlock("production", production);
  indexByBlock("fertilizer", fertilizer);
  indexByBlock("lsu", lsu);

  const periodMap = new Map();
  production.features.forEach((f) => periodMap.set(f.properties.PERIOD, f.properties.PERIOD_LABEL));
  availablePeriods = [...periodMap.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) => a.value.localeCompare(b.value));

  return operationalByBlock;
}

// Every block shares the same monthly period set (production drives it),
// used to drive the map's time selector.
export function getAvailablePeriods() {
  return availablePeriods;
}

export function getOperationalRecords(blockName) {
  return operationalByBlock[blockName] || null;
}

export function getAllOperationalRecords() {
  return operationalByBlock;
}

// Average yield per period across the given blocks (division-filtered by
// the caller) — the estate/division-level counterpart to the per-block
// production trend chart.
export function getEstateYieldTrend(blockCodes) {
  const periodMap = new Map();

  blockCodes.forEach((blockCode) => {
    const records = operationalByBlock[blockCode]?.production || [];

    records.forEach((r) => {
      const period = r.properties.PERIOD;
      const bucket = periodMap.get(period) || { period, label: r.properties.PERIOD_LABEL, yieldSum: 0, count: 0 };

      bucket.yieldSum += Number(r.properties.YIELD_TON_HA || 0);
      bucket.count += 1;

      periodMap.set(period, bucket);
    });
  });

  return [...periodMap.values()]
    .map((b) => ({ period: b.period, label: b.label, avgYield: b.count ? b.yieldSum / b.count : 0 }))
    .sort((a, b) => String(a.period).localeCompare(String(b.period)));
}

export function summarizeBlockOperations(blockName) {
  const data = operationalByBlock[blockName];

  if (!data) return null;

  const totalTonnage = data.production.reduce(
    (sum, feature) => sum + Number(feature.properties.TONNAGE_TON || 0),
    0
  );

  const totalBunches = data.production.reduce(
    (sum, feature) => sum + Number(feature.properties.BUNCH_COUNT || 0),
    0
  );

  const areaHa = data.production.length
    ? Number(data.production[0].properties.AREA_HA || 0)
    : 0;

  const yieldTonHa = areaHa > 0 ? totalTonnage / areaHa : 0;

  const totalFertilizerKg = data.fertilizer.reduce(
    (sum, feature) => sum + Number(feature.properties.TOTAL_FERTILIZER_KG || 0),
    0
  );

  return {
    production: {
      records: data.production,
      totalTonnage,
      totalBunches,
      areaHa,
      yieldTonHa,
    },
    fertilizer: {
      records: data.fertilizer,
      totalKg: totalFertilizerKg,
      applications: data.fertilizer.length,
    },
    lsu: {
      records: data.lsu,
      samples: data.lsu.length,
    },
  };
}
