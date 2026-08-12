const THEMATIC_SOURCE = "block-thematic";

const PRODUCTION_STOPS = [
  { value: 0, color: "#2a2b32", label: "0" },
  { value: 0.8, color: "#6a4a1c", label: "0.8" },
  { value: 1.6, color: "#a9762c", label: "1.6" },
  { value: 2.4, color: "#c99a4e", label: "2.4" },
  { value: 3.2, color: "#e2b876", label: "3.2+" },
];

// Fertilizer STATUS in the MAPID layer is a workflow state (has the
// application happened yet), not a dosage-quality rating.
const FERTILIZER_STOPS = [
  { value: "Applied", color: "#6fa8a3" },
  { value: "Planned", color: "#d1a13a" },
];

const NO_DATA_COLOR = "#3a3b42";

function emptyFC() {
  return { type: "FeatureCollection", features: [] };
}

export function addThematicLayers(map) {
  map.addSource(THEMATIC_SOURCE, { type: "geojson", data: emptyFC() });

  map.addLayer(
    {
      id: "production-choropleth",
      type: "fill",
      source: THEMATIC_SOURCE,
      layout: { visibility: "none" },
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
        "fill-opacity": 0.85,
      },
    },
    "block-boundary"
  );

  map.addLayer(
    {
      id: "fertilizer-choropleth",
      type: "fill",
      source: THEMATIC_SOURCE,
      layout: { visibility: "none" },
      paint: {
        "fill-color": [
          "match",
          ["coalesce", ["get", "_FERTILIZER_STATUS"], "No Data"],
          ...FERTILIZER_STOPS.flatMap((stop) => [stop.value, stop.color]),
          NO_DATA_COLOR,
        ],
        "fill-opacity": 0.85,
      },
    },
    "block-boundary"
  );
}

export function setActiveThematicLayer(map, layerKey) {
  map.setLayoutProperty("production-choropleth", "visibility", layerKey === "production" ? "visible" : "none");
  map.setLayoutProperty("fertilizer-choropleth", "visibility", layerKey === "fertilizer" ? "visible" : "none");
}

// A block can have more than one fertilizer record in the same period (one
// per nutrient type). Dosage is summed and the status shows "Planned" if
// any of them is still pending, so the layer reads as an action list.
function aggregateFertilizer(records, period) {
  const matches = records.filter((r) => r.properties.PERIOD === period);

  if (!matches.length) return { dosage: null, status: null };

  const dosage = matches.reduce((sum, r) => sum + Number(r.properties.DOSAGE_KG_HA || 0), 0);
  const status = matches.some((r) => r.properties.STATUS === "Planned") ? "Planned" : "Applied";

  return { dosage, status };
}

export function updateThematicData(map, blockData, period, operationalLookup) {
  const features = blockData.features.map((feature) => {
    const bucket = operationalLookup[feature.properties.BLOCK];

    const productionRecord = bucket?.production.find((r) => r.properties.PERIOD === period) || null;
    const fertilizer = aggregateFertilizer(bucket?.fertilizer || [], period);

    return {
      ...feature,
      properties: {
        ...feature.properties,
        _PRODUCTION_TON: productionRecord ? Number(productionRecord.properties.TONNAGE_TON) : null,
        _YIELD_TON_HA: productionRecord ? Number(productionRecord.properties.YIELD_TON_HA) : null,
        _FERTILIZER_DOSAGE: fertilizer.dosage,
        _FERTILIZER_STATUS: fertilizer.status,
      },
    };
  });

  map.getSource(THEMATIC_SOURCE).setData({ type: "FeatureCollection", features });
}

function legendHtml(layerKey) {
  if (layerKey === "production") {
    return `
      <span class="legend-title">Yield (ton/ha)</span>
      <div class="legend-scale">
        ${PRODUCTION_STOPS.map((stop) => `<span class="legend-swatch" style="background:${stop.color}"></span>`).join("")}
      </div>
      <div class="legend-range">
        <span>${PRODUCTION_STOPS[0].label}</span>
        <span>${PRODUCTION_STOPS[PRODUCTION_STOPS.length - 1].label}</span>
      </div>
    `;
  }

  if (layerKey === "fertilizer") {
    return `
      <span class="legend-title">Fertilizer Status</span>
      <ul class="legend-list">
        ${FERTILIZER_STOPS.map(
          (stop) => `<li><span class="legend-dot" style="background:${stop.color}"></span>${stop.value}</li>`
        ).join("")}
        <li><span class="legend-dot" style="background:${NO_DATA_COLOR}"></span>No Data</li>
      </ul>
    `;
  }

  return "";
}

// Renders into both the sidebar legend container and the print-only one so
// the printed map keeps a readable legend even though the sidebar is hidden.
export function renderLegend(layerKey) {
  const html = legendHtml(layerKey);

  ["map-legend", "print-legend"].forEach((id) => {
    const el = document.getElementById(id);

    if (!el) return;

    el.innerHTML = html;
    el.classList.toggle("hidden", !html);
  });
}
