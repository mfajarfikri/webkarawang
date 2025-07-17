<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\GarduInduk>
 */
class GarduIndukFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->unique()->company . ' GI',
            'latitude' => $this->faker->randomFloat(7, -7.0000000, -6.0000000),
            'longitude' => $this->faker->randomFloat(7, 107.0000000, 108.0000000),
            'name_ultg' => $this->faker->randomElement(['ULTG Karawang', 'ULTG Purwakarta']),
            'kondisi' => $this->faker->randomElement(['Operasi', 'Tidak Operasi']),
        ];
    }
}
