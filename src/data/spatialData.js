import { MAPID_LAYERS } from "../config/env.js";
import { fetchLayerWithFallback } from "../services/mapidApi.js";

export async function loadEstateData() {
  return fetchLayerWithFallback("Estate", MAPID_LAYERS.estate, "/data/estate.geojson");
}

export async function loadBlockData() {
  return fetchLayerWithFallback("Block", MAPID_LAYERS.block, "/data/block.geojson");
}
