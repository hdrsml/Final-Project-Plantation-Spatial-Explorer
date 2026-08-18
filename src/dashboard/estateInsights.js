import * as maplibregl from "maplibre-gl";

import { getEstateAttentionList } from "../map/spatialAnalysis.js";
import { getEstateYieldTrend, getAllOperationalRecords } from "../data/operationalData.js";
import { renderEstateYieldTrendChart } from "../charts/productionTrendChart.js";
import { updateKPI } from "./kpiPanel.js";

function gapLabel(gapPercent) {
  const sign = gapPercent >= 0 ? "+" : "-";

  return `${sign}${Math.abs(gapPercent).toFixed(1)}%`;
}

// Every row spells out the actual figure (not just the delta) so "-68.9%"
// reads as "0.62 t/ha, 68.9% below the estate's average yield" rather than
// an unexplained bare number.
function attentionItemHtml(entry, tier, estateAverage) {
  const verb = tier === "low" ? "di bawah" : "di atas";

  return `
    <li class="attention-item" data-block="${entry.feature.properties.BLOCK}">
      <span class="attention-dot tier-${tier}"></span>
      <span class="attention-info">
        <span class="attention-block">${entry.feature.properties.BLOCK}</span>
        <span class="attention-yield">${entry.yield.toFixed(2)} ton/ha</span>
      </span>
      <span class="attention-gap ${tier === "low" ? "negative" : "positive"}">
        ${gapLabel(entry.gapPercent)}
        <small>${verb} rata-rata (${estateAverage.toFixed(2)} ton/ha)</small>
      </span>
    </li>
  `;
}

// Caps how many rows show per tier so the list stays scannable — the
// summary counts above it still reflect the true total.
const MAX_ROWS_PER_TIER = 5;

function renderAttentionList(listEl, summaryEl, result) {
  if (!result.estateAverage) {
    summaryEl.innerHTML = "";
    listEl.innerHTML = `<p class="attention-empty">Belum ada data yield untuk dianalisis.</p>`;
    return;
  }

  if (!result.low.length && !result.high.length) {
    summaryEl.innerHTML = "";
    listEl.innerHTML = `<p class="attention-empty">Semua block dalam rentang normal, dibanding rata-rata yield ${result.estateAverage.toFixed(2)} ton/ha.</p>`;
    return;
  }

  summaryEl.innerHTML = `
    ${result.low.length ? `<span class="attention-tag tier-low">${result.low.length} block di bawah rata-rata</span>` : ""}
    ${result.high.length ? `<span class="attention-tag tier-high">${result.high.length} block di atas rata-rata</span>` : ""}
  `;

  const rows = [
    ...result.low.slice(0, MAX_ROWS_PER_TIER).map((e) => attentionItemHtml(e, "low", result.estateAverage)),
    ...result.high.slice(0, MAX_ROWS_PER_TIER).map((e) => attentionItemHtml(e, "high", result.estateAverage)),
  ];

  listEl.innerHTML = `<ul class="attention-items">${rows.join("")}</ul>`;
}

function boundsOfFeature(feature) {
  const bounds = new maplibregl.LngLatBounds();

  feature.geometry.coordinates.flat(Infinity).forEach((value, index, array) => {
    if (index % 2 === 0) {
      bounds.extend([value, array[index + 1]]);
    }
  });

  return bounds;
}

// Wires the "Attention List" panel and the Estate Yield Trend chart — both
// depend on operational data, which loads separately from (and not
// necessarily before) the spatial block data the rest of the dashboard
// initializes with. Awaiting it here, instead of assuming it's ready,
// avoids the exact class of race condition the thematic-map bug came from.
export async function initEstateInsights({ map, blockData, operationalDataReady, onSelectBlock }) {
  const listEl = document.getElementById("attention-list");
  const summaryEl = document.getElementById("attention-summary");
  const trendCanvas = document.getElementById("estate-yield-chart");

  function focusBlock(blockName) {
    const feature = blockData.features.find((f) => f.properties.BLOCK === blockName);

    if (!feature) return;

    map.fitBounds(boundsOfFeature(feature), { padding: 100, duration: 800, maxZoom: 16 });
    onSelectBlock(blockName, feature);
  }

  listEl.addEventListener("click", (e) => {
    const item = e.target.closest(".attention-item");

    if (item) focusBlock(item.dataset.block);
  });

  function computeAndRender(selectedDivision = "all") {
    const filteredFeatures =
      selectedDivision === "all"
        ? blockData.features
        : blockData.features.filter((f) => f.properties.DIVISION === selectedDivision);

    const operationalLookup = getAllOperationalRecords();

    const attention = getEstateAttentionList(filteredFeatures, operationalLookup);

    renderAttentionList(listEl, summaryEl, attention);

    const trend = getEstateYieldTrend(filteredFeatures.map((f) => f.properties.BLOCK));

    renderEstateYieldTrendChart(trendCanvas, trend);

    updateKPI(blockData, selectedDivision, trend.length ? trend[trend.length - 1].avgYield : null);
  }

  await operationalDataReady;

  // Read whichever division is selected right now rather than assuming
  // "all" — the user may have already changed it while this was loading.
  computeAndRender(document.getElementById("division-filter")?.value || "all");

  return { refresh: computeAndRender };
}
