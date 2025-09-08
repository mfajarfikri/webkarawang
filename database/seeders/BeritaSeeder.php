<?php

namespace Database\Seeders;

use App\Models\Berita;
use App\Models\User;
use Illuminate\Database\Seeder;

class BeritaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Buat user admin jika belum ada
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
            ]
        );
        
        // Buat 10 berita dengan user admin
        Berita::factory(10)
            ->fromUser($admin)
            ->create();
            
        // Buat 5 berita terbaru
        Berita::factory(5)
            ->terbaru()
            ->create();
            
        // Buat berita dengan multiple gambar
        Berita::factory()
            ->withImages(['image1.jpg', 'image2.jpg', 'image3.jpg'])
            ->withReadCount(500)
            ->create();
    }
}
