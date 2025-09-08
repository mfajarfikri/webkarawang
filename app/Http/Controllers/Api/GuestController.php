<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Berita;
use App\Models\GarduInduk;
use Illuminate\Http\Request;

class GuestController extends Controller
{
    public function berita(Request $request)
    {
        $perPage = $request->query('per_page', 9); // Default 9 items per page
        $berita = Berita::with('user')->latest()->paginate($perPage);

        return response()->json([
            'berita' => $berita->items(),
            'pagination' => [
                'total' => $berita->total(),
                'per_page' => $berita->perPage(),
                'current_page' => $berita->currentPage(),
                'last_page' => $berita->lastPage(),
                'from' => $berita->firstItem(),
                'to' => $berita->lastItem()
            ]
        ]);
    }

    public function gardu()
    {
        $gardu = GarduInduk::all();

        return response()->json([
            'gardu' => $gardu
        ]);
    }

    /**
     * Increment the read count for a berita by slug.
     */
    public function incrementReadCount($slug)
    {
        $berita = Berita::where('slug', $slug)->first();

        if (!$berita) {
            return response()->json(['message' => 'Berita not found'], 404);
        }

        $berita->increment('read_count');

        return response()->json(['message' => 'Read count incremented successfully']);
    }
}
