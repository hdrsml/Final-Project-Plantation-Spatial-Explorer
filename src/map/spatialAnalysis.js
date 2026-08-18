import * as turf from "@turf/turf";

const LOW_THRESHOLD = 0.85;
const HIGH_THRESHOLD = 1.15;
const MAX_COMPARABLE_BLOCKS = 5;

function centroidOf(feature) {
  return turf.centroid(feature);
}

function distanceMeters(featureA, featureB) {
  return turf.distance(centroidOf(featureA), centroidOf(featureB), { units: "meters" });
}

function latestRecord(records) {
  if (!records || !records.length) return null;

  return [...records].sort((a, b) => String(b.properties.PERIOD).localeCompare(String(a.properties.PERIOD)))[0];
}

// Most recent monthly yield for a block, or null if it has no production
// history yet (e.g. still immature).
export function getLatestYield(bucket) {
  const record = latestRecord(bucket?.production);

  return record ? Number(record.properties.YIELD_TON_HA || 0) : null;
}

// Blocks near a given block, ranked nearest-first. Proximity is measured
// centroid-to-centroid, which is precise enough for "what's around this
// block" without needing full polygon distance.
export function findNearbyBlocks(blockData, selectedFeature, radiusMeters) {
  const selectedBlockCode = selectedFeature.properties.BLOCK;

  return blockData.features
    .filter((f) => f.properties.BLOCK !== selectedBlockCode)
    .map((f) => ({ feature: f, distance: distanceMeters(selectedFeature, f) }))
    .filter((entry) => entry.distance <= radiusMeters)
    .sort((a, b) => a.distance - b.distance);
}

// "How does this block compare with nearby, comparable (mature) blocks?"
export function runBenchmark(blockData, selectedFeature, operationalLookup) {
  const selectedBlockCode = selectedFeature.properties.BLOCK;
  const selectedYield = getLatestYield(operationalLookup[selectedBlockCode]);

  const comparable = blockData.features
    .filter((f) => f.properties.BLOCK !== selectedBlockCode && f.properties.REMARKS === "Mature")
    .map((f) => ({
      feature: f,
      distance: distanceMeters(selectedFeature, f),
      yield: getLatestYield(operationalLookup[f.properties.BLOCK]),
    }))
    .filter((entry) => entry.yield !== null)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, MAX_COMPARABLE_BLOCKS);

  const avgYield = comparable.length
    ? comparable.reduce((sum, entry) => sum + entry.yield, 0) / comparable.length
    : null;

  const gapPercent =
    selectedYield !== null && avgYield ? ((selectedYield - avgYield) / avgYield) * 100 : null;

  return { selectedBlockCode, selectedYield, comparable, avgYield, gapPercent };
}

// "What operational context (production/LSU/fertilizer coverage) exists
// around this block?"
export function runNearbyAnalysis(blockData, selectedFeature, operationalLookup, radiusMeters) {
  const nearby = findNearbyBlocks(blockData, selectedFeature, radiusMeters);

  const hasData = (blockCode, bucketKey) => (operationalLookup[blockCode]?.[bucketKey]?.length || 0) > 0;

  const withProduction = nearby.filter((e) => hasData(e.feature.properties.BLOCK, "production")).length;
  const withLsu = nearby.filter((e) => hasData(e.feature.properties.BLOCK, "lsu")).length;
  const withFertilizer = nearby.filter((e) => hasData(e.feature.properties.BLOCK, "fertilizer")).length;

  return { radiusMeters, nearby, withProduction, withLsu, withFertilizer };
}

export function classifyPerformance(yieldValue, estateAverage) {
  if (yieldValue === null || !estateAverage) return "unknown";
  if (yieldValue < estateAverage * LOW_THRESHOLD) return "low";
  if (yieldValue > estateAverage * HIGH_THRESHOLD) return "high";

  return "normal";
}

// "Is this a problem in one block, or a spatial pattern across several
// nearby blocks?" Simple threshold-vs-estate-average classification, then
// nearby blocks sharing the same tier are treated as one cluster.
export function runPerformanceCluster(blockData, selectedFeature, operationalLookup, radiusMeters) {
  const matureYields = blockData.features
    .filter((f) => f.properties.REMARKS === "Mature")
    .map((f) => getLatestYield(operationalLookup[f.properties.BLOCK]))
    .filter((y) => y !== null);

  const estateAverage = matureYields.length
    ? matureYields.reduce((sum, y) => sum + y, 0) / matureYields.length
    : null;

  const selectedBlockCode = selectedFeature.properties.BLOCK;
  const selectedYield = getLatestYield(operationalLookup[selectedBlockCode]);
  const tier = classifyPerformance(selectedYield, estateAverage);

  if (tier === "unknown" || tier === "normal") {
    return { tier, estateAverage, selectedYield, members: [] };
  }

  const members = findNearbyBlocks(blockData, selectedFeature, radiusMeters)
    .map((entry) => ({ ...entry, yield: getLatestYield(operationalLookup[entry.feature.properties.BLOCK]) }))
    .filter((entry) => entry.yield !== null && classifyPerformance(entry.yield, estateAverage) === tier);

  const clusterYields = [selectedYield, ...members.map((m) => m.yield)];
  const clusterAverage = clusterYields.reduce((sum, y) => sum + y, 0) / clusterYields.length;
  const gapPercent = estateAverage ? ((clusterAverage - estateAverage) / estateAverage) * 100 : null;

  return { tier, estateAverage, clusterAverage, gapPercent, selectedYield, members };
}

// Estate-wide version of the same low/high classification used by
// Performance Cluster, but scanning every mature block up front instead of
// waiting for one to be selected — the "what needs attention right now"
// view an executive or manager wants without drilling into each block.
export function getEstateAttentionList(features, operationalLookup) {
  const matureEntries = features
    .filter((f) => f.properties.REMARKS === "Mature")
    .map((f) => ({ feature: f, yield: getLatestYield(operationalLookup[f.properties.BLOCK]) }))
    .filter((entry) => entry.yield !== null);

  const estateAverage = matureEntries.length
    ? matureEntries.reduce((sum, e) => sum + e.yield, 0) / matureEntries.length
    : null;

  if (!estateAverage) return { estateAverage: null, low: [], high: [] };

  const classified = matureEntries.map((entry) => ({
    ...entry,
    tier: classifyPerformance(entry.yield, estateAverage),
    gapPercent: ((entry.yield - estateAverage) / estateAverage) * 100,
  }));

  return {
    estateAverage,
    low: classified.filter((e) => e.tier === "low").sort((a, b) => a.gapPercent - b.gapPercent),
    high: classified.filter((e) => e.tier === "high").sort((a, b) => b.gapPercent - a.gapPercent),
  };
}
