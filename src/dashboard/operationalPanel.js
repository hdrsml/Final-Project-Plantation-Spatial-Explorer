import { getOperationalRecords } from "../data/operationalData.js";
import { renderProductionTrendChart } from "../charts/productionTrendChart.js";
import { renderNutrientBalanceChart } from "../charts/nutrientBalanceChart.js";

function latestByPeriod(records) {
  if (!records.length) return null;

  return [...records].sort((a, b) =>
    String(b.properties.PERIOD).localeCompare(String(a.properties.PERIOD))
  )[0];
}

function setText(id, value) {
  const el = document.getElementById(id);

  if (el) el.textContent = value;
}

export function updateOperationalDashboard(blockName) {
  const dashboard = document.getElementById("operational-dashboard");
  const blockLabel = document.getElementById("operational-dashboard-block");

  const data = getOperationalRecords(blockName);

  if (!data) {
    dashboard.classList.add("hidden");
    return;
  }

  const { production, fertilizer, lsu } = data;

  const latestProduction = latestByPeriod(production);
  blockLabel.textContent = `Block ${blockName} · ${latestProduction?.properties?.PERIOD_LABEL || "—"}`;

  const totalProduction = production.reduce(
    (sum, f) => sum + Number(f.properties.TONNAGE_TON || 0),
    0
  );

  const totalBunches = production.reduce(
    (sum, f) => sum + Number(f.properties.BUNCH_COUNT || 0),
    0
  );

  const averageYield = production.length
    ? production.reduce((sum, f) => sum + Number(f.properties.YIELD_TON_HA || 0), 0) / production.length
    : 0;

  const averageBunchWeight = production.length
    ? production.reduce((sum, f) => sum + Number(f.properties.AVG_BUNCH_WEIGHT_KG || 0), 0) / production.length
    : 0;

  renderProductionTrendChart(document.getElementById("production-chart"), production);

  const totalFertilizer = fertilizer.reduce(
    (sum, f) => sum + Number(f.properties.TOTAL_FERTILIZER_KG || 0),
    0
  );

  const latestFertilizer = latestByPeriod(fertilizer);
  const latestFertilizerProperties = latestFertilizer?.properties || null;
  const fertilizerStatus = latestFertilizerProperties?.STATUS || "—";
  const latestDosage = latestFertilizerProperties ? Number(latestFertilizerProperties.DOSAGE_KG_HA || 0) : 0;

  const latestLsu = latestByPeriod(lsu)?.properties || null;

  renderNutrientBalanceChart(document.getElementById("nutrient-chart"), latestLsu);

  setText("op-production-ton", totalProduction.toFixed(1));
  setText("op-yield", averageYield.toFixed(2));
  setText("op-bunch-count", totalBunches.toLocaleString());
  setText("op-avg-bunch-weight", averageBunchWeight.toFixed(2));

  setText("op-fertilizer-applications", fertilizer.length);
  setText("op-total-fertilizer", totalFertilizer.toLocaleString(undefined, { maximumFractionDigits: 1 }));
  setText("op-fertilizer-dosage", latestDosage.toFixed(0));
  setText("op-fertilizer-status", fertilizerStatus);

  setText("op-lsu-samples", lsu.length);

  dashboard.classList.remove("hidden");
}

export function initOperationalDashboardClose() {
  const closeBtn = document.getElementById("operational-dashboard-close");

  closeBtn.addEventListener("click", () => {
    document.getElementById("operational-dashboard").classList.add("hidden");
  });
}
