<?php

use App\Models\Anomali;
use App\Models\GarduInduk;
use App\Models\Kategori;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Spatie\Permission\Models\Permission;

it('menutup anomali dengan upload PDF dan tanggal pekerjaan', function () {
    Storage::fake('public');

    $permission = Permission::query()->firstOrCreate([
        'name' => 'View Anomali',
        'guard_name' => 'web',
    ]);

    $user = User::factory()->create();
    $user->givePermissionTo($permission);

    $gardu = GarduInduk::factory()->create();
    $kategori = Kategori::factory()->create();

    $anomali = Anomali::factory()->create([
        'gardu_id' => $gardu->id,
        'kategori_id' => $kategori->id,
        'user_id' => $user->id,
        'status' => 'Open',
    ]);

    $pdf = UploadedFile::fake()->create('penutupan.pdf', 200, 'application/pdf');

    $this->actingAs($user)
        ->post(route('dashboard.anomali.close.store', $anomali->slug), [
            'tanggal_pekerjaan' => '2026-02-10',
            'lampiran_pdf' => $pdf,
        ])
        ->assertOk()
        ->assertJsonPath('success', true);

    $anomali->refresh();
    expect($anomali->status)->toBe('Close');
    expect($anomali->tanggal_selesai)->toBe('2026-02-10');

    $this->assertDatabaseHas('anomali_closures', [
        'anomali_id' => $anomali->id,
        'tanggal_pekerjaan' => '2026-02-10',
        'created_by' => $user->id,
    ]);

    $closure = DB::table('anomali_closures')->where('anomali_id', $anomali->id)->first();
    expect($closure)->not->toBeNull();
    Storage::disk('public')->assertExists($closure->lampiran_pdf_path);

    $this->assertDatabaseHas('anomali_timelines', [
        'anomali_id' => $anomali->id,
        'event_type' => 'status_changed',
        'new_value' => 'Close',
        'user_id' => $user->id,
    ]);

    $this->assertDatabaseHas('anomali_timelines', [
        'anomali_id' => $anomali->id,
        'event_type' => 'completed',
        'user_id' => $user->id,
    ]);
});

it('menolak penutupan jika file bukan PDF', function () {
    Storage::fake('public');

    $permission = Permission::query()->firstOrCreate([
        'name' => 'View Anomali',
        'guard_name' => 'web',
    ]);

    $user = User::factory()->create();
    $user->givePermissionTo($permission);

    $gardu = GarduInduk::factory()->create();
    $kategori = Kategori::factory()->create();
    $anomali = Anomali::factory()->create([
        'gardu_id' => $gardu->id,
        'kategori_id' => $kategori->id,
        'user_id' => $user->id,
        'status' => 'Open',
    ]);

    $file = UploadedFile::fake()->create('penutupan.txt', 10, 'text/plain');

    $this->actingAs($user)
        ->post(route('dashboard.anomali.close.store', $anomali->slug), [
            'tanggal_pekerjaan' => '2026-02-10',
            'lampiran_pdf' => $file,
        ])
        ->assertStatus(422)
        ->assertJsonPath('success', false);
});
