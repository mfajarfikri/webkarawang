<?php

use App\Http\Controllers\AnomaliController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\KttController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BeritaController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PermissionController;
use App\Http\Middleware\AutoPermission;

Route::controller(HomeController::class)->group(function () {
    Route::get('/', 'index')->name('home');
    Route::get('/berita', 'berita')->name('berita');
    Route::get('/berita/{slug}', 'beritaDetail')->name('berita.detail');
    Route::get('/gardu-induk', 'garduInduk')->name('gardu-induk');
    Route::get('/gallery', 'gallery')->name('gallery');
    Route::get('/ktt', 'ktt')->name('ktt.index');
    Route::get('/ruang-rapat', 'ruangRapat')->name("ruangRapat");
    Route::get('/struktur-organisasi', 'strukturOrganisasi')->name('struktur-organisasi');
    Route::get('/anomali', 'anomali')->name('anomali');
});


Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard.index');
});

Route::middleware(['auth'])->prefix('dashboard')->group(function () {

    
    Route::get('profile', [ProfileController::class, 'edit'])->name('dashboard.profile.edit');
    Route::patch('profile', [ProfileController::class, 'update'])->name('dashboard.profile.update');
    Route::delete('profile', [ProfileController::class, 'destroy'])->name('dashboard.profile.destroy');

    Route::get('berita', [BeritaController::class, 'index'])->name('dashboard.berita.index');
    Route::get('berita/create', [BeritaController::class, 'create'])->name('dashboard.berita.create');
    Route::post('berita/create', [BeritaController::class, 'store'])->name('dashboard.berita.store');
    Route::get('berita/{slug}', [BeritaController::class, 'show'])->name('dashboard.berita.show');

    Route::get('ktt', [KttController::class, 'index'])->middleware(AutoPermission::class . ':View Ktt')->name('dashboard.ktt.index');
    Route::post('ktt', [KttController::class, 'store'])->name('dashboard.ktt.store');

    Route::get('/anomali', [AnomaliController::class, 'index'])->middleware(AutoPermission::class . ':View Anomali')->name('dashboard.anomali.index');
    Route::get('/anomali/create', [AnomaliController::class, 'create'])->middleware(AutoPermission::class . ':View Anomali Create')->name('dashboard.anomali.create');

    Route::get('user', [UserController::class, 'index'])->name('dashboard.user.index');
    Route::post('user', [UserController::class, 'store'])->name('dashboard.user.store');
    Route::get('user/{id}/role', [UserController::class, 'showAssignRoleForm'])->name('dashboard.user.role.edit');
    Route::post('user/{id}/role', [UserController::class, 'updateRole'])->name('dashboard.user.role.update');

    Route::get('role', [RoleController::class, 'index'])->name('dashboard.role.index');
    Route::post('roles', [RoleController::class, 'store']);
    Route::resource('roles', RoleController::class)->only(['edit', 'update']);
    Route::delete('roles/{role}', [RoleController::class, 'destroy']);

    // Permission routes
    Route::get('permission', [PermissionController::class, 'index'])->name('permission.index');
    Route::post('permissions', [PermissionController::class, 'store'])->name('permissions.store');
    Route::delete('permissions/{permission}', [PermissionController::class, 'destroy'])->name('permissions.destroy');

    Route::get('role/{id}/permissions', [RoleController::class, 'editPermissions'])->name('role.permissions.edit');
    Route::post('role/{id}/permissions', [RoleController::class, 'updatePermissions'])->name('role.permissions.update');
});

require __DIR__ . '/auth.php';
