# Spesifikasi Desain Halaman — Dashboard Berita (Redesign)

## 1) Tujuan
- Menghadirkan Dashboard Berita yang konsisten dengan tema/branding website.
- Menyediakan 3 mode tampilan (List / Grid / Table) yang responsif (desktop-first) dan stabil.
- Menangani state loading/empty/error secara jelas dan ramah aksesibilitas.

---

## 2) Layout
- Pendekatan: desktop-first.
- Sistem layout: kombinasi CSS Grid (untuk grid kartu) dan Flexbox (untuk header/toolbar).
- Kontainer halaman:
  - Max width: mengikuti container global website (mis. 1200–1440px) dengan padding responsif.
  - Spacing: gunakan skala spacing token global (mis. 4/8/12/16/24/32px).
- Responsif:
  - Desktop (>=1024px): toolbar horizontal; table ditampilkan optimal.
  - Tablet (>=768px dan <1024px): grid kolom berkurang; table tetap usable.
  - Mobile (<768px): default ke List atau Grid 1 kolom; Table diubah ke scroll horizontal aman atau dihindari sebagai default.

---

## 3) Meta Information
- Title: "Dashboard Berita" 
- Description: "Kelola dan pantau daftar berita dalam tampilan list, grid, atau tabel." 
- Open Graph:
  - og:title: "Dashboard Berita"
  - og:description: sama seperti description
  - og:type: "website"

---

## 4) Global Styles (Design Tokens)
Catatan: jika website sudah memiliki design system, gunakan token existing sebagai sumber kebenaran; nilai di bawah berfungsi sebagai referensi struktur token.

- Warna:
  - Background: neutral-0 / neutral-50
  - Surface (card/table): neutral-0
  - Border/divider: neutral-200
  - Text primary: neutral-900
  - Text secondary: neutral-600
  - Brand primary: brand-600 (untuk tombol utama/indikator aktif)
  - Focus ring: brand-500 (outline fokus terlihat)
  - State:
    - Info: blue-600
    - Error: red-600
- Tipografi:
  - H1 halaman: 20–24px, semibold
  - Body: 14–16px
  - Caption/metadata: 12–13px
- Komponen interaksi:
  - Button: tinggi 36–40px, radius konsisten dengan sistem (mis. 8px)
  - Hover: perubahan background/outline halus, tetap memenuhi kontras
  - Link: underline on hover/focus, warna brand
- Motion:
  - Transisi ringan (150–200ms) untuk hover/active.
  - Hormati prefers-reduced-motion: nonaktifkan animasi non-esensial.

---

## 5) Struktur Halaman (Page Structure)
Pola: stacked sections.
1. Top spacing (mengikuti layout global website)
2. Page Header
3. Toolbar (kontrol mode tampilan)
4. Content Area (List/Grid/Table + state handler)

---

## 6) Sections & Components

### 6.1 Page Header
- Elemen:
  - Judul: "Dashboard Berita"
  - (Opsional) Deskripsi singkat 1 baris (jika pola website umum memakai subtitle).
- Perilaku:
  - Judul selalu terlihat dan menjadi anchor konteks untuk screen reader.

### 6.2 Toolbar — View Switcher (List / Grid / Table)
- Komponen: segmented control / toggle group.
- Isi:
  - 3 tombol: "List", "Grid", "Table".
- Interaksi:
  - Klik atau keyboard mengubah mode tampilan.
  - Status aktif jelas (warna brand + teks/ikon + indikator).
- Aksesibilitas:
  - Gunakan pola ARIA untuk toggle group (mis. role="tablist" + tab, atau aria-pressed pada button) secara konsisten.
  - Fokus keyboard berurutan; outline fokus tidak dihilangkan.

### 6.3 Content Area — Mode Tampilan
Semua mode menampilkan dataset yang sama, hanya presentasi yang berbeda.

#### A) Mode List
- Layout: list vertikal, tiap item berupa row/card tipis.
- Elemen per item (minimal, tanpa menambah fitur baru):
  - Judul berita (primary)
  - Metadata ringkas (secondary) jika tersedia (mis. tanggal/kategori/penulis) — tampilkan hanya bila memang sudah ada di data.
- Responsif:
  - Mobile: 1 kolom, padding lebih rapat.

#### B) Mode Grid
- Layout: CSS Grid.
- Kolom:
  - Desktop: 3–4 kolom (bergantung lebar container)
  - Tablet: 2–3 kolom
  - Mobile: 1 kolom
- Kartu:
  - Surface putih, border halus, radius konsisten.
  - Judul dan metadata, dengan clamp 2–3 baris untuk mencegah card tinggi tidak stabil.

#### C) Mode Table
- Layout: tabel semantik.
- Struktur:
  - thead dengan label kolom
  - tbody berisi baris berita
- Responsif:
  - Desktop: full table.
  - Mobile: aktifkan scroll horizontal pada wrapper (overflow-x: auto) dengan indikator visual halus agar tidak “terlihat rusak”.
- Aksesibilitas:
  - Gunakan <table>, <th scope="col">, dan urutan fokus yang jelas.

---

## 7) State UI (Loading / Empty / Error)
State harus konsisten antar mode tampilan dan tidak mengubah layout secara drastis.

### 7.1 Loading
- Tampilkan skeleton sesuai mode:
  - List: 6–10 skeleton rows
  - Grid: 6–8 skeleton cards
  - Table: skeleton header + beberapa baris
- Aksesibilitas:
  - Tambahkan teks tersembunyi (sr-only) seperti "Memuat daftar berita".
  - Hindari animasi berlebihan; patuhi prefers-reduced-motion.

### 7.2 Empty
- Tampilan:
  - Ikon/ilustrasi sederhana (opsional) + judul: "Belum ada berita"
  - Deskripsi: jelaskan bahwa data tidak tersedia.
  - Tombol aman: "Muat ulang" (retry fetch) bila sesuai dengan pola website.
- Aksesibilitas:
  - Pastikan pesan empty dapat dibaca screen reader (tidak hanya visual).

### 7.3 Error
- Tampilan:
  - Alert/banner dengan teks: "Gagal memuat berita" + penjelasan singkat.
  - Tombol: "Coba lagi" untuk memicu retry.
- Aksesibilitas:
  - Gunakan aria-live="polite" atau role="alert" untuk pengumuman error.
  - Fokus dapat diarahkan ke alert saat error pertama kali muncul (opsional, jangan mengganggu bila sering terjadi).

---

## 8) Aksesibilitas (Checklist Implementasi)
- Navigasi keyboard:
  - Semua kontrol (view switcher) dan item list bisa difokuskan.
  - Fokus terlihat (focus ring warna brand) dan kontras cukup.
- Kontras warna:
  - Teks utama vs background memenuhi standar WCAG (minimal 4.5:1 untuk teks normal).
- Semantik:
  - Table benar-benar menggunakan elemen tabel.
  - Heading hierarchy: H1 untuk judul halaman.
- Screen reader:
  - Label tombol jelas (mis. "Tampilkan sebagai Grid").
  - State loading/empty/error diumumkan dengan tepat.
- Target sentuh:
  - Ukuran interaktif minimal ~44px pada mobile.
- Reduced motion:
  - Nonaktifkan shimmer/animasi jika prefers-reduced-motion aktif.

---

## 9) Responsive Behavior (Ringkasan)
- Desktop: Table sebagai mode paling informatif; Grid menampilkan banyak item; List untuk pemindaian cepat.
- Mobile: Default disarankan ke List atau Grid 1 kolom; Table tetap tersedia namun dengan scroll horizontal aman.
- Semua state (loading/empty/error) harus tetap rapi dan terbaca di semua breakpoint.
