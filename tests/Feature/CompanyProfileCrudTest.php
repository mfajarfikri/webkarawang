<?php

use App\Models\CompanyProfile;
use App\Models\CompanyProfileVersion;
use App\Models\User;

it('menyimpan draft dengan semua perubahan CRUD di draft_data', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('dashboard.company-profile.edit'))->assertOk();
    $profile = CompanyProfile::query()->firstOrFail();

    $draft = [
        'company_name' => 'PLN UPT Karawang',
        'tagline' => 'Unit Pelaksana Transmisi',
        'about_editor' => ['time' => 1, 'blocks' => [], 'version' => '2.0.0'],
        'logo' => ['path' => 'company-profile/1/logo/x.jpg', 'url' => '/storage/company-profile/1/logo/x.jpg'],
        'cover' => null,
        'address' => 'Alamat A',
        'phone' => '021-123',
        'email' => 'a@b.com',
        'website' => 'https://example.com',
        'social' => ['facebook' => 'fb', 'instagram' => 'ig', 'linkedin' => '', 'twitter' => 'x'],
        'map' => ['lat' => '-6.2', 'lng' => '107.3'],
        'vision_editor' => ['time' => 2, 'blocks' => [], 'version' => '2.0.0'],
        'missions' => ['m1', 'm2'],
        'team' => [
            'photo' => null,
            'members' => [
                ['name' => 'A', 'position' => 'P', 'bio' => 'B', 'photo' => null],
            ],
        ],
        'gallery' => [
            'items' => [
                ['image' => ['path' => 'p', 'url' => 'u'], 'caption' => 'c', 'credit' => 'cr'],
            ],
        ],
        'stats' => [
            ['label' => 'L', 'value' => '1', 'unit' => 'U', 'sourceLabel' => 'S', 'sourceUrl' => ''],
        ],
        'testimonials' => [
            ['quote' => 'Q', 'name' => 'N', 'organization' => 'O', 'role' => 'R'],
        ],
        'founded_year' => 1990,
    ];

    $this->post(route('dashboard.company-profile.draft'), [
        'draft_data' => $draft,
        'change_note' => 'test',
    ])->assertRedirect();

    $profile->refresh();
    expect($profile->draft_data['tagline'])->toBe('Unit Pelaksana Transmisi');
    expect($profile->draft_data['missions'])->toBe(['m1', 'm2']);
    expect($profile->draft_data['gallery']['items'][0]['caption'])->toBe('c');
    expect($profile->draft_data)->not->toHaveKey('founded_year');

    expect(CompanyProfileVersion::query()->where('company_profile_id', $profile->id)->count())->toBeGreaterThan(0);
});

it('mempublish dan menyimpan published_data tanpa founded_year', function () {
    $user = User::factory()->create();
    $this->actingAs($user);

    $this->get(route('dashboard.company-profile.edit'))->assertOk();
    $profile = CompanyProfile::query()->firstOrFail();

    $draft = $profile->draft_data;
    $draft['company_name'] = 'PLN UPT Karawang';
    $draft['tagline'] = 'Terbit';
    $draft['founded_year'] = 2000;

    $this->post(route('dashboard.company-profile.publish'), [
        'draft_data' => $draft,
        'change_note' => 'publish',
    ])->assertRedirect();

    $profile->refresh();
    expect($profile->status)->toBe('published');
    expect($profile->published_data['tagline'])->toBe('Terbit');
    expect($profile->published_data)->not->toHaveKey('founded_year');
});

