# Plantation Spatial Explorer

## Project Overview

Plantation Spatial Explorer is a WebGIS application built around a simple idea: a plantation block on a map should be more than a shape you can look at — it should be a reference point that connects directly to the operational data behind it (production, yield, fertilizer, leaf sampling).

The map stays the primary interface. Spatial data (Estate, Plantation Block) comes from the MAPID API, with a local GeoJSON dataset as an offline fallback. Operational data (production, yield, fertilizer, leaf sampling / LSU) is joined to each block through a shared `BLOCK` code.

This started as the final project for MAPID Academy's WebGIS Development Bootcamp Batch 3, and doubles as a personal portfolio piece — I work day to day as a GIS Specialist in the ArcGIS ecosystem (ArcGIS Enterprise, ArcGIS Server, Portal for ArcGIS, ArcGIS Pro, Experience Builder, Dashboard, SQL Server, Enterprise Geodatabase, Python/ArcPy ETL), so the goal here wasn't to rebuild what I already do at work, but to learn modern client-side WebGIS: JavaScript, MapLibre GL JS, API integration, and browser-side spatial processing with Turf.js.

**Core concept:**

```
Spatial Data (MAPID API) + Operational Data (MAPID API / local fallback)
                              ↓
                    Interactive WebGIS
                              ↓
   Map + KPI + Charts + Spatial Analysis + Measure + Print
```

## Data

All data — spatial and operational — belongs to a fictional company, **PT Mencari Cinta Sejati**, built purely for demonstration.

### Spatial — MAPID API
- **Estate**: 1 feature, ~458 ha total.
- **Plantation Block**: 30 features across 2 divisions (`BLOCK`, `DIVISION`, `AREA`, `PLANT_YEAR`, `REMARKS`).
- Fetched from `https://geoserver.mapid.io`; if the request fails, the app falls back to `public/data/estate.geojson` / `block.geojson` automatically.

### Operational — MAPID API (with local fallback)
- **Production**: monthly FFB tonnage, yield, bunch count per block (`TONNAGE_TON`, `YIELD_TON_HA`, `BUNCH_COUNT`, `PERIOD`).
- **Fertilizer**: dosage and application status per period (`DOSAGE_KG_HA`, `STATUS` — `Applied` / `Planned`).
- **LSU (Leaf Sampling Unit)**: leaf nutrient analysis (`N_PERCENT`, `P_PERCENT`, `K_PERCENT`).
- Same fetch-with-fallback pattern as spatial data, backed by `public/data/production.json`, `fertilizer.json`, `lsu.json`.

Spatial and operational data are joined client-side by `BLOCK` — there's no backend, no database; a static frontend is enough for what this project needs.

## Pages

- **Home** (`index.html`) — what the project is, a decorative MapLibre preview of the estate, and a plain-language breakdown of the data.
- **Dashboard** (`dashboard.html`) — the actual WebGIS: map, KPIs, thematic layers, spatial analysis, measure and print tools.
- **About** (`about.html`) — who built this.

## Features

**Interactive map** — Estate and Plantation Block boundaries, hover feedback, a persistent highlight for the selected block, block search with autocomplete, and division filtering.

**KPI & overview** — Division / Block / Area / Yield summary that follows the active filter, a block maturity breakdown chart, an estate/division yield trend chart, and an **Attention List** of blocks whose yield sits noticeably below or above the average of other mature blocks — each entry shows the actual figure and what it's being compared against, not just a bare percentage, and clicking one flies the map to that block.

**Thematic maps** — Block-level choropleths for **Production** (yield, ton/ha, on by default) and **Fertilizer status** (Applied / Planned), driven by a period slider so you can scrub through the available months. Production uses a red-to-green scale (low → high yield); immature (TBM) blocks and blocks with no record for the period are left hollow rather than colored, since a near-zero yield there isn't a performance signal. Both layers are semi-transparent so the satellite basemap stays visible underneath.

**Operational Spatial Analysis** — selecting a block opens a Feature Inspector with three analyses, all backed by Turf.js. Each one also draws its reasoning on the map, not just in the result panel:
- *Block Benchmark* — compares the block's yield against nearby comparable (mature) blocks; dashed lines on the map connect the selected block to each one used in the comparison.
- *Nearby Analysis* — summarizes operational data coverage within a chosen radius; the radius itself is drawn as a ring on the map.
- *Performance Cluster* — flags whether a block's under/over-performance is isolated or shared with its neighbors; when a cluster is found, the same radius ring is drawn, tinted to match the low/high tier.

**Measure tool** — line (m) and polygon (ha) measurement with a live readout while drawing.

**Print map** — two modes. *Peta*: A4/A3, portrait/landscape, with a print-only title, legend, and scale bar. *Ringkasan Eksekutif*: a one-page KPI/chart/Attention List briefing instead of the map — a snapshot of exactly what's on screen (current division filter, current KPI figures, current flagged blocks), captured client-side via canvas export, no server round-trip.

**Not in scope**, by design: authentication, a backend/database, forecasting or ML-based prediction, advanced geoprocessing (intersect, union, spatial join), and real-time collaboration. The point of this project is a focused, understandable WebGIS — not a full plantation management platform.

## Limitations & Disclaimer

- This is a **training/demo project for the MAPID Bootcamp**, not a production plantation management system.
- All spatial and operational data belongs to a fictional company and was **generated with AI** for demonstration purposes — it does not represent a real plantation and should not be used as a basis for real-world agricultural or operational decisions.
- There is no automated test or lint suite. Changes are verified through the production build (`npm run build`) and deterministic manual/browser testing rather than a CI test pipeline — reasonable for this project's size, but worth knowing before extending it.

## Tech Stack

| | |
|---|---|
| Build tool | Vite (multi-page: Home / Dashboard / About) |
| Web mapping | MapLibre GL JS |
| Spatial analysis | Turf.js |
| Charts | Chart.js |
| Spatial data | MAPID API, local GeoJSON fallback |
| Language | Vanilla JavaScript (ES modules), no framework |

No backend — everything runs client-side, including the spatial-analysis math.

## Project Structure

```
src/
  pages/        entry scripts for Home, Dashboard, About
  map/          MapLibre setup, base/thematic/analysis layers, search, spatial analysis, draw/measure engine
  data/         MAPID fetch + local-fallback data loaders
  services/     MAPID API client
  dashboard/    dashboard UI panels (KPI, operational panel, print, measure, etc.)
  charts/       Chart.js configs
  components/   shared site header
  styles/       theme + per-page CSS
public/data/      local GeoJSON/JSON fallback datasets
public/maplibre/  MapLibre's worker script + its own internal dependency, copied
                  in as plain static files (see the comment in map/createMap.js —
                  a Vite `?url` import of just the worker file breaks the relative
                  import inside it). Re-copy from node_modules/maplibre-gl/dist/ if
                  the maplibre-gl version in package.json is ever upgraded.
```

## Getting Started

```bash
npm install
```

Create a `.env` file with your MAPID credentials (see `src/config/env.js` for the full list of expected variables — API key plus a layer/project ID pair per layer: Estate, Block, Production, Fertilizer, LSU). Without it, the app still works fully off the local fallback data in `public/data/`.

```bash
npm run dev      # local dev server
npm run build    # production build
npm run preview  # preview the production build locally
```

## Scope

This is a focused bootcamp/portfolio project, not a Plantation Management Information System or an enterprise GIS platform. Principle: *"Focused features, clear purpose, complete implementation"* — a few finished, understandable features beat a long list of half-built ones.

## Relation to Professional GIS Workflow

A learning bridge from the enterprise GIS work I do day to day toward modern WebGIS:

| Enterprise GIS Experience | Modern WebGIS Concept |
|---|---|
| ArcGIS Enterprise | WebGIS architecture |
| REST / Feature Service | API integration |
| SQL Server / Enterprise Geodatabase | Structured spatial and attribute data |
| Python ETL | Client-side data joining and transformation |
| ArcGIS Dashboard | KPI and chart visualization |
| Experience Builder | Interactive WebGIS interface |
| GIS Automation | Frontend/client-side spatial processing (Turf.js) |
