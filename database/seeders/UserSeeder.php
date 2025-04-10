<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('users')->delete();

        DB::table('users')->insert(array(
            0 => array(
                'id' => 1,
                'name' => 'Muhammad Fajar Fikri Fadilah',
                'email' => 'fajarfikri31@gmail.com',
                'password' => bcrypt('Tjbt4pp04'),
                'role' => 'admin',
                'karyawan_id' => 1,
                'created_at' => now(),
                'updated_at' => now(),
            ),
        ));
    }
}
