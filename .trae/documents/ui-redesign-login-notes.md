## UI Redesign Login (Ringkasan Implementasi)

### Tujuan
- Menyamakan tampilan halaman login dengan tema dashboard (palet `slate/s-ky/cyan`, `rounded-2xl`, `border-slate-*`, `shadow-sm`, typography tegas).
- Membuat struktur responsif 2-kolom (desktop) → 1-kolom (mobile).
- Meningkatkan aksesibilitas: label, `aria-invalid`, `aria-describedby`, focus ring, dan alert yang dapat dibaca screen reader.

### Perubahan Utama
- Layout diganti ke grid `lg:grid-cols-12` dengan panel brand di kiri dan card login di kanan.
- Class styling distandarkan via konstanta (token) di dalam `Login.jsx`:
  - `labelCls`, `inputBaseCls`, `inputNormalCls`, `inputErrorCls`, dll.
- State error dibuat lebih konsisten:
  - Error global ditampilkan sebagai alert `role="alert"`.
  - Error field terhubung ke input via `aria-describedby` dan `aria-invalid`.
  - Jika login gagal (`422`), fokus otomatis ke field error pertama.
- Perbaikan handling error snackbar (sebelumnya ada argumen yang tidak valid).
- Micro-interaction selaras tema:
  - `motion-safe:animate-fadeInUp`, hover/focus transitions, focus-visible ring.

### Aksesibilitas (Checklist)
- Label terhubung `htmlFor` → `id` input.
- `aria-invalid` dan `aria-describedby` untuk field error.
- Toggle password memiliki `aria-label`.
- Tombol submit memiliki `aria-busy` saat loading.

### Responsif
- Mobile: satu kolom, card full-width.
- Desktop: panel kiri + card kanan (proporsi 7/5 kolom).

### File
- Halaman: [Login.jsx](file:///d:/Coding/webkarawang/resources/js/Pages/Auth/Login.jsx)
- Spesifikasi: [page-design-redesain-ui-login-konsistensi-tema.md](file:///d:/Coding/webkarawang/.trae/documents/page-design-redesain-ui-login-konsistensi-tema.md)

