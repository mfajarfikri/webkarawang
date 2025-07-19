<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class KategoriSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('kategoris')->delete();

        DB::table('kategoris')->insert(array(
            0 => array(
                'id' => 1,
                'name' => 'Hotsopt'
            ),
            1 => array(
                'id' => 2,
                'name' => 'Announsiator'
            ),
            2 => array(
                'id' => 3,
                'name' => 'Alarm Relay'
            ),
            3 => array(
                'id' => 4,
                'name' => 'Remebesan / Kebocoran'
            ),
            4 => array(
                'id' => 5,
                'name' => 'Tegakan Kritis'
            ),
            5 => array(
                'id' => 6,
                'name' => 'Pentanahan'
            ),
        ));
    }
}
