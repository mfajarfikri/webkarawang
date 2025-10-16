<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Berita;
use App\Models\Anomali;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\GarduInduk;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        
        // User::factory(10)->create();

        // User::factory()->create([
        //     'name' => 'Test User',
        //     'email' => 'test@example.com',
        // ]);

        $this->call([
            UserSeeder::class,
            KategoriSeeder::class,
            GarduIndukSeeder::class
        ]);
        // Anomali::factory(50)->create();
        Berita::factory(10)->create();
        // Kategori::factory(5)->create();
        // User::factory(10)->create();
        // GarduInduk::factory(18)->create();
        // Anomali::factory(50)->create();
    }
}
