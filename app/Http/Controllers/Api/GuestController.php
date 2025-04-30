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
}
