<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kategori;
use Illuminate\Http\Request;

class KategoriController extends Controller
{
    /**
     * Get all categories for filter options
     */
    public function index()
    {
        try {
            $kategoris = Kategori::select(['id', 'name'])
                ->orderBy('name')
                ->get();

            return response()->json($kategoris);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Gagal mengambil data kategori',
                'message' => $e->getMessage()
            ], 500);
        }
    }
}