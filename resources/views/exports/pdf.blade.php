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
      <ol class="ml-5 mt-2 list-decimal list-inside border" style="font-size:12px;">
        <li class="mb-2 leading-relaxed flex items-start">
          <span class="inline-block font-normal min-w-[220px]">DATA PERALATAN YANG RUSAK</span>
          <table class="content-table w-full ml-4">
            <tr>
              <td class="w-3"><span class="inline-block">a.</span></td>
              <td><span>Nama Peralatan</span></td>
              <td>: {{ $anomali->nama_peralatan }}</td>
            </tr>
            <tr>
              <td><span class="inline-block">b.</span></td>
              <td><span>Merk</span></td>
              <td>: {{ $anomali->merk }}</td>
            </tr>
            <tr>
              <td><span class="inline-block">c.</span></td>
              <td><span>Tipe</span></td>
              <td>: {{ $anomali->tipe_alat }}</td>
            </tr>
            <tr>
              <td><span class="inline-block">d.</span></td>
              <td><span>No Seri</span></td>
              <td>: {{ $anomali->no_seri }}</td>
            </tr>
            <tr>
              <td><span class="inline-block">e.</span></td>
              <td><span>Harga</span></td>
              <td>: {{ $anomali->harga }}</td>
            </tr>
            <tr>
              <td><span class="inline-block">f.</span></td>
              <td><span>Kode Asset</span></td>
              <td>: {{ $anomali->kode_asset }}</td>
            </tr>
            <tr>
              <td><span class="inline-block">g.</span></td>
              <td><span>Tahun Operasi</span></td>
              <td>: {{ $anomali->tahun_operasi }}</td>
            </tr>
            <tr>
              <td><span class="inline-block">h.</span></td>
              <td><span>Tahun Buat</span></td>
              <td>: {{ $anomali->tahun_buat }}</td>
            </tr>
          </table>
        </li>
        <li class="mb-2 leading-relaxed">
            <span class="inline-block font-normal">PENEMPATAN PERALATAN</span>
        </li>
      </ol>
      <table class="content-table w-full mt-2 ml-0">
        <tr>
          <td>{{ $anomali->penempatan_alat }}</td>
        </tr>
        <tr>
          <td><span class="inline-block">TANGGAL KEJADIAN</span></td>
          <td>{{ $anomali->tanggal_kejadian }}</td>
        </tr>
        <tr>
          <td><span class="inline-block">JENIS KERUSAKAN</span></td>
          <td>{{ $anomali->jenis_kerusakan }}</td>
        </tr>
        <tr>
          <td><span class="inline-block">PENYEBAB KERUSAKAN</span></td>
          <td>{{ $anomali->penyebab }}</td>
        </tr>
        <tr>
          <td><span class="inline-block">AKIBAT KERUSAKAN</span></td>
          <td>{{ $anomali->akibat }}</td>
        </tr>
        <tr>
          <td><span class="inline-block">USUL DAN SARAN</span></td>
          <td>{{ $anomali->usul_saran }}</td>
        </tr>
        <tr>
          <td><span class="inline-block">LAMPIRAN</span></td>
          <td>{{ $anomali->lampiran }}</td>
        </tr>
      </table>
    </div>

    <!-- Footer -->
    <div class="mt-12 text-center">
      <p>Karawang, {{ $anomali->tanggal_kejadian }}</p>
      <div class="flex justify-around mt-8 text-center">
        <div>
          <p>Mengetahui,</p>
          <p>Manager ULTG Karawang</p>
          <div class="h-20"></div>
          <p><span>Adi Kusmiyanto</span></p>
        </div>
        <div>
          <p>TL JARGI GI Telukjambe</p>
          <img
            src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/2099226c-19b6-477e-bfd4-ef7fd16ce45b.png"
            alt="Signature of Moch. Roni Ramdani"
            class="mt-4 max-h-24 mx-auto"
            style="margin-top:16px;max-height:96px;display:block;margin-left:auto;margin-right:auto;"
          />
          <p><span>Moch. Roni Ramdani</span></p>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
