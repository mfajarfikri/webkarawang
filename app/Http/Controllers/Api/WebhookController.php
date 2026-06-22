<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Events\SheetDataUpdated;
use Illuminate\Support\Facades\Cache;

class WebhookController extends Controller
{
    public function handleGoogleSheet(Request $request)
    {
        $data = $request->all();
        
        // Simpan data terbaru ke Cache agar bisa di-load saat refresh halaman
        Cache::forever('kinerja_dashboard_data', $data);
        
        // Broadcast event untuk update realtime
        broadcast(new SheetDataUpdated($data));

        return response()->json(['status' => 'success', 'message' => 'Data broadcasted and cached']);
    }
}

