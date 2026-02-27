# Page Design — Fitur “Tutup Anomali” (Desktop-first)

## Global Styles

* Layout: container terpusat (max-width 1200px), grid 12 kolom untuk desktop; turun ke 4 kolom untuk mobile.

* Spacing: basis 8px (8/16/24/32).

* Typography: H1 24–28px, H2 18–20px, body 14–16px.

* Colors (token):

  * Background: `--bg` (putih/abu terang sesuai tema aplikasi)

  * Text: `--text`

  * Primary button: `--primary` + hover `--primary-600`

  * Error: `--danger` (teks + border)

  * Success: `--success`

* Button states:

  * Default, hover, active

  * Disabled saat loading

* Link styles: underline on hover.

***

## Page 1 — Tab Assigned

### Layout

* Mengikuti layout halaman utama (header + area konten).

* Area konten: tabel/list item; aksi per baris.

### Meta Information

* Title: `Assigned` (atau mengikuti judul modul yang sudah ada)

* Description: `Daftar anomali yang ditugaskan dan aksi penutupan.`

### Page Structure

1. Header halaman (judul + breadcrumb jika ada di sistem).
2. Daftar Assigned (tabel atau kartu).

### Sections & Components

**A. Daftar Assigned (tabel/kartu)**

* Kolom/field minimal yang sudah ada (mengikuti sistem saat ini).

* Setiap item memiliki tombol aksi:

  * Label: “Tutup Anomali”

  * Placement: kolom Actions / area kanan kartu

  * Interaction:

    * Klik membuka halaman baru/route: `/anomali/:anomalyId/tutup`

    * Saat navigasi, tampilkan loading singkat jika data konteks perlu diambil.

**B. Empty & error state (jika halaman Assigned sudah punya)**

* Jika tidak ada data: tampilkan pesan empty state.

* Jika gagal load data: tampilkan banner error + tombol coba lagi (mengikuti pola aplikasi).

Responsive

* Desktop: tabel full.

* Mobile: kartu bertumpuk, tombol “Tutup Anomali” full-width.

***

## Page 2 — Halaman Tutup Anomali

### Layout

* Struktur single-column form untuk keterbacaan.

* Menggunakan card container (lebar 640–760px) di tengah pada desktop.

* Grid internal: label + input (2 kolom di desktop), menjadi 1 kolom di mobile.

### Meta Information

* Title: `Tutup Anomali`

* Description: `Unggah PDF dan isi tanggal pekerjaan untuk menutup anomali.`

* Open Graph: mengikuti default aplikasi (judul + deskripsi di atas).

### Page Structure

1. Top bar: tombol kembali + judul.
2. Card “Ringkasan Anomali”.
3. Card “Form Penutupan”.
4. Area notifikasi (error/sukses).

### Sections & Components

**A. Header / Back**

* Tombol: “Kembali” (kembali ke Assigned)

* Judul: “Tutup Anomali”

**B. Ringkasan Anomali (read-only)**

* Menampilkan info minimum untuk verifikasi konteks (mis. ID/judul singkat).

* Skeleton/loading bila data konteks belum siap.

**C. Form Penutupan**

1. Field Upload PDF

* Komponen: file picker + dropzone (opsional jika sudah ada)

* Teks bantuan: “Hanya file PDF.”

* Validasi:

  * Wajib diisi

  * Harus PDF (cek MIME/ekstensi)

  * Jika gagal: tampilkan error inline di bawah field

* Preview ringkas:

  * Menampilkan nama file + ukuran + tombol “Ganti file”

1. Field Tanggal Pekerjaan

* Komponen: date input / date picker

* Validasi:

  * Wajib diisi

  * Jika gagal: tampilkan error inline

1. Tombol Aksi

* Primary: “Submit Penutupan”

* Secondary: “Batal” (kembali ke Assigned)

* Loading behavior:

  * Saat submit: disable semua input + tombol

  * Ubah label tombol menjadi “Memproses…”

**D. Error / Loading / Success**

* Loading global: spinner kecil di tombol + status teks di atas tombol (mis. “Mengunggah…”, “Menyimpan…”).

* Error submit (non-validasi): banner/alert di atas form dengan pesan singkat + tombol “Coba lagi”.

* Success: toast/banner “Anomali berhasil ditutup” lalu redirect otomatis ke Assigned (atau tombol “Kembali ke Assigned”).

Responsive

* Desktop-first: form card terpusat, dua kolom untuk label+input bila ruang cukup.

* Mobile: semua elemen full-width, tombol stack vertikal.

