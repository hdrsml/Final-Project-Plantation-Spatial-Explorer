function setKpi(key, value) {
  const el = document.querySelector(`[data-kpi="${key}"]`);

  if (el) el.textContent = value;
}

// avgYield is optional because it depends on operational data, which loads
// separately from (and not necessarily before) the spatial block data this
// function otherwise only needs — see estateInsights.js.
export function updateKPI(blockData, selectedDivision = "all", avgYield = null) {
  const filteredFeatures =
    selectedDivision === "all"
      ? blockData.features
      : blockData.features.filter((f) => f.properties.DIVISION === selectedDivision);

  const divisions = new Set(filteredFeatures.map((f) => f.properties.DIVISION).filter(Boolean));

  const totalArea = filteredFeatures.reduce(
    (sum, f) => sum + Number(f.properties.AREA || 0),
    0
  );

  setKpi("division", divisions.size);
  setKpi("block", filteredFeatures.length);
  setKpi("area", totalArea.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

  if (avgYield !== null) {
    setKpi("yield", avgYield.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  }
}

export function updateSelectedBlockDashboard(blockFeature, operationalSummary) {
  const division = blockFeature.properties.DIVISION || "-";
  const blockName = blockFeature.properties.BLOCK || "-";
  const area = Number(blockFeature.properties.AREA || 0);
  const yieldTonHa = operationalSummary?.production?.yieldTonHa ?? 0;

  setKpi("division", division);
  setKpi("block", blockName);
  setKpi("area", area.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  setKpi("yield", yieldTonHa.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
}
