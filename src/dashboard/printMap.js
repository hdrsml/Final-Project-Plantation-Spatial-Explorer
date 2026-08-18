const PAPER_SIZES_MM = {
  A4: [210, 297],
  A3: [297, 420],
};

const PAGE_MARGIN_MM = 10;
const HEADER_RESERVE_MM = 20;

function computeMapHeightMm(paper, orientation) {
  let [width, height] = PAPER_SIZES_MM[paper] || PAPER_SIZES_MM.A4;

  if (orientation === "landscape") {
    [width, height] = [height, width];
  }

  const usableHeight = height - PAGE_MARGIN_MM * 2 - HEADER_RESERVE_MM;

  return Math.max(usableHeight, 60);
}

// The dashboard's charts are styled for the dark sidebar (light strokes,
// transparent background) — exporting them as-is onto a white printed page
// would leave anything drawn in a light color unreadable. Compositing onto
// a white backing canvas first fixes that without touching Chart.js.
function captureChartOnWhite(canvasId) {
  const source = document.getElementById(canvasId);

  if (!source || !source.width) return "";

  const temp = document.createElement("canvas");

  temp.width = source.width;
  temp.height = source.height;

  const ctx = temp.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, temp.width, temp.height);
  ctx.drawImage(source, 0, 0);

  return temp.toDataURL("image/png");
}

function setImageSrc(id, dataUrl) {
  const img = document.getElementById(id);

  if (img && dataUrl) img.src = dataUrl;
}

// Snapshots exactly what's currently on screen — same division filter, same
// KPI figures, same Attention List entries the user is already looking at —
// rather than recomputing anything, so the export always matches the view.
function populateExecutiveSummary(map) {
  ["division", "block", "area", "yield"].forEach((key) => {
    const source = document.querySelector(`[data-kpi="${key}"]`);
    const target = document.getElementById(`print-summary-${key}`);

    if (source && target) target.textContent = source.textContent;
  });

  setImageSrc("print-summary-map-img", map.getCanvas().toDataURL("image/png"));
  setImageSrc("print-summary-maturity-img", captureChartOnWhite("block-maturity-chart"));
  setImageSrc("print-summary-trend-img", captureChartOnWhite("estate-yield-chart"));

  const attentionSummary = document.getElementById("attention-summary")?.innerHTML || "";
  const attentionList = document.getElementById("attention-list")?.innerHTML || "";

  document.getElementById("print-summary-attention-body").innerHTML = attentionSummary + attentionList;
}

export function initPrintTool(map) {
  const container = document.getElementById("print-tool");
  const toggleBtn = document.getElementById("print-toggle-btn");
  const minimizeBtn = document.getElementById("print-minimize-btn");
  const modeSelect = document.getElementById("print-mode");
  const titleInput = document.getElementById("print-title");
  const paperSelect = document.getElementById("print-paper-size");
  const orientationSelect = document.getElementById("print-orientation");
  const applyBtn = document.getElementById("print-apply-btn");
  const pageStyleTag = document.getElementById("print-page-size");
  const printHeaderTitle = document.getElementById("print-header-title");
  const printHeaderMeta = document.getElementById("print-header-meta");
  const printSummaryTitle = document.getElementById("print-summary-title");
  const printSummaryMeta = document.getElementById("print-summary-meta");

  // Print CSS resizes .map-wrap, so ask MapLibre to re-measure and redraw —
  // otherwise the printout shows a stale, wrongly-sized frame.
  window.addEventListener("beforeprint", () => map.resize());
  window.addEventListener("afterprint", () => map.resize());

  toggleBtn.addEventListener("click", () => container.classList.remove("minimized"));
  minimizeBtn.addEventListener("click", () => container.classList.add("minimized"));

  // Orientation only makes sense for the map view — the summary is always
  // a portrait document, so the control is disabled rather than silently
  // ignored while it's set to a mode where it wouldn't do anything.
  modeSelect.addEventListener("change", () => {
    orientationSelect.disabled = modeSelect.value === "summary";
  });

  applyBtn.addEventListener("click", () => {
    const mode = modeSelect.value;
    const dateLabel = new Date().toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    const title = titleInput.value.trim() || (mode === "summary" ? "Ringkasan Eksekutif" : "Plantation Spatial Explorer");
    const meta = `PT Mencari Cinta Sejati · ${dateLabel}`;

    document.body.classList.toggle("print-mode-summary", mode === "summary");

    if (mode === "summary") {
      printSummaryTitle.textContent = title;
      printSummaryMeta.textContent = meta;

      populateExecutiveSummary(map);

      pageStyleTag.textContent = `@page { size: ${paperSelect.value} portrait; margin: ${PAGE_MARGIN_MM}mm; }`;
    } else {
      printHeaderTitle.textContent = title;
      printHeaderMeta.textContent = meta;

      const mapHeightMm = computeMapHeightMm(paperSelect.value, orientationSelect.value);

      pageStyleTag.textContent = `
        @page { size: ${paperSelect.value} ${orientationSelect.value}; margin: ${PAGE_MARGIN_MM}mm; }
        @media print {
          .map-wrap { height: ${mapHeightMm}mm !important; }
        }
      `;
    }

    window.print();
  });
}
