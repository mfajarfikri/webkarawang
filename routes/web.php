<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\KaryawanController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\BeritaController;
use App\Http\Controllers\KttController;


Route::controller(HomeController::class)->group(function () {
    Route::get('/', 'index')->name('home');
    Route::get('/berita', 'berita')->name('berita');
    Route::get('/berita/{slug}', 'beritaDetail')->name('berita.detail');
    Route::get('/gardu-induk', 'garduInduk')->name('gardu-induk');
    Route::get('/gallery', 'gallery')->name('gallery');
    Route::get('/ktt', 'ktt')->name('ktt');
    Route::get('/ruang-rapat', 'ruangRapat')->name("ruangRapat");
    Route::get('/struktur-organisasi', 'strukturOrganisasi')->name('struktur-organisasi');
    Route::get('/anomali', 'anomali')->name('anomali');
});


Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('dashboard/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('dashboard/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('dashboard/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('dashboard/karyawan', [KaryawanController::class, 'index'])->name('karyawan.index');
    Route::post('dashboard/karyawan', [KaryawanController::class, 'store'])->name('karyawan.store');
    Route::get('dashboard/karyawan/download-template', [KaryawanController::class, 'downloadTemplate'])->name('karyawan.download-template');
    Route::post('dashboard/karyawan/import', [KaryawanController::class, 'importExcel'])->name('karyawan.import');

    Route::get('dashboard/berita', [BeritaController::class, 'index'])->name('berita.index');
    Route::get('dashboard/berita/create', [BeritaController::class, 'create'])->name('berita.create');
    Route::post('dashboard/berita/create', [BeritaController::class, 'store'])->name('berita.store');
    Route::get('dashboard/berita/{slug}', [BeritaController::class, 'show'])->name('berita.show');

    Route::get('dashboard/ktt', [KttController::class, 'index'])->name('ktt.index');
    Route::post('dashboard/ktt', [KttController::class, 'store'])->name('ktt.store');
});

require __DIR__ . '/auth.php';
