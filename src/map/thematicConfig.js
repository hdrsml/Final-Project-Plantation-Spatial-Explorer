// Single source of truth for the thematic-map modes: layer id, paint
// expression, and legend content all come from this config instead of being
// duplicated per-mode across thematicLayers.js/divisionFilter.js. Adding a
// third thematic mode means adding one entry here, not touching multiple
// hardcoded conditional branches.

export const NO_DATA_COLOR = "#3a3b42";

// Lets the satellite basemap read through both choropleths instead of
// fully covering it — was 0.85.
const LAYER_OPACITY = 0.6;

// Red-to-green performance ramp — low yield reads as red, high yield as
// green, same convention as a traffic light. Kept a shade muted rather than
// pure saturated hues so it still sits comfortably in the dark UI.
const PRODUCTION_STOPS = [
  { value: 0, color: "#c1595a", label: "0" },
  { value: 0.8, color: "#d1823f", label: "0.8" },
  { value: 1.6, color: "#d1a13a", label: "1.6" },
  { value: 2.4, color: "#9cb84a", label: "2.4" },
  { value: 3.2, color: "#5fa05f", label: "3.2+" },
];

// Fertilizer STATUS in the MAPID layer is a workflow state (has the
// application happened yet), not a dosage-quality rating.
const FERTILIZER_STOPS = [
  { value: "Applied", color: "#6fa8a3" },
  { value: "Planned", color: "#d1a13a" },
];

export const THEMATIC_MODES = {
  production: {
    layerId: "production-choropleth",
    legendTitle: "Yield (ton/ha)",
    legendKind: "scale",
    legendNote: "Block transparan = belum matang (TBM) atau data belum tersedia",
    stops: PRODUCTION_STOPS,
    paint: {
      "fill-color": [
        "case",
        ["==", ["get", "_YIELD_TON_HA"], null],
        NO_DATA_COLOR,
        [
          "interpolate",
          ["linear"],
          ["get", "_YIELD_TON_HA"],
          ...PRODUCTION_STOPS.flatMap((stop) => [stop.value, stop.color]),
        ],
      ],
      // Immature (TBM) blocks report a near-zero yield by convention — real,
      // but not a performance signal — which would otherwise paint them the
      // same "critical red" as a genuinely underperforming mature block.
      // Hollow them out instead, same as blocks with no record at all.
      "fill-opacity": [
        "case",
        ["any", ["!=", ["get", "REMARKS"], "Mature"], ["==", ["get", "_YIELD_TON_HA"], null]],
        0,
        LAYER_OPACITY,
      ],
    },
  },
  fertilizer: {
    layerId: "fertilizer-choropleth",
    legendTitle: "Fertilizer Status",
    legendKind: "list",
    stops: FERTILIZER_STOPS,
    paint: {
      "fill-color": [
        "match",
        ["coalesce", ["get", "_FERTILIZER_STATUS"], "No Data"],
        ...FERTILIZER_STOPS.flatMap((stop) => [stop.value, stop.color]),
        NO_DATA_COLOR,
      ],
      "fill-opacity": LAYER_OPACITY,
    },
  },
};

export const THEMATIC_LAYER_IDS = Object.values(THEMATIC_MODES).map((mode) => mode.layerId);
