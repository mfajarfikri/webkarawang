## Ringkasan perubahan — Close Anomali

### 1) UI modern & konsisten tema
- Layout dibuat 2 kolom (desktop): Form (kiri) + Preview PDF (kanan), dan stack di mobile.
- Mengikuti pola dashboard: `bg-slate-50`, card `rounded-2xl`, border halus, shadow minimal, dan focus ring.

### 2) Date library + date picker
- Menggunakan `date-fns` untuk format/validasi tanggal dan `react-day-picker` untuk date picker.
- Format tersimpan: `YYYY-MM-DD`; format tampilan: `dd MMMM yyyy` (locale Indonesia).

### 3) PDF preview
- Menambahkan komponen preview berbasis `@react-pdf-viewer`.
- Support multi file di UI (tab file), namun backend tetap mengirim 1 file: PDF yang sedang aktif.
- Lazy-load komponen preview agar initial load lebih cepat.

### 5) Fix error Hooks runtime
- Memperbaiki error `Rendered fewer hooks than expected` dengan memastikan inisialisasi plugin `defaultLayoutPlugin(...)` dieksekusi konsisten setiap render (tidak kondisional / tidak dibungkus `useMemo`).
- Menambahkan `ErrorBoundary` global agar error render tidak menjatuhkan seluruh app dan stack tetap tercatat di console.

### 4) Testing
- Unit test untuk util tanggal & validasi (`vitest`).
- Integration test ringan untuk UI preview (mock viewer).
- Snapshot (visual regression sederhana) untuk layout Close.

### Catatan instalasi dependency PDF
- Library PDF yang dipakai membutuhkan `pdfjs-dist`.
- Di Windows + Node v22, install default dapat memicu build dependency native `canvas`.
- Project ini dipasang dengan opsi `--ignore-scripts` untuk menghindari build native yang tidak diperlukan pada runtime browser.
