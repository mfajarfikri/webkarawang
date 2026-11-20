# Web PLN UPT Karawang

Website publik dan dashboard internal PLN Unit Pelaksana Transmisi (UPT) Karawang.
Situs publik menampilkan profil perusahaan, berita, gardu induk, dan KTT; dashboard
dipakai pegawai untuk mengelola konten serta menjalankan alur pelaporan anomali
peralatan transmisi.

## Fitur

**Situs publik**

- Beranda, profil perusahaan, struktur organisasi, galeri, ruang rapat
- Berita dan detail berita
- Daftar gardu induk dan Konsumen Tegangan Tinggi (KTT)

**Dashboard (perlu login)**

- **Anomali** — alur lengkap: lapor → review MULTG → penugasan bidang → jadwal →
  tutup, dengan tampilan tabel, kalender, antrean "menunggu saya", timeline,
  export Excel, dan PDF per laporan
- **Berita** — tulis, ubah, hapus artikel dengan editor rich text
- **Profil Perusahaan** — draf, terbit, riwayat versi, dan unggah media
- **Dashboard Kinerja** — grafik kinerja dari Google Sheets (CSV)
- **KTT** dan **Gardu Induk**
- **Manajemen akses** — user, role, permission, dan menu website
- Login email/kata sandi dan Google (Socialite), tanda tangan digital pelapor

## Teknologi

| Lapisan  | Stack                                                                          |
| -------- | ------------------------------------------------------------------------------ |
| Backend  | PHP 8.2+, Laravel 12, Inertia.js (Laravel adapter), Spatie Laravel Permission  |
| Frontend | React 19, Inertia.js, Tailwind CSS 3, Headless UI, Chart.js, FullCalendar       |
| Build    | Vite 6, Ziggy (route Laravel di JavaScript)                                    |
| Lainnya  | Laravel Reverb (realtime, opsional), DomPDF, Maatwebsite Excel, Laravel Pulse  |
| Database | MySQL 8                                                                        |
| Tes      | Vitest + Testing Library (JS), Pest (PHP)                                      |

## Prasyarat

- PHP 8.2+ dengan ekstensi `pdo_mysql`, `gd`, `zip`, `mbstring`, `fileinfo`
- Composer 2
- Node.js 20+ dan npm
- MySQL 8

## Instalasi lokal

```bash
git clone https://github.com/mfajarfikri/webkarawang.git
cd webkarawang

composer install
npm ci

cp .env.example .env
php artisan key:generate
```

Atur koneksi database di `.env` (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`), lalu:

```bash
php artisan migrate --seed
php artisan storage:link
```

`--seed` membuat permission, role **Super Admin**, akun admin awal, kategori,
gardu induk, dan menu. Akun admin awal ada di `database/seeders/UserSeeder.php` —
**ganti kata sandinya setelah login pertama**.

## Menjalankan

```bash
composer dev
```

Perintah ini menjalankan sekaligus server Laravel, queue worker, log (`pail`), dan
Vite dev server. Buka `http://localhost:8000`, dashboard ada di `/dashboard`.

Bila ingin terpisah: `php artisan serve` dan `npm run dev`. Untuk fitur realtime,
jalankan juga `php artisan reverb:start`.

## Konfigurasi `.env`

Selain pengaturan bawaan Laravel (app, database, mail), project ini memakai:

| Variabel                                                          | Untuk                                                                            |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| `GOOGLE_SHEET_CSV_URL`                                            | Sumber data Dashboard Kinerja (URL CSV "Publish to web" Google Sheets)           |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI` | Login dengan Google                                                              |
| `REVERB_*`, `VITE_REVERB_*`                                       | Realtime via Laravel Reverb. Kosongkan `VITE_REVERB_APP_KEY` untuk menonaktifkan |
| `SESSION_DRIVER`, `QUEUE_CONNECTION`                              | Default `database` — tabelnya dibuat oleh migrasi                               |

Variabel `VITE_*` dibaca saat build, jadi jalankan ulang `npm run build` setelah
mengubahnya.

## Hak akses

Akses diatur dengan [Spatie Laravel Permission](https://spatie.be/docs/laravel-permission).
Setiap route dashboard dijaga middleware `AutoPermission` dengan satu nama permission
(lihat `routes/web.php`). User tanpa izin mendapat 403.

Di frontend, nama permission yang sama dikumpulkan di
`resources/js/utils/permissions.js`. Sidebar dan tombol aksi (buat, edit, hapus,
export, kelola) hanya ditampilkan bila user memegang izinnya.

**Menambah fitur yang dibatasi:**

1. Tambahkan nama permission ke `UserSeeder` (dan ke `PERMISSIONS` di
   `resources/js/utils/permissions.js`).
2. Pasang middleware di route: `->middleware(AutoPermission::class . ':Nama Izin')`.
3. Sembunyikan tombol/menu di frontend dengan `useCan()` atau `hasPermission()`.
4. Jalankan `php artisan db:seed --class=UserSeeder` agar izin baru ada di database.

## Pengujian

```bash
npm test          # tes JavaScript (Vitest)
```

> [!WARNING]
> **Jangan jalankan `php artisan test` terhadap database yang berisi data.**
> Tes PHP (Pest) memakai `RefreshDatabase` dan `phpunit.xml` tidak menetapkan
> database terpisah, sehingga tes menjalankan `migrate:fresh` pada database di
> `.env` dan **menghapus seluruh datanya**. Buat database kosong khusus tes lalu
> arahkan ke sana:
>
> ```bash
> DB_DATABASE=webkarawang_test php artisan test
> ```

## Deploy

Branch produksi: `master`.

```bash
git pull origin master
composer install --no-dev --optimize-autoloader
npm ci && npm run build
php artisan migrate --force
php artisan db:seed --class=UserSeeder --force   # bila ada permission baru
php artisan storage:link                          # sekali saja
php artisan optimize
```

Pastikan di server:

- `APP_ENV=production` dan `APP_DEBUG=false`
- Folder `storage/` dan `bootstrap/cache/` dapat ditulis web server
- Queue worker berjalan (`php artisan queue:work`, misalnya lewat Supervisor)
- File `public/hot` **tidak ada** (sisa Vite dev server membuat aset tidak termuat)

Perintah opsional untuk menandai anomali yang melewati jadwal:

```bash
php artisan anomali:update-overdue --dry-run   # cek dulu
php artisan anomali:update-overdue
```

## Struktur penting

```text
app/
  Http/Controllers/          controller situs publik & dashboard
  Http/Middleware/AutoPermission.php
  Console/Commands/          perintah artisan (anomali:update-overdue)
database/seeders/            data awal: permission, role, admin, menu
resources/js/
  Pages/                     halaman Inertia (Home/ = publik, Dashboard/ = internal)
  Components/                komponen UI; Components/Anomali/ berisi alur anomali
  Layouts/                   layout publik dan dashboard
  utils/permissions.js       daftar permission untuk frontend
routes/web.php               route & permission dashboard
docs/erd/                    diagram relasi database
```
