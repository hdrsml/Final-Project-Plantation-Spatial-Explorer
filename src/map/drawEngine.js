import * as turf from "@turf/turf";

const DRAW_SOURCE = "draw-data";

function emptyFC() {
  return { type: "FeatureCollection", features: [] };
}

function measureFeature(feature) {
  if (feature.geometry.type === "LineString") {
    const meters = turf.length(feature, { units: "kilometers" }) * 1000;

    return { type: "line", meters };
  }

  if (feature.geometry.type === "Polygon") {
    const hectares = turf.area(feature) / 10000;

    return { type: "polygon", hectares };
  }

  return null;
}

// Line/polygon drawing with live rubber-band preview and length(m)/area(ha)
// measurement, backed by Turf.js. Used by the floating Measure tool.
export function createDrawEngine(map) {
  let mode = null; // "line" | "polygon"
  let vertices = [];
  let onCompleteCb = null;
  let onUpdateCb = null;

  function setup() {
    map.addSource(DRAW_SOURCE, { type: "geojson", data: emptyFC() });

    map.addLayer({
      id: "draw-fill",
      type: "fill",
      source: DRAW_SOURCE,
      filter: ["==", ["geometry-type"], "Polygon"],
      paint: { "fill-color": "#e2b876", "fill-opacity": 0.18 },
    });

    map.addLayer({
      id: "draw-line",
      type: "line",
      source: DRAW_SOURCE,
      filter: ["!=", ["geometry-type"], "Point"],
      paint: { "line-color": "#e2b876", "line-width": 3 },
    });

    map.addLayer({
      id: "draw-vertex",
      type: "circle",
      source: DRAW_SOURCE,
      filter: ["==", ["geometry-type"], "Point"],
      paint: {
        "circle-radius": 5,
        "circle-color": "#e2b876",
        "circle-stroke-color": "#1c1d22",
        "circle-stroke-width": 2,
      },
    });

    map.on("click", handleClick);
    map.on("dblclick", handleDblClick);
    map.on("mousemove", handleMouseMove);

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") cancel();
    });
  }

  function setSourceData(features) {
    map.getSource(DRAW_SOURCE).setData({ type: "FeatureCollection", features });
  }

  function vertexPoints() {
    return vertices.map((v) => turf.point(v));
  }

  function previewFeature(extraVertex) {
    const points = extraVertex ? [...vertices, extraVertex] : vertices;

    if (mode === "line") {
      if (points.length < 2) return null;
      return turf.lineString(points);
    }

    if (mode === "polygon") {
      if (points.length < 3) return points.length >= 2 ? turf.lineString(points) : null;
      return turf.polygon([[...points, points[0]]]);
    }

    return null;
  }

  function handleClick(e) {
    if (!mode) return;

    vertices.push([e.lngLat.lng, e.lngLat.lat]);

    const preview = previewFeature();
    setSourceData([...(preview ? [preview] : []), ...vertexPoints()]);
  }

  function handleDblClick(e) {
    if (mode === "line" && vertices.length >= 2) {
      e.preventDefault();
      finish(turf.lineString(vertices));
    } else if (mode === "polygon" && vertices.length >= 3) {
      e.preventDefault();
      finish(turf.polygon([[...vertices, vertices[0]]]));
    }
  }

  function handleMouseMove(e) {
    if (!mode || vertices.length === 0) return;

    const cursor = [e.lngLat.lng, e.lngLat.lat];
    const preview = previewFeature(cursor);

    if (!preview) return;

    setSourceData([preview, ...vertexPoints()]);

    if (onUpdateCb) onUpdateCb(measureFeature(preview));
  }

  function finish(feature) {
    const summary = measureFeature(feature);

    if (summary) {
      feature.properties = { ...(feature.properties || {}), ...summary };
    }

    setSourceData([feature]);

    mode = null;
    vertices = [];
    map.doubleClickZoom.enable();
    map.getCanvas().style.cursor = "";

    if (onCompleteCb) onCompleteCb(feature, summary);
  }

  function start(newMode, { onComplete, onUpdate } = {}) {
    cancel();

    mode = newMode;
    vertices = [];
    onCompleteCb = onComplete || null;
    onUpdateCb = onUpdate || null;

    map.doubleClickZoom.disable();
    map.getCanvas().style.cursor = "crosshair";
  }

  function cancel() {
    if (!mode) return;

    mode = null;
    vertices = [];
    map.doubleClickZoom.enable();
    map.getCanvas().style.cursor = "";
  }

  function isActive() {
    return mode !== null;
  }

  function clearDrawn() {
    setSourceData([]);
  }

  setup();

  return { start, cancel, isActive, clearDrawn };
}
