<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class KaryawanSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('karyawans')->delete();

        DB::table('karyawans')->insert(array(
            0 => array(
                'id' => 1,
                'nip' => '1234567890',
                'name' => 'Muhammad Fajar Fikri Fadilah',
                'email' => 'fajarfikri31@gmail.com',
                'jabatan_id' => 1, // MANAJER UPT
                'department_id' => 1, // RENEV
                'parent_id' => 1,
                'kedudukan' => 'UPT Karawang',
                'foto_profil' => null,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ),
        ));
    }
}
