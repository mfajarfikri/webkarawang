# Spesifikasi Desain Halaman — Dashboard Pengelolaan Profil Perusahaan (Desktop-first)

## Global Styles (berlaku untuk semua halaman)

* Design tokens

  * Background: #0B1220 (app shell), surface: #111A2E, card: #0F172A

  * Primary: #3B82F6, Primary hover: #2563EB

  * Success: #16A34A, Warning: #F59E0B, Danger: #EF4444

  * Border: rgba(255,255,255,0.08), Text: #E5E7EB, Muted: #9CA3AF

* Tipografi

  * Font: Inter/system-ui, base 14–16px

  * Skala: H1 24/32, H2 18/28, H3 16/24, Body 14/20, Caption 12/16

* Komponen umum

  * Button: primary/secondary/ghost + disabled state; loading spinner saat simpan/terbit

  * Input/textarea: border halus + helper text + error text

  * Toast: sukses/gagal simpan, upload, publish

* Responsif (pratinjau & layout)

  * Desktop (≥1024): editor + preview berdampingan

  * Tablet (≥768): preview bisa ditaruh di tab/accordion

  * Mobile (<768): layout single column, preview via switch “Lihat Pratinjau”

***

## Halaman 1 — Halaman Masuk

### Layout

* Menggunakan Flexbox terpusat (centered card) dengan background gradien halus.

* Lebar card 420px (desktop), full-width dengan padding (mobile).

### Meta Information

* Title: Masuk — Dashboard Profil Perusahaan

* Description: Autentikasi untuk mengakses dashboard pengelolaan profil perusahaan.

* Open Graph: title & description sama, og:type=website.

### Page Structure

1. Brand header (logo/teks).
2. Card autentikasi.
3. Footer kecil (teks legal/versi aplikasi bila perlu).

### Sections & Components

* Header Brand

  * Logo kecil + nama aplikasi.

* Form Autentikasi

  * Field: Email, Kata sandi

  * Tombol: “Masuk” (primary, loading)

  * Link: “Lupa kata sandi” membuka mode reset (inline section) agar tetap 1 halaman.

  * Error state: salah kredensial, user tidak aktif.

* Reset Kata Sandi (inline)

  * Field: Email

  * Tombol: “Kirim tautan reset”

  * State: sukses (instruksi cek email), gagal (email tidak ditemukan).

***

## Halaman 2 — Dashboard Profil Perusahaan

### Layout

* App shell: CSS Grid 2 baris (Topbar + Content).

* Content area: CSS Grid 2 kolom (Editor kiri, Preview kanan).

  * Kolom editor: minmax(520px, 1fr)

  * Kolom preview: 520px (fixed) dengan resize handle (opsional) untuk simulasi responsif.

* Spasi: 16–24px; kartu/panel memakai radius 12px.

### Meta Information

* Title: Dashboard — Profil Perusahaan

* Description: Kelola konten profil perusahaan, aset gambar, versi, dan publikasi.

* Open Graph: title/description, og:type=website.

### Page Structure

1. Topbar (sticky)
2. Workspace (dua kolom)

   * Left: Editor panel bertingkat

   * Right: Live preview panel
3. Panel tambahan (Drawer/Modal): Riwayat versi

### Sections & Components

#### A. Topbar (Sticky)

* Kiri: nama perusahaan (atau placeholder) + indikator status

  * Badge: Draft / Terbit

  * Teks kecil: “Terakhir diubah: …”

* Kanan: aksi utama

  * Button secondary: “Simpan Draft”

  * Button primary: “Terbitkan” (dengan konfirmasi)

  * Button ghost: “Riwayat Versi” (membuka drawer)

  * Avatar/menu: “Keluar”

#### B. Editor Panel (Kolom Kiri)

* Menggunakan stacked sections (cards) agar mudah discan.

1. Card: Informasi Dasar

* Field: Nama perusahaan (required)

* Field: Deskripsi/About (textarea)

* Validasi: required/maxlength; helper text.

1. Card: Kontak & Lokasi

* Field: Alamat

* Field: Email

* Field: Telepon

* Field: Website

1. Card: Tautan Sosial

* Repeater list (baris dinamis): platform + url

* Tombol: tambah/hapus baris

1. Card: Media (Upload Gambar)

* Subsection: Logo

  * Upload area (drag-drop + browse), menampilkan preview thumbnail

  * Tombol: ganti/hapus

* Subsection: Cover

  * Upload area + preview rasio (mis. 16:9)

* Subsection: Galeri

  * Grid thumbnail 3–4 kolom

  * Upload multiple + progress per file

  * Aksi per item: jadikan utama (opsional), hapus

* Batasan: tipe image/\*, ukuran maksimum (ditampilkan sebagai helper text)

1. Card: Catatan Perubahan (untuk versi)

* Field: change\_note (opsional) saat simpan/terbit

1. State & Interaksi

* Dirty state: label “Belum disimpan” jika ada perubahan

* Loading: disable tombol saat request berjalan

* Error handling: banner di atas editor + highlight field terkait

#### C. Live Preview Panel (Kolom Kanan)

* Header kecil: “Pratinjau Langsung” + kontrol perangkat

  * Segmented control: Desktop / Tablet / Mobile

  * (Opsional) input width px untuk custom

* Frame preview

  * Border device frame

  * Konten preview menggunakan data form terkini (real-time)

  * Skeleton/empty state jika data belum lengkap

* Catatan: preview tidak wajib tersimpan untuk terlihat.

#### D. Drawer/Modal: Riwayat Versi

* Dibuka dari Topbar.

* Layout: list di kiri + detail di kanan (desktop), satu kolom (mobile).

* List item versi

  * Label: v12, Draft/Terbit, tanggal, pembuat

  * Aksi: “Lihat”

* Detail versi

  * Ringkasan: status, timestamp, change note

  * Tombol: “Pulihkan sebagai Draft”

  * Tombol: “Terbitkan Versi Ini” (jika valid)

* Konfirmasi aksi destruktif/publish.

### Responsif

* ≥1024px: editor+preview side-by-side.

* 768–1023px: preview pindah ke tab (Editor | Pratinjau) agar nyaman.

* <768px: Topbar aksi jadi dropdown; preview via toggle full-screen.

### Animasi/Transisi

* Transisi 150–200ms untuk hover button, drawer slide-in, dan toast.

