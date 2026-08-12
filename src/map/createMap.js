import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
// Vite bundles maplibre-gl's own worker script into a hashed chunk, so its
// default runtime lookup (a file literally named maplibre-gl-worker.mjs
// next to itself) 404s in production. Importing it as a URL makes Vite
// package it correctly and gives MapLibre the real path in both dev and
// build.
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
    // Keeps the last rendered frame in the WebGL buffer instead of clearing
    // it, otherwise the canvas prints blank/stale (browser print & screenshot
    // capture read the buffer outside the normal render loop).
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
