# Spesifikasi Desain Singkat — Redesain UI Gardu Induk (Desktop-first)

## 1) Tujuan
Menyamakan tampilan halaman Gardu Induk (Website & Dashboard) dengan tema aplikasi yang sudah berjalan melalui standardisasi palet, tipografi, komponen reusable, dan perilaku responsif.

## 2) Global Styles (Design Tokens)
> Prinsip: gunakan token yang bisa dipetakan ke kelas Tailwind yang sudah dominan di aplikasi (cyan/sky/blue, slate/gray).

### 2.1 Palet Warna (token → Tailwind yang disarankan)
- Background
  - `--bg`: `slate-50` (dashboard), `white`/`slate-50` (website)
  - `--surface`: `white`
  - `--border`: `gray-100`–`gray-200`
- Brand/Primary (selaraskan dengan dashboard active state yang memakai cyan/sky)
  - `--primary`: `cyan-600`
  - `--primary-hover`: `cyan-700`
  - `--primary-soft`: `sky-50`
  - `--primary-gradient`: `from-cyan-600 to-sky-600`
- Text
  - `--text`: `gray-900`
  - `--text-muted`: `gray-600`
- Status
  - `--success`: `green-600` (badge Operasi)
  - `--danger`: `red-600` (badge Tidak Operasi / error)
- Focus
  - `--focus-ring`: `ring-2 ring-cyan-500 ring-offset-2` (gunakan `:focus-visible`)

Aturan:
- Hindari mencampur “primary blue” dan “primary cyan” dalam 1 halaman; pilih primary cyan/sky untuk konsistensi dashboard, dan gunakan blue hanya sebagai accent minor bila diperlukan.
- Semua elemen interaktif wajib punya state: default, hover, active, focus-visible, disabled.

### 2.2 Tipografi
Basis font mengikuti Tailwind config: `font-sans` (Figtree) sebagai default.
- H1: 28–32px (`text-2xl`–`text-3xl`), `font-bold`, `tracking-tight`
- H2: 16–18px (`text-base`–`text-lg`), `font-semibold`
- Body: 14–16px (`text-sm`–`text-base`), `text-gray-600`
- Caption: 12–13px (`text-xs`), `text-gray-500`

### 2.3 Spacing, Radius, Shadow
- Spacing: kelipatan 4/8px (Tailwind default).
- Radius: gunakan konsisten `rounded-lg` (kontrol), `rounded-xl` (button), `rounded-2xl` (card besar/modal).
- Shadow: batasi 2 level: `shadow-sm` (surface), `shadow-lg` (modal/overlay).

## 3) Komponen Reusable (disarankan)
1. **PageHeader**: ikon (badge/gradient), H1, deskripsi, slot action (CTA).
2. **Card / Panel**: wrapper section dengan header opsional + border halus.
3. **Button**: varian `primary | secondary | ghost | danger`, ukuran `md | sm`.
4. **TextInput + Icon**: untuk pencarian, state error, focus ring.
5. **Select (Listbox)**: untuk ULTG/Kondisi/Rows-per-page, dengan option active/selected konsisten.
6. **BadgeStatus**: `Operasi` (success) vs `Tidak Operasi` (danger).
7. **Table**: header sticky opsional, row hover, empty state.
8. **Pagination**: prev/next, indikator page/total.
9. **Modal (Dialog)**: header gradient, close button, body form, footer actions.

## 4) Halaman: Gardu Induk (Website)

### 4.1 Meta Information
- Title: "Gardu Induk"
- Description: "Peta lokasi gardu induk dan status operasional."
- Open Graph: `og:title`, `og:description`, `og:type=website`

### 4.2 Layout
- Desktop-first: stacked layout.
- Struktur: Header → Filter Bar → Map Canvas.
- Gunakan container center untuk header+filter; map full-width.

### 4.3 Page Structure & Elemen
1) **Header Section (centered)**
- H1 + deskripsi.
- Garis aksen (divider) gunakan token primary (mis. `bg-cyan-600`).

2) **Filter Bar (wrap)**
- Dua select: ULTG dan Kondisi.
- Layout:
  - Desktop: inline, gap 16px.
  - Mobile: stacked, full-width.
- Perilaku:
  - Klik/keyboard navigable (Listbox).
  - Fokus jelas (`focus-visible` ring).

3) **Map Section**
- Container map: `rounded-2xl`, border halus (`border-cyan-100`), shadow ringan.
- **Legend Card**: posisi absolute kanan-atas di desktop; di mobile pindah ke bawah header map (menghindari menutupi peta).
- **Popup Marker**:
  - Judul: nama gardu.
  - Field: ULTG.
  - Badge kondisi: pakai `BadgeStatus`.
- **Empty State Overlay**: ketika hasil filter kosong, tampilkan panel semi-transparan dengan teks singkat.

### 4.4 Responsif
- ≤768px: filter jadi 1 kolom; legend tidak floating (jadi block) untuk menghindari overlap.
- Pastikan map tinggi tidak memotong footer/layout; gunakan `min-height` dan `calc()` seperti saat ini.

## 5) Halaman: Manajemen Gardu Induk (Dashboard)

### 5.1 Meta Information
- Title: "Manajemen Gardu Induk"
- Description: "Kelola data gardu induk, koordinat, dan kondisi operasional."
- Open Graph: `og:title`, `og:description`, `og:type=website`

### 5.2 Layout
- Mengikuti DashboardLayout (header fixed + sidebar).
- Struktur: PageHeader → Card (Daftar) → Modal Tambah.

### 5.3 Page Structure & Elemen
1) **PageHeader**
- Ikon dalam badge gradient (selaraskan gradient ke `from-cyan-600 to-sky-600`).
- CTA “Tambah Gardu” gunakan `Button primary`.

2) **Card: Daftar Gardu Induk**
- Card header:
  - Judul + total data (caption).
  - Aksi kanan: tombol Filter + Select rows-per-page.
- Filter area (expand/collapse):
  - Input pencarian dengan ikon.
  - Border-top divider + animasi ringan.

3) **Table**
- Kolom: No, Wilayah (ULTG), Nama Gardu, Koordinat, Aksi.
- Koordinat ditampilkan dalam “chip” kecil (surface netral) dengan label `Lat/Long`.
- Hover row: highlight ringan `sky-50`.
- Empty state: ikon + teks.

4) **Pagination**
- Kiri: ringkasan range data.
- Kanan: prev/next + page indicator.
- Disabled state jelas.

5) **Modal Tambah Gardu**
- Header gradient (primary), close button.
- Body: form grid 2 kolom di desktop, 1 kolom di mobile.
- Field:
  - Text input: Nama, ULTG.
  - Number input: Latitude, Longitude.
  - Select kondisi: Operasi / Tidak Operasi (warna status konsisten via `BadgeStatus`).
- Error state: pesan kecil merah di bawah field.
- Footer: tombol Batal (secondary) + Simpan (primary) + disabled saat processing.

### 5.4 Responsif
- Tabel: tetap `overflow-x-auto` untuk layar kecil.
- Header actions: wrap menjadi 2 baris pada ≤640px.
- Modal: full-width di mobile, padding dipadatkan.

## 6) Checklist Konsistensi (Acceptance)
- Primary color untuk kedua halaman mengikuti token yang sama (cyan/sky) dan state konsisten.
- Skala tipografi konsisten dengan dashboard (H1/H2/body/caption) dan tidak ada ukuran “loncat”.
- Komponen shared (Button, Select/Listbox, BadgeStatus, Card, Modal) dipakai ulang di website & dashboard.
- Semua interaksi punya `hover` dan `focus-visible` yang jelas.
- Responsif memenuhi: desktop rapi, mobile tidak ada overlap legend/filter, tabel dapat di-scroll horizontal.
