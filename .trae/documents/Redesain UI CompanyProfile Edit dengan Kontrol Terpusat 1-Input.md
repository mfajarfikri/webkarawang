## Tujuan
- Mendesain ulang UI di Edit.jsx agar modern, responsif, dan konsisten.
- Menggunakan 1 input sebagai kontrol terpusat yang dapat mengubah warna tema, layout, tipografi, dan gaya komponen secara dinamis.
- Menambahkan validasi input, error handling, dan dokumentasi.

## Arsitektur Kontrol Terpusat
- Tambahkan komponen DesignControl di bagian header Edit.jsx sebagai satu-satunya input.
- DesignControl menghasilkan objek konfigurasi (state) bernama designConfig yang berisi:
  - theme: { hue: "sky|blue|emerald|rose|slate", intensity: 50..900, bg: "white|slate-50" }
  - layout: { density: "compact|normal|comfortable", cardRadius: "md|xl|2xl", gap: 3..8 }
  - typography: { font: "inter|figtree|montserrat", baseSize: 14..16, headingWeight: 700..900 }
  - components: { buttonStyle: "solid|outline|gradient", badgeTone: "sky|slate", skeleton: true|false }
- State designConfig disebarkan lewat context/provider lokal (DesignConfigProvider) agar semua bagian Edit.jsx dapat membaca token.

## Skema Input Tunggal
- Bentuk input: TextInput multiline yang menerima string JSON (atau preset kata kunci). Contoh:
  - {"theme":{"hue":"sky","intensity":700},"layout":{"cardRadius":"2xl"}}
- Sediakan tombol “Terapkan” yang:
  - Mem-parse JSON dengan try/catch
  - Melakukan normalisasi dan validasi skema (ajv ringan sendiri tanpa lib: cek tipe dan nilai enum)
  - Menampilkan error jika invalid; jika valid, update designConfig.
- Alternatif: dukung preset singkat seperti "preset: modern-sky" yang akan dipetakan ke JSON internal.

## Aplikasi Token ke UI
- Warna tema: set CSS variables pada root container Edit.jsx, mis.:
  - --tone: sky; --tone-700: #…; --text: slate-900; --border: slate-200
- Layout: gunakan token untuk radius kartu (rounded-*), density (padding p-4/p-5/p-6), dan gap grid.
- Tipografi: set kelas font family sesuai tailwind (font-inter dll), baseSize lewat class text-[15px] pada container.
- Komponen:
  - Button: solid/outline/gradient bergantung pada designConfig.components.buttonStyle
  - Badge, card, tabel: gunakan CSS variables + kelas utilitas agar konsisten
- EditorJS wrapper: gunakan token untuk background, border, dan radius, tanpa mengubah logika editor.

## Responsivitas
- Gunakan grid responsive (1→2→12 kolom sedia) dengan gap dari token.
- Pastikan toolbar/aksi bersifat flex-wrap dengan min-w-0 agar tidak overflow.
- Gunakan container w-full dan mengandalkan DashboardLayout padding.

## Validasi & Error Handling
- Validasi JSON: cek kunci wajib dan tipe nilai; normalisasi nilai di luar rentang ke default.
- Error UI: tampilkan banner merah dengan pesan spesifik (kunci tidak dikenal, enum salah, tipe salah).
- Fallback: jika parsing gagal, gunakan desain default.

## Loading State & Aksesibilitas
- Tambahkan skeleton konsisten ketika data awal (profile/versions) belum siap.
- Fokus ring dan aria-label untuk tombol “Terapkan”, banner error, dan kontrol input.
- Hindari animasi berat; gunakan transition yang halus.

## Integrasi di Edit.jsx
- Sisipkan DesignConfigProvider di atas konten utama.
- Bungkus kartu/section (Informasi Umum, Kontak & Lokasi, Visi & Misi, Galeri, Panel Pratinjau) agar membaca token untuk radius, padding, border, dan warna.
- Pastikan “1 input” hanya memengaruhi desain; data domain (draft_data) tetap tidak berubah.

## Testing
- Unit test: parsing valid/invalid JSON dan normalisasi token.
- Rendering test: memastikan kelas/variabel berubah sesuai token.
- Responsif: snapshot untuk breakpoint sm/md/lg.
- Guard EditorJS: tetap memastikan hanya 1 redactor per holder.

## Dokumentasi
- Tambahkan DESIGN_NOTES.md: skema token, preset, contoh input, dan tabel pemetaan token→kelas/variables.
- Komentar singkat pada komponen baru (DesignControl, provider) untuk developer.

## Rencana Implementasi
1. Buat DesignConfigProvider + hook useDesignConfig.
2. Tambah komponen DesignControl (TextInput JSON + tombol Terapkan + banner error).
3. Injeksi CSS variables pada root Edit container berdasarkan designConfig.
4. Refactor kartu/section agar membaca token untuk kelas.
5. Tambah skeleton komponen dan a11y ring.
6. Tambah unit tests dan dokumentasi.

Konfirmasi: setelah disetujui, saya akan implementasikan langsung di Edit.jsx beserta komponen pendukung dan pengujian.