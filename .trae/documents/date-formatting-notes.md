## Perbaikan format tanggal (Dashboard Anomali)

### Tujuan
- Menampilkan tanggal/rentang tanggal dalam format konsisten: `DD/MM/YYYY`.
- Mencegah pergeseran tanggal karena parsing `YYYY-MM-DD` yang sensitif zona waktu.
- Menangani input kosong, tanggal invalid, dan format string yang tidak dikenal.

### Implementasi
- Menambahkan util di [formatDate.js](file:///d:/Coding/webkarawang/resources/js/Components/Utils/formatDate.js):
  - `parseDateOnly("YYYY-MM-DD")` menggunakan `new Date(year, month-1, day)` agar stabil di zona waktu lokal.
  - `formatDateDMY(...)` untuk output `dd/MM/yyyy`.
  - `formatMaybeDateRange("YYYY-MM-DD - YYYY-MM-DD")` untuk memformat rentang tanggal; invalid → `"Tanggal tidak valid"`, kosong → `"-"`.
- Mengganti tampilan old/new value di timeline Schedule/Detail agar memakai formatter ini.

### File yang diubah
- [formatDate.js](file:///d:/Coding/webkarawang/resources/js/Components/Utils/formatDate.js)
- [Schedule.jsx](file:///d:/Coding/webkarawang/resources/js/Pages/Dashboard/Anomali/Schedule.jsx)
- [Detail.jsx](file:///d:/Coding/webkarawang/resources/js/Pages/Dashboard/Anomali/Detail.jsx)

### Testing
- Unit test util tanggal (termasuk leap year): [formatDate.test.js](file:///d:/Coding/webkarawang/resources/js/Components/Utils/__tests__/formatDate.test.js)

