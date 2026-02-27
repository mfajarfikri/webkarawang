# Spesifikasi Redesign Halaman Login (Konsisten Tema/Branding)

Dokumen ini mendefinisikan token desain (warna/typography/spacing), struktur halaman, state interaksi, responsif, dan aksesibilitas untuk halaman **Login** agar konsisten dengan tema/branding website.

---

## 1) Meta Information
- **Title**: Masuk | [Nama Website]
- **Description**: Masuk ke akun Anda untuk mengakses fitur dan data.
- **Open Graph**:
  - `og:title`: Masuk | [Nama Website]
  - `og:description`: Masuk ke akun Anda.
  - `og:type`: website
  - `og:url`: [URL]/login
  - `og:image`: [URL]/assets/og-login.png (opsional; gunakan aset brand)

---

## 2) Global Styles (Design Tokens)
> Catatan: Gunakan token ini secara konsisten (bukan nilai hardcode per komponen). Jika sistem desain sudah ada, map-kan ke token internal yang setara.

### 2.1 Color Tokens
**Brand & dasar**
- `--color-brand-600`: warna utama brand (CTA, link utama, fokus brand)
- `--color-brand-700`: hover/active CTA
- `--color-brand-50`: latar aksen lembut (badge/hero panel)

**Netral (teks & permukaan)**
- `--color-bg`: latar halaman
- `--color-surface`: kartu/form container
- `--color-surface-2`: permukaan sekunder (panel kiri, atau header)
- `--color-border`: garis/border default
- `--color-text`: teks utama
- `--color-text-muted`: teks sekunder/hint
- `--color-placeholder`: placeholder input

**Status**
- `--color-danger-600`: error (teks, border error)
- `--color-danger-50`: latar error lembut
- `--color-success-600`: (opsional, jika ada state sukses)
- `--color-warning-600`: (opsional)

**Focus ring (aksesibilitas)**
- `--color-focus-ring`: default `rgba(brand-600, 0.35)` atau token setara
- `--focus-ring-size`: `3px`

**Kontras minimum (wajib)**
- Teks normal vs background: **≥ 4.5:1**
- Teks besar (≥ 18pt regular / 14pt bold): **≥ 3:1**
- Elemen fokus harus jelas terlihat pada semua permukaan.

### 2.2 Typography Tokens
**Font family**
- `--font-sans`: font utama website (mis. Inter/Roboto/Plus Jakarta Sans sesuai branding)

**Skala ukuran (desktop-first)**
- `--text-xs`: 12px (helper, caption)
- `--text-sm`: 14px (label, hint)
- `--text-md`: 16px (body, input text)
- `--text-lg`: 18px (subheading)
- `--text-xl`: 24px (heading halaman)

**Line-height**
- Body: 1.5
- Label/Hint: 1.4
- Heading: 1.2–1.3

**Weight**
- Regular 400, Medium 500, Semibold 600

### 2.3 Spacing, Radius, Shadow
**Spacing scale (8pt system)**
- `--space-1`: 4px
- `--space-2`: 8px
- `--space-3`: 12px
- `--space-4`: 16px
- `--space-5`: 20px
- `--space-6`: 24px
- `--space-8`: 32px
- `--space-10`: 40px

**Radius**
- `--radius-sm`: 8px (input)
- `--radius-md`: 12px (card)
- `--radius-lg`: 16px (panel)

**Border**
- `--border-width`: 1px

**Shadow**
- `--shadow-sm`: bayangan halus untuk input fokus/hover (opsional)
- `--shadow-md`: untuk card login (halus, tidak “berat”)

---

## 3) Layout & Page Structure
### 3.1 Layout System
- Desktop-first dengan **CSS Grid** untuk pembagian panel, dan **Flexbox** untuk alignment komponen form.
- Kontainer utama:
  - `max-width`: 1120–1200px (tergantung layout website)
  - `padding-inline`: 24–32px desktop
  - `min-height`: 100vh (agar form terpusat vertikal dengan baik)

### 3.2 Struktur Halaman (Desktop)
**Pola: 2 kolom (Brand Panel + Form Card)**
1. **Header kecil (opsional, jika konsisten di website)**
   - Logo brand (klik kembali ke Beranda)
2. **Main (Grid 2 kolom)**
   - **Kolom kiri (Brand Panel)**
     - Headline singkat sesuai positioning brand
     - Ringkasan manfaat (2–3 poin) *tanpa menambah fitur baru*
     - Ilustrasi/ornamen brand (opsional)
   - **Kolom kanan (Login Card)**
     - Judul: “Masuk”
     - Deskripsi singkat: “Gunakan kredensial Anda untuk melanjutkan.”
     - Form fields + CTA
     - Link bantuan (mis. “Lupa kata sandi?”) **hanya jika memang sudah ada di sistem**
3. **Footer minimal**
   - Copyright / tautan kebijakan (opsional; ikut pola website)

### 3.3 Struktur Halaman (Mobile)
- Grid berubah menjadi **1 kolom**.
- Brand panel diperkecil menjadi header/section atas (headline singkat + logo), lalu form card di bawah.
- Padding sisi lebih rapat: 16px.

---

## 4) Sections & Components (Detail UI)

### 4.1 App Header (jika digunakan)
- **Komponen**: Logo + (opsional) link kembali.
- **Perilaku**:
  - Logo fokusable (`<a>`) dengan state hover/focus-visible.

### 4.2 Login Card
- **Container**:
  - Background: `--color-surface`
  - Border: `1px solid --color-border`
  - Radius: `--radius-md`
  - Shadow: `--shadow-md` (halus)
  - Padding: 24px (mobile) / 32px (desktop)
- **Header dalam card**:
  - Heading `H1`: “Masuk” (gunakan `--text-xl`, weight 600)
  - Subcopy: `--text-sm` atau `--text-md` dengan `--color-text-muted`

### 4.3 Form Login
**Struktur & urutan**
1. Field: Email / Username (sesuaikan implementasi saat ini)
2. Field: Kata sandi
3. (Opsional) “Ingat saya” **hanya jika memang ada**
4. Tombol utama: “Masuk”
5. Area bantuan: tautan pendaftaran / lupa kata sandi **hanya jika memang ada**

#### 4.3.1 Input Field (Email/Username & Password)
- **Anatomi**:
  - Label (wajib, bukan placeholder)
  - Input
  - Hint text (opsional)
  - Error message (muncul saat invalid)
- **Ukuran**:
  - Tinggi input: 44–48px
  - Padding: 12px horizontal, 10–12px vertikal
  - Font: `--text-md`
- **State visual**:
  - Default: border `--color-border`, bg `--color-surface`
  - Hover: border sedikit lebih gelap (turunan dari `--color-border`)
  - Focus-visible: ring `--focus-ring-size` dengan `--color-focus-ring` + border `--color-brand-600`
  - Disabled: bg `--color-surface-2`, teks `--color-text-muted`, cursor not-allowed
  - Error:
    - Border `--color-danger-600`
    - Background opsional `--color-danger-50` *tipis*
    - Error text `--color-danger-600`
- **Password field**:
  - (Opsional) tombol “lihat/sembunyikan” password (ikon) di dalam input
  - Ikon harus fokusable, memiliki label aksesibel (lihat A11y)

#### 4.3.2 Tombol (CTA “Masuk”)
- **Primary button**:
  - Background: `--color-brand-600`
  - Text: kontras tinggi (biasanya putih)
  - Radius: `--radius-sm`
  - Tinggi: 44–48px
- **States**:
  - Hover: `--color-brand-700`
  - Active: sedikit lebih gelap + translateY(0) (opsional)
  - Focus-visible: ring sama dengan input
  - Disabled/loading: opacity 0.6, non-interaktif
- **Loading**:
  - Tampilkan spinner kecil di kiri teks atau ganti teks menjadi “Memproses…”
  - Tombol tetap memiliki lebar yang stabil (hindari layout shift)

#### 4.3.3 Inline Alert (Error global form)
- Dipakai untuk error yang bukan per-field (mis. kredensial salah).
- **Gaya**:
  - Container: bg `--color-danger-50`, border `--color-danger-600` (tipis), radius `--radius-sm`
  - Ikon error (opsional) + teks singkat
- **Posisi**: di atas tombol “Masuk”, setelah fields.

### 4.4 Link & Teks bantuan
- Link menggunakan `--color-brand-600`, hover `--color-brand-700`.
- Focus-visible ring jelas.
- Hindari underline default hanya jika ada style pengganti yang jelas; rekomendasi: underline saat hover/focus.

---

## 5) Validasi, Error/Focus Handling (UX)
- Validasi dilakukan saat:
  - On submit, dan
  - (Opsional) saat blur pada field yang sudah disentuh (touched)
- Aturan tampilan error:
  - Error per-field muncul tepat di bawah field.
  - Error global muncul di area alert.
- Fokus saat error submit:
  1. Jika ada error per-field → fokus pindah ke field error pertama.
  2. Jika hanya error global → fokus ke komponen alert (agar screen reader membacakan).
- Placeholder tidak digunakan sebagai pengganti label.

---

## 6) Responsif (Breakpoints & Perilaku)
- **≥ 1024px (desktop)**: 2 kolom (brand panel : form) ~ 55:45 atau 60:40.
- **768–1023px (tablet)**: boleh tetap 2 kolom namun lebih sempit; card tetap max-width 440–480px.
- **≤ 767px (mobile)**: 1 kolom, card full-width, jarak vertikal dipadatkan.
- Pastikan:
  - Font minimal 16px untuk input di mobile (menghindari auto-zoom di iOS).
  - CTA selalu terlihat tanpa harus scroll berlebihan (usahakan card tidak terlalu tinggi).

---

## 7) Aksesibilitas (Wajib)
### 7.1 Semantik & Label
- Gunakan `<form>` dengan submit via Enter.
- Setiap input punya `<label for>` yang terhubung ke `id` input.
- Jika ada tombol show/hide password:
  - Gunakan `<button type="button">`.
  - Beri `aria-label="Tampilkan kata sandi"` / “Sembunyikan kata sandi”.

### 7.2 Error Message yang Terbaca Screen Reader
- Error text dihubungkan via `aria-describedby` pada input.
- Saat error aktif:
  - Set `aria-invalid="true"` pada input.
- Untuk error global:
  - Gunakan `role="alert"` atau `aria-live="assertive"` (pilih salah satu, konsisten) agar dibacakan.

### 7.3 Keyboard Navigation
- Urutan tab logis: logo → field 1 → field 2 → (opsional toggle password) → CTA → link.
- Jangan hilangkan outline; ganti dengan focus ring token.

### 7.4 Kontras & Target Sentuh
- Kontras sesuai ketentuan di bagian Color Tokens.
- Target klik/tap minimal 44x44px untuk tombol & ikon interaktif.

---

## 8) Motion / Transition (Ringan)
- Gunakan transisi halus 120–180ms untuk:
  - hover/focus border
  - tombol hover
- Hindari animasi berlebihan; prioritaskan kejelasan state.

---

## 9) Checklist Konsistensi Branding
- Logo, warna `brand-600/700`, dan gaya tombol utama sama dengan halaman inti lain.
- Heading, label, dan jarak antar komponen mengikuti spacing scale.
- Focus ring seragam di semua komponen interaktif.
- Error state seragam (warna, ikon, wording singkat).
