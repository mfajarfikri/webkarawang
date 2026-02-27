# Catatan Perubahan — Redesain UI Gardu Induk

## Tujuan
- Menyamakan tampilan halaman `GarduInduk` dengan tema aplikasi: aksen `cyan/sky`, layout berbasis card, border halus, shadow ringan, dan fokus keyboard yang jelas.
- Mempertahankan fitur yang sudah ada: peta (Leaflet), filter ULTG/Kondisi, marker + popup, dan empty state.

## Perubahan UI
- Struktur halaman diubah menjadi pola **stacked sections** menggunakan komponen reusable `Section` (judul, subtitle, padding konsisten).
- Filter dipindahkan ke section khusus dengan komponen select HeadlessUI (Listbox) yang konsisten: `rounded-2xl`, `border-slate-200`, `focus-visible ring`.
- Map dibungkus dalam card dengan header singkat, radius besar, border halus, serta tinggi responsif.
- Legend dioptimalkan untuk responsif:
  - Desktop: floating (absolute) di kanan-atas map.
  - Mobile: ditampilkan sebagai block di atas map agar tidak menutupi canvas.
- Popup marker dirapikan: judul, ULTG, dan badge kondisi (Operasi/Tidak Operasi).
- Empty state overlay dibuat lebih konsisten (panel dashed di atas map).

## Reusable Components
- Menggunakan komponen UI yang sudah dipakai halaman publik lain: `Section`, `IconBadge`, `classNames` dari `resources/js/Components/Home/HomeUi.jsx`.
- Menambahkan komponen kecil khusus halaman:
  - `BadgeStatus`, `FilterSelect`, `LegendCard` (scope lokal di `GarduInduk.jsx`).

## Testing
- Jalankan `npm run build` untuk memastikan build lolos.
- Cek halaman `/gardu-induk` secara visual (desktop & mobile breakpoint) untuk memastikan:
  - Filter berfungsi
  - Marker + popup tampil
  - Legend tidak overlap di mobile
  - Tidak ada error/warning di console browser

