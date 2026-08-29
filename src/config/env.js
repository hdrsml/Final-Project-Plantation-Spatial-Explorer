const env = import.meta.env;

export const MAPID_API_KEY = env.VITE_MAPID_API_KEY;
export const MAPID_BASEMAP_KEY = env.VITE_MAPID_BASEMAP_KEY;

export const MAPID_LAYERS = {
  estate: {
    layerId: env.VITE_MAPID_ESTATE_LAYER_ID,
    projectId: env.VITE_MAPID_ESTATE_PROJECT_ID,
  },
  block: {
    layerId: env.VITE_MAPID_BLOCK_LAYER_ID,
    projectId: env.VITE_MAPID_BLOCK_PROJECT_ID,
  },
  production: {
    layerId: env.VITE_MAPID_PRODUCTION_LAYER_ID,
    projectId: env.VITE_MAPID_PRODUCTION_PROJECT_ID,
  },
  fertilizer: {
    layerId: env.VITE_MAPID_FERTILIZER_LAYER_ID,
    projectId: env.VITE_MAPID_FERTILIZER_PROJECT_ID,
  },
  lsu: {
    layerId: env.VITE_MAPID_LSU_LAYER_ID,
    projectId: env.VITE_MAPID_LSU_PROJECT_ID,
  },
};
