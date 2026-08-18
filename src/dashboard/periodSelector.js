import { setActiveThematicLayer, updateThematicData, renderLegend } from "../map/thematicLayers.js";
import { getAvailablePeriods, getAllOperationalRecords } from "../data/operationalData.js";

function titleCase(label) {
  return label.replace(/\w\S*/g, (word) => word.charAt(0) + word.slice(1).toLowerCase());
}

// Wires the period slider + thematic layer <select> in the sidebar and keeps
// the production/fertilizer choropleth + legend in sync with both.
//
// The thematic <select> is wired and synced to the map immediately and
// unconditionally, before awaiting operational data. Thematic switching must
// never depend on another async fetch resolving first, or on which option a
// user happens to pick first — otherwise a selection made while that fetch
// is still in flight is silently dropped (the listener isn't attached yet)
// and never recovers, since nothing re-syncs the map to the <select>'s
// current value afterwards.
export async function initPeriodAndLayerControls({ map, blockData, operationalDataReady }) {
  const periodPanel = document.getElementById("period-panel");
  const slider = document.getElementById("period-slider");
  const periodLabel = document.getElementById("period-label");
  const layerSelect = document.getElementById("thematic-layer-select");

  function applyActiveThematicLayer() {
    setActiveThematicLayer(map, layerSelect.value);
    renderLegend(layerSelect.value);
    layerSelect.classList.toggle("is-active", layerSelect.value !== "none");
  }

  layerSelect.addEventListener("change", applyActiveThematicLayer);
  applyActiveThematicLayer();

  await operationalDataReady;

  const periods = getAvailablePeriods();

  if (!periods.length) {
    periodPanel.classList.add("hidden");
    return;
  }

  slider.min = "0";
  slider.max = String(periods.length - 1);
  slider.value = String(periods.length - 1);
  periodLabel.textContent = titleCase(periods[periods.length - 1].label);

  function currentPeriod() {
    return periods[Number(slider.value)].value;
  }

  function refreshThematicData() {
    updateThematicData(map, blockData, currentPeriod(), getAllOperationalRecords());
  }

  slider.addEventListener("input", () => {
    periodLabel.textContent = titleCase(periods[Number(slider.value)].label);
    refreshThematicData();
  });

  refreshThematicData();
}
