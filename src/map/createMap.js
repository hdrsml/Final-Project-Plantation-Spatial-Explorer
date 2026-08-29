import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MAPID_BASEMAP_KEY } from "../config/env.js";

// MapLibre's worker script itself imports a sibling "./maplibre-gl-shared.mjs"
// via a plain relative path. Pointing setWorkerUrl() at a Vite `?url` copy of
// just the worker file breaks that import — Vite only emits the one file it
// was asked for, so the worker's own module graph 404s at runtime (surfaces
// as "Failed to load module script ... text/html", since the dev/preview
// server's fallback routing returns index.html for the missing sibling).
// Both files are copied into public/maplibre/ (see package.json's version of
// maplibre-gl — re-copy from node_modules/maplibre-gl/dist/ if it's ever
// upgraded) so they ship together, unbundled, at matching relative paths.
//
// Resolved against document.baseURI (not a root-absolute "/maplibre/...")
// so it still finds the worker when the whole app is served from a subpath,
// e.g. GitHub Pages' <user>.github.io/<repo>/ — a literal leading slash
// would point at the domain root instead and 404, silently breaking every
// GeoJSON source (block boundaries, thematic layers) since MapLibre tiles
// GeoJSON through the worker.
maplibregl.setWorkerUrl(new URL("maplibre/maplibre-gl-worker.mjs", document.baseURI).href);

function mapidBasemapStyleUrl() {
  const url = new URL("https://basemap.mapid.io/styles/satellite/style.json");

  url.searchParams.set("key", MAPID_BASEMAP_KEY || "");

  return url.href;
}

export function createBaseMap(containerId, options = {}) {
  return new maplibregl.Map({
    container: containerId,
    style: mapidBasemapStyleUrl(),
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
