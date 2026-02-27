## PDF download (Anomali)

### Ringkasan
- Tombol download PDF dibuat **tanpa membuka tab baru**: request `GET` via XHR (`axios`) → terima `blob` → trigger download via `<a download>`.
- Server mengembalikan header `Content-Disposition: attachment` untuk memaksa download.

### UI/UX
- Tombol responsif: `w-full` di mobile, `sm:w-auto` di layar lebih besar.
- Loading state: spinner + label `Mengunduh...` (opsional persentase jika `Content-Length` tersedia).
- Error handling: toast error (notistack) untuk 404/403/umum.

### Aksesibilitas
- Elemen `<button>` (keyboard friendly).
- `aria-busy` saat download.
- `focus-visible` ring.

### Server headers & caching
- Endpoint `GET /dashboard/anomali/{slug}/pdf` mengembalikan:
  - `Content-Type: application/pdf`
  - `Content-Disposition: attachment; filename="..."`
  - `Cache-Control: private, max-age=3600`
  - `ETag: "..."` (berdasarkan `anomali.id` dan `updated_at`)
  - Mendukung `If-None-Match` → `304 Not Modified`

### Cross-browser test checklist (manual)
- Chrome/Edge: tombol mengunduh file dan tidak membuka tab baru.
- Firefox: nama file mengikuti `Content-Disposition`.
- Safari macOS: download berjalan (tanpa tab baru), jika diblokir oleh setting, tampil toast error.
- Mobile (Android Chrome / iOS Safari): tombol full-width, klik tetap memulai download (iOS bisa berbeda tergantung setting, tetapi tidak membuka tab baru).

### File terkait
- UI component: [PdfDownloadButton.jsx](file:///d:/Coding/webkarawang/resources/js/Components/Dashboard/Anomali/PdfDownloadButton.jsx)
- Dipakai di:
  - [Detail.jsx](file:///d:/Coding/webkarawang/resources/js/Pages/Dashboard/Anomali/Detail.jsx)
  - [Schedule.jsx](file:///d:/Coding/webkarawang/resources/js/Pages/Dashboard/Anomali/Schedule.jsx)
  - [Review.jsx](file:///d:/Coding/webkarawang/resources/js/Pages/Dashboard/Anomali/Review.jsx)
- Backend download: [AnomaliController.php](file:///d:/Coding/webkarawang/app/Http/Controllers/AnomaliController.php)

