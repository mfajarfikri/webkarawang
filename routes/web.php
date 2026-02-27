<?php

use App\Http\Controllers\AnomaliController;
use App\Http\Controllers\AnomaliTimelineController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\KttController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BeritaController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\GarduIndukController;
use App\Http\Controllers\PermissionController;
use App\Http\Middleware\AutoPermission;
use App\Http\Controllers\Auth\SocialiteController;
use App\Http\Controllers\Dashboard\CompanyProfileController;

Route::controller(HomeController::class)->group(function () {
    Route::get('/', 'index')->name('home');
    Route::get('/profil', 'profilPerusahaan')->name('profil');
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
    Route::post('profile/upload-media', [ProfileController::class, 'uploadMedia'])->name('dashboard.profile.upload-media');
    Route::post('profile/tanda-tangan', [ProfileController::class, 'tandaTangan'])->name('dashboard.profile.tanda-tangan');

    Route::get('berita', [BeritaController::class, 'index'])->name('dashboard.berita.index')->middleware(AutoPermission::class . ':Dashboard Berita');
    Route::get('berita/fetch-url', [BeritaController::class, 'fetchUrl'])->name('dashboard.berita.fetch-url');
    Route::get('berita/create', [BeritaController::class, 'create'])->name('dashboard.berita.create')->middleware(AutoPermission::class . ':Buat Berita');
    Route::post('berita/create', [BeritaController::class, 'store'])->name('dashboard.berita.store')->middleware(AutoPermission::class . ':Buat Berita');
    Route::get('berita/{slug}', [BeritaController::class, 'show'])->name('dashboard.berita.show')->middleware(AutoPermission::class . ':Detail Berita');
    Route::get('berita/{berita:slug}/edit', [BeritaController::class, 'edit'])->name('dashboard.berita.edit')->middleware(AutoPermission::class . ':Edit Berita');
    Route::post('berita/{berita:slug}', [BeritaController::class, 'update'])->name('dashboard.berita.update')->middleware(AutoPermission::class . ':Edit Berita');
    Route::delete('berita/{berita}', [BeritaController::class, 'destroy'])->name('dashboard.berita.destroy')->middleware(AutoPermission::class . ':Hapus Berita');

    Route::get('ktt', [KttController::class, 'index'])->middleware(AutoPermission::class . ':View Ktt')->name('dashboard.ktt.index');
    Route::post('ktt', [KttController::class, 'store'])->middleware(AutoPermission::class . ':Buat Ktt')->name('dashboard.ktt.store');

    Route::get('/anomali', [AnomaliController::class, 'index'])->middleware(AutoPermission::class . ':View Anomali')->name('dashboard.anomali.index');
    Route::get('/anomali/create', [AnomaliController::class, 'create'])->middleware(AutoPermission::class . ':View Anomali Create')->name('dashboard.anomali.create');
    Route::get('/anomali/review/{anomali:slug}', [AnomaliController::class, 'review'])->middleware(AutoPermission::class . ':Review Anomali')->name('dashboard.anomali.review');
    Route::post('/anomali/{anomali:slug}/approve', [AnomaliController::class, 'approve'])->middleware(AutoPermission::class . ':Approve Anomali')->name('dashboard.anomali.approve');
    Route::post('/anomali', [AnomaliController::class, 'store'])->name('dashboard.anomali.store');
    Route::get('/anomali/export', [AnomaliController::class, 'export'])->name('dashboard.anomali.export');
    Route::get('/anomali/{anomali:slug}', [AnomaliController::class, 'show'])->name('dashboard.anomali.show');
    Route::get('/anomali/{anomali:slug}/pdf', [AnomaliController::class, 'exportPdf'])->name('dashboard.anomali.pdf');
    Route::get('/anomali/{anomali:slug}/schedule', [AnomaliController::class, 'schedule'])->name('dashboard.anomali.schedule');
    Route::post('/anomali/{anomali:slug}/schedule', [AnomaliController::class, 'updateSchedule'])->name('dashboard.anomali.schedule.update');
    Route::delete('/anomali/{anomali:slug}/schedule', [AnomaliController::class, 'deleteSchedule'])->name('dashboard.anomali.schedule.destroy');

    Route::get('/anomali/{anomali:slug}/tutup', [AnomaliController::class, 'closeForm'])->middleware(AutoPermission::class . ':View Anomali')->name('dashboard.anomali.close');
    Route::post('/anomali/{anomali:slug}/tutup', [AnomaliController::class, 'closeStore'])->middleware(AutoPermission::class . ':View Anomali')->name('dashboard.anomali.close.store');

    // Anomali Timeline Routes
    Route::get('/anomali/{anomaliId}/timeline', [AnomaliTimelineController::class, 'index'])->name('dashboard.anomali.timeline.index');
    Route::post('/anomali/{anomaliId}/timeline', [AnomaliTimelineController::class, 'store'])->name('dashboard.anomali.timeline.store');
    Route::put('/anomali/{anomaliId}/timeline/{timelineId}', [AnomaliTimelineController::class, 'update'])->name('dashboard.anomali.timeline.update');
    Route::delete('/anomali/{anomaliId}/timeline/{timelineId}', [AnomaliTimelineController::class, 'destroy'])->name('dashboard.anomali.timeline.destroy');
    Route::get('/anomali/{anomaliId}/timeline/statistics', [AnomaliTimelineController::class, 'statistics'])->name('dashboard.anomali.timeline.statistics');


    Route::get('garduinduk', [GarduIndukController::class, 'index'])->name('dashboard.gardu.index');

    Route::get('user', [UserController::class, 'index'])->name('dashboard.user.index');
    Route::post('user', [UserController::class, 'store'])->name('dashboard.user.store');
    Route::delete('user/{id}', [UserController::class, 'destroy'])->name('dashboard.user.destroy');
    Route::get('user/{id}/role', [UserController::class, 'showAssignRoleForm'])->name('dashboard.user.role.edit');
    Route::post('user/{id}/role', [UserController::class, 'update'])->name('dashboard.user.role.update');

    Route::get('role', [RoleController::class, 'index'])->name('dashboard.role.index')->middleware(AutoPermission::class . ':View Anomali');
    Route::post('roles', [RoleController::class, 'store']);
    Route::resource('roles', RoleController::class)->only(['edit', 'update']);
    Route::delete('roles/{role}', [RoleController::class, 'destroy']);

    // Permission routes
    Route::get('permission', [PermissionController::class, 'index'])->name('permission.index');
    Route::post('permissions', [PermissionController::class, 'store'])->name('permissions.store');
    Route::delete('permissions/{permission}', [PermissionController::class, 'destroy'])->name('permissions.destroy');

    Route::get('role/{id}/permissions', [RoleController::class, 'editPermissions'])->name('role.permissions.edit');
    Route::post('role/{id}/permissions', [RoleController::class, 'updatePermissions'])->name('role.permissions.update');

    Route::get('company-profile', [CompanyProfileController::class, 'edit'])->name('dashboard.company-profile.edit');
    Route::post('company-profile/draft', [CompanyProfileController::class, 'saveDraft'])->name('dashboard.company-profile.draft');
    Route::post('company-profile/publish', [CompanyProfileController::class, 'publish'])->name('dashboard.company-profile.publish');
    Route::post('company-profile/publish/{version}', [CompanyProfileController::class, 'publishVersion'])->name('dashboard.company-profile.publish-version');
    Route::post('company-profile/restore/{version}', [CompanyProfileController::class, 'restore'])->name('dashboard.company-profile.restore');
    Route::post('company-profile/upload', [CompanyProfileController::class, 'upload'])->name('dashboard.company-profile.upload');
});

Route::get('auth/{provider}', [SocialiteController::class, 'redirect'])->name('socialite.redirect');
Route::get('auth/{provider}/callback', [SocialiteController::class, 'callback'])->name('socialite.callback');

require __DIR__ . '/auth.php';
