import { mountSiteHeader } from "../components/siteHeader.js";
import { initHeroMap } from "../map/heroMap.js";

mountSiteHeader("home");

function setStat(id, value) {
  const el = document.getElementById(id);

  if (el) el.textContent = value;
}

function animateCount(id, targetValue, { suffix = "", decimals = 0, duration = 900 } = {}) {
  const el = document.getElementById(id);

  if (!el) return;

  const start = performance.now();

  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = targetValue * eased;

    el.textContent = `${value.toLocaleString("en-US", { maximumFractionDigits: decimals, minimumFractionDigits: decimals })}${suffix}`;

    if (progress < 1) requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
}

async function init() {
  const [estateData, blockData] = await Promise.all([
    fetch("/data/estate.geojson").then((res) => res.json()),
    fetch("/data/block.geojson").then((res) => res.json()),
  ]);

  const totalArea = blockData.features.reduce(
    (sum, f) => sum + Number(f.properties.AREA || 0),
    0
  );

  const divisions = new Set(blockData.features.map((f) => f.properties.DIVISION).filter(Boolean));

  const plantYears = blockData.features
    .map((f) => Number(String(f.properties.PLANT_YEAR).trim()))
    .filter((year) => !Number.isNaN(year));

  animateCount("stat-area", totalArea, { suffix: " ha", decimals: 1 });
  animateCount("stat-block", blockData.features.length);
  animateCount("stat-division", divisions.size);
  setStat("stat-year-range", `${Math.min(...plantYears)}–${Math.max(...plantYears)}`);

  initHeroMap("hero-map", estateData, blockData);
}

init();
