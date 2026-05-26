<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\Menu;

class MenuSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Beranda
        Menu::create([
            'title' => 'Beranda',
            'url' => '/',
            'order' => 1,
        ]);

        // 2. Tentang Kami
        $tentangKami = Menu::create([
            'title' => 'Tentang Kami',
            'url' => '#',
            'order' => 2,
        ]);

        Menu::create([
            'parent_id' => $tentangKami->id,
            'title' => 'Profil Perusahaan',
            'url' => '/profil',
            'order' => 1,
        ]);

        Menu::create([
            'parent_id' => $tentangKami->id,
            'title' => 'Visi & Misi',
            'url' => '/profil#visi-misi',
            'order' => 2,
        ]);

        Menu::create([
            'parent_id' => $tentangKami->id,
            'title' => 'Struktur Organisasi',
            'url' => '/struktur-organisasi',
            'order' => 3,
        ]);

        Menu::create([
            'parent_id' => $tentangKami->id,
            'title' => 'Sejarah',
            'url' => '/profil#sejarah',
            'order' => 4,
        ]);

        // 3. Informasi
        $informasi = Menu::create([
            'title' => 'Informasi',
            'url' => '#',
            'order' => 3,
        ]);

        Menu::create([
            'parent_id' => $informasi->id,
            'title' => 'Berita',
            'url' => '/berita',
            'order' => 1,
        ]);

        Menu::create([
            'parent_id' => $informasi->id,
            'title' => 'Gardu Induk',
            'url' => '/gardu-induk',
            'order' => 2,
        ]);

        Menu::create([
            'parent_id' => $informasi->id,
            'title' => 'KTT',
            'url' => '/ktt',
            'order' => 3,
        ]);

        Menu::create([
            'parent_id' => $informasi->id,
            'title' => 'Anomali',
            'url' => '/anomali',
            'order' => 4,
        ]);

        // 4. Galeri
        Menu::create([
            'title' => 'Galeri',
            'url' => '/gallery',
            'order' => 4,
        ]);

        // 5. Kontak
        Menu::create([
            'title' => 'Kontak',
            'url' => '/kontak',
            'order' => 5,
        ]);
    }
}
