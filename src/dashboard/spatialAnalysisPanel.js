import { getAllOperationalRecords } from "../data/operationalData.js";
import { runBenchmark, runNearbyAnalysis, runPerformanceCluster } from "../map/spatialAnalysis.js";
import {
  setAnalysisFeatures,
  clearAnalysis,
  setAnalysisRadius,
  clearAnalysisRadius,
  setAnalysisConnectors,
  clearAnalysisConnectors,
} from "../map/analysisLayers.js";

const mapHint = (text) => `<div class="analysis-map-hint">${text}</div>`;

function gapRowHtml(label, gapPercent) {
  const sign = gapPercent >= 0 ? "+" : "-";
  const cls = gapPercent >= 0 ? "positive" : "negative";

  return `
    <div class="analysis-result-row analysis-gap ${cls}">
      <span>${label}</span>
      <strong>${sign}${Math.abs(gapPercent).toFixed(1)}%</strong>
    </div>
  `;
}

function renderBenchmarkResult(result) {
  if (result.selectedYield === null) {
    return `<div class="analysis-result-block">Block ini belum punya data production, belum bisa dibandingkan.</div>`;
  }

  if (!result.comparable.length) {
    return `<div class="analysis-result-block">Tidak ditemukan block mature dengan data yield di sekitar block ini.</div>`;
  }

  return `
    <div class="analysis-result-block">
      <div class="analysis-result-title">${result.selectedBlockCode}</div>
      <div class="analysis-result-row"><span>Yield</span><strong>${result.selectedYield.toFixed(1)} ton/ha</strong></div>
      <div class="analysis-result-divider"></div>
      <div class="analysis-result-row"><span>Comparable blocks</span><strong>${result.comparable.length}</strong></div>
      <div class="analysis-result-row"><span>Average</span><strong>${result.avgYield.toFixed(1)} ton/ha</strong></div>
      ${gapRowHtml("Performance gap", result.gapPercent)}
    </div>
    ${mapHint("Garis putus-putus di peta menghubungkan block terpilih ke tiap block pembanding.")}
  `;
}

function renderNearbyResult(result, radiusLabel) {
  return `
    <div class="analysis-result-block">
      <div class="analysis-result-title">Nearby (${radiusLabel})</div>
      <div class="analysis-result-row"><span>Nearby blocks</span><strong>${result.nearby.length}</strong></div>
      <div class="analysis-result-row"><span>With Production data</span><strong>${result.withProduction}</strong></div>
      <div class="analysis-result-row"><span>With LSU data</span><strong>${result.withLsu}</strong></div>
      <div class="analysis-result-row"><span>With Fertilizer data</span><strong>${result.withFertilizer}</strong></div>
    </div>
    ${mapHint(`Lingkaran putus-putus di peta menandai radius ${radiusLabel} yang dicari.`)}
  `;
}

function renderClusterResult(result) {
  if (result.tier === "unknown") {
    return `<div class="analysis-result-block">Block ini belum punya data yield, belum bisa diklasifikasi.</div>`;
  }

  if (result.tier === "normal") {
    return `<div class="analysis-result-block">Yield block ini masih dalam rentang normal terhadap rata-rata estate — tidak terdeteksi pola cluster.</div>`;
  }

  const tierClass = result.tier === "low" ? "tier-low" : "tier-high";
  const tierLabel = result.tier === "low" ? "LOW" : "HIGH";

  return `
    <div class="analysis-result-block">
      <div class="analysis-result-title ${tierClass}">${tierLabel} PERFORMANCE CLUSTER</div>
      <div class="analysis-result-row"><span>Blocks</span><strong>${result.members.length + 1}</strong></div>
      <div class="analysis-result-row"><span>Average Yield</span><strong>${result.clusterAverage.toFixed(1)} ton/ha</strong></div>
      <div class="analysis-result-row"><span>Estate Average</span><strong>${result.estateAverage.toFixed(1)} ton/ha</strong></div>
      ${gapRowHtml("Performance gap", result.gapPercent)}
    </div>
    ${mapHint(`Lingkaran putus-putus di peta menandai radius pencarian cluster ${tierLabel.toLowerCase()}.`)}
  `;
}

// Wires the "Spatial Analysis" section of the Feature Inspector
// (#operational-dashboard): Block Benchmark, Nearby Analysis and
// Performance Cluster all read the currently selected block via
// getSelectedBlock() and render both a map highlight and a text summary.
export function initSpatialAnalysisPanel({ map, getBlockData, getSelectedBlock }) {
  const radiusSelect = document.getElementById("analysis-radius");
  const benchmarkBtn = document.getElementById("analysis-benchmark-btn");
  const nearbyBtn = document.getElementById("analysis-nearby-btn");
  const clusterBtn = document.getElementById("analysis-cluster-btn");
  const resultEl = document.getElementById("analysis-result");
  const closeBtn = document.getElementById("operational-dashboard-close");

  const buttons = [benchmarkBtn, nearbyBtn, clusterBtn];

  function setActiveButton(activeBtn) {
    buttons.forEach((btn) => btn.classList.toggle("is-active", btn === activeBtn));
  }

  function radiusLabel() {
    const option = radiusSelect.options[radiusSelect.selectedIndex];

    return option ? option.textContent : `${radiusSelect.value} m`;
  }

  benchmarkBtn.addEventListener("click", () => {
    const selected = getSelectedBlock();

    if (!selected) return;

    setActiveButton(benchmarkBtn);

    const result = runBenchmark(getBlockData(), selected.feature, getAllOperationalRecords());

    resultEl.innerHTML = renderBenchmarkResult(result);

    setAnalysisFeatures(map, [
      { feature: selected.feature, role: "selected" },
      ...result.comparable.map((entry) => ({ feature: entry.feature, role: "comparable" })),
    ]);
    clearAnalysisRadius(map);
    setAnalysisConnectors(
      map,
      selected.feature,
      result.comparable.map((entry) => entry.feature)
    );
  });

  nearbyBtn.addEventListener("click", () => {
    const selected = getSelectedBlock();

    if (!selected) return;

    setActiveButton(nearbyBtn);

    const radiusMeters = Number(radiusSelect.value);
    const result = runNearbyAnalysis(getBlockData(), selected.feature, getAllOperationalRecords(), radiusMeters);

    resultEl.innerHTML = renderNearbyResult(result, radiusLabel());

    setAnalysisFeatures(map, [
      { feature: selected.feature, role: "selected" },
      ...result.nearby.map((entry) => ({ feature: entry.feature, role: "nearby" })),
    ]);
    clearAnalysisConnectors(map);
    setAnalysisRadius(map, selected.feature, radiusMeters, "neutral");
  });

  clusterBtn.addEventListener("click", () => {
    const selected = getSelectedBlock();

    if (!selected) return;

    setActiveButton(clusterBtn);

    const radiusMeters = Number(radiusSelect.value);
    const result = runPerformanceCluster(getBlockData(), selected.feature, getAllOperationalRecords(), radiusMeters);

    resultEl.innerHTML = renderClusterResult(result);

    const clusterRole = result.tier === "low" ? "cluster-low" : "cluster-high";

    setAnalysisFeatures(
      map,
      result.members.length
        ? [
            { feature: selected.feature, role: "selected" },
            ...result.members.map((entry) => ({ feature: entry.feature, role: clusterRole })),
          ]
        : [{ feature: selected.feature, role: "selected" }]
    );
    clearAnalysisConnectors(map);

    // Only "low"/"high" tiers actually run a radius search (see
    // runPerformanceCluster) — "unknown"/"normal" never search, so no ring
    // to show for those.
    if (result.tier === "low" || result.tier === "high") {
      setAnalysisRadius(map, selected.feature, radiusMeters, result.tier);
    } else {
      clearAnalysisRadius(map);
    }
  });

  function reset() {
    setActiveButton(null);
    clearAnalysis(map);
    resultEl.textContent = "Pilih salah satu analisis untuk melihat konteks spasial block ini.";
  }

  closeBtn.addEventListener("click", reset);

  return { reset };
}
