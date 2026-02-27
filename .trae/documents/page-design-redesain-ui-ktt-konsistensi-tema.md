# Desain Halaman — Redesain UI KTT (Konsistensi Tema)

## 1) Pendekatan desain (desktop-first)
- Target utama: tampilan desktop rapi (max-width), lalu diturunkan ke tablet dan mobile dengan reflow grid.
- Pola visual: “clean cards” dengan gradient lembut + shadow bertingkat, sehingga selaras dengan elemen aplikasi lain.

## 2) Global Styles (Design Tokens)
> Nama token di bawah bersifat rekomendasi; sesuaikan dengan token/tema aplikasi yang sudah ada.

### 2.1 Palet warna
- **Primary**: warna brand utama (untuk CTA, link utama, highlight).
- **Secondary**: pendukung untuk chip/tag/aksen.
- **Surface**: 
  - Surface-0 (page background), Surface-1 (card), Surface-2 (raised).
- **Text**:
  - Text-Strong (judul), Text (body), Text-Muted (meta/caption).
- **Accent/Status**: success/warning/danger/info (jika sudah ada di aplikasi).
- **Gradient** (untuk card header/hero):
  - `gradientPrimary`: Primary 600 → Primary 400 (opacity halus) atau Primary → Secondary (sangat subtle).

### 2.2 Tipografi
- Font mengikuti aplikasi.
- Skala (rekomendasi desktop):
  - H1: 28–32px / semibold
  - H2: 20–24px / semibold
  - Body: 14–16px / regular
  - Caption/meta: 12–13px / regular
- Line-height: 1.4–1.6 untuk body; 1.2–1.3 untuk heading.

### 2.3 Spacing & radius
- Spacing grid: 8px base (8/16/24/32).
- Radius:
  - Card: 16px (desktop), 14px (tablet), 12px (mobile).
  - Button/input: 10–12px.

### 2.4 Shadow & border
- Border: 1px solid dengan warna outline halus (berbasis Surface).
- Shadow bertingkat:
  - Elevation-1 (default card)
  - Elevation-2 (hover)
  - Elevation-3 (modal/overlay bila ada)

### 2.5 Motion (micro-interactions)
- Durasi transisi: 150–220ms; easing: `ease-out`.
- Hover:
  - Card naik 2–4px + shadow meningkat + outline sedikit lebih tegas.
- Active/pressed:
  - Card/button turun 1px + shadow menurun.
- Focus (keyboard):
  - Focus ring 2px kontras + offset 2px.
- Aksesibilitas:
  - Hormati `prefers-reduced-motion` (kurangi transform/animasi; cukup perubahan warna/shadow).

## 3) Meta Information (Halaman KTT)
- Title: `KTT | [Nama Aplikasi]`
- Description: Ringkas; menjelaskan konten KTT dalam 1 kalimat.
- Open Graph:
  - og:title = Title
  - og:description = Description
  - og:type = website

## 4) Layout (struktur + responsif)
### 4.1 Sistem layout
- **Container**: max-width 1120–1200px, center align, padding horizontal 24px (desktop).
- **Grid**: CSS Grid untuk daftar kartu; Flex untuk header dan bar kontrol.

### 4.2 Breakpoints (rekomendasi)
- Desktop (≥1024): grid 3 kolom (atau 2 jika konten padat), gap 24.
- Tablet (≥768 <1024): grid 2 kolom, gap 16–20.
- Mobile (<768): grid 1 kolom, gap 14–16, padding 16.

## 5) Page Structure — Halaman KTT
### 5.1 Header area
- **Breadcrumb / lokasi halaman** (opsional jika pola aplikasi sudah ada).
- **Judul halaman (H1)**: “KTT”
- **Subjudul (body muted)**: 1 kalimat ringkas.

### 5.2 Hero / highlight section (opsional, jika cocok dengan tema aplikasi)
- Panel lebar penuh container dengan **gradientPrimary** yang sangat halus.
- Isi minimal: judul section (H2) + 1–2 baris penjelasan.
- Visual: rounded besar, shadow tipis, tidak mengganggu konten utama.

### 5.3 Konten utama (grid kartu)
- **KTT Card (komponen utama)**
  - Area atas: judul item (H2/H3), meta (caption), optional badge/tag.
  - Area tengah: ringkasan (2–4 baris, ellipsis jika panjang).
  - Area bawah: aksi utama (button/link) mengikuti pola aplikasi.
- **Gaya kartu**
  - Background: Surface-1.
  - Border: outline halus.
  - Shadow: Elevation-1.
  - Accent: strip/gradient tipis di header kartu (bukan full-bleed) untuk konsistensi.
- **Empty state**
  - Ilustrasi sederhana/ikon + teks “Belum ada data KTT” + arahan singkat.

### 5.4 Footer spacing
- Ruang bawah 32–48px agar halaman terasa “bernapas”.

## 6) Interaction States (ringkas)
- Link:
  - Default: Primary
  - Hover: lebih gelap + underline halus
  - Focus: ring jelas
- Button:
  - Default/hover/active mengikuti sistem aplikasi; pastikan kontras.
- Card:
  - Hover: elevate + shadow naik + border sedikit lebih tegas
  - Active: sedikit “pressed”
  - Focus-within: outline/focus ring saat navigasi keyboard

## 7) Checklist konsistensi
- Warna: semua memakai token, tidak hardcode.
- Tipografi: heading/body/meta konsisten.
- Spacing: konsisten antar section.
- Shadow/gradient: hanya 1–2 gaya utama, tidak bercabang.
- Micro-interactions: konsisten durasi/easing + ada fallback reduced-motion.
