import { MAPID_API_KEY } from "../config/env.js";

function hasConfigValue(value) {
  if (typeof value !== "string") return false;

  const normalized = value.trim().toLowerCase();

  return normalized !== "" && normalized !== "undefined" && normalized !== "null";
}

async function fetchMapidLayer(layerId, projectId) {
  const url = new URL("https://geoserver.mapid.io/layers_new/get_layer");

  url.searchParams.set("api_key", MAPID_API_KEY);
  url.searchParams.set("layer_id", layerId);
  url.searchParams.set("project_id", projectId);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`MAPID API returned ${response.status}`);
  }

  const data = await response.json();

  if (!data.features || !Array.isArray(data.features)) {
    throw new Error("MAPID API returned invalid FeatureCollection");
  }

  return data;
}

async function fetchFallback(label, fallbackUrl) {
  const response = await fetch(fallbackUrl);

  if (!response.ok) {
    throw new Error(`Local fallback for ${label} returned ${response.status}`);
  }

  const data = await response.json();

  console.log(`${label} data source: local fallback`);

  return data;
}

// Tries the live MAPID layer first, falls back to a local dummy dataset
// when the API key/layer is unavailable (offline demo, expired credentials, etc).
export async function fetchLayerWithFallback(label, { layerId, projectId }, fallbackUrl) {
  if (![MAPID_API_KEY, layerId, projectId].every(hasConfigValue)) {
    console.warn(
      `MAPID ${label} configuration is incomplete; skipping the API request and using local fallback.`
    );

    return fetchFallback(label, fallbackUrl);
  }

  try {
    const data = await fetchMapidLayer(layerId, projectId);

    console.log(`${label} data source: MAPID API`);

    return data;
  } catch (error) {
    console.warn(`MAPID ${label} API failed, using local fallback:`, error);

    return fetchFallback(label, fallbackUrl);
  }
}
