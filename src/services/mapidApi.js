import { MAPID_API_KEY } from "../config/env.js";

async function fetchMapidLayer(layerId, projectId) {
  const url =
    `https://geoserver.mapid.io/layers_new/get_layer` +
    `?api_key=${MAPID_API_KEY}` +
    `&layer_id=${layerId}` +
    `&project_id=${projectId}`;

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

// Tries the live MAPID layer first, falls back to a local dummy dataset
// when the API key/layer is unavailable (offline demo, expired credentials, etc).
export async function fetchLayerWithFallback(label, { layerId, projectId }, fallbackUrl) {
  try {
    const data = await fetchMapidLayer(layerId, projectId);

    console.log(`${label} data source: MAPID API`);

    return data;
  } catch (error) {
    console.warn(`MAPID ${label} API failed, using local fallback:`, error);

    const response = await fetch(fallbackUrl);

    if (!response.ok) {
      throw new Error(`Local fallback for ${label} returned ${response.status}`);
    }

    const data = await response.json();

    console.log(`${label} data source: local fallback`);

    return data;
  }
}
