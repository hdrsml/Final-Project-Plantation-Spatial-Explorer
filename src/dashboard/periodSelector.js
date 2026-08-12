import { setActiveThematicLayer, updateThematicData, renderLegend } from "../map/thematicLayers.js";
import { getAvailablePeriods, getAllOperationalRecords } from "../data/operationalData.js";

function titleCase(label) {
  return label.replace(/\w\S*/g, (word) => word.charAt(0) + word.slice(1).toLowerCase());
}

// Wires the period slider + thematic layer <select> in the sidebar and keeps
// the production/fertilizer choropleth + legend in sync with both.
export function initPeriodAndLayerControls({ map, blockData }) {
  const periods = getAvailablePeriods();

  const periodPanel = document.getElementById("period-panel");
  const slider = document.getElementById("period-slider");
  const periodLabel = document.getElementById("period-label");
  const layerSelect = document.getElementById("thematic-layer-select");

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

  layerSelect.addEventListener("change", () => {
    setActiveThematicLayer(map, layerSelect.value);
    renderLegend(layerSelect.value);
  });

  refreshThematicData();
}
