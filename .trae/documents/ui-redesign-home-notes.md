# Catatan Perubahan — Redesain UI Home

## Tujuan
- Menyamakan tampilan Home dengan pola visual halaman publik lain (mis. Profil Perusahaan): latar gradasi lembut, kartu ber-radius besar, border halus, dan tipografi yang rapi.

## Perubahan UI Utama
- Mengganti layout Home menjadi pola **section + card** dengan container yang konsisten.
- Hero carousel dibuat sebagai **surface card** (rounded-3xl, border halus, backdrop blur) dengan overlay gradasi dan CTA.
- Section “Asset” dan “Berita Terbaru” memakai komponen section yang seragam (judul, subtitle, action di kanan).
- Komponen konten dibuat reusable:
  - `Section`, `IconBadge`, `ButtonLink`, `classNames` di `resources/js/Components/Home/HomeUi.jsx`
  - `StatCard` dan `NewsCard` di `resources/js/Pages/Home/Home.jsx`

## Palet Warna & Tipografi
- Netral: `slate` untuk teks, border, dan surface.
- Aksen: `sky` untuk CTA/link, dengan variasi tone (`emerald`, `violet`, `amber`) pada badge statistik.
- Skala tipografi mengikuti hierarchy: eyebrow (11px uppercase), heading (lg–xl), body (sm).

## Spacing & Responsif
- Spacing mengikuti ritme 4/8px (Tailwind `p-5`, `p-6`, `gap-4`, `py-10`).
- Grid responsif:
  - Statistik: 1 kolom → 2 kolom → 4 kolom.
  - Berita: 1 kolom → 3 kolom.

## Edge Case & Stabilitas
- Parsing `gambar` berita dibuat lebih robust (string JSON, string path tunggal, array) agar konsisten di Hero dan card berita.
- Loading state menampilkan skeleton untuk section berita.

