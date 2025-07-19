<?php

namespace Database\Factories;

use App\Models\Anomali;
use App\Models\GarduInduk;
use App\Models\Kategori;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class AnomaliFactory extends Factory
{
    protected $model = Anomali::class;

    public function definition(): array
    {
        return [
            'judul' => $this->faker->sentence(3),
            'ultg' => $this->faker->randomElement(['ULTG Karawang', 'ULTG Purwakarta']),
            'gardu_id' => GarduInduk::inRandomOrder()->first()?->id ?? 1,
            'bagian' => $this->faker->randomElement(['Banghal', 'Hargi', 'Harjar', 'Harpro', 'K3L']),
            'tipe' => $this->faker->randomElement(['Major', 'Minor']),
            'kategori_id' => Kategori::inRandomOrder()->first()?->id ?? 1,
            'peralatan' => $this->faker->word(),
            'merek' => $this->faker->word(),
            'tipe_alat' => $this->faker->word(),
            'no_seri' => $this->faker->bothify('SN-####-??'),
            'harga' => $this->faker->numberBetween(1000000, 10000000),
            'kode_asset' => $this->faker->bothify('AST-####'),
            'tahun_operasi' => $this->faker->year(),
            'tahun_buat' => $this->faker->year(),
            'penempatan_alat' => $this->faker->city(),
            'tanggal_kejadian' => $this->faker->date(),
            'penyebab' => $this->faker->sentence(6),
            'akibat' => $this->faker->sentence(6),
            'usul_saran' => $this->faker->sentence(6),
            'lampiran_foto' => json_encode([]),
            'status' => $this->faker->randomElement(['New','Open','Pending']),
            'assign_to' => null,
            'tanggal_approve' => null,
            'user_id' => User::inRandomOrder()->first()?->id ?? 1,
            'approve_by' => null,
            'tanggal_mulai' => null,
            'tanggal_selesai' => null,
        ];
    }
}
