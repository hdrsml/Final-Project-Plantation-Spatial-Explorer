# 🌴 Plantation Spatial Explorer

## 🗺️ Gambaran Proyek

Plantation Spatial Explorer adalah aplikasi WebGIS yang dibangun dari ide sederhana: block perkebunan di peta seharusnya bukan sekadar bentuk yang dilihat — tapi jadi titik acuan yang langsung terhubung ke data operasional di baliknya (produksi, yield, pupuk, sampel daun).

Peta tetap jadi antarmuka utama. Data spasial (Estate, Plantation Block) diambil dari MAPID API, dengan dataset GeoJSON lokal sebagai cadangan kalau offline. Data operasional (produksi, yield, pupuk, sampel daun / LSU) digabung ke tiap block lewat kode `BLOCK` yang sama.

Proyek ini awalnya dibuat sebagai final project untuk WebGIS Development Bootcamp Batch 3 di MAPID Academy, sekaligus jadi portofolio pribadi — sehari-hari saya bekerja sebagai GIS Specialist di ekosistem ArcGIS (ArcGIS Enterprise, ArcGIS Server, Portal for ArcGIS, ArcGIS Pro, Experience Builder, Dashboard, SQL Server, Enterprise Geodatabase, Python/ArcPy ETL) — jadi tujuannya di sini bukan membangun ulang apa yang sudah saya kerjakan di kantor, melainkan belajar WebGIS client-side modern: JavaScript, MapLibre GL JS, integrasi API, dan pemrosesan spasial langsung di browser pakai Turf.js.

**Konsep inti:**

```
Data Spasial (MAPID API) + Data Operasional (MAPID API / fallback lokal)
                              ↓
                    WebGIS Interaktif
                              ↓
   Peta + KPI + Chart + Spatial Analysis + Measure + Print
```

## 🗃️ Data

Semua data — spasial maupun operasional — milik perusahaan fiktif, **PT Mencari Cinta Sejati**, dibuat murni untuk keperluan demonstrasi.

### Spasial — MAPID API
- **Estate**: 1 feature, total ±458 ha.
- **Plantation Block**: 30 feature tersebar di 2 divisi (`BLOCK`, `DIVISION`, `AREA`, `PLANT_YEAR`, `REMARKS`).
- Diambil dari `https://geoserver.mapid.io`; kalau request-nya gagal, aplikasi otomatis fallback ke `public/data/estate.geojson` / `block.geojson`.

### Operasional — MAPID API (dengan fallback lokal)
- **Production**: tonase FFB bulanan, yield, jumlah tandan per block (`TONNAGE_TON`, `YIELD_TON_HA`, `BUNCH_COUNT`, `PERIOD`).
- **Fertilizer**: dosis dan status aplikasi per periode (`DOSAGE_KG_HA`, `STATUS` — `Applied` / `Planned`).
- **LSU (Leaf Sampling Unit)**: analisis nutrisi daun (`N_PERCENT`, `P_PERCENT`, `K_PERCENT`).
- Pakai pola fetch-with-fallback yang sama seperti data spasial, didukung `public/data/production.json`, `fertilizer.json`, `lsu.json`.

Data spasial dan operasional digabung di sisi client lewat kode `BLOCK` — tidak ada backend, tidak ada database; frontend statis saja sudah cukup untuk kebutuhan proyek ini.

## 🧭 Halaman

- **Home** (`index.html`) — penjelasan tentang proyek ini, preview MapLibre dekoratif dari estate, dan ringkasan data dengan bahasa yang mudah dipahami.
- **Dashboard** (`dashboard.html`) — WebGIS-nya sendiri: peta, KPI, thematic layer, spatial analysis, tools measure dan print.
- **About** (`about.html`) — tentang pembuatnya.

## ✨ Fitur

**Peta interaktif** — batas Estate dan Plantation Block, hover feedback, highlight yang menetap untuk block terpilih, pencarian block dengan autocomplete, dan filter divisi.

**KPI & overview** — ringkasan Division / Block / Area / Yield yang mengikuti filter aktif, chart breakdown kematangan block, chart tren yield estate/divisi, dan **Attention List** — daftar block yang yield-nya terlihat jauh di bawah atau di atas rata-rata block matang lainnya. Tiap entri menampilkan angka aslinya dan apa yang dibandingkan, bukan cuma persentase kosong — klik salah satu, peta langsung fokus ke block itu.

**Thematic map** — choropleth per block untuk **Production** (yield, ton/ha, aktif secara default) dan **Fertilizer Status** (Applied / Planned), dikendalikan slider periode supaya bisa ditelusuri per bulan. Production pakai skala warna merah-ke-hijau (yield rendah → tinggi); block yang belum matang (TBM) dan block tanpa data di periode itu dibiarkan transparan, bukan diwarnai, karena yield mendekati nol di situ bukan sinyal performa. Kedua layer dibuat semi-transparan supaya basemap satelit tetap terlihat di bawahnya.

**Operational Spatial Analysis** — memilih satu block membuka Feature Inspector dengan tiga jenis analisis, semuanya ditenagai Turf.js. Masing-masing juga menggambar alasannya langsung di peta, bukan cuma di panel hasil:
- *Block Benchmark* — membandingkan yield block dengan block matang terdekat yang sebanding; garis putus-putus di peta menghubungkan block terpilih ke tiap block pembanding.
- *Nearby Analysis* — merangkum cakupan data operasional dalam radius tertentu; radiusnya sendiri digambar sebagai lingkaran di peta.
- *Performance Cluster* — menandai apakah under/over-performance suatu block itu terisolasi atau juga dialami block-block tetangganya; kalau ketemu cluster, lingkaran radius yang sama digambar dengan warna sesuai tier rendah/tinggi.

**Measure tool** — pengukuran garis (m) dan poligon (ha) dengan hasil yang langsung update saat menggambar.

**Print map** — dua mode. *Peta*: A4/A3, portrait/landscape, dengan judul, legend, dan skala khusus print. *Ringkasan Eksekutif*: satu halaman berisi KPI/chart/Attention List sebagai pengganti peta — snapshot persis dari apa yang sedang tampil di layar (filter divisi aktif, angka KPI saat itu, block yang sedang ditandai), diambil langsung di sisi client lewat canvas export, tanpa perlu server.

**Di luar cakupan**, memang disengaja: autentikasi, backend/database, forecasting atau prediksi berbasis ML, geoprocessing tingkat lanjut (intersect, union, spatial join), dan kolaborasi real-time. Fokus proyek ini adalah WebGIS yang jelas dan mudah dipahami — bukan platform manajemen perkebunan yang lengkap.

## ⚠️ Batasan & Disclaimer

- Ini **proyek training/demo untuk MAPID Bootcamp**, bukan sistem manajemen perkebunan yang siap produksi.
- Semua data spasial dan operasional milik perusahaan fiktif dan **dibuat dengan bantuan AI** untuk keperluan demonstrasi — tidak merepresentasikan kondisi perkebunan nyata dan tidak boleh dijadikan dasar keputusan agrikultur atau operasional di dunia nyata.
- Belum ada automated test atau lint suite. Perubahan diverifikasi lewat production build (`npm run build`) dan testing manual/browser yang deterministik, bukan lewat CI test pipeline — cukup masuk akal untuk skala proyek ini, tapi perlu diketahui sebelum dikembangkan lebih jauh.

## 🛠️ Tech Stack

| | |
|---|---|
| Build tool | Vite (multi-page: Home / Dashboard / About) |
| Web mapping | MapLibre GL JS |
| Spatial analysis | Turf.js |
| Chart | Chart.js |
| Data spasial | MAPID API, fallback GeoJSON lokal |
| Bahasa | Vanilla JavaScript (ES modules), tanpa framework |

Tanpa backend — semuanya berjalan di sisi client, termasuk perhitungan spatial analysis-nya.

## 🗂️ Struktur Proyek

```
src/
  pages/        entry script untuk Home, Dashboard, About
  map/          setup MapLibre, layer base/thematic/analysis, search, spatial analysis, draw/measure engine
  data/         loader data MAPID + fallback lokal
  services/     client MAPID API
  dashboard/    panel UI dashboard (KPI, operational panel, print, measure, dll.)
  charts/       konfigurasi Chart.js
  components/   site header bersama
  styles/       theme + CSS per halaman
public/data/      dataset GeoJSON/JSON lokal untuk fallback
public/maplibre/  worker script MapLibre + dependency internalnya sendiri, disalin
                  sebagai file statis biasa (lihat komentar di map/createMap.js —
                  import `?url` dari Vite untuk file worker-nya saja akan merusak
                  relative import di dalamnya). Salin ulang dari
                  node_modules/maplibre-gl/dist/ kalau versi maplibre-gl di
                  package.json pernah di-upgrade.
```

## 🚀 Cara Menjalankan

```bash
npm install
```

Buat file `.env` dengan kredensial MAPID Anda (lihat `src/config/env.js` untuk daftar lengkap variabel yang dibutuhkan — API key plus pasangan layer/project ID untuk tiap layer: Estate, Block, Production, Fertilizer, LSU). Tanpa ini pun, aplikasi tetap jalan penuh pakai data fallback lokal di `public/data/`.

```bash
npm run dev      # dev server lokal
npm run build    # production build
npm run preview  # preview hasil production build secara lokal
```

## 🎯 Scope

Ini proyek bootcamp/portofolio yang fokus, bukan Plantation Management Information System atau platform GIS enterprise. Prinsipnya: *"Fitur yang fokus, tujuan yang jelas, implementasi yang tuntas"* — beberapa fitur yang benar-benar selesai dan mudah dipahami lebih baik daripada daftar panjang fitur setengah jadi.

## 🔗 Relevansi dengan Alur Kerja GIS Profesional

Jembatan belajar dari pekerjaan GIS enterprise yang saya jalani sehari-hari menuju WebGIS modern:

| Pengalaman GIS Enterprise | Konsep WebGIS Modern |
|---|---|
| ArcGIS Enterprise | Arsitektur WebGIS |
| REST / Feature Service | Integrasi API |
| SQL Server / Enterprise Geodatabase | Data spasial & atribut terstruktur |
| Python ETL | Penggabungan & transformasi data di sisi client |
| ArcGIS Dashboard | Visualisasi KPI & chart |
| Experience Builder | Antarmuka WebGIS interaktif |
| GIS Automation | Pemrosesan spasial frontend/client-side (Turf.js) |

## 🚧 Status Proyek

Masih tahap **On Development and Review** sebagai **Final Project Bootcamp WebGIS MAPID Batch 3**.
