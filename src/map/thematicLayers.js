import { NO_DATA_COLOR, THEMATIC_MODES } from "./thematicConfig.js";

const THEMATIC_SOURCE = "block-thematic";

function emptyFC() {
  return { type: "FeatureCollection", features: [] };
}

export function addThematicLayers(map) {
  map.addSource(THEMATIC_SOURCE, { type: "geojson", data: emptyFC() });

  Object.values(THEMATIC_MODES).forEach((mode) => {
    map.addLayer(
      {
        id: mode.layerId,
        type: "fill",
        source: THEMATIC_SOURCE,
        layout: { visibility: "none" },
        paint: mode.paint,
      },
      "block-boundary"
    );
  });
}

export function setActiveThematicLayer(map, activeKey) {
  Object.entries(THEMATIC_MODES).forEach(([key, mode]) => {
    map.setLayoutProperty(mode.layerId, "visibility", key === activeKey ? "visible" : "none");
  });
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
  const mode = THEMATIC_MODES[layerKey];

  if (!mode) return "";

  if (mode.legendKind === "scale") {
    return `
      <span class="legend-title">${mode.legendTitle}</span>
      <div class="legend-scale">
        ${mode.stops.map((stop) => `<span class="legend-swatch" style="background:${stop.color}"></span>`).join("")}
      </div>
      <div class="legend-range">
        <span>${mode.stops[0].label}</span>
        <span>${mode.stops[mode.stops.length - 1].label}</span>
      </div>
      ${mode.legendNote ? `<span class="legend-note">${mode.legendNote}</span>` : ""}
    `;
  }

  return `
    <span class="legend-title">${mode.legendTitle}</span>
    <ul class="legend-list">
      ${mode.stops
        .map((stop) => `<li><span class="legend-dot" style="background:${stop.color}"></span>${stop.value}</li>`)
        .join("")}
      <li><span class="legend-dot" style="background:${NO_DATA_COLOR}"></span>No Data</li>
    </ul>
  `;
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
