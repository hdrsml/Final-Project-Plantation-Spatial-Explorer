import { renderBlockMaturityChart } from "../charts/blockMaturityChart.js";

export function renderOverviewCharts(blockData) {
  renderBlockMaturityChart(document.getElementById("block-maturity-chart"), blockData);
}
