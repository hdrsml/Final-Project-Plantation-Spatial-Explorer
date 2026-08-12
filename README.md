# Plantation Spatial Explorer

## Project Overview

Plantation Spatial Explorer adalah modern WebGIS application yang menggabungkan spatial exploration, plantation data visualization, production visualization, yield visualization, agronomy/fertilizer monitoring, basic spatial analysis, dan map printing dalam satu interactive web application.

Map tetap menjadi primary interface aplikasi ini. Project ini menggunakan MAPID API sebagai spatial data source dan MapLibre GL JS sebagai web mapping library utama, dikombinasikan dengan local dummy dataset untuk merepresentasikan operational dan agronomy data.

Project ini merupakan final project untuk MAPID Academy WebGIS Development Bootcamp Batch 3, sekaligus menjadi portfolio project bagi saya yang memiliki background sebagai GIS Specialist dengan pengalaman di ekosistem ArcGIS (ArcGIS Enterprise, ArcGIS Server, Portal for ArcGIS, ArcGIS Pro, Experience Builder, Dashboard, SQL Server, Enterprise Geodatabase, Python ETL/ArcPy, REST Service, Feature Service, GIS Automation). Tujuannya bukan membangun ulang sistem enterprise yang sudah saya kerjakan sehari-hari, melainkan mempelajari dan menerapkan modern WebGIS development menggunakan JavaScript, Node.js, MapLibre GL JS, API integration, dan client-side spatial processing.

Project bukan sekadar map viewer, dan juga bukan full plantation management system. Tujuan utamanya adalah menunjukkan bagaimana spatial data dapat dihubungkan dengan operational dan agronomy data, kemudian divisualisasikan melalui interactive WebGIS.

**Core concept:**

```
Spatial Data + Operational Data + Agronomy Data
                    ↓
            Interactive WebGIS
                    ↓
   Map + KPI + Charts + Basic Spatial Tools + Print
```

## Problem Statement

Spatial data plantation biasanya hanya diperlakukan sebagai layer pada map, sebatas untuk dilihat secara visual. Padahal spatial unit seperti Plantation Block sebenarnya dapat menjadi common reference untuk menghubungkan berbagai informasi operasional, seperti production, yield, dan fertilizer monitoring.

Project ini mencoba membangun WebGIS yang tidak hanya menampilkan geometry, tetapi juga membantu user memahami informasi yang terkait dengan spatial unit tersebut, melalui workflow berikut:

```
User memilih Plantation Block
        ↓
Map menampilkan feature
        ↓
Application mengambil operational/agronomy information berdasarkan block_id
        ↓
KPI diperbarui
        ↓
Chart diperbarui
        ↓
User dapat melakukan basic spatial analysis
        ↓
User dapat menghasilkan printable map
```

Selain itu, dari sisi personal, project ini juga menjawab kebutuhan saya untuk mempelajari modern WebGIS development sebagai pelengkap pengalaman enterprise GIS yang sudah saya miliki.

## Objectives

- Mempelajari dan menerapkan modern WebGIS development workflow menggunakan Node.js dan MapLibre GL JS.
- Mengonsumsi spatial data dari MAPID API sebagai external spatial data source.
- Mengintegrasikan spatial data dengan local operational/agronomy dummy data melalui relasi sederhana (`block_id`).
- Menampilkan KPI dan chart visualization berdasarkan data yang tersedia.
- Menerapkan basic client-side spatial processing (drawing, measurement, buffer).
- Membangun map printing sederhana dengan beberapa opsi paper size dan orientation.
- Menghasilkan project yang code structure, naming, modularity, dan error handling-nya diarahkan menuju good software engineering practice, meskipun tidak diklaim sebagai production-grade enterprise system.
- Menjadikan project ini sebagai portfolio yang menunjukkan kemampuan transisi dari enterprise GIS ke modern WebGIS development.

## Target Users

- GIS users yang membutuhkan basic spatial exploration melalui web browser.
- Plantation spatial data users yang ingin melihat kondisi Estate dan Plantation Block beserta informasi operasional terkait.
- Users yang membutuhkan visualisasi production, yield, dan fertilizer monitoring secara sederhana dan terhubung dengan spatial context.

## Data Source & Data Architecture

Project ini menggunakan dua sumber data yang terpisah secara jelas.

### A. Spatial Data — MAPID API

MAPID API digunakan sebagai spatial data source. Initial spatial data yang digunakan:

- Estate
- Plantation Block
- Geometry
- Spatial attributes yang memang tersedia dari MAPID API

MAPID API dipilih karena dapat diakses secara publik dari web application, sehingga cocok untuk kebutuhan learning API-based spatial data consumption. Sebagai perbandingan, ArcGIS Enterprise yang saya gunakan di lingkungan kerja berada di intranet perusahaan dan tidak dapat diakses dari public deployment, sehingga tidak digunakan sebagai runtime data source pada project ini.

MAPID API **tidak** diasumsikan menyediakan production, yield, atau agronomy data. Detail teknis seperti endpoint, authentication mechanism, dan response structure masih **to be determined during implementation**, menunggu dokumentasi API bootcamp dipelajari dan diverifikasi lebih lanjut.

### B. Operational & Agronomy Data — Local Dummy Dataset

Production, yield, dan fertilizer monitoring **tidak** bergantung pada MAPID API. Untuk final project ini, data tersebut dibuat menggunakan local dummy/mock dataset yang mensimulasikan operational/agronomy information dengan relasi ke Plantation Block.

Contoh field dummy dataset:

- `block_id`
- `production_ton`
- `yield_ton_ha`
- `fertilizer_kg`
- `fertilizer_status`

Contoh relationship:

```
MAPID API — Plantation Block          Local Dummy Data
  block_id                              block_id
  geometry                              production_ton
  estate                                yield_ton_ha
                                         fertilizer_kg
                                         fertilizer_status

  Plantation Block ── block_id ──▶ Operational / Agronomy Data
```

Dengan pendekatan ini, project mendemonstrasikan bagaimana spatial data dari external API dapat dikombinasikan dengan non-spatial operational data dari sumber lain.

**Kenapa dummy data?** Production, yield, dan fertilizer monitoring bukan data yang diasumsikan tersedia di MAPID API, sehingga dummy data digunakan murni untuk kebutuhan demonstration dan learning — bukan untuk membuat replika enterprise plantation database. Initial implementation sengaja dibuat sederhana: tidak diperlukan SQL Server, PostgreSQL, backend API, authentication system, ETL pipeline, maupun database server hanya untuk menyediakan dummy data. Local static/mock data sudah cukup untuk final project ini. Pengembangan menggunakan database atau backend API dapat menjadi arah pengembangan di masa depan, namun berada di luar scope final project.

Data untuk public repository dan deployment akan berupa dummy data, anonymized data, atau data non-confidential.

## Main Features

### 1. Spatial Exploration
Display Estate layer, display Plantation Block layer, basic map navigation, feature popup, search, attribute-based filtering, dan select spatial feature. Map tetap menjadi primary interface aplikasi.

### 2. KPI / Summary Visualization
Menampilkan summary information dari spatial dan operational data, misalnya total Estate, total Plantation Block, total area, total production, average yield, selected block count, selected area, dan selected production. KPI hanya dibuat berdasarkan data yang benar-benar tersedia; tidak semua KPI wajib diimplementasikan jika data yang diperlukan belum tersedia.

### 3. Production Visualization
Production data berasal dari local dummy dataset. Informasi yang dapat divisualisasikan meliputi production tonnage per block, production summary per estate, production distribution, dan comparison antar spatial unit, menggunakan KPI, bar chart, dan pie/donut chart jika relevan. Tidak mencakup production forecasting, prediction, atau advanced statistical modelling.

### 4. Yield Visualization
Yield data berasal dari local dummy dataset. Mencakup yield per block, yield per estate, average yield, dan yield comparison. Jika memungkinkan, yield dapat divisualisasikan pada map menggunakan thematic styling atau classification sederhana. Tidak mencakup yield prediction, machine learning, atau forecasting.

### 5. Agronomy / Fertilizer Monitoring
Fokus hanya pada basic fertilizer monitoring: fertilizer application per block, fertilizer quantity, fertilizer status, fertilizer summary, dan comparison antar block/estate. Jika memungkinkan, fertilizer information dapat dikaitkan dengan Plantation Block pada map. Project **tidak** membangun full agronomy management system — tidak mencakup fertilizer recommendation, AI fertilizer recommendation, crop modelling, disease detection, atau advanced agronomic modelling.

### 6. Basic Spatial Analysis
Spatial drawing (Point, Line, Polygon), measurement (distance untuk Line, area untuk Polygon), dan buffer dari geometry yang dibuat atau tersedia. Tidak mencakup advanced geoprocessing seperti intersect, union, difference, spatial join, atau complex overlay analysis.

### 7. Map Printing
Print map dengan paper size A4, A3, dan custom/user-defined size, orientation portrait dan landscape, dengan elemen dasar seperti map, title, legend, scale, dan data source/attribution.

## Map & Data Interaction

Salah satu tujuan penting project adalah membuat hubungan antara map interaction dan data visualization, misalnya:

```
User memilih Estate
        ↓
Block yang relevan ditampilkan / difilter
        ↓
KPI berubah → Production chart berubah → Yield summary berubah → Fertilizer monitoring berubah
```

Jika implementasi teknis memungkinkan, filter dan spatial selection akan mempengaruhi KPI dan chart secara terhubung. Namun interaction architecture sengaja dijaga tetap sederhana dan tidak dibuat kompleks — prioritas ada pada implementation yang mudah dipahami.

## Technology Stack

**Frontend:** HTML, CSS, Modern JavaScript

**Web Mapping:** MapLibre GL JS

**Spatial Data:** MAPID API

**Operational / Agronomy Data:** Local dummy/mock dataset

**Spatial Processing:** JavaScript-based spatial processing approach/library yang relevan dengan materi Spatial Engine Processor pada bootcamp — *to be determined*.

**Visualization:** JavaScript charting library yang sesuai kebutuhan — *to be determined*.

**Development Tools:** Node.js, npm, Git, GitHub, Cursor AI (sebagai coding guidance, bukan untuk menulis seluruh kode secara otomatis)

Tidak ada penambahan library di luar yang sudah disebutkan sampai benar-benar diperlukan dan diverifikasi.

## Project Scope

Project ini harus tetap realistic untuk final project bootcamp, sebagai focused WebGIS portfolio project. Project ini **bukan** full Plantation Management Information System, enterprise GIS platform, Plantation ERP, full Business Intelligence platform, ataupun complete Agronomy Management System.

**Core scope:**

```
Spatial Exploration + KPI & Visualization + Production + Yield
+ Fertilizer Monitoring + Basic Spatial Analysis + Map Printing
```

Prinsip project: *"Focused features, clear purpose, complete implementation."* Lebih baik memiliki beberapa fitur yang selesai dan dipahami, daripada terlalu banyak fitur tetapi setengah jadi.

**Yang tidak termasuk scope:** ArcGIS Enterprise/ArcGIS Server/SQL Server runtime integration, Enterprise Geodatabase, authentication, user management, AI, machine learning, yield prediction, production forecasting, fertilizer recommendation, disease detection, NDVI/NDRE/EVI, weather monitoring, advanced agronomy modelling, advanced spatial analysis (intersect, union, spatial join), real-time collaboration, dan mobile application.

Production, Yield, Fertilizer Monitoring, KPI, dan Chart tetap menjadi bagian resmi dari scope project ini.

## Development Plan / Roadmap

**Phase 1 — Project Setup**
Initialize Node.js project, setup Git, create GitHub repository, basic project structure, README.

**Phase 2 — MapLibre Setup**
Initialize MapLibre GL JS, display map, basic map navigation.

**Phase 3 — MAPID API Integration**
Understand MAPID API, connect to MAPID API, retrieve spatial data, display Estate dan Plantation Block layers.

**Phase 4 — Spatial Data Interaction**
Popup, search, filtering, feature selection.

**Phase 5 — Local Operational Data**
Prepare dummy production data, dummy yield data, dummy fertilizer monitoring data; define `block_id` relationship; load local data ke aplikasi; combine spatial dan operational data.

**Phase 6 — KPI & Data Visualization**
KPI cards, production visualization, yield visualization, fertilizer monitoring visualization, basic charts, connect map filtering/selection dengan KPI dan chart.

**Phase 7 — Spatial Tools**
Create Point, Line, Polygon; distance measurement; area measurement; buffer.

**Phase 8 — Map Printing**
A4, A3, custom paper size, portrait/landscape, basic map layout.

**Phase 9 — Testing & Deployment**
Functional testing, UI cleanup, basic documentation, public deployment.

## Expected Outcome

Final application diharapkan mendemonstrasikan kemampuan membangun modern WebGIS application yang:

1. Mengonsumsi spatial data dari external API.
2. Menampilkan spatial data menggunakan MapLibre GL JS.
3. Mengintegrasikan spatial data dengan local operational/agronomy data.
4. Menyediakan KPI dan chart visualization.
5. Menyediakan production dan yield visualization.
6. Menyediakan basic fertilizer monitoring visualization.
7. Memungkinkan user melakukan basic spatial drawing dan analysis.
8. Menghasilkan printable map.
9. Menunjukkan penerapan modern JavaScript dan frontend development practice.

Project ini diharapkan menjadi bukti transisi praktis dari traditional GIS workflow menuju modern WebGIS development.

## Relation to Professional GIS Workflow

Project ini menjadi learning bridge dari pengalaman GIS existing saya menuju modern WebGIS development:

| Enterprise GIS Experience | Modern WebGIS Concept |
|---|---|
| ArcGIS Enterprise | WebGIS architecture |
| REST / Feature Service | API integration |
| SQL Server / Enterprise Geodatabase | Structured spatial and attribute data |
| Python ETL | Data preparation and transformation |
| ArcGIS Dashboard | KPI and chart visualization |
| Experience Builder | Interactive WebGIS interface |
| GIS Automation | Frontend/client-side automation and spatial processing |

Project ini **tidak** mengintegrasikan sistem perusahaan secara langsung. Tujuannya adalah memahami konsep dan workflow modern menggunakan technology stack yang sesuai dengan materi bootcamp.

## Learning Objectives

Project ini membantu memahami: modern JavaScript, Node.js project structure, npm, Git & GitHub, frontend development, API integration, MapLibre GL JS, GeoJSON/spatial data handling, client-side spatial processing, data visualization, map interaction, spatial selection, basic WebGIS architecture, deployment, dan maintainable frontend code.

## Current Status

MAPID API integration (Estate, Plantation Block, Production, Fertilizer, LSU), dummy/local fallback data, KPI, dan chart visualization sudah berjalan. Aplikasi sekarang terbagi menjadi tiga halaman:

- **Home** (`index.html`) — objective project, ringkasan data, dan preview spatial sederhana.
- **Dashboard** (`dashboard.html`) — inti WebGIS: map, KPI, filter, search, dan operational chart.
- **About** (`about.html`) — profil pembuat project.

Spatial tools (drawing/measurement/buffer) dan map printing masih di roadmap dan belum diimplementasikan.