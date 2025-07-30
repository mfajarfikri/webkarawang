<?php
namespace App\Exports;

use App\Models\Anomali;
use App\Models\GarduInduk;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class AnomaliExport implements FromCollection, WithHeadings
{
    protected $months;
    protected $ultgs;
    protected $gardus;

    public function __construct($months = [], $ultgs = [], $gardus = [])
    {
        $this->months = $months;
        $this->ultgs = $ultgs;
        $this->gardus = $gardus;
    }

    public function collection()
    {
        $query = Anomali::query();

        // Filter by months
        if (!empty($this->months)) {
            $query->where(function($q) {
                foreach ($this->months as $month) {
                    [$year, $monthNum] = explode('-', $month);
                    $q->orWhere(function($subQ) use ($year, $monthNum) {
                        $subQ->whereYear('tanggal_kejadian', $year)
                              ->whereMonth('tanggal_kejadian', $monthNum);
                    });
                }
            });
        }

        // Filter by ULTGs
        if (!empty($this->ultgs)) {
            $query->whereIn('ultg', $this->ultgs);
        }

        // Filter by Gardu Induks
        if (!empty($this->gardus)) {
            $query->whereHas('gardu_induk', function($q) {
                $q->whereIn('name', $this->gardus);
            });
        }

        return $query->with(['gardu_induk', 'kategori', 'user'])
            ->get()
            ->map(function ($a) {
                return [
                    'Judul' => $a->judul,
                    'ULTG' => $a->ultg,
                    'Gardu Induk' => $a->gardu_induk->name ?? '-',
                    'Bagian' => $a->bagian,
                    'Tipe' => $a->tipe,
                    'Kategori' => $a->kategori->name ?? '-',
                    'Peralatan' => $a->peralatan,
                    'Merek' => $a->merek ?? '-',
                    'Tipe Alat' => $a->tipe_alat ?? '-',
                    'No Seri' => $a->no_seri ?? '-',
                    'Harga' => $a->harga ?? '-',
                    'Kode Asset' => $a->kode_asset ?? '-',
                    'Tahun Operasi' => $a->tahun_operasi ?? '-',
                    'Tahun Buat' => $a->tahun_buat ?? '-',
                    'Penempatan Alat' => $a->penempatan_alat,
                    'Tanggal Kejadian' => $a->tanggal_kejadian,
                    'Penyebab' => $a->penyebab,
                    'Akibat' => $a->akibat,
                    'Usul/Saran' => $a->usul_saran,
                    'Status' => $a->status,
                    'User' => $a->user->name ?? '-',
                    'Tanggal Dibuat' => $a->created_at,
                    'Tanggal Diupdate' => $a->updated_at,
                ];
            });
    }

    public function headings(): array
    {
        return [
            'Judul',
            'ULTG',
            'Gardu Induk',
            'Bagian',
            'Tipe',
            'Kategori',
            'Peralatan',
            'Merek',
            'Tipe Alat',
            'No Seri',
            'Harga',
            'Kode Asset',
            'Tahun Operasi',
            'Tahun Buat',
            'Penempatan Alat',
            'Tanggal Kejadian',
            'Penyebab',
            'Akibat',
            'Usul/Saran',
            'Status',
            'User',
            'Tanggal Dibuat',
            'Tanggal Diupdate',
        ];
    }
}
