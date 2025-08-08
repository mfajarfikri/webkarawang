<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Anomali;
use Illuminate\Http\Request;

class AnomaliController extends Controller
{
    /**
     * Get anomali statistics for dashboard charts
     */
    public function statistics()
    {
        try {
            $anomalis = Anomali::with(['gardu_induk', 'kategori'])
                ->select([
                    'id',
                    'ultg',
                    'tipe',
                    'bagian',
                    'kategori_id',
                    'gardu_id',
                    'status',
                    'created_at'
                ])
                ->get()
                ->map(function ($anomali) {
                    return [
                        'id' => $anomali->id,
                        'ultg' => $anomali->ultg,
                        'tipe' => $anomali->tipe,
                        'bagian' => $anomali->bagian,
                        'kategori' => $anomali->kategori ? $anomali->kategori->name : 'Tidak Diketahui',
                        'gardu' => $anomali->gardu_induk ? $anomali->gardu_induk->name : 'Tidak Diketahui',
                        'status' => $anomali->status,
                        'created_at' => $anomali->created_at->format('Y-m-d')
                    ];
                });

            return response()->json($anomalis);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Gagal mengambil data statistik anomali',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}