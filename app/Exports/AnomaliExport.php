<?php
namespace App\Exports;

use App\Models\Anomali;
use App\Models\GarduInduk;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;

class AnomaliExport implements FromCollection, WithHeadings
{
    protected $month;
    protected $ultg;
    protected $gardu;

    public function __construct($month, $ultg = 'all', $gardu = 'all')
    {
        $this->month = $month;
        $this->ultg = $ultg;
        $this->gardu = $gardu;
    }

    public function collection()
    {
        $query = Anomali::query();

        if ($this->month && $this->month !== 'all') {
            [$year, $month] = explode('-', $this->month);
            $query->whereYear('tanggal_kejadian', $year)
                  ->whereMonth('tanggal_kejadian', $month);
        }
        if ($this->ultg && $this->ultg !== 'all') {
            $query->where('ultg', $this->ultg);
        }
        if ($this->gardu && $this->gardu !== 'all') {
            $query->whereHas('gardu_induk', function($q) {
                $q->where('name', $this->gardu);
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
                    'Penempatan Alat' => $a->penempatan_alat,
                    'Tanggal Kejadian' => $a->tanggal_kejadian,
                    'Status' => $a->status,
                    'User' => $a->user->name ?? '-',
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
            'Penempatan Alat',
            'Tanggal Kejadian',
            'Status',
            'User',
        ];
    }
}
