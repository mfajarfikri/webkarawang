<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Formulir Laporan</title>
  <style>
    body {
      background-color: #fff;
      color: #000;
      font-size: 12px;
      font-family: sans-serif;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 100%;
      margin: 0;
      border: 1px solid #000;
      padding: 0;
    }
    table {
      width: 98%;
      border-collapse: collapse;
      margin: 16px 8px;
      font-size: 12px;
    }
    th, td {
      border: 1px solid #000;
      padding: 4px 8px;
      text-align: center;
      vertical-align: middle;
    }
    .header-title {
      font-weight: bold;
      font-size: 20px;
      text-align: center;
    }
    .header-subtitle {
      font-weight: bold;
      text-transform: uppercase;
      font-size: 11px;
      text-align: center;
    }
    .pt-8 {
      padding-top: 32px;
    }
    .ml-5 {
      margin-left: 20px;
    }
    .mt-2 {
      margin-top: 8px;
    }
    .mb-2 {
      margin-bottom: 8px;
    }
    .list-decimal {
      list-style-type: decimal;
    }
    .list-inside {
      list-style-position: inside;
    }
    .leading-relaxed {
      line-height: 1.6;
    }
    .font-normal {
      font-weight: normal;
    }
    .inline-block {
      display: inline-block;
    }
    .w-3{
        width: 3%;
    }
    .w-30 {
      width: 30%;
    }
    .w-full {
      width: 100%;
    }
    .ml-4 {
      margin-left: 16px;
    }
    .mt-12 {
      margin-top: 48px;
    }
    .text-center {
      text-align: center;
    }
    .flex {
      display: flex;
    }
    .justify-around {
      justify-content: space-around;
    }
    .mt-8 {
      margin-top: 32px;
    }
    .h-20 {
      height: 80px;
    }
    .max-h-24 {
      max-height: 96px;
    }
    .mx-auto {
      display: block;
      margin-left: auto;
      margin-right: auto;
    }
    /* Remove border for some table cells as in original */
    .no-border {
      border: none !important;
    }
    /* Remove border for first table (header) */
    .header-table td, .header-table th {
      border: 1px solid #000;
      padding: 4px 8px;
      text-align: center;
      vertical-align: middle;
    }
    /* Remove border for content table */
    .content-table td, .content-table th {
      border: none;
      padding: 4px 8px;
      text-align: left;
      vertical-align: middle;
    }
  </style>
</head>
<body>
    {{-- @dd($anomali) --}}
  <div class="container">
    <!-- Header -->
    <table class="header-table">
      <tr>
        <td rowspan="3" class="header-title">LEVEL<br>4</td>
        <td>No. Informasi Terdokumentasi</td>
        <td colspan="1">0004.FML/SMT/HAR/UITJBT/2022</td>
        <td>Berlaku Efektif</td>
        <td>Januari 2024</td>
      </tr>
      <tr>
        <td>Status</td>
        <td>Edisi : 01 / Revisi : 02</td>
        <td>Halaman</td>
        <td>1 dari 2</td>
      </tr>
      <tr>
        <td colspan="4" class="header-subtitle">
          FORMULIR LAPORAN KETIDAKSESUAIAN/KERUSAKAN PERALATAN (LKP)<br>
          PT PLN (PERSERO) UNIT INDUK TRANSMISI JAWA BAGIAN TENGAH
        </td>
      </tr>
    </table>

    <!-- Content -->
    <div class="pt-8">
      <ol class="ml-5 mt-2 list-decimal list-inside" style="font-size:12px;">
        <li class="mb-2 leading-relaxed">
          <span class="inline-block font-normal justify-center">DATA PERALATAN YANG RUSAK</span>
          <table class="no-border content-table" style="width: 100%; border-collapse: collapse; margin-left: 16px; margin-top: 8px;">
            <tr>
              <td style="width: 20px; padding: 3px 0; vertical-align: top;">a.</td>
              <td style="width: 120px; padding: 3px 0; vertical-align: top;">Nama Peralatan</td>
              <td style="width: 20px; padding: 3px 0; vertical-align: top;">:</td>
              <td style="padding: 3px 0; vertical-align: top;">{{ $anomali->peralatan ?? '-' }}</td>
            </tr>
            <tr>
              <td style="width: 20px; padding: 3px 0; vertical-align: top;">b.</td>
              <td style="width: 120px; padding: 3px 0; vertical-align: top;">Merk</td>
              <td style="width: 20px; padding: 3px 0; vertical-align: top;">:</td>
              <td style="padding: 3px 0; vertical-align: top;">{{ $anomali->merek ?? '-' }}</td>
            </tr>
            <tr>
              <td style="width: 20px; padding: 3px 0; vertical-align: top;">c.</td>
              <td style="width: 120px; padding: 3px 0; vertical-align: top;">Tipe</td>
              <td style="width: 20px; padding: 3px 0; vertical-align: top;">:</td>
              <td style="padding: 3px 0; vertical-align: top;">{{ $anomali->tipe_alat ?? '-' }}</td>
            </tr>
            <tr>
              <td style="width: 20px; padding: 3px 0; vertical-align: top;">d.</td>
              <td style="width: 120px; padding: 3px 0; vertical-align: top;">No Seri</td>
              <td style="width: 20px; padding: 3px 0; vertical-align: top;">:</td>
              <td style="padding: 3px 0; vertical-align: top;">{{ $anomali->no_seri ?? '-' }}</td>
            </tr>
            <tr>
              <td style="width: 20px; padding: 3px 0; vertical-align: top;">e.</td>
              <td style="width: 120px; padding: 3px 0; vertical-align: top;">Harga</td>
              <td style="width: 20px; padding: 3px 0; vertical-align: top;">:</td>
              <td style="padding: 3px 0; vertical-align: top;">{{ $anomali->harga ?? '-' }}</td>
            </tr>
            <tr>
              <td style="width: 20px; padding: 3px 0; vertical-align: top;">f.</td>
              <td style="width: 120px; padding: 3px 0; vertical-align: top;">Kode Asset</td>
              <td style="width: 20px; padding: 3px 0; vertical-align: top;">:</td>
              <td style="padding: 3px 0; vertical-align: top;">{{ $anomali->kode_asset ?? '-' }}</td>
            </tr>
            <tr>
              <td style="width: 20px; padding: 3px 0; vertical-align: top;">g.</td>
              <td style="width: 120px; padding: 3px 0; vertical-align: top;">Tahun Operasi</td>
              <td style="width: 20px; padding: 3px 0; vertical-align: top;">:</td>
              <td style="padding: 3px 0; vertical-align: top;">{{ $anomali->tahun_operasi ?? '-' }}</td>
            </tr>
            <tr>
              <td style="width: 20px; padding: 3px 0; vertical-align: top;">h.</td>
              <td style="width: 120px; padding: 3px 0; vertical-align: top;">Tahun Buat</td>
              <td style="width: 20px; padding: 3px 0; vertical-align: top;">:</td>
              <td style="padding: 3px 0; vertical-align: top;">{{ $anomali->tahun_buat ?? '-' }}</td>
            </tr>
          </table>
        </li>
      </ol>
      <table class="no-border content-table" style="width: 90%; border-collapse: collapse; margin-bottom: 10px; margin-left: 50px;">

          <tr>
            <td style="width: 30%; padding: 3px 0; vertical-align: top; font-weight: normal;">2. BAY</td>
            <td style="width: 5%; padding: 3px 0; vertical-align: top;">:</td>
            <td style="width: 65%; padding: 3px 0; vertical-align: top;">{{ $anomali->bay ?? '-' }}</td>
          </tr>
          <tr>
            <td style="width: 30%; padding: 3px 0; vertical-align: top; font-weight: normal;">3. PENEMPATAN PERALATAN</td>
            <td style="width: 5%; padding: 3px 0; vertical-align: top;">:</td>
            <td style="width: 65%; padding: 3px 0; vertical-align: top;">{{ $anomali->penempatan_alat ?? '-' }}</td>
          </tr>
          <tr>
            <td style="width: 30%; padding: 3px 0; vertical-align: top; font-weight: normal;">4. TANGGAL KEJADIAN</td>
            <td style="width: 5%; padding: 3px 0; vertical-align: top;">:</td>
            <td style="width: 65%; padding: 3px 0; vertical-align: top;">{{ \Carbon\Carbon::parse($anomali->tanggal_kejadian)->format('d F Y') ?? '-' }}</td>
          </tr>
          <tr>
            <td style="width: 30%; padding: 3px 0; vertical-align: top; font-weight: normal;">5. JENIS KERUSAKAN</td>
            <td style="width: 5%; padding: 3px 0; vertical-align: top;">:</td>
            <td style="width: 65%; padding: 3px 0; vertical-align: top;">{{ $anomali->kategori->name ?? '-' }}</td>
          </tr>
          <tr>
            <td style="width: 30%; padding: 3px 0; vertical-align: top; font-weight: normal;">6. PENYEBAB KERUSAKAN</td>
            <td style="width: 5%; padding: 3px 0; vertical-align: top;">:</td>
            <td style="width: 65%; padding: 3px 0; vertical-align: top;">{{ $anomali->penyebab ?? '-' }}</td>
          </tr>
          <tr>
            <td style="width: 30%; padding: 3px 0; vertical-align: top; font-weight: normal;">7. AKIBAT KERUSAKAN</td>
            <td style="width: 5%; padding: 3px 0; vertical-align: top;">:</td>
            <td style="width: 65%; padding: 3px 0; vertical-align: top;">{{ $anomali->akibat ?? '-' }}</td>
          </tr>
          <tr>
            <td style="width: 30%; padding: 3px 0; vertical-align: top; font-weight: normal;">8. USUL DAN SARAN</td>
            <td style="width: 5%; padding: 3px 0; vertical-align: top;">:</td>
            <td style="width: 65%; padding: 3px 0; vertical-align: top;">{{ $anomali->usul_saran ?? '-' }}</td>
          </tr>
          <tr>
            <td style="width: 30%; padding: 3px 0; vertical-align: top; font-weight: normal;">9. LAMPIRAN</td>
            <td style="width: 5%; padding: 3px 0; vertical-align: top;">:</td>
            <td style="width: 65%; padding: 3px 0; vertical-align: top; font-weight: bold;">
              @if($anomali->lampiran_foto && json_decode($anomali->lampiran_foto))
                Terlampir Foto Pendukung
              @else
                -
              @endif
            </td>
          </tr>
        </table>
    </div>

    <!-- Footer -->
    <div class="mt-12">
      <p style="text-align: center; margin-bottom: 20px;">Karawang, {{ \Carbon\Carbon::parse($anomali->tanggal_kejadian)->locale('id')->translatedFormat('d F Y') }}</p>
      <table style="width: 100%; border: none;">
        <tr>
          <td style="width: 50%; text-align: center; vertical-align: top; border: none;">
            <p>Mengetahui,</p>
            <p>Manager {{ $anomali->ultg ?? 'ULTG Karawang' }}</p>
            @if($anomali->tanda_tangan_approve)
              <img
                src="{{ public_path('storage/' . $anomali->tanda_tangan_approve) }}"
                alt="Signature of Manager"
                class="mt-4 max-h-24 mx-auto"
                style="margin-top:16px;max-height:96px;display:block;margin-left:auto;margin-right:auto;"
              />
            @else
              <div class="h-20"></div>
            @endif
            <p><span style="font-weight: bold; text-decoration: underline;">{{ $anomali->approvedBy->name ?? 'Adi Kusmiyanto' }}</span></p>
          </td>
          <td style="width: 50%; text-align: center; vertical-align: top; border: none;">
            <p>TL JARGI {{ preg_replace('/^(GI|GITET|GIS|GISTET)\s+(\d+KV\s+)?/i', '', $anomali->gardu_induk->name) ?? '...' }}</p>
            @if($anomali->user && $anomali->user->tanda_tangan_path)
              <img
                src="{{ public_path('storage/' . $anomali->user->tanda_tangan_path) }}"
                alt="Signature of {{ $anomali->user->name }}"
                class="mt-4 max-h-24 mx-auto"
                style="margin-top:16px;max-height:96px;display:block;margin-left:auto;margin-right:auto;"
              />
            @else
              <div class="h-20"></div>
            @endif
            <p><span style="font-weight: bold; text-decoration: underline;">{{ $anomali->user->name ?? 'Nama Tidak Tersedia' }}</span></p>
          </td>
        </tr>
      </table>
    </div>
  </div>

  @php
    $lampiran = json_decode($anomali->lampiran_foto);
  @endphp
  @if($lampiran && is_array($lampiran) && count($lampiran) > 0)
    <div style="page-break-before: always;"></div>
    <div class="container">
      <table class="header-table">
      <tr>
        <td rowspan="3" class="header-title">LEVEL<br>4</td>
        <td>No. Informasi Terdokumentasi</td>
        <td colspan="1">0004.FML/SMT/HAR/UITJBT/2022</td>
        <td>Berlaku Efektif</td>
        <td>Januari 2024</td>
      </tr>
      <tr>
        <td>Status</td>
        <td>Edisi : 01 / Revisi : 02</td>
        <td>Halaman</td>
        <td>2 dari 2</td>
      </tr>
      <tr>
        <td colspan="4" class="header-subtitle">
          FORMULIR LAPORAN KETIDAKSESUAIAN/KERUSAKAN PERALATAN (LKP)<br>
          PT PLN (PERSERO) UNIT INDUK TRANSMISI JAWA BAGIAN TENGAH
        </td>
      </tr>
    </table>
      <div style="padding: 20px; text-align: center;">
        <p style="margin-bottom: 20px;">Lampiran</p>
        @foreach($lampiran as $foto)
          <div style="display: inline-block; width: 45%; margin: 5px; vertical-align: middle;">
            <img src="{{ public_path('storage/' . $foto) }}" alt="Foto Lampiran" style="max-width: 98%; max-height: 300px; border: 1px solid #ccc; padding: 5px;" />
          </div>
        @endforeach
      </div>
    </div>
  @endif
</body>
</html>
