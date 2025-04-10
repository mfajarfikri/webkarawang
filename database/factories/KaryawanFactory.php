<?php

namespace Database\Factories;

use App\Models\Department;
use App\Models\Jabatan;
use App\Models\Karyawan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Karyawan>
 */
class KaryawanFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        // Pastikan ada data jabatan dan department
        $jabatan = Karyawan::firstOrCreate([
            'name' => 'Staff',
            'level' => 1,
        ]);

        $department = Karyawan::firstOrCreate([
            'name' => 'Transmisi',
            'kode' => 'TRM',
        ]);

        // Array nama depan yang umum di Indonesia
        $namaDepan = ['Ahmad', 'Muhammad', 'Budi', 'Siti', 'Rina', 'Dedi', 'Eko', 'Dwi', 'Sri', 'Tri'];
        
        // Array nama belakang yang umum di Indonesia
        $namaBelakang = ['Setiawan', 'Kusuma', 'Wijaya', 'Pratama', 'Putra', 'Saputra', 'Hidayat', 'Nugraha', 'Wibowo', 'Santoso'];

        // Generate nama lengkap
        $nama = $this->faker->randomElement($namaDepan) . ' ' . 
                $this->faker->randomElement($namaBelakang);

        return [
            'name' => $nama,
            'nip' => $this->faker->unique()->numerify('##########'),
            'email' => $this->faker->unique()->safeEmail(),
            'jabatan_id' => $jabatan->id,
            'department_id' => $department->id,
            'kedudukan' => 'UPT Karawang',
            'is_active' => true,
            'foto_profil' => 'default.jpg',
            'parent_id' => null, // Akan diupdate nanti jika diperlukan
            'created_at' => now(),
            'updated_at' => now(),
        ];
    }

    /**
     * State untuk karyawan dengan jabatan spesifik
     */
    public function withJabatan(string $namaJabatan, int $level = 1)
    {
        return $this->state(function (array $attributes) use ($namaJabatan, $level) {
            $jabatan = Karyawan::firstOrCreate([
                'name' => $namaJabatan,
                'level' => $level,
            ]);

            return [
                'jabatan_id' => $jabatan->id,
            ];
        });
    }

    /**
     * State untuk karyawan dengan department spesifik
     */
    public function withDepartment(string $namaDepartment, string $kode)
    {
        return $this->state(function (array $attributes) use ($namaDepartment, $kode) {
            $department = Karyawan::firstOrCreate([
                'name' => $namaDepartment,
                'kode' => $kode,
            ]);

            return [
                'department_id' => $department->id,
            ];
        });
    }

    /**
     * State untuk karyawan aktif
     */
    public function active()
    {
        return $this->state(function (array $attributes) {
            return [
                'is_active' => true,
            ];
        });
    }

    /**
     * State untuk karyawan tidak aktif
     */
    public function inactive()
    {
        return $this->state(function (array $attributes) {
            return [
                'is_active' => false,
            ];
        });
    }

    /**
     * State untuk karyawan dengan atasan
     */
    public function withParent(Karyawan $parent)
    {
        return $this->state(function (array $attributes) use ($parent) {
            return [
                'parent_id' => $parent->id,
            ];
        });
    }
}
