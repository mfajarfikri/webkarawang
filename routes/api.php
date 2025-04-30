<?php

use App\Http\Controllers\Api\GuestController;
use App\Http\Controllers\BeritaController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::get('/berita', [GuestController::class, 'berita']);
