<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Berita;
use Illuminate\Http\Request;

class GuestController extends Controller
{
    public function berita()
    {
        $berita = Berita::with('user')->latest()->get();

        return response()->json([
            'berita' => $berita
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
