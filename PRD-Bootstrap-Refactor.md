# 📄 PRD — UI Refactoring: Migrasi ke Bootstrap 5

**Dokumen:** PRD-Bootstrap-Refactor  
**Versi:** 1.1  
**Tanggal:** 27 Februari 2026  
**Proyek:** MitraFinance – Frontend UI Refactor  
**Status:** Draft  
**Changelog v1.1:** Form create pada AssetsPage, SnapshotsPage, dan UsersPage dipindahkan ke Bootstrap Modal.

---

## 1. Executive Summary

### Problem Statement

Frontend MitraFinance saat ini hanya mengandalkan satu file CSS global ([frontend/src/styles.css](frontend/src/styles.css)) yang ditulis secara manual tanpa design system. Pendekatan ini menghasilkan komponen yang inkonsisten secara visual, sulit di-maintain saat penambahan fitur baru, dan tidak menyediakan interactive UI behavior (dropdown, modal, toast) tanpa kode tambahan.

### Proposed Solution

Refactor seluruh layer presentasi frontend dengan mengintegrasikan **Bootstrap 5.3.8** via CDN sebagai design system utama. Semua class CSS kustom pada setiap halaman dan layout akan digantikan dengan utility class dan komponen Bootstrap, sementara `styles.css` hanya dipertahankan untuk override minimal yang tidak dapat ditangani Bootstrap.

### Success Criteria

| #   | Metrik                                                                        | Target                                                 |
| --- | ----------------------------------------------------------------------------- | ------------------------------------------------------ |
| 1   | Semua halaman render tanpa class CSS kustom yang overlapping dengan Bootstrap | 100% class migrasi tercakup                            |
| 2   | Ukuran `styles.css` berkurang setelah migrasi                                 | Minimal berkurang 70% dari 150 baris saat ini          |
| 3   | Lighthouse Accessibility score                                                | ≥ 90 pada semua halaman                                |
| 4   | Mobile responsiveness breakpoint                                              | Semua halaman functional di viewport ≥ 320px           |
| 5   | Zero regresi pada fitur fungsional                                            | Semua test yang ada (LoginPage.test.jsx) tetap passing |

---

## 2. User Experience & Functionality

### User Personas

| Persona                 | Deskripsi                                                     | Concern Utama                                                             |
| ----------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------- |
| **End User (Investor)** | Pengguna yang memantau aset keuangan pribadi via dashboard    | UI yang bersih dan mudah dibaca di desktop & mobile                       |
| **Admin**               | Pengguna dengan role admin yang mengelola user dan audit logs | Tabel data yang dense tapi tetap readable                                 |
| **Developer**           | Engineer yang maintain dan extend codebase MitraFinance       | Class yang konsisten, komponen mudah dipahami tanpa perlu baca CSS manual |

---

### User Stories & Acceptance Criteria

#### Story 1 — Bootstrap CDN Dimuat di Seluruh Halaman

> _As a developer, I want Bootstrap CSS and JS loaded via CDN in `index.html` so that all pages have access to Bootstrap utility classes and components without installing npm packages._

**Acceptance Criteria:**

- [ ] Tag `<link>` Bootstrap CSS `bootstrap@5.3.8/dist/css/bootstrap.min.css` ditambahkan di `<head>` pada [frontend/index.html](frontend/index.html).
- [ ] Tag `<script>` Bootstrap bundle JS `bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js` ditambahkan sebelum `</body>` pada [frontend/index.html](frontend/index.html).
- [ ] Aplikasi tidak menginstal paket `bootstrap` via npm/yarn (murni CDN).
- [ ] Tidak terdapat error `bootstrap is not defined` di browser console.

---

#### Story 2 — Layout & Navigasi (`AppLayout.jsx`)

> _As a user, I want a consistent top navigation bar with a brand logo and logout button so that I can navigate between sections easily on both desktop and mobile._

**Acceptance Criteria:**

- [ ] Header direfaktor menggunakan `<nav class="navbar navbar-expand-lg">` Bootstrap.
- [ ] Brand name "MitraFinance" menggunakan `navbar-brand`.
- [ ] Link navigasi (Dashboard, Assets, Snapshots, Users, Audit Logs) menggunakan `nav-link` di dalam `navbar-nav`.
- [ ] Tombol Logout menggunakan `btn btn-outline-danger btn-sm`.
- [ ] Navbar collapsible di viewport < 992px menggunakan `navbar-toggler` (hamburger menu).
- [ ] Nama user yang login ditampilkan di area navbar kanan dengan class `text-muted`.
- [ ] Class kustom `.container`, `.header`, `.header-actions`, `.nav` dihapus dari komponen ini.

---

#### Story 3 — Halaman Login (`LoginPage.jsx`)

> _As a user, I want a centered login form with clear input fields and error feedback so that I can authenticate without confusion._

**Acceptance Criteria:**

- [ ] Halaman login menggunakan `d-flex min-vh-100 align-items-center justify-content-center` untuk centering.
- [ ] Form card menggunakan `card`, `card-body` dengan lebar maksimum `360px`.
- [ ] Input email dan password menggunakan `form-control` dengan label `form-label`.
- [ ] Tombol submit menggunakan `btn btn-primary w-100`.
- [ ] Pesan error ditampilkan menggunakan `alert alert-danger` (bukan hanya `<p class="error">`).
- [ ] Class kustom `.login-container`, `.card`, `.error` dihapus dari komponen ini.

---

#### Story 4 — Dashboard (`DashboardPage.jsx`)

> _As a user, I want the dashboard to display financial metrics in clearly separated cards so that I can understand my net worth and growth at a glance._

**Acceptance Criteria:**

- [ ] Section header (judul & range) menggunakan Bootstrap `row` dan `col` system.
- [ ] Empat metrik (Total Net Worth, Pertumbuhan Rp, Perubahan 30 Hari, Perubahan Snapshot) masing-masing ditampilkan dalam `card` terpisah menggunakan grid `row row-cols-2 row-cols-md-4`.
- [ ] Chart Line net worth dibungkus dalam `card` dengan judul `card-title`.
- [ ] Tabel Summary Assets menggunakan `table table-bordered table-hover table-sm table-responsive`.
- [ ] Class kustom `.dashboard-metrics-grid`, `.dashboard-heading-grid`, `.dashboard-metric-item`, `.dashboard-chart-wrapper`, `.dashboard-chart-canvas`, `.dashboard-table-wrapper` dihapus.

---

#### Story 5 — Halaman Assets (`AssetsPage`)

> _As a user, I want to add a new asset via a modal form and view all my assets in a table so that I can manage my financial portfolio without losing context of the existing data._

**Acceptance Criteria:**

- [ ] Tombol **"+ Add Asset"** ditampilkan di atas tabel menggunakan `btn btn-primary` dengan atribut `data-bs-toggle="modal"` dan `data-bs-target="#addAssetModal"`.
- [ ] Form create dipindahkan ke dalam **Bootstrap Modal** dengan struktur `modal > modal-dialog > modal-content > modal-header + modal-body + modal-footer`.
- [ ] `modal-header` berisi judul "Add New Asset" dan tombol `btn-close` (`data-bs-dismiss="modal"`).
- [ ] `modal-body` berisi field form:
  - Input **Name** menggunakan `form-control` dengan `form-label`.
  - Select **Category** menggunakan `form-select` dengan `form-label`.
- [ ] `modal-footer` berisi tombol **Cancel** (`btn btn-secondary`, `data-bs-dismiss="modal"`) dan tombol **Save** (`btn btn-primary`, type `submit`).
- [ ] Setelah submit berhasil, modal ditutup secara programatik via `bootstrap.Modal.getInstance(el).hide()`.
- [ ] Form di-reset ke nilai kosong setiap kali modal dibuka.
- [ ] Pesan error ditampilkan di dalam `modal-body` menggunakan `alert alert-danger`.
- [ ] Tabel daftar aset menggunakan `table table-bordered table-hover table-sm` di luar modal.
- [ ] Class kustom `.row` (form), `.card` digantikan class Bootstrap.

---

#### Story 6 — Halaman Snapshots (`SnapshotsPage.jsx`)

> _As a user, I want to add a new snapshot via a modal form and delete old ones so that I can track asset value changes over time without disrupting my view of the snapshot table._

**Acceptance Criteria:**

- [ ] Tombol **"+ Add Snapshot"** ditampilkan di atas tabel menggunakan `btn btn-primary` dengan atribut `data-bs-toggle="modal"` dan `data-bs-target="#addSnapshotModal"`.
- [ ] Form create dipindahkan ke dalam **Bootstrap Modal** dengan struktur `modal > modal-dialog > modal-content > modal-header + modal-body + modal-footer`.
- [ ] `modal-header` berisi judul "Add New Snapshot" dan tombol `btn-close`.
- [ ] `modal-body` berisi field form:
  - Select **Asset** menggunakan `form-select` dengan `form-label`.
  - Input **Date** (`type="date"`) menggunakan `form-control` dengan `form-label`.
  - Input **Value** (`type="number"`, `step="0.01"`) menggunakan `form-control` dengan `form-label`.
- [ ] `modal-footer` berisi tombol **Cancel** (`btn btn-secondary`) dan **Save** (`btn btn-primary`).
- [ ] Setelah submit berhasil, modal ditutup via `bootstrap.Modal.getInstance(el).hide()` dan tabel di-refresh.
- [ ] Form di-reset ke nilai kosong setiap kali modal dibuka.
- [ ] Pesan error ditampilkan di dalam `modal-body` menggunakan `alert alert-danger`.
- [ ] Tombol "Delete" di setiap baris tabel menggunakan `btn btn-danger btn-sm`.
- [ ] Tabel menggunakan `table table-bordered table-hover table-sm table-responsive`.
- [ ] Class kustom `.row`, `.card`, `.error` dihapus.

---

#### Story 7 — Halaman Users (`UsersPage.jsx`)

> _As an admin, I want to create a new user via a modal form and view all users in a table so that I can manage access without losing context of the user list._

**Acceptance Criteria:**

- [ ] Tombol **"+ Add User"** ditampilkan di atas tabel menggunakan `btn btn-primary` dengan atribut `data-bs-toggle="modal"` dan `data-bs-target="#addUserModal"`.
- [ ] Form create dipindahkan ke dalam **Bootstrap Modal** dengan struktur `modal > modal-dialog > modal-content > modal-header + modal-body + modal-footer`.
- [ ] `modal-header` berisi judul "Add New User" dan tombol `btn-close`.
- [ ] `modal-body` berisi field form:
  - Input **Name** menggunakan `form-control` dengan `form-label`.
  - Input **Email** (`type="email"`) menggunakan `form-control` dengan `form-label`.
  - Input **Password** (`type="password"`, `minLength={8}`) menggunakan `form-control` dengan `form-label`.
  - Select **Role** (`user` / `admin`) menggunakan `form-select` dengan `form-label`.
- [ ] `modal-footer` berisi tombol **Cancel** (`btn btn-secondary`) dan **Save** (`btn btn-primary`).
- [ ] Setelah submit berhasil, modal ditutup via `bootstrap.Modal.getInstance(el).hide()`, form di-reset, dan tabel di-refresh.
- [ ] Pesan error ditampilkan di dalam `modal-body` menggunakan `alert alert-danger`.
- [ ] Tabel menggunakan `table table-bordered table-sm table-responsive`.

---

#### Story 8 — Halaman Audit Logs (`LogsPage.jsx`)

> _As an admin, I want to see audit logs in a readable table so that I can monitor user activity._

**Acceptance Criteria:**

- [ ] Tabel menggunakan `table table-bordered table-hover table-sm table-responsive`.
- [ ] 6 kolom tetap ada: Date, User, Action, Entity, Entity ID, IP.
- [ ] Class kustom `.card`, `.table-responsive` digantikan Bootstrap.

---

### Non-Goals

Hal-hal berikut **tidak termasuk** dalam scope refactor ini:

| #   | Non-Goal                                                | Alasan                                                      |
| --- | ------------------------------------------------------- | ----------------------------------------------------------- |
| 1   | Instalasi Bootstrap via npm (`npm install bootstrap`)   | Scope ini eksplisit menggunakan CDN                         |
| 2   | Migrasi ke React-Bootstrap atau Reactstrap              | Hanya Bootstrap vanilla class, tidak menambah library React |
| 3   | Perubahan logic bisnis, API call, atau state management | Murni perubahan presentasi / markup                         |
| 4   | Penambahan fitur baru (edit aset, export data, dll)     | Di luar scope refactor                                      |
| 5   | Dark mode                                               | Tidak diminta dalam brief ini                               |
| 6   | Animasi & transisi kustom                               | Cukup menggunakan transisi default Bootstrap                |
| 7   | Penghapusan Chart.js                                    | Library charting tetap dipertahankan                        |

---

## 3. Technical Specifications

### Architecture Overview

```
index.html (entry point)
├── <link> Bootstrap 5.3.8 CSS (CDN)          ← BARU
├── <script> Bootstrap 5.3.8 bundle JS (CDN)  ← BARU  (diperlukan untuk Modal JS)
├── /src/styles.css (override minimal only)   ← DIPANGKAS
└── React App
    ├── AppLayout.jsx       → navbar, container-fluid           ← DIREFAKTOR
    ├── LoginPage.jsx       → card, form-control                ← DIREFAKTOR
    ├── DashboardPage.jsx   → card, grid, table                 ← DIREFAKTOR
    ├── AssetsPage          → btn trigger + Modal + table        ← DIREFAKTOR
    │   └── #addAssetModal  → modal-dialog, form-control
    ├── SnapshotsPage.jsx   → btn trigger + Modal + table        ← DIREFAKTOR
    │   └── #addSnapshotModal → modal-dialog, form-control
    ├── UsersPage.jsx       → btn trigger + Modal + table        ← DIREFAKTOR
    │   └── #addUserModal   → modal-dialog, form-control
    └── LogsPage.jsx        → table                             ← DIREFAKTOR
```

**Pola Modal yang digunakan (React + Bootstrap JS vanilla):**

```jsx
import { useRef } from "react";

// Ref ke elemen modal DOM
const modalRef = useRef(null);

// Tutup modal setelah submit berhasil
const closeModal = () => {
  const modal = window.bootstrap.Modal.getInstance(modalRef.current);
  modal?.hide();
};

// Reset form saat modal ditutup (event Bootstrap)
// modalRef.current.addEventListener("hidden.bs.modal", resetForm);
```

> **Catatan:** Karena React tidak mengontrol Bootstrap Modal melalui state, penutupan modal dilakukan via DOM API `bootstrap.Modal.getInstance()`. Gunakan `useEffect` cleanup untuk menghapus event listener `hidden.bs.modal`.

### CDN Integration (index.html)

```html
<!-- Bootstrap CSS — di dalam <head> -->
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
/>

<!-- Bootstrap JS Bundle (Popper.js included) — sebelum </body> -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/js/bootstrap.bundle.min.js"></script>
```

### Class Mapping: Custom CSS → Bootstrap

Tabel ini adalah panduan migrasi setiap class kustom ke ekuivalen Bootstrap:

| Class Kustom Lama          | Bootstrap 5 Pengganti                                                   | Berlaku Di                           |
| -------------------------- | ----------------------------------------------------------------------- | ------------------------------------ |
| `.container`               | `container` atau `container-fluid`                                      | AppLayout                            |
| `.header`                  | `navbar navbar-expand-lg bg-white border-bottom`                        | AppLayout                            |
| `.header-actions`          | `d-flex align-items-center gap-2`                                       | AppLayout                            |
| `.nav` (link bar)          | `navbar-nav`                                                            | AppLayout                            |
| `.main`                    | `py-3` (wrapper `<main>`)                                               | AppLayout                            |
| `.card`                    | `card card-body`                                                        | Semua halaman                        |
| `.login-container`         | `d-flex min-vh-100 align-items-center justify-content-center`           | LoginPage                            |
| `.row` (form grid inline)  | Dihapus — form dipindahkan ke Bootstrap Modal                           | AssetsPage, SnapshotsPage, UsersPage |
| _(tidak ada)_              | `modal modal-dialog modal-content modal-header modal-body modal-footer` | AssetsPage, SnapshotsPage, UsersPage |
| _(tombol trigger)_         | `btn btn-primary` + `data-bs-toggle="modal"`                            | AssetsPage, SnapshotsPage, UsersPage |
| `.error`                   | `alert alert-danger py-2`                                               | LoginPage, SnapshotsPage, UsersPage  |
| `.table-responsive`        | `table-responsive` (Bootstrap built-in)                                 | LogsPage, DashboardPage, UsersPage   |
| `table` (unstyled)         | `table table-bordered table-hover table-sm`                             | Semua halaman                        |
| `.dashboard-metrics-grid`  | `row row-cols-2 row-cols-md-4 g-3`                                      | DashboardPage                        |
| `.dashboard-heading-grid`  | `row align-items-center mb-3`                                           | DashboardPage                        |
| `.dashboard-chart-wrapper` | `mb-3`                                                                  | DashboardPage                        |
| `.dashboard-chart-canvas`  | inline style `height: 280px` dipertahankan                              | DashboardPage                        |
| `button` (unstyled)        | `btn btn-primary` / `btn btn-danger btn-sm` / `btn btn-outline-danger`  | Semua halaman                        |

### Residual styles.css (setelah migrasi)

Hanya override berikut yang boleh tetap ada di [frontend/src/styles.css](frontend/src/styles.css):

```css
/* Override: pastikan chart canvas punya tinggi eksplisit */
.dashboard-chart-canvas {
  min-height: 280px;
}

/* Override: NavLink active state sesuai warna brand */
.navbar-nav .active {
  font-weight: 600;
  color: #0d6efd !important;
}
```

Semua rule lain dihapus.

### Integration Points

| Komponen              | Dependency                    | Perubahan                                                 |
| --------------------- | ----------------------------- | --------------------------------------------------------- |
| `index.html`          | Bootstrap CDN                 | Tambah `<link>` & `<script>`                              |
| `styles.css`          | (self)                        | Pangkas 70%+ dari current content                         |
| `AppLayout.jsx`       | `react-router-dom` NavLink    | Tambah Bootstrap class, pertahankan routing logic         |
| Chart (DashboardPage) | `chart.js`, `react-chartjs-2` | Tidak berubah; hanya wrapper div mendapat Bootstrap class |
| Form pages            | Axios via `api.js`            | Tidak berubah; hanya markup HTML class                    |

### Security & Privacy

- Bootstrap CDN dimuat dari `cdn.jsdelivr.net` (Subresource Integrity / SRI hash **direkomendasikan** untuk produksi).
- Tidak ada data pengguna yang dikirim ke CDN; Bootstrap adalah asset statis.
- SRI hash Bootstrap 5.3.8 (opsional tapi best practice):
  ```html
  <link
    rel="stylesheet"
    href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.8/dist/css/bootstrap.min.css"
    integrity="sha384-..."
    crossorigin="anonymous"
  />
  ```
  > Hash lengkap dapat diperoleh dari https://www.jsdelivr.com/package/npm/bootstrap saat implementasi.

---

## 4. AI System Requirements

_Tidak applicable — refactor ini tidak melibatkan AI/ML inference._

---

## 5. Risks & Roadmap

### Technical Risks

| #   | Risiko                                                                              | Dampak                       | Mitigasi                                                                                           |
| --- | ----------------------------------------------------------------------------------- | ---------------------------- | -------------------------------------------------------------------------------------------------- |
| 1   | Bootstrap class conflict dengan class kustom yang tersisa                           | Medium — visual glitch       | Audit penuh semua class sebelum & sesudah migrasi                                                  |
| 2   | NavLink active style dari React Router tidak terdeteksi oleh Bootstrap              | Low — styling                | Override eksplisit `.active` class di residual CSS                                                 |
| 3   | CDN unavailable di environment tertentu (offline / restricted network)              | Medium — page loads unstyled | Dokumentasikan fallback: jalankan `npm install bootstrap` jika CDN tidak tersedia                  |
| 4   | Chart.js `maintainAspectRatio: false` membutuhkan height eksplisit pada parent      | Low — chart collapse         | Pertahankan `.dashboard-chart-canvas { min-height: 280px }` di CSS                                 |
| 5   | Bootstrap grid `.row` conflicts dengan class `.row` lama di form                    | High — layout breakdown      | Inline form row sudah dihapus (dipindah ke Modal), sehingga konflik ini tidak relevan lagi         |
| 6   | Modal Bootstrap tidak ter-trigger jika `bootstrap.bundle.min.js` belum dimuat       | High — modal tidak terbuka   | Pastikan `<script>` CDN Bootstrap JS ada di `index.html` sebelum React app bundle                  |
| 7   | Memory leak: event listener `hidden.bs.modal` tidak di-cleanup di React             | Medium — memory leak         | Gunakan `useEffect` dengan return cleanup `removeEventListener` pada setiap `modalRef`             |
| 8   | Modal tidak menutup otomatis jika submit API gagal (error path)                     | Low — UX confusion           | Jangan panggil `modal.hide()` pada catch block; tampilkan error di dalam `modal-body`              |
| 9   | `bootstrap.Modal.getInstance()` mengembalikan `null` jika modal belum pernah dibuka | Low — null reference error   | Gunakan optional chaining `modal?.hide()` atau inisialisasi `new bootstrap.Modal(el)` saat pertama |

---

### Phased Rollout

#### Phase 1 — Foundation (MVP)

**Scope:** CDN setup + AppLayout refactor

**Deliverables:**

- [ ] CDN Bootstrap ditambahkan ke [frontend/index.html](frontend/index.html)
- [ ] [frontend/src/layouts/AppLayout.jsx](frontend/src/layouts/AppLayout.jsx) direfaktor ke `navbar` Bootstrap
- [ ] `styles.css` dibersihkan dari rule yang sudah di-cover Bootstrap

**Definition of Done:** Navigasi antar halaman berfungsi, navbar hamburger berfungsi di mobile.

---

#### Phase 2 — Auth & Dashboard

**Scope:** LoginPage + DashboardPage

**Deliverables:**

- [ ] [frontend/src/features/auth/LoginPage.jsx](frontend/src/features/auth/LoginPage.jsx) menggunakan Bootstrap card + form
- [ ] [frontend/src/features/dashboard/DashboardPage.jsx](frontend/src/features/dashboard/DashboardPage.jsx) menggunakan Bootstrap grid + card + table
- [ ] `LoginPage.test.jsx` tetap passing

**Definition of Done:** Login form dapat submit, dashboard menampilkan chart dan tabel dengan layout Bootstrap.

---

#### Phase 3 — CRUD Pages + Modal Forms

**Scope:** AssetsPage + SnapshotsPage + UsersPage + LogsPage

**Deliverables:**

- [ ] Form create pada **AssetsPage**, **SnapshotsPage**, dan **UsersPage** dipindahkan ke Bootstrap Modal
- [ ] Masing-masing halaman memiliki tombol trigger `+ Add [Entity]` dengan `data-bs-toggle="modal"`
- [ ] Modal berisi `modal-header`, `modal-body` (form), dan `modal-footer` (Cancel + Save)
- [ ] Modal menutup secara programatik via `bootstrap.Modal.getInstance(el).hide()` pada submit sukses
- [ ] Form di-reset setiap kali modal ditutup via event `hidden.bs.modal`
- [ ] Error ditampilkan di dalam `modal-body` menggunakan `alert alert-danger`
- [ ] Semua tabel menggunakan `table table-bordered table-hover table-sm table-responsive`
- [ ] Tombol Delete menggunakan `btn btn-danger btn-sm`
- [ ] `useEffect` cleanup event listener `hidden.bs.modal` pada setiap komponen yang pakai modal

**Definition of Done:** Semua CRUD create operations berfungsi via modal, modal menutup otomatis pada sukses, error ditampilkan di dalam modal, tidak ada regresi fungsional.

---

#### Phase 4 — Polish & Cleanup (v1.0 Final)

**Scope:** Finalisasi residual CSS + responsive QA

**Deliverables:**

- [ ] `styles.css` hanya berisi override minimal (≤ 15 baris)
- [ ] QA manual di viewport: 320px, 768px, 1280px
- [ ] Lighthouse Accessibility score ≥ 90 pada Login, Dashboard, Assets
- [ ] Dokumentasi class mapping diperbarui di repo

**Definition of Done:** Tidak ada class kustom duplikat dengan Bootstrap, semua halaman responsive.

---

## 6. File Change Summary

| File                                                                                                   | Jenis Perubahan                                                      |
| ------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| [frontend/index.html](frontend/index.html)                                                             | Tambah CDN `<link>` & `<script>` Bootstrap                           |
| [frontend/src/styles.css](frontend/src/styles.css)                                                     | Hapus 70%+ rule, sisakan override minimal                            |
| [frontend/src/layouts/AppLayout.jsx](frontend/src/layouts/AppLayout.jsx)                               | Refactor ke Bootstrap navbar                                         |
| [frontend/src/features/auth/LoginPage.jsx](frontend/src/features/auth/LoginPage.jsx)                   | Refactor ke Bootstrap card + form                                    |
| [frontend/src/features/dashboard/DashboardPage.jsx](frontend/src/features/dashboard/DashboardPage.jsx) | Refactor ke Bootstrap grid + card + table                            |
| [frontend/src/features/assets/AssetsPage.js](frontend/src/features/assets/AssetsPage.js)               | Hapus inline form, tambah tombol trigger + Modal `#addAssetModal`    |
| [frontend/src/features/snapshots/SnapshotsPage.jsx](frontend/src/features/snapshots/SnapshotsPage.jsx) | Hapus inline form, tambah tombol trigger + Modal `#addSnapshotModal` |
| [frontend/src/features/users/UsersPage.jsx](frontend/src/features/users/UsersPage.jsx)                 | Hapus inline form, tambah tombol trigger + Modal `#addUserModal`     |
| [frontend/src/features/users/LogsPage.jsx](frontend/src/features/users/LogsPage.jsx)                   | Refactor ke Bootstrap table                                          |

---

_PRD ini adalah living document. Setiap perubahan scope harus disetujui oleh project owner sebelum implementasi dimulai._
