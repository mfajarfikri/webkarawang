# Rancangan Halaman — Profil Perusahaan PLN UPT Karawang (Desktop-first)

## 1) Meta Information (SEO)

* Title: "Profil Perusahaan | PLN UPT Karawang"

* Description: "Profil, visi & misi, sejarah, galeri, statistik, dan testimoni PLN UPT Karawang."

* Open Graph:

  * og:title: "Profil Perusahaan PLN UPT Karawang"

  * og:description: "Kenali profil, visi-misi, sejarah, dokumentasi, dan pengalaman pemangku kepentingan."

  * og:type: "website"

  * og:image: "\[OG\_IMAGE\_URL\_PLACEHOLDER]"

## 2) Global Styles (Design Tokens)

* Layout container: max-width 1200px, padding-x 24px (desktop), center aligned

* Grid: 12 kolom (desktop), gap 24px; untuk kartu gunakan 3–4 kolom per baris

* Warna (placeholder token):

  * Background: `--bg: #FFFFFF`

  * Surface: `--surface: #F7F8FA`

  * Text: `--text: #111827`

  * Muted: `--muted: #6B7280`

  * Primary/Brand: `--primary: [PLN_BLUE_PLACEHOLDER]`

  * Accent: `--accent: [PLN_YELLOW_PLACEHOLDER]`

* Tipografi:

  * H1 40/48 semibold

  * H2 28/36 semibold

  * H3 20/28 semibold

  * Body 16/24 regular

  * Small 14/20

* Button:

  * Primary: background `--primary`, text putih, hover: sedikit lebih gelap

  * Secondary: border 1px `--primary`, hover: background tipis

* Link:

  * Default: underline on hover, warna `--primary`

* Elevation:

  * Card: border 1px `#E5E7EB`, radius 12px, shadow halus on hover

## 3) Layout & Responsiveness

* Pendekatan desktop-first:

  * Desktop (≥1024px): sidebar/TOC sticky di kiri + konten utama di kanan (2 kolom)

  * Tablet (768–1023px): TOC berubah menjadi bar horizontal/accordion di atas konten

  * Mobile (<768px): TOC menjadi tombol “Navigasi Seksi” membuka bottom sheet/accordion

* Sistem layout:

  * Header: Flexbox (logo kiri, CTA/tautan kanan)

  * Body: CSS Grid 12 kolom (TOC 3–4 kolom, konten 8–9 kolom)

  * Galeri: Grid responsif (auto-fit minmax)

## 4) Page Structure (Komposisi)

1. Sticky Top Header
2. Hero / Intro Section
3. Body Area

   * Kolom kiri: Navigasi Internal (Table of Contents / TOC)

   * Kolom kanan: Konten seksi + blok konten pendukung (galeri, statistik, testimoni)
4. Footer

## 5) Sections & Components (Detail Elemen)

### 5.1 Sticky Top Header

* Elemen:

  * Logo/brand area: "PLN" + teks "UPT Karawang" (placeholder aset)

  * Tautan cepat: "Profil", "Visi & Misi", "Sejarah", "Galeri", "Statistik", "Testimoni" (anchor)

  * CTA opsional: "Hubungi" (scroll ke footer / membuka mailto placeholder)

* Interaksi:

  * Saat klik tautan: smooth scroll ke anchor

  * Saat scroll: header tetap, tinggi mengecil (opsional)

### 5.2 Hero / Intro

* Layout: dua kolom (desktop)

  * Kiri: judul H1 + ringkasan 2–3 kalimat

  * Kanan: gambar hero (landscape) dengan caption & kredit

* Konten (placeholder terstruktur):

  * headline: "Profil Perusahaan"

  * subheadline: "PLN UPT Karawang"

  * summary: "\[RINGKASAN\_2\_3\_KALIMAT]"

  * heroImage: { url, alt, caption, credit }

* Elemen tambahan:

  * “Chip” info (tanpa angka): "Area kerja: \[AREA\_PLACEHOLDER]", "Fokus layanan: \[FOCUS\_PLACEHOLDER]"

### 5.3 Navigasi Internal (TOC) — Sticky Sidebar

* Komponen: card TOC dengan daftar anchor

  * \#profil

  * \#visi-misi

  * \#sejarah

  * \#galeri

  * \#statistik

  * \#testimoni

* State:

  * Active link: highlight `--primary`, indicator bar di kiri

  * Focus state: outline aksesibilitas

### 5.4 Seksi: Profil (id="profil")

* Struktur konten (kartu bertumpuk):

  1. Gambaran Umum
  2. Tugas Utama (bullet)
  3. Lingkup Layanan (bullet)
  4. Nilai/Prinsip Kerja (bullet)

* Format placeholder (contoh):

  * overviewText: "\[PARAGRAF\_OVERVIEW]"

  * dutyPoints: \["\[POIN\_1]", "\[POIN\_2]", "\[POIN\_3]"]

  * scopePoints: \["\[POIN\_1]", "\[POIN\_2]"]

  * values: \["\[VALUE\_1]", "\[VALUE\_2]"]

### 5.5 Seksi: Visi & Misi (id="visi-misi")

* Layout: dua kartu berdampingan (desktop)

  * Kartu Visi: 1 kalimat utama

  * Kartu Misi: daftar bullet 3–7 item

* Placeholder:

  * vision: "\[VISI\_PLACEHOLDER]"

  * missions: \["\[MISI\_1]", "\[MISI\_2]", "\[MISI\_3]"]

### 5.6 Seksi: Sejarah (id="sejarah")

* Komponen: timeline vertikal

  * Item timeline: Periode + deskripsi 1–2 paragraf + poin dampak (opsional)

* Placeholder aman (tanpa klaim spesifik):

  * timelineItems:

    * { periodLabel: "\[PERIODE\_1: mis. Tahun YYYY]", title: "\[JUDUL]", description: "\[DESKRIPSI]" }

    * { periodLabel: "\[PERIODE\_2]", title: "\[JUDUL]", description: "\[DESKRIPSI]" }

### 5.7 Blok: Galeri (id="galeri")

* Layout: grid 3–4 kolom (desktop)

* Elemen kartu galeri:

  * Thumbnail image

  * Caption singkat

  * Kredit/sumber (teks kecil)

* Interaksi:

  * Klik thumbnail membuka lightbox/modal:

    * gambar besar

    * caption & kredit

    * tombol navigasi sebelumnya/berikutnya

    * tombol tutup (ESC)

* Placeholder item:

  * galleryItems:

    * { url: "\[IMG\_URL]", alt: "\[ALT]", caption: "\[CAPTION]", credit: "\[CREDIT]" }

### 5.8 Blok: Statistik Ringkas (id="statistik")

* Layout: kartu-kartu metrik (4 per baris desktop)

* Aturan konten:

  * Tidak boleh menggunakan angka spesifik tanpa sumber

  * Nilai boleh berupa placeholder terstruktur: "\[N]", "\[X%]", "\[YYYY]", atau "\[TBD]"

  * Wajib ada catatan sumber di setiap kartu atau di bawah grid

* Komponen kartu statistik:

  * label (mis. "Cakupan Layanan")

  * value placeholder (mis. "\[N]")

  * unit opsional (mis. "\[UNIT]")

  * source (label + url placeholder)

* Placeholder:

  * stats:

    * { label: "\[LABEL\_1]", value: "\[N]", unit: "\[UNIT]", sourceLabel: "\[SUMBER]", sourceUrl: "\[URL\_SUMBER]" }

    * { label: "\[LABEL\_2]", value: "\[TBD]", unit: "", sourceLabel: "\[SUMBER]", sourceUrl: "" }

### 5.9 Blok: Testimoni (id="testimoni")

* Layout: carousel (desktop) atau grid 2 kolom

* Elemen kartu testimoni:

  * Kutipan 2–4 baris

  * Nama (placeholder)

  * Peran/Instansi (placeholder)

  * Tanggal (opsional, placeholder)

* Interaksi:

  * Carousel: tombol prev/next + indikator dot

  * Aksesibilitas: tombol dapat di-tab, aria-label jelas

* Placeholder:

  * testimonials:

    * { quote: "\[KUTIPAN]", name: "\[NAMA]", organization: "\[INSTANSI]", role: "\[PERAN]" }

### 5.10 Footer

* Elemen:

  * Alamat/kontak: "\[ALAMAT]", "\[EMAIL]", "\[TELP]" (placeholder)

  * Tautan kebijakan: "\[PRIVACY\_URL]", "\[TERMS\_URL]"

  * Kredit konten/sumber utama (jika ada): "Sumber: \[TAUTAN]"

## 6) Interaction & Motion Guidelines

* Smooth scroll 200–300ms, ease-out

* Hover pada kartu: shadow meningkat tipis + translateY -2px

* Lightbox: fade-in 150–200ms

## 7) Data Placeholder (Skema Ringkas)

Gunakan satu objek data agar mudah dikelola:

```ts
type CompanyProfilePageContent = {
  hero: {
    headline: string;
    unitName: string;
    summary: string;
    image: { url: string; alt: string; caption?: string; credit?: string };
  };
  profile: {
    overviewText: string;
    dutyPoints: string[];
    scopePoints: string[];
    values: string[];
  };
  visionMission: {
    vision: string;
    missions: string[];
  };
  history: {
    timelineItems: Array<{ periodLabel: string; title: string; description: string }>;
  };
  gallery: {
    items: Array<{ url: string; alt: string; caption?: string; credit?: string }>;
  };
  stats: {
    items: Array<{ label: string; value: string; unit?: string; sourceLabel?: string; sourceUrl?: string }>;
    note?: string;
  };
  testimonials: {
    items: Array<{ quote: string; name: string; organization?: string; role?: string }>;
  };
  footer: {
    address?: string;
    email?: string;
    phone?: string;
    privacyUrl?: string;
    termsUrl?: string;
    sourceCredit?: string;
  };
};
```

