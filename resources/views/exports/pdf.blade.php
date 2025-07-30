<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Formulir Laporan Ketidaksesuaian/Kerusakan Peralatan (LKP)</title>
    <style>
    body {
        font-family: Arial, Helvetica, sans-serif;
        font-size: 12px;
        color: #222;
    }
    .header-top{
        padding: 0;
        margin: 0;
    }
    table {
    width: 100%;
    border-collapse: collapse;
    font-size: 11px;
    font-family: Arial, sans-serif;
  }
    </style>
</head>
<body>
    <div class="main-border">
        <table class="" cellspacing="0" cellpadding="0">
            <tr>
                <td class="no-border" style="padding:0;">
                    <table class="header-table" style="margin-bottom:0;">
                        <tr class="header-top">
                            <td rowspan="3" style="width: 70px; text-align: center; vertical-align: middle; border: 1px solid #000;">
                                <div style="font-size: 18px; font-weight: bold; line-height: 1.1; text-align: center; font-weight: bold; font-size: 14px; justify-content: center; align-items: center; height: 100%;">
                                    LEVEL<br>
                                    <span class="level-number" style="font-size: 28px; font-weight: normal;">4</span>
                                </div>
                            </td>
                            <td style="width: 18%; border: 1px solid #000; font-size:11px; padding:4px;">No. Informasi<br>Terdokumentasi</td>
                            <td style="width: 27%; border: 1px solid #000; font-size:11px; padding:4px;">0004.FML/SMT/HAR/UITJBT/2022</td>
                            <td style="width: 15%; border: 1px solid #000; font-size:11px; padding:4px;">Berlaku<br>Efektif</td>
                            <td style="width: 15%; border: 1px solid #000; font-size:11px; padding:4px;">Januari 2024</td>
                        </tr>
                        <tr>
                            <td style="border: 1px solid #000; font-size:11px; padding:4px;">Status</td>
                            <td style="border: 1px solid #000; font-size:11px; padding:4px;">Edisi : 01 / Revisi : 02</td>
                            <td style="border: 1px solid #000; font-size:11px; padding:4px;">Halaman</td>
                            <td style="border: 1px solid #000; font-size:11px; padding:4px;">1 dari 2</td>
                        </tr>
                        <tr>
                            <td colspan="4" class="title" style="border: 1px solid #000; font-weight: bold; text-align: center; font-size:12px; line-height:1.3; padding:8px;">
                                FORMULIR LAPORAN KETIDAKSESUAIAN/KERUSAKAN PERALATAN (LKP)<br>
                                PT PLN (PERSERO) UNIT INDUK TRANSMISI JAWA BAGIAN TENGAH
                            </td>
                        </tr>
                    </table>
                    {{-- <table class="content-table">
                        <tr>
                            <td class="section-number">1.</td>
                            <td class="bold" colspan="3">DATA PERALATAN YANG RUSAK</td>
                        </tr>
                        <tr>
                            <td></td>
                            <td class="sub-label">a.</td>
                            <td>Nama Peralatan</td>
                            <td>: <span class="bold">{{ $anomali->peralatan ?? '-' }}</span></td>
                        </tr>
                        <tr>
                            <td></td><td class="sub-label">b.</td><td>Merk</td><td>: {{ $anomali->merek ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td></td><td class="sub-label">c.</td><td>Tipe</td><td>: {{ $anomali->tipe_alat ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td></td><td class="sub-label">d.</td><td>No Seri</td><td>: {{ $anomali->no_seri ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td></td><td class="sub-label">e.</td><td>Harga</td><td>: {{ $anomali->harga ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td></td><td class="sub-label">f.</td><td>Kode Asset</td><td>: {{ $anomali->kode_asset ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td></td><td class="sub-label">g.</td><td>Tahun Operasi</td><td>: {{ $anomali->tahun_operasi ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td></td><td class="sub-label">h.</td><td>Tahun Buat</td><td>: {{ $anomali->tahun_buat ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td class="section-number">2.</td>
                            <td colspan="2">PENEMPATAN PERALATAN</td>
                            <td>: {{ $anomali->penempatan_alat ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td class="section-number">3.</td>
                            <td colspan="2">TANGGAL KEJADIAN</td>
                            <td>: {{ \Carbon\Carbon::parse($anomali->tanggal_kejadian)->format('d F Y') ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td class="section-number">4.</td>
                            <td colspan="2">JENIS KERUSAKAN</td>
                            <td>: {{ $anomali->judul ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td class="section-number">5.</td>
                            <td colspan="2">PENYEBAB KERUSAKAN</td>
                            <td>: {{ $anomali->penyebab ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td class="section-number">6.</td>
                            <td colspan="2">AKIBAT KERUSAKAN</td>
                            <td>: {{ $anomali->akibat ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td class="section-number">7.</td>
                            <td colspan="2">USUL DAN SARAN</td>
                            <td>: {{ $anomali->usul_saran ?? '-' }}</td>
                        </tr>
                        <tr>
                            <td class="section-number">8.</td>
                            <td colspan="2">LAMPIRAN</td>
                            <td>: <span class="bold">Terlampir Foto Hotpot Dan Nameplate</span></td>
                        </tr>
                    </table> --}}
                    <div style="margin-top: 32px;">
                        <div style="text-align:right; margin-bottom: 8px;">Karawang, {{ \Carbon\Carbon::parse($anomali->tanggal_kejadian)->format('d F Y') ?? '-' }}</div>
                        <table class="signature">
                            <tr>
                                <td>Mengetahui,<br>Manager ULTG Karawang<br><br><br><br><span class="underline">Adi Kusmiyanto</span></td>
                                <td>TL JARGI GI Telukjambe<br><br><br><br><span class="underline">Moch. Roni Ramdani</span></td>
                            </tr>
                        </table>
                    </div>
                </td>
            </tr>
        </table>
    </div>
</body>
</html>
