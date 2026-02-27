# Catatan Perubahan — Redesain UI KTT

## Tujuan
- Menyamakan tampilan halaman `KTT` dengan tema aplikasi: aksen `cyan/sky`, card rounded, shadow ringan, gradient halus, dan focus ring konsisten.
- Mempertahankan fungsionalitas: peta Leaflet, marker + tooltip + popup, lokasi user, dan loading state.

## Perubahan UI
- Menambahkan struktur halaman berbasis section + card (container konsisten, whitespace lebih rapi).
- Header halaman dibuat lebih informatif: ringkasan jumlah titik dengan koordinat + tombol “Lokasi saya”.
- Tombol “Lokasi saya” memakai style primary (hover/focus ring) dan badge status lokasi (aktif/nonaktif).
- Map dibungkus dalam card dengan header, legend ringkas, dan tinggi responsif (`vh`) untuk desktop/tablet/mobile.
- Empty state tampil sebagai overlay panel dashed di atas peta ketika data kosong.
- Popup marker dirapikan: nama, lokasi, tipe (badge), dan kapasitas.

## Catatan Teknis
- Koordinat `latitude/longitude` diparse aman (string/number) dan marker yang tidak valid di-skip.

## Testing
- `npm run build`
- Cek halaman `/ktt` di desktop/tablet/mobile:
  - Loading state tampil
  - Tombol “Lokasi saya” bekerja
  - Marker, tooltip, popup tampil
  - Empty state muncul saat data kosong

