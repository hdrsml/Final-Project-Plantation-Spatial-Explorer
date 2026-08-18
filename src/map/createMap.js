import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// MapLibre's worker script itself imports a sibling "./maplibre-gl-shared.mjs"
// via a plain relative path. Pointing setWorkerUrl() at a Vite `?url` copy of
// just the worker file breaks that import — Vite only emits the one file it
// was asked for, so the worker's own module graph 404s at runtime (surfaces
// as "Failed to load module script ... text/html", since the dev/preview
// server's fallback routing returns index.html for the missing sibling).
// Both files are copied into public/maplibre/ (see package.json's version of
// maplibre-gl — re-copy from node_modules/maplibre-gl/dist/ if it's ever
// upgraded) so they ship together, unbundled, at matching relative paths.
maplibregl.setWorkerUrl("/maplibre/maplibre-gl-worker.mjs");

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
