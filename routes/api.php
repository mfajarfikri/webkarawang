<?php

use App\Http\Controllers\Api\GuestController;
use App\Http\Controllers\BeritaController;
use App\Http\Controllers\Api\DataController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\WebhookController;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::post('/webhook/google-sheet', [WebhookController::class, 'handleGoogleSheet']);

Route::get('/berita', [DataController::class, 'berita']);
Route::get('/themes', [DataController::class, 'themes']);
Route::get('/showberita', [DataController::class, 'ShowBerita']);
Route::get('/gardu', [DataController::class, 'ShowGardu']);
Route::get('/stats', [DataController::class, 'stats']);
Route::post('/berita/{slug}/increment-read', [DataController::class, 'incrementReadCount']);
Route::patch('/berita/{id}/homepage', [DataController::class, 'updateBeritaHomepage']);
Route::delete('/berita/{berita}', [BeritaController::class, 'destroy']);

// Rute untuk menghapus berita
Route::get('/anomali', [DataController::class, 'ShowAnomali']);
Route::get('/anomali/overdue', [DataController::class, 'getOverdueAnomalies']);
Route::post('/anomali/update-overdue', [DataController::class, 'updateOverdueAnomalies']);
Route::middleware('auth:sanctum')->group(function() {
});



Route::get('/berita-paginated', function() {
    return response()->json(['data' => App\Models\Berita::with(['user', 'tema'])->latest()->paginate(6)]);
})->name('api.berita.index');

// Instagram feed endpoint
Route::get('/instagram/feed', function (Illuminate\Http\Request $request) {
    $service = app(App\Services\InstagramService::class);
    $limit = (int) $request->query('limit', 12);
    $data = $service->getFeed(max(1, min(50, $limit)));
    if (!$data['success']) {
        return response()->json([
            'success' => false,
            'error'   => $data['error'] ?? 'Gagal mengambil feed Instagram.',
        ], 502);
    }
    return response()->json([
        'success' => true,
        'profile' => $data['profile'] ?? null,
        'posts'   => $data['posts'] ?? [],
    ]);
})->name('api.instagram.feed');
