import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
// MapLibre looks for its worker script next to its own file at runtime —
// that lookup breaks once Vite bundles it, so point it there explicitly.
import maplibreWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";

maplibregl.setWorkerUrl(maplibreWorkerUrl);

const IMAGERY_STYLE = {
  version: 8,
  sources: {
    imagery: {
      type: "raster",
      tiles: [
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      ],
      tileSize: 256,
      attribution: "Esri World Imagery",
    },
  },
  layers: [
    {
      id: "imagery",
      type: "raster",
      source: "imagery",
    },
  ],
};

export function createBaseMap(containerId, options = {}) {
  return new maplibregl.Map({
    container: containerId,
    style: IMAGERY_STYLE,
    center: options.center || [0, 0],
    zoom: options.zoom ?? 2,
    interactive: options.interactive ?? true,
    attributionControl: options.attributionControl ?? true,
    // Keeps the last frame in the WebGL buffer so print/screenshot capture
    // doesn't grab a blank canvas.
    preserveDrawingBuffer: true,
  });
}

export function fitBoundsToFeatures(map, featureCollection, padding = 80) {
  const bounds = new maplibregl.LngLatBounds();

  for (const feature of featureCollection.features) {
    feature.geometry.coordinates.flat(Infinity).forEach((value, index, array) => {
      if (index % 2 === 0) {
        bounds.extend([value, array[index + 1]]);
      }
    });
  }

  map.fitBounds(bounds, { padding, duration: 1000 });

  return bounds;
}
