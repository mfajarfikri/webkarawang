<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DepartmentSeeder extends Seeder
{
    public function run(): void
    {
        $departments = [
            ['nama_department' => 'RENEV'],
            ['nama_department' => 'KEUANGAN & UMUM'],
            ['nama_department' => 'KONSTRUKSI'],
            ['nama_department' => 'PDKB'],
            ['nama_department' => 'LAKSDA'],
            ['nama_department' => 'K3'],
            ['nama_department' => 'LINGKUNGAN'],
        ];

        DB::table('departments')->insert($departments);
    }
} 