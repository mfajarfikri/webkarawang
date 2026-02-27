# Spesifikasi Desain Singkat — Redesain UI Home (Desktop-first)

## 1) Tujuan
Membuat tampilan halaman Home konsisten secara visual dengan halaman lain melalui:
- Palet warna yang terstandardisasi
- Tipografi dengan skala yang jelas
- Spacing & grid yang rapi
- Komponen reusable dengan varian & state
- Responsif yang terukur (desktop-first)

## 2) Meta Information (Home)
- Title: "Home" (ikuti pola penamaan title halaman lain)
- Description: Ringkasan 1 kalimat tentang isi Home (konsisten dengan halaman lain)
- Open Graph:
  - og:title: Sama dengan title
  - og:description: Sama dengan description
  - og:type: website

## 3) Global Styles (Design Tokens)
> Catatan: token di bawah dimaksudkan untuk dipakai konsisten pada Home dan dapat disejajarkan dengan token yang sudah dipakai halaman lain.

### 3.1 Palet Warna (disarankan berbasis token)
- `--color-bg`: Latar utama halaman
- `--color-surface`: Latar kartu/section
- `--color-text`: Teks utama
- `--color-text-muted`: Teks sekunder
- `--color-border`: Garis pemisah/border halus
- `--color-primary`: Aksi utama (CTA)
- `--color-primary-hover`
- `--color-primary-active`
- `--color-focus`: Outline fokus (keyboard)
- `--color-danger` (opsional bila ada state error)

Aturan penggunaan:
- Surface (kartu) harus kontras halus terhadap background (via perbedaan tone, bukan hanya border).
- Warna primary hanya untuk aksi utama/tautan penting; gunakan netral untuk aksi sekunder.
- Semua interactive element wajib punya state: default, hover, active, focus-visible, disabled.

### 3.2 Tipografi
Gunakan 1 keluarga font yang sama dengan halaman lain.

Skala (contoh token):
- `--font-size-h1`, `--line-height-h1`, `--font-weight-h1`
- `--font-size-h2` …
- `--font-size-body`
- `--font-size-small`

Aturan:
- Heading: maksimal 2 tingkat heading dominan per layar untuk menjaga hierarchy.
- Body: line-height nyaman untuk baca; batasi panjang baris (mis. 60–80 karakter) pada area teks panjang.

### 3.3 Spacing & Radius
- Skala spacing berbasis 4px atau 8px (pilih yang paling mendekati standar halaman lain).
  - Contoh: 4, 8, 12, 16, 24, 32, 48, 64
- Radius:
  - `--radius-sm`, `--radius-md`, `--radius-lg` (konsisten untuk kartu & tombol)

### 3.4 Elevation / Shadow
- Gunakan shadow minimalis untuk membedakan surface dari background.
- Hindari variasi shadow yang terlalu banyak; cukup 1–2 level.

### 3.5 Interaksi
- Transisi: 150–200ms untuk hover/focus (opacity/transform ringan).
- Fokus: gunakan `:focus-visible` dengan outline yang jelas (warna token `--color-focus`).

## 4) Layout System & Responsif
### 4.1 Breakpoints (desktop-first)
- Desktop: ≥ 1024px (default desain)
- Tablet: 768–1023px
- Mobile: ≤ 767px

### 4.2 Container & Grid
- Container desktop: lebar maksimum mengikuti pola halaman lain (mis. 1120–1200px), center aligned.
- Padding container:
  - Desktop: 24–32px
  - Tablet: 20–24px
  - Mobile: 16px
- Grid:
  - Desktop: 12 kolom
  - Tablet: 8 kolom
  - Mobile: 4 kolom

Aturan responsif:
- Card grid: 3 kolom (desktop) → 2 kolom (tablet) → 1 kolom (mobile).
- Section spacing dipadatkan di mobile (turunkan satu tingkat skala spacing).

## 5) Struktur Halaman Home (Page Structure)
Pola: stacked sections (vertikal) dengan ritme spacing konsisten dan surface berbeda untuk memisahkan area.

Urutan section (tingkat tinggi):
1. Global Navigation (mengikuti layout halaman lain)
2. Hero / Header Section (judul + ringkasan + CTA utama)
3. Content Sections (berbasis card/list, mengikuti kebutuhan konten yang sudah ada)
4. Footer (mengikuti halaman lain)

> Jika Home saat ini memiliki section spesifik (mis. banner, highlight, daftar item), semua section tersebut tetap ada—yang berubah adalah presentasi visual dan konsistensi komponen.

## 6) Sections & Components (Reusable)

### 6.1 App Header / Navigation
- Layout: flex row
  - Kiri: logo/brand
  - Tengah/kanan: item navigasi
  - Kanan: CTA/akun (jika ada)
- State:
  - Active route: jelas (warna/underline)
  - Hover & focus-visible: konsisten
- Responsif:
  - Tablet/mobile: navigasi jadi menu (ikon) atau wrap; jaga tinggi header stabil.

### 6.2 Hero Section
- Elemen:
  - H1 (judul utama)
  - Deskripsi singkat (body)
  - CTA utama (Primary Button)
  - CTA sekunder (Link Button / Secondary Button)
- Layout:
  - Desktop: dua kolom (teks + visual/ilustrasi bila ada)
  - Mobile: stack, CTA full-width

### 6.3 Section Header (Komponen)
Komponen reusable untuk semua section konten:
- Judul section (H2/H3)
- Deskripsi singkat (opsional)
- Aksi kanan (mis. "Lihat semua" berupa link)

### 6.4 Card (Komponen)
Kartu sebagai surface utama untuk konten:
- Struktur:
  - Header (judul)
  - Body (ringkasan)
  - Footer (aksi: link/tombol)
- Varian:
  - Default (surface + border halus)
  - Clickable (hover: elevasi ringan / border lebih kontras)
- State:
  - Hover: perubahan border/shadow
  - Focus-visible: outline

### 6.5 Button (Komponen)
- Varian:
  - Primary (CTA utama)
  - Secondary (aksi pendamping)
  - Tertiary/Link (aksi ringan)
- Ukuran:
  - Default + Compact (opsional)
- Aturan:
  - Tinggi tombol konsisten
  - Disabled jelas namun tetap terbaca

### 6.6 Link
- Gaya link konsisten (warna primary atau text + underline on hover).
- Fokus keyboard wajib terlihat.

### 6.7 Divider & Spacing Utilities
- Divider untuk pemisah antar blok bila diperlukan.
- Gunakan spacing token; hindari margin/padding “acak”.

### 6.8 Footer
- Konsisten dengan halaman lain (warna surface, tipografi kecil, link).
- Responsif: stack kolom.

## 7) Checklist Konsistensi (Acceptance)
- Palet warna Home = palet halaman lain (token sama, state sama).
- Skala tipografi Home mengikuti hierarchy yang sama (H1/H2/body/caption).
- Spacing antar section konsisten (menggunakan token, bukan nilai bebas).
- Semua komponen interaktif punya hover/focus/active/disabled.
- Layout tetap rapi di desktop/tablet/mobile sesuai aturan grid.
