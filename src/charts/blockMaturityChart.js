import Chart from "chart.js/auto";
import { CHART_COLORS } from "./chartTheme.js";

let chartInstance = null;

// Donut of block count by REMARKS (Immature/Mature/...), a quick read on
// how much of the estate is already productive.
export function renderBlockMaturityChart(canvas, blockData) {
  if (!canvas) return null;

  const counts = {};

  blockData.features.forEach((feature) => {
    const status = feature.properties.REMARKS || "Unknown";

    counts[status] = (counts[status] || 0) + 1;
  });

  const labels = Object.keys(counts);
  const values = labels.map((label) => counts[label]);

  if (chartInstance) {
    chartInstance.destroy();
  }

  chartInstance = new Chart(canvas, {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            CHART_COLORS.accent,
            CHART_COLORS.categorical[1],
            CHART_COLORS.categorical[3],
          ],
          borderColor: CHART_COLORS.panelBorder,
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "65%",
      plugins: {
        legend: {
          position: "bottom",
          labels: { color: CHART_COLORS.text, boxWidth: 10, padding: 10, font: { size: 11 } },
        },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${ctx.parsed} block`,
          },
        },
      },
    },
  });

  return chartInstance;
}
