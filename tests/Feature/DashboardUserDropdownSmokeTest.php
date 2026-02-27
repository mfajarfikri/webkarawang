<?php

use App\Models\User;

it('merender halaman dashboard user', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard.user.index'))
        ->assertOk();
});

