<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Anomali;
use Illuminate\Http\Request;

class DataController extends Controller
{
    public function ShowAnomali(Request $request) {
        $anomalis = Anomali::with(['garduInduk', 'kategori', 'user'])->get();
        return response()->json([
            'anomalis' => $anomalis
        ]);
    }
}
