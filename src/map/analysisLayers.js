import * as turf from "@turf/turf";

const ANALYSIS_SOURCE = "analysis-data";
const RADIUS_SOURCE = "analysis-radius-data";
const CONNECTOR_SOURCE = "analysis-connector-data";

function emptyFC() {
  return { type: "FeatureCollection", features: [] };
}

// Deliberately vivid and spread across the wheel — each of the three
// analyses (and the two Performance Cluster tiers) needs to read as a
// distinct signal at a glance, not just a subtler shade of the app's muted
// accent palette used elsewhere.
const ROLE_COLOR = [
  "match",
  ["get", "_ROLE"],
  "selected",
  "#f5a623", // orange — the block being analyzed, same role in all three analyses
  "comparable",
  "#38bdf8", // cyan — Block Benchmark's comparison set
  "nearby",
  "#c084fc", // purple — Nearby Analysis's coverage set
  "cluster-low",
  "#ef4444", // red — Performance Cluster, underperforming tier
  "cluster-high",
  "#4ade80", // green — Performance Cluster, overperforming tier
  "#38bdf8",
];

// Tone for the radius ring: mirrors the role each color represents above so
// the ring and the blocks inside it read as one consistent signal.
const TONE_COLOR = {
  neutral: "#c084fc", // Nearby Analysis
  low: "#ef4444", // Performance Cluster, low tier
  high: "#4ade80", // Performance Cluster, high tier
};

// Three map layers shared by Block Benchmark, Nearby Analysis and
// Performance Cluster, each visualizing *why* a set of blocks was picked:
//  - analysis-fill/outline: the blocks themselves (selected vs. related).
//  - analysis-radius: the search radius behind Nearby/Cluster, so the area
//    actually considered is visible, not just the blocks that matched it.
//  - analysis-connectors: dashed lines from the selected block to each
//    comparable block in Block Benchmark, which isn't radius-bound.
export function addAnalysisLayers(map) {
  map.addSource(ANALYSIS_SOURCE, { type: "geojson", data: emptyFC() });
  map.addSource(RADIUS_SOURCE, { type: "geojson", data: emptyFC() });
  map.addSource(CONNECTOR_SOURCE, { type: "geojson", data: emptyFC() });

  // Radius ring goes in first so the block highlights above always stay on
  // top of it, never obscured.
  map.addLayer(
    {
      id: "analysis-radius-fill",
      type: "fill",
      source: RADIUS_SOURCE,
      paint: {
        "fill-color": ["get", "_TONE_COLOR"],
        "fill-opacity": 0.07,
      },
    },
    "block-boundary"
  );

  map.addLayer(
    {
      id: "analysis-radius-outline",
      type: "line",
      source: RADIUS_SOURCE,
      paint: {
        "line-color": ["get", "_TONE_COLOR"],
        "line-width": 1.5,
        "line-dasharray": [2, 2],
        "line-opacity": 0.75,
      },
    },
    "block-boundary"
  );

  map.addLayer(
    {
      id: "analysis-fill",
      type: "fill",
      source: ANALYSIS_SOURCE,
      paint: {
        "fill-color": ROLE_COLOR,
        "fill-opacity": ["match", ["get", "_ROLE"], "selected", 0.3, 0.16],
      },
    },
    "block-boundary"
  );

  map.addLayer(
    {
      id: "analysis-outline",
      type: "line",
      source: ANALYSIS_SOURCE,
      paint: {
        "line-color": ROLE_COLOR,
        "line-width": ["match", ["get", "_ROLE"], "selected", 4, 2.5],
      },
    },
    "block-boundary"
  );

  map.addLayer(
    {
      id: "analysis-connectors",
      type: "line",
      source: CONNECTOR_SOURCE,
      paint: {
        "line-color": "#38bdf8",
        "line-width": 1.5,
        "line-dasharray": [1, 2],
        "line-opacity": 0.75,
      },
    },
    "block-boundary"
  );
}

// entries: [{ feature, role }] where role is "selected" | "comparable" |
// "nearby" | "cluster-low" | "cluster-high".
export function setAnalysisFeatures(map, entries) {
  const features = entries.map(({ feature, role }) => ({
    ...feature,
    properties: { ...feature.properties, _ROLE: role },
  }));

  map.getSource(ANALYSIS_SOURCE).setData({ type: "FeatureCollection", features });
}

// Draws the actual search radius used by Nearby Analysis / Performance
// Cluster around the selected block's centroid, so the analysis' scope is
// something the user can see, not just infer from the dropdown value.
export function setAnalysisRadius(map, centerFeature, radiusMeters, tone = "neutral") {
  const center = turf.centroid(centerFeature);
  const circle = turf.circle(center, radiusMeters, { steps: 64, units: "meters" });

  circle.properties = { _TONE_COLOR: TONE_COLOR[tone] || TONE_COLOR.neutral };

  map.getSource(RADIUS_SOURCE).setData({ type: "FeatureCollection", features: [circle] });
}

export function clearAnalysisRadius(map) {
  map.getSource(RADIUS_SOURCE).setData(emptyFC());
}

// Draws a comparison line from the selected block to each block Block
// Benchmark picked, so "compared against what" is visible on the map
// instead of only listed in the result panel.
export function setAnalysisConnectors(map, centerFeature, targetFeatures) {
  const center = turf.centroid(centerFeature).geometry.coordinates;
  const lines = targetFeatures.map((feature) => turf.lineString([center, turf.centroid(feature).geometry.coordinates]));

  map.getSource(CONNECTOR_SOURCE).setData({ type: "FeatureCollection", features: lines });
}

export function clearAnalysisConnectors(map) {
  map.getSource(CONNECTOR_SOURCE).setData(emptyFC());
}

export function clearAnalysis(map) {
  map.getSource(ANALYSIS_SOURCE).setData(emptyFC());
  clearAnalysisRadius(map);
  clearAnalysisConnectors(map);
}
