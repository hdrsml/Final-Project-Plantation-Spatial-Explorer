import { THEMATIC_LAYER_IDS } from "./thematicConfig.js";

const EMPTY_BLOCK_FILTER = ["==", ["get", "BLOCK"], ""];

// Populates the division <select> from block data and wires map filtering.
// onChange(selectedDivision) fires after the map filters are applied.
export function initDivisionFilter({ map, blockData, selectEl, onChange }) {
  const divisions = [
    ...new Set(blockData.features.map((f) => f.properties.DIVISION).filter(Boolean)),
  ].sort();

  divisions.forEach((division) => {
    const option = document.createElement("option");

    option.value = division;
    option.textContent = division;

    selectEl.appendChild(option);
  });

  selectEl.addEventListener("change", () => {
    const selectedDivision = selectEl.value;

    if (selectedDivision === "all") {
      map.setFilter("block-boundary", null);
      map.setFilter("block-hit-area", null);
      map.setFilter("block-label", null);
      THEMATIC_LAYER_IDS.forEach((layerId) => map.setFilter(layerId, null));
      map.setFilter("block-hover-highlight", EMPTY_BLOCK_FILTER);
      map.setFilter("block-selected-fill", EMPTY_BLOCK_FILTER);
      map.setFilter("block-selected-highlight", EMPTY_BLOCK_FILTER);
    } else {
      const divisionExpression = ["==", ["get", "DIVISION"], selectedDivision];

      map.setFilter("block-boundary", divisionExpression);
      map.setFilter("block-hit-area", divisionExpression);
      map.setFilter("block-label", divisionExpression);
      THEMATIC_LAYER_IDS.forEach((layerId) => map.setFilter(layerId, divisionExpression));
      map.setFilter("block-hover-highlight", ["all", divisionExpression, EMPTY_BLOCK_FILTER]);
      map.setFilter("block-selected-fill", ["all", divisionExpression, EMPTY_BLOCK_FILTER]);
      map.setFilter("block-selected-highlight", ["all", divisionExpression, EMPTY_BLOCK_FILTER]);
    }

    onChange(selectedDivision);
  });
}
