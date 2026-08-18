import * as maplibregl from "maplibre-gl";

import { mountSiteHeader } from "../components/siteHeader.js";
import { loadEstateData, loadBlockData } from "../data/spatialData.js";
import { loadOperationalData, summarizeBlockOperations } from "../data/operationalData.js";

import { createBaseMap, fitBoundsToFeatures } from "../map/createMap.js";
import {
  addEstateLayer,
  addBlockLayers,
  wireEstateToggle,
  wireBlockToggle,
  setSelectedHighlight,
  clearSelectedHighlight,
} from "../map/mapLayers.js";
import { initDivisionFilter } from "../map/divisionFilter.js";
import { initBlockSearch } from "../map/blockSearch.js";
import { createDrawEngine } from "../map/drawEngine.js";
import { addThematicLayers } from "../map/thematicLayers.js";
import { addAnalysisLayers } from "../map/analysisLayers.js";

import { updateKPI, updateSelectedBlockDashboard } from "../dashboard/kpiPanel.js";
import { updateOperationalDashboard, initOperationalDashboardClose } from "../dashboard/operationalPanel.js";
import { renderOverviewCharts } from "../dashboard/overviewPanel.js";
import { initSpatialAnalysisPanel } from "../dashboard/spatialAnalysisPanel.js";
import { initEstateInsights } from "../dashboard/estateInsights.js";
import { initMeasureTool } from "../dashboard/measurePanel.js";
import { initPrintTool } from "../dashboard/printMap.js";
import { initPeriodAndLayerControls } from "../dashboard/periodSelector.js";

mountSiteHeader("dashboard");
initOperationalDashboardClose();

const operationalDataReady = loadOperationalData();

let selectedBlock = null;
let drawEngine = null;
let spatialAnalysis = null;
let estateInsights = null;
let currentBlockData = null;

async function selectBlock(blockName, feature) {
  await operationalDataReady;

  spatialAnalysis?.reset();

  const operational = summarizeBlockOperations(blockName);

  selectedBlock = { name: blockName, feature, operational };

  setSelectedHighlight(map, blockName);
  updateSelectedBlockDashboard(feature, operational);
  updateOperationalDashboard(blockName);
}

// Selected-block highlight persists while the inspector is open, clears on close.
function closeInspector() {
  document.getElementById("operational-dashboard").classList.add("hidden");
  clearSelectedHighlight(map);
  spatialAnalysis?.reset();
  selectedBlock = null;
}

const map = createBaseMap("map", { center: [0, 0], zoom: 2 });

// Re-measure the canvas whenever its container resizes (font load, window
// resize, layout shift) — MapLibre won't pick this up on its own.
const mapWrapEl = document.querySelector(".map-wrap");

if (window.ResizeObserver && mapWrapEl) {
  new ResizeObserver(() => map.resize()).observe(mapWrapEl);
}

map.addControl(new maplibregl.NavigationControl(), "top-right");
// top-left is the only corner free of custom floating UI.
map.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "top-left");

map.on("error", (e) => {
  console.error("Map error:", e?.error || e);
});

initPrintTool(map);

document.getElementById("operational-dashboard-close").addEventListener("click", closeInspector);

map.on("load", async () => {
  const [estateData, blockData] = await Promise.all([loadEstateData(), loadBlockData()]);

  currentBlockData = blockData;

  addEstateLayer(map, estateData);
  addBlockLayers(map, blockData);

  // Estate boundary should read above the block grid, but stay below the
  // hover/selection highlight and labels so those stay usable.
  map.moveLayer("estate-boundary", "block-hover-highlight");

  addThematicLayers(map);
  addAnalysisLayers(map);

  drawEngine = createDrawEngine(map);

  wireEstateToggle(map, document.getElementById("estate-toggle"));
  wireBlockToggle(map, document.getElementById("block-toggle"));

  updateKPI(blockData);
  renderOverviewCharts(blockData);

  spatialAnalysis = initSpatialAnalysisPanel({
    map,
    getBlockData: () => currentBlockData,
    getSelectedBlock: () => selectedBlock,
  });

  initEstateInsights({ map, blockData, operationalDataReady, onSelectBlock: selectBlock }).then((controller) => {
    estateInsights = controller;
  });

  initMeasureTool(drawEngine);
  initPeriodAndLayerControls({ map, blockData, operationalDataReady });

  const divisionFilterEl = document.getElementById("division-filter");

  const searchController = initBlockSearch({
    map,
    blockData,
    divisionFilterEl,
    onSelect: selectBlock,
  });

  initDivisionFilter({
    map,
    blockData,
    selectEl: divisionFilterEl,
    onChange: (selectedDivision) => {
      updateKPI(blockData, selectedDivision);
      estateInsights?.refresh(selectedDivision);
      searchController.resetSearch();
      closeInspector();
    },
  });

  map.on("click", "block-hit-area", (e) => {
    if (!e.features.length || drawEngine.isActive()) return;

    selectBlock(e.features[0].properties.BLOCK, e.features[0]);
  });

  map.on("mousemove", "block-hit-area", (e) => {
    if (drawEngine.isActive()) return;

    map.getCanvas().style.cursor = "pointer";

    if (e.features.length > 0) {
      map.setFilter("block-hover-highlight", ["==", ["get", "BLOCK"], e.features[0].properties.BLOCK]);
    }
  });

  map.on("mouseleave", "block-hit-area", () => {
    if (drawEngine.isActive()) return;

    map.getCanvas().style.cursor = "";
    map.setFilter("block-hover-highlight", ["==", ["get", "BLOCK"], ""]);
  });

  // Collapse the floating panels on map interaction instead of requiring
  // the minimize button. Skip Measure mid-draw — it still needs map clicks.
  function collapseFloatingTools() {
    document.getElementById("search-tool")?.classList.add("minimized");
    document.getElementById("print-tool")?.classList.add("minimized");

    if (!drawEngine.isActive()) {
      document.getElementById("measure-tool")?.classList.add("minimized");
    }
  }

  map.on("click", collapseFloatingTools);
  map.on("dragstart", collapseFloatingTools);

  fitBoundsToFeatures(map, estateData, 80);
});
