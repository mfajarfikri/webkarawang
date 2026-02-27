<?php

use App\Models\User;
use Spatie\Permission\Models\Permission;

it('merender halaman create anomali untuk user berizin', function () {
    $permission = Permission::query()->firstOrCreate([
        'name' => 'View Anomali Create',
        'guard_name' => 'web',
    ]);

    $user = User::factory()->create();
    $user->givePermissionTo($permission);

    $this->actingAs($user)
        ->get(route('dashboard.anomali.create'))
        ->assertOk();
});

