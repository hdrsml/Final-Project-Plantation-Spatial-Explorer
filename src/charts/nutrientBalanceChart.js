import Chart from "chart.js/auto";
import { CHART_COLORS } from "./chartTheme.js";

let chartInstance = null;

// Compact horizontal bar chart for the latest N/P/K leaf sample of a block,
// used in place of three separate number tiles in the operational panel.
export function renderNutrientBalanceChart(canvas, latestLsuProperties) {
  if (!canvas) return null;

  const values = latestLsuProperties
    ? [
        Number(latestLsuProperties.N_PERCENT || 0),
        Number(latestLsuProperties.P_PERCENT || 0),
        Number(latestLsuProperties.K_PERCENT || 0),
      ]
    : [0, 0, 0];

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels: ["Nitrogen (N)", "Phosphorus (P)", "Potassium (K)"],
      datasets: [
        {
          data: values,
          backgroundColor: [
            CHART_COLORS.accent,
            CHART_COLORS.categorical[1],
            CHART_COLORS.categorical[4],
          ],
          borderRadius: 4,
          barThickness: 14,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          beginAtZero: true,
          grid: { color: CHART_COLORS.gridline },
          ticks: {
            color: CHART_COLORS.text,
            callback: (value) => `${value}%`,
          },
        },
        y: {
          grid: { display: false },
          ticks: { color: CHART_COLORS.text },
        },
      },
    },
  });

  return chartInstance;
}
