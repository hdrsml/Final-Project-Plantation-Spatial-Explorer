import './style.css'
import 'maplibre-gl/dist/maplibre-gl.css'

import {
  Map,
  NavigationControl,
  setWorkerUrl
} from 'maplibre-gl'

import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

setWorkerUrl(workerUrl)

const map = new Map({
  container: 'app',
  style: 'https://tiles.openfreemap.org/styles/liberty',
  center: [101.6869, 3.1390],
  zoom: 10
})

map.addControl(new NavigationControl())