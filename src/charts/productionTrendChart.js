import Chart from "chart.js/auto";
import { CHART_COLORS } from "./chartTheme.js";

let chartInstance = null;
let estateChartInstance = null;

export function renderProductionTrendChart(canvas, productionRecords) {
  if (!canvas) return null;

  const sorted = [...productionRecords].sort((a, b) =>
    String(a.properties.PERIOD).localeCompare(String(b.properties.PERIOD))
  );

  const labels = sorted.map((f) => f.properties.PERIOD_LABEL);
  const values = sorted.map((f) => Number(f.properties.TONNAGE_TON || 0));

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Production (ton)",
          data: values,
          borderColor: CHART_COLORS.accent,
          backgroundColor: "rgba(201, 154, 78, 0.16)",
          tension: 0.35,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: CHART_COLORS.accent,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: CHART_COLORS.text },
        },
        y: {
          beginAtZero: true,
          grid: { color: CHART_COLORS.gridline },
          ticks: {
            color: CHART_COLORS.text,
            callback: (value) => `${value} t`,
          },
        },
      },
    },
  });

  return chartInstance;
}

// Estate/division-level counterpart: average yield (ton/ha) per period
// across whichever blocks are currently in view, instead of one block's
// raw tonnage. Same visual language as the chart above, teal instead of
// gold so the two trend charts stay visually distinct at a glance.
export function renderEstateYieldTrendChart(canvas, trendData) {
  if (!canvas) return null;

  const labels = trendData.map((entry) => entry.label);
  const values = trendData.map((entry) => Number(entry.avgYield.toFixed(2)));

  if (estateChartInstance) {
    estateChartInstance.destroy();
  }

  estateChartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Avg. Yield (ton/ha)",
          data: values,
          borderColor: CHART_COLORS.categorical[4],
          backgroundColor: "rgba(111, 168, 163, 0.16)",
          tension: 0.35,
          fill: true,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: CHART_COLORS.categorical[4],
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: CHART_COLORS.text },
        },
        y: {
          beginAtZero: true,
          grid: { color: CHART_COLORS.gridline },
          ticks: {
            color: CHART_COLORS.text,
            callback: (value) => `${value} t/ha`,
          },
        },
      },
    },
  });

  return estateChartInstance;
}
