<?php

use App\Http\Controllers\Api\GuestController;
use App\Http\Controllers\BeritaController;
use App\Http\Controllers\Api\DataController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/berita', [DataController::class, 'berita']);
Route::get('/themes', [DataController::class, 'themes']);
Route::get('/showberita', [DataController::class, 'ShowBerita']);
Route::get('/gardu', [DataController::class, 'ShowGardu']);
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
