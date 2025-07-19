<?php

use App\Http\Controllers\Api\GuestController;
use App\Http\Controllers\BeritaController;
use App\Http\Controllers\Api\DataController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

Route::get('/berita', [GuestController::class, 'berita']);
Route::post('/berita/{slug}/increment-read', [GuestController::class, 'incrementReadCount']);

Route::get('/anomali', [DataController::class, 'ShowAnomali']);
Route::middleware('auth:sanctum')->group(function() {
});
