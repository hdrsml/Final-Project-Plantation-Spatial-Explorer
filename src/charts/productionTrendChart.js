import Chart from "chart.js/auto";
import { CHART_COLORS } from "./chartTheme.js";

let chartInstance = null;

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
