const EMPTY_BLOCK_FILTER = ["==", ["get", "BLOCK"], ""];

export function addEstateLayer(map, estateData) {
  map.addSource("estate", { type: "geojson", data: estateData });

  map.addLayer({
    id: "estate-boundary",
    type: "line",
    source: "estate",
    paint: {
      "line-color": "#e8b34a",
      "line-width": 4,
      "line-dasharray": [2, 2],
    },
  });
}

export function addBlockLayers(map, blockData) {
  map.addSource("block", { type: "geojson", data: blockData });

  map.addLayer({
    id: "block-boundary",
    type: "line",
    source: "block",
    paint: {
      "line-color": "#6fb3c9",
      "line-width": 2,
    },
  });

  // Persistent highlight for the currently selected block (click or
  // search) — stays on until the Feature Inspector is closed, unlike the
  // transient hover highlight below.
  map.addLayer({
    id: "block-selected-fill",
    type: "fill",
    source: "block",
    filter: EMPTY_BLOCK_FILTER,
    paint: {
      "fill-color": "#e2b876",
      "fill-opacity": 0.22,
    },
  });

  map.addLayer({
    id: "block-selected-highlight",
    type: "line",
    source: "block",
    filter: EMPTY_BLOCK_FILTER,
    paint: {
      "line-color": "#e2b876",
      "line-width": 4,
    },
  });

  // Transient highlight that only follows the mouse cursor.
  map.addLayer({
    id: "block-hover-highlight",
    type: "line",
    source: "block",
    filter: EMPTY_BLOCK_FILTER,
    paint: {
      "line-color": "#ffffff",
      "line-width": 3,
    },
  });

  // Invisible fill so hover/click can target the whole block area, not just the outline.
  map.addLayer({
    id: "block-hit-area",
    type: "fill",
    source: "block",
    paint: {
      "fill-color": "#ffffff",
      "fill-opacity": 0.01,
    },
  });

  map.addLayer({
    id: "block-label",
    type: "symbol",
    source: "block",
    layout: {
      "text-field": ["get", "BLOCK"],
      "text-size": 12,
    },
    paint: {
      "text-color": "#000000",
      "text-halo-color": "#ffffff",
      "text-halo-width": 2,
    },
  });
}

export function wireEstateToggle(map, checkboxEl) {
  checkboxEl.addEventListener("change", () => {
    map.setLayoutProperty(
      "estate-boundary",
      "visibility",
      checkboxEl.checked ? "visible" : "none"
    );
  });
}

export function wireBlockToggle(map, checkboxEl) {
  checkboxEl.addEventListener("change", () => {
    const visibility = checkboxEl.checked ? "visible" : "none";

    map.setLayoutProperty("block-boundary", "visibility", visibility);
    map.setLayoutProperty("block-label", "visibility", visibility);
    map.setLayoutProperty("block-hit-area", "visibility", visibility);
  });
}

export function setSelectedHighlight(map, blockName) {
  const filter = blockName ? ["==", ["get", "BLOCK"], blockName] : EMPTY_BLOCK_FILTER;

  map.setFilter("block-selected-fill", filter);
  map.setFilter("block-selected-highlight", filter);
}

export function clearSelectedHighlight(map) {
  setSelectedHighlight(map, null);
}
