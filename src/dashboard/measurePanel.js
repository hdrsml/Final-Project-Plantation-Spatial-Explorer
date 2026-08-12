export function initMeasureTool(engine) {
  const container = document.getElementById("measure-tool");
  const toggleBtn = document.getElementById("measure-toggle-btn");
  const minimizeBtn = document.getElementById("measure-minimize-btn");
  const lineBtn = document.getElementById("measure-line-btn");
  const polygonBtn = document.getElementById("measure-polygon-btn");
  const clearBtn = document.getElementById("measure-clear-btn");
  const resultEl = document.getElementById("measure-result");

  const modeButtons = [lineBtn, polygonBtn];

  function setActive(activeBtn) {
    modeButtons.forEach((btn) => btn.classList.toggle("is-active", btn === activeBtn));
  }

  function showResult(summary) {
    if (!summary) return;

    if (summary.type === "line") {
      resultEl.textContent =
        summary.meters >= 1000 ? `${(summary.meters / 1000).toFixed(2)} km` : `${summary.meters.toFixed(1)} m`;
    } else if (summary.type === "polygon") {
      resultEl.textContent = `${summary.hectares.toFixed(3)} ha`;
    }
  }

  toggleBtn.addEventListener("click", () => container.classList.remove("minimized"));

  minimizeBtn.addEventListener("click", () => {
    container.classList.add("minimized");
    engine.cancel();
    setActive(null);
  });

  lineBtn.addEventListener("click", () => {
    setActive(lineBtn);
    resultEl.textContent = "Klik di peta untuk mulai mengukur…";

    engine.start("line", {
      onUpdate: showResult,
      onComplete: (_feature, summary) => showResult(summary),
    });
  });

  polygonBtn.addEventListener("click", () => {
    setActive(polygonBtn);
    resultEl.textContent = "Klik di peta untuk mulai mengukur…";

    engine.start("polygon", {
      onUpdate: showResult,
      onComplete: (_feature, summary) => showResult(summary),
    });
  });

  clearBtn.addEventListener("click", () => {
    engine.cancel();
    engine.clearDrawn();
    setActive(null);
    resultEl.textContent = "Pilih mode lalu klik di peta.";
  });
}
