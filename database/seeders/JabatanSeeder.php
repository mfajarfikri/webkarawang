<?php

namespace Database\Seeders;

use App\Models\Jabatan;
use Illuminate\Database\Seeder;

class JabatanSeeder extends Seeder
{
    public function run(): void
    {
        $jabatan = [
            ['nama_jabatan' => 'Manajer UPT', 'level' => 1],
            ['nama_jabatan' => 'Supervisor', 'level' => 2],
            ['nama_jabatan' => 'Staff Senior', 'level' => 3],
            ['nama_jabatan' => 'Staff', 'level' => 4],
        ];

        foreach ($jabatan as $item) {
            Jabatan::create($item);
        }
    }
} 