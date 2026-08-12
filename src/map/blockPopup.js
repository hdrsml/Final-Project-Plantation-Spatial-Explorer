import * as maplibregl from "maplibre-gl";

let activePopup = null;

export function boundsCenter(feature) {
  const bounds = new maplibregl.LngLatBounds();

  feature.geometry.coordinates.flat(Infinity).forEach((value, index, array) => {
    if (index % 2 === 0) {
      bounds.extend([value, array[index + 1]]);
    }
  });

  return bounds.getCenter();
}

export function showBlockPopup(map, feature) {
  const { BLOCK, ESTATE, DIVISION, PLANT_YEAR, REMARKS, AREA } = feature.properties;

  const popupHTML = `
    <div class="block-popup">
      <div class="block-popup-header">
        <div class="block-popup-title">BLOCK ${BLOCK}</div>
        <div class="block-popup-estate">${ESTATE}</div>
      </div>

      <div class="block-popup-divider"></div>

      <div class="block-popup-row">
        <span>Division</span>
        <strong>${DIVISION}</strong>
      </div>

      <div class="block-popup-row">
        <span>Plant Year</span>
        <strong>${PLANT_YEAR}</strong>
      </div>

      <div class="block-popup-row">
        <span>Area</span>
        <strong>${AREA.toFixed(2)} ha</strong>
      </div>

      <div class="block-popup-row">
        <span>Status</span>
        <strong>${REMARKS}</strong>
      </div>
    </div>
  `;

  if (activePopup) {
    activePopup.remove();
  }

  activePopup = new maplibregl.Popup().setLngLat(boundsCenter(feature)).setHTML(popupHTML).addTo(map);
}
