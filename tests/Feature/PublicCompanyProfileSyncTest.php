<?php

use App\Models\CompanyProfile;
use App\Models\User;

it('menampilkan data published company profile pada halaman publik profil', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('dashboard.company-profile.edit'))->assertOk();
    $profile = CompanyProfile::query()->firstOrFail();

    $draft = $profile->draft_data;
    $draft['company_name'] = 'PLN UPT Karawang';
    $draft['tagline'] = 'Unit Pelaksana Transmisi';
    $draft['address'] = 'Alamat Kantor Uji';
    $draft['phone'] = '021-123';
    $draft['email'] = 'upt@example.com';
    $draft['website'] = 'https://example.com';

    $this->post(route('dashboard.company-profile.publish'), [
        'draft_data' => $draft,
        'change_note' => 'publish test',
    ])->assertRedirect();

    $this->get(route('profil'))
        ->assertOk()
        ->assertSee('Unit Pelaksana Transmisi')
        ->assertSee('Alamat Kantor Uji')
        ->assertSee('example.com');
});
