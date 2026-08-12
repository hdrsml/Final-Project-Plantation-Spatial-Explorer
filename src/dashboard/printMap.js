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

export function initPrintTool(map) {
  const container = document.getElementById("print-tool");
  const toggleBtn = document.getElementById("print-toggle-btn");
  const minimizeBtn = document.getElementById("print-minimize-btn");
  const titleInput = document.getElementById("print-title");
  const paperSelect = document.getElementById("print-paper-size");
  const orientationSelect = document.getElementById("print-orientation");
  const applyBtn = document.getElementById("print-apply-btn");
  const pageStyleTag = document.getElementById("print-page-size");
  const printHeaderTitle = document.getElementById("print-header-title");
  const printHeaderMeta = document.getElementById("print-header-meta");

  // Print CSS resizes .map-wrap, so ask MapLibre to re-measure and redraw —
  // otherwise the printout shows a stale, wrongly-sized frame.
  window.addEventListener("beforeprint", () => map.resize());
  window.addEventListener("afterprint", () => map.resize());

  toggleBtn.addEventListener("click", () => container.classList.remove("minimized"));
  minimizeBtn.addEventListener("click", () => container.classList.add("minimized"));

  applyBtn.addEventListener("click", () => {
    const title = titleInput.value.trim() || "Plantation Spatial Explorer";
    const dateLabel = new Date().toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    printHeaderTitle.textContent = title;
    printHeaderMeta.textContent = `PT Mencari Cinta Sejati · ${dateLabel}`;

    const mapHeightMm = computeMapHeightMm(paperSelect.value, orientationSelect.value);

    pageStyleTag.textContent = `
      @page { size: ${paperSelect.value} ${orientationSelect.value}; margin: ${PAGE_MARGIN_MM}mm; }
      @media print {
        .map-wrap { height: ${mapHeightMm}mm !important; }
      }
    `;

    window.print();
  });
}
