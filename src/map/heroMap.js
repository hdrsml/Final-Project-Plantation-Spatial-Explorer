import { createBaseMap, fitBoundsToFeatures } from "./createMap.js";

// Small, mostly-decorative map for the homepage hero: pan/pinch still work,
// but scroll/keyboard/rotate are off so it doesn't fight the page scroll.
export function initHeroMap(containerId, estateData, blockData) {
  const map = createBaseMap(containerId, {
    center: [0, 0],
    zoom: 2,
    attributionControl: false,
  });

  map.scrollZoom.disable();
  map.boxZoom.disable();
  map.keyboard.disable();
  map.dragRotate.disable();
  map.touchZoomRotate.disableRotation();

  map.on("load", () => {
    map.addSource("estate", { type: "geojson", data: estateData });
    map.addSource("block", { type: "geojson", data: blockData });

    map.addLayer({
      id: "hero-block-fill",
      type: "fill",
      source: "block",
      paint: { "fill-color": "#6fb3c9", "fill-opacity": 0.14 },
    });

    map.addLayer({
      id: "hero-block-line",
      type: "line",
      source: "block",
      paint: { "line-color": "#6fb3c9", "line-width": 1 },
    });

    map.addLayer({
      id: "hero-estate-line",
      type: "line",
      source: "estate",
      paint: { "line-color": "#e8b34a", "line-width": 3, "line-dasharray": [2, 2] },
    });

    fitBoundsToFeatures(map, estateData, 40);
  });

  return map;
}
