<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Http;

class KinerjaController extends Controller
{
    public function index()
    {
        return Inertia::render('Dashboard/Kinerja/Index');
    }

    public function fetchData()
    {
        $url = env('GOOGLE_SHEET_CSV_URL');
        
        if (!$url) {
            return response()->json(['error' => 'URL CSV Spreadsheet belum dikonfigurasi di .env (GOOGLE_SHEET_CSV_URL)'], 400);
        }

        try {
            $response = Http::get($url);
            if (!$response->successful()) {
                return response()->json(['error' => 'Gagal mengambil data dari Google Sheets'], 500);
            }

            $csvData = $response->body();
            $lines = explode("\n", trim($csvData));
            
            // Inisialisasi struktur data
            $parsedData = [
                'transmisi_kumulatif' => ['labels' => [], 'datasets' => []],
                'transmisi_ultg' => ['labels' => [], 'datasets' => []],
                'transmisi_penyebab' => ['labels' => [], 'datasets' => []],
                
                'trafo_kumulatif' => ['labels' => [], 'datasets' => []],
                'trafo_ultg' => ['labels' => [], 'datasets' => []],
                'trafo_penyebab' => ['labels' => [], 'datasets' => []],
                
                'security_kumulatif' => ['labels' => [], 'datasets' => []],
                'security_ultg' => ['labels' => [], 'datasets' => []],
                'security_penyebab' => ['labels' => [], 'datasets' => []],
            ];

            // Parsing baris per baris
            $currentSection = null;
            
            foreach ($lines as $index => $line) {
                // Gunakan str_getcsv dengan parameter escape kosong untuk menghindari deprecated warning
                $row = str_getcsv(trim($line), ",", '"', "");
                
                // Cek header section utama
                if (isset($row[0]) && str_contains(strtolower($row[0]), 'gangguan kumulatif transmisi')) {
                    $currentSection = 'transmisi';
                    continue;
                } elseif (isset($row[0]) && str_contains(strtolower($row[0]), 'gangguan kumulatif trafo')) {
                    $currentSection = 'trafo';
                    continue;
                } elseif (isset($row[0]) && str_contains(strtolower($row[0]), 'security index')) {
                    $currentSection = 'security';
                    continue;
                }

                // Skip baris kosong
                if (empty(array_filter($row))) continue;

                // Cek jika ini baris header bulan (Jan, Feb, Mar, dll)
                if (isset($row[1]) && (strtolower(trim($row[1])) == 'jan' || strtolower(trim($row[1])) == 'january')) {
                    if (!$currentSection) $currentSection = 'transmisi'; // Fallback jika tidak ada header
                    
                    // Ekstrak label dari header
                    // Bagian Kumulatif (kolom 1-12)
                    $parsedData[$currentSection . '_kumulatif']['labels'] = array_map('trim', array_slice($row, 1, 12));
                    
                    // Cari indeks header ULTG
                    $ultgStartIndex = false;
                    foreach ($row as $i => $val) {
                        if (strtoupper(trim($val)) == 'KARAWANG') {
                            $ultgStartIndex = $i;
                            break;
                        }
                    }

                    if ($ultgStartIndex !== false) {
                        $parsedData[$currentSection . '_ultg']['labels'] = array_map('trim', array_slice($row, $ultgStartIndex, 2));
                    }

                    // Cari indeks header Penyebab (berbeda per section)
                    $penyebabStartIndex = false;
                    foreach ($row as $i => $val) {
                        if ($ultgStartIndex !== false && $i > $ultgStartIndex + 2 && trim($val) != '' && !is_numeric(trim($val))) {
                            $penyebabStartIndex = $i;
                            break;
                        }
                    }
                    
                    if ($penyebabStartIndex !== false) {
                        $penyebabLabels = [];
                        for ($i = $penyebabStartIndex; $i < count($row); $i++) {
                            if (trim($row[$i]) != '') {
                                $penyebabLabels[] = trim($row[$i]);
                            }
                        }
                        $parsedData[$currentSection . '_penyebab']['labels'] = $penyebabLabels;
                    }
                    continue;
                }

                // Cek jika ini baris data tahun (2023, 2024, dll)
                if (isset($row[0]) && is_numeric(trim($row[0])) && $currentSection) {
                    $year = trim($row[0]);
                    
                    // Kumulatif (kolom 1-12)
                    $kumulatifData = array_map(function($val) { return trim($val) === '' ? null : (int)$val; }, array_slice($row, 1, 12));
                    $parsedData[$currentSection . '_kumulatif']['datasets'][] = [
                        'label' => $year,
                        'data' => $kumulatifData
                    ];

                    // ULTG (cari tahun yang sama di kolom setelah bulan)
                    $ultgYearIndex = false;
                    for ($i = 13; $i < count($row); $i++) {
                        if (trim($row[$i]) == $year) {
                            $ultgYearIndex = $i;
                            break;
                        }
                    }
                    
                    if ($ultgYearIndex !== false) {
                         $ultgData = array_map(function($val) { return trim($val) === '' ? 0 : (int)$val; }, array_slice($row, $ultgYearIndex + 1, 2));
                         $parsedData[$currentSection . '_ultg']['datasets'][] = [
                             'label' => $year,
                             'data' => $ultgData
                         ];
                         
                         // Penyebab
                         $penyebabYearIndex = false;
                         for ($i = $ultgYearIndex + 3; $i < count($row); $i++) {
                             if (trim($row[$i]) == $year) {
                                 $penyebabYearIndex = $i;
                                 break;
                             }
                         }

                         if ($penyebabYearIndex !== false && isset($parsedData[$currentSection . '_penyebab']['labels'])) {
                             $numLabels = count($parsedData[$currentSection . '_penyebab']['labels']);
                             $penyebabData = array_map(function($val) { return trim($val) === '' ? 0 : (int)$val; }, array_slice($row, $penyebabYearIndex + 1, $numLabels));
                             $parsedData[$currentSection . '_penyebab']['datasets'][] = [
                                 'label' => $year,
                                 'data' => $penyebabData
                             ];
                         }
                    }
                }
            }

            return response()->json($parsedData);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage() . ' di baris ' . $e->getLine()], 500);
        }
    }
}

