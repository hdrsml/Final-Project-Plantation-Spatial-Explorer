import * as maplibregl from "maplibre-gl";
import { showBlockPopup } from "./blockPopup.js";

function zoomToBlock(map, blockData, blockName) {
  const feature = blockData.features.find((f) => f.properties.BLOCK === blockName);

  if (!feature) return null;

  const bounds = new maplibregl.LngLatBounds();

  feature.geometry.coordinates.flat(Infinity).forEach((value, index, array) => {
    if (index % 2 === 0) {
      bounds.extend([value, array[index + 1]]);
    }
  });

  map.fitBounds(bounds, { padding: 100, duration: 1000, maxZoom: 16 });

  return feature;
}

// Wires the floating search box (toggle, dropdown, keyboard nav) and calls
// onSelect(blockName, feature) whenever a block is picked.
export function initBlockSearch({ map, blockData, divisionFilterEl, onSelect }) {
  const blockSearch = document.getElementById("block-search");
  const blockDropdown = document.getElementById("block-dropdown");
  const blockSearchBtn = document.getElementById("block-search-btn");
  const floatingSearch = document.getElementById("search-tool");
  const searchToggleBtn = document.getElementById("search-toggle-btn");
  const searchMinimizeBtn = document.getElementById("search-minimize-btn");

  const allBlockNames = blockData.features.map((f) => f.properties.BLOCK);

  function getFilteredBlockNames() {
    const selectedDivision = divisionFilterEl.value;

    if (selectedDivision === "all") return allBlockNames;

    return blockData.features
      .filter((f) => f.properties.DIVISION === selectedDivision)
      .map((f) => f.properties.BLOCK);
  }

  function renderDropdown(blocks) {
    blockDropdown.innerHTML = "";

    blocks.forEach((blockName) => {
      const item = document.createElement("div");

      item.className = "block-dropdown-item";
      item.textContent = blockName;

      item.addEventListener("click", () => {
        blockSearch.value = blockName;
        blockDropdown.style.display = "none";
        selectBlock(blockName);
      });

      blockDropdown.appendChild(item);
    });

    blockDropdown.style.display = "block";
  }

  function selectBlock(blockName) {
    const feature = zoomToBlock(map, blockData, blockName);

    if (!feature) return;

    onSelect(blockName, feature);

    map.once("moveend", () => showBlockPopup(map, feature));
  }

  searchToggleBtn.addEventListener("click", () => {
    floatingSearch.classList.remove("minimized");
    blockSearch.focus();
  });

  searchMinimizeBtn.addEventListener("click", () => {
    floatingSearch.classList.add("minimized");
    blockDropdown.style.display = "none";
  });

  blockSearch.addEventListener("focus", () => {
    renderDropdown(getFilteredBlockNames());
  });

  blockSearch.addEventListener("input", () => {
    const term = blockSearch.value.toLowerCase().trim();

    renderDropdown(getFilteredBlockNames().filter((name) => name.toLowerCase().includes(term)));
  });

  document.addEventListener("click", (e) => {
    if (!floatingSearch.contains(e.target)) {
      blockDropdown.style.display = "none";
    }
  });

  blockSearch.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      blockDropdown.style.display = "none";
      blockSearch.blur();
    }

    if (e.key === "Enter") {
      const blockName = blockSearch.value.trim();

      if (!blockName) return;

      selectBlock(blockName);
      blockDropdown.style.display = "none";
    }
  });

  blockSearchBtn.addEventListener("click", () => {
    const blockName = blockSearch.value.trim();

    if (!blockName) return;

    selectBlock(blockName);
    blockDropdown.style.display = "none";
  });

  return {
    getFilteredBlockNames,
    resetSearch() {
      blockSearch.value = "";
      blockDropdown.style.display = "none";
    },
  };
}
