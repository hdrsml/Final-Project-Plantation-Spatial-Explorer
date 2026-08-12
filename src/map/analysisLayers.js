const ANALYSIS_SOURCE = "analysis-data";

function emptyFC() {
  return { type: "FeatureCollection", features: [] };
}

const ROLE_COLOR = [
  "match",
  ["get", "_ROLE"],
  "selected",
  "#e2b876",
  "cluster-low",
  "#c1595a",
  "cluster-high",
  "#6fa8a3",
  "#6fb3c9", // comparable / nearby
];

// Highlight layer shared by Block Benchmark, Nearby Analysis and
// Performance Cluster: the selected block gets the strongest emphasis,
// related blocks a secondary one, everything else is untouched.
export function addAnalysisLayers(map) {
  map.addSource(ANALYSIS_SOURCE, { type: "geojson", data: emptyFC() });

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

export function clearAnalysis(map) {
  map.getSource(ANALYSIS_SOURCE).setData(emptyFC());
}
