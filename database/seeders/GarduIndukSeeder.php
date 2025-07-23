<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class GarduIndukSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        DB::table('gardu_induks')->delete();

        DB::table('gardu_induks')->insert(array(
            0 => array(
                'id' => 1,
                'name' => 'GITET 500KV DELTAMAS',
                'latitude' => -6.405008876673348,
                'longitude' => 107.175800484976,
                'ultg' => 'ULTG Karawang',
                'kondisi' => 'Operasi'
            ),
            1 => array(
                'id' => 2,
                'name' => 'GISTET 500KV SUKATANI',
                'latitude' => -6.247407132695488, 
                'longitude' => 107.188247715593,
                'ultg' => 'ULTG Karawang',
                'kondisi' => 'Operasi'
            ),
            2 => array(
                'id' => 3,
                'name' => 'GI 150KV DELTAMAS',
                'latitude' => -6.403969499794382,
                'longitude' => 107.17454242024002,
                'ultg' => 'ULTG Karawang',
                'kondisi' => 'Operasi'
            ),
            3 => array(
                'id' => 4,
                'name' => 'GIS 150KV SUKATANI',
                'latitude' => -6.248662039434629,
                'longitude' => 107.18707666304559,
                'ultg' => 'ULTG Karawang',
                'kondisi' => 'Operasi'
            ),
            4 => array(
                'id' => 5,
                'name' => 'GI 150KV SUKATANI GOBEL',
                'latitude' => -6.254063343073294, 
                'longitude' => 107.2001923906209,
                'ultg' => 'ULTG Karawang',
                'kondisi' => 'Operasi'
            ),
            5 => array(
                'id' => 6,
                'name' => 'GI 150KV KOSAMBI BARU',
                'latitude' => -6.373265921295081, 
                'longitude' => 107.37778015784274,
                'ultg' => 'ULTG Karawang',
                'kondisi' => 'Operasi'
            ),
            6 => array(
                'id' => 7,
                'name' => 'GI 70KV KOSAMBI BARU',
                'latitude' => -6.373143939811202,
                'longitude' => 107.37849188466635,
                'ultg' => 'ULTG Karawang',
                'kondisi' => 'Operasi'
            ),
            7 => array(
                'id' => 8,
                'name' => 'GI 150KV DAWUAN',
                'latitude' => -6.404102919183203,
                'longitude' => 107.42493541141211,
                'ultg' => 'ULTG Karawang',
                'kondisi' => 'Operasi'
            ),
            8 => array(
                'id' => 9,
                'name' => 'GI 150KV SUKAMANDI',
                'latitude' => -6.334825674619869,
                'longitude' => 107.66244545847039,
                'ultg' => 'ULTG Karawang',
                'kondisi' => 'Operasi'
            ),
            9 => array(
                'id' => 10,
                'name' => 'GI 150KV PARUNGMULYA',
                'latitude' => -6.3746904077084245,
                'longitude' => 107.32213364606511,
                'ultg' => 'ULTG Karawang',
                'kondisi' => 'Operasi'
            ),
            10 => array(
                'id' => 11,
                'name' => 'GI 150KV KUTAMEKAR',
                'latitude' => -6.387353811877259, 
                'longitude' => 107.34339229218287,
                'ultg' => 'ULTG Karawang',
                'kondisi' => 'Operasi'
            ),
            11 => array(
                'id' => 12,
                'name' => 'GI 150KV KIARAPAYUNG',
                'latitude' => -6.3794736678257875,
                'longitude' => 107.35966897905122,
                'ultg' => 'ULTG Karawang',
                'kondisi' => 'Operasi'
            ),
            12 => array(
                'id' => 13,
                'name' => 'GI 150KV PERURI',
                'latitude' => -6.359325667498092,
                'longitude' => 107.30611307307728,
                'ultg' => 'ULTG Karawang',
                'kondisi' => 'Operasi'
            ),
            13 => array(
                'id' => 14,
                'name' => 'GI 150KV TELUKJAMBE',
                'latitude' => -6.3790061912435405, 
                'longitude' => 107.3314906986144,
                'ultg' => 'ULTG Karawang',
                'kondisi' => 'Operasi'
            ),
            14 => array(
                'id' => 15,
                'name' => 'GI 150KV MALIGI',
                'latitude' => -6.361192155682295, 
                'longitude' => 107.32534429607158,
                'ultg' => 'ULTG Karawang',
                'kondisi' => 'Operasi'
            ),
            15 => array(
                'id' => 16,
                'name' => 'GI 150KV PINDODELI',
                'latitude' => -6.3222472625486565, 
                'longitude' => 107.31705502839068,
                'ultg' => 'ULTG Karawang',
                'kondisi' => 'Operasi'
            ),
            16 => array(
                'id' => 17,
                'name' => 'GI 150KV INDOLIBERTY',
                'latitude' => -6.339202115232549, 
                'longitude' => 107.3238696421573,
                'ultg' => 'ULTG Karawang',
                'kondisi' => 'Operasi'
            ),
            17 => array(
                'id' => 18,
                'name' => 'GI 70KV RENGASDENGKLOK',
                'latitude' => -6.16276761596219,
                'longitude' => 107.31186609786688,
                'ultg' => 'ULTG Karawang',
                'kondisi' => 'Operasi'
            ),
            18 => array(
                'id' => 19,
                'name' => 'GI 70KV INDOBHARAT',
                'latitude' => -6.487924911631123, 
                'longitude' => 107.38777440537237,
                'ultg' => 'ULTG Purwakarta',
                'kondisi' => 'Operasi'
            ),
            19 => array(
                'id' => 20,
                'name' => 'GI 70KV SOUTHPASIFIC',
                'latitude' => -6.491506111821957, 
                'longitude' => 107.39553565854408,
                'ultg' => 'ULTG Purwakarta',
                'kondisi' => 'Operasi'
            ),
            20 => array(
                'id' => 21,
                'name' => 'GI 150KV TATAJABAR',
                'latitude' => -6.427639025730964, 
                'longitude' => 107.41753151899988,
                'ultg' => 'ULTG Purwakarta',
                'kondisi' => 'Operasi'
            ),
            21 => array(
                'id' => 22,
                'name' => 'GI 150KV CIKUMPAY',
                'latitude' => -6.504679979908353, 
                'longitude' => 107.49422178016906,
                'ultg' => 'ULTG Purwakarta',
                'kondisi' => 'Operasi'
            ),
            22 => array(
                'id' => 23,
                'name' => 'GI 150KV SUBANG',
                'latitude' => -6.557158907132009, 
                'longitude' => 107.75048594305674,
                'ultg' => 'ULTG Purwakarta',
                'kondisi' => 'Operasi'
            ),
            23 => array(
                'id' => 24,
                'name' => 'GI 150KV PURWAKARTA',
                'latitude' => -6.56737249537068, 
                'longitude' => 107.45470619143275,
                'ultg' => 'ULTG Purwakarta',
                'kondisi' => 'Operasi'
            ),
            24 => array(
                'id' => 25,
                'name' => 'GI 70KV PURWAKARTA',
                'latitude' => -6.5675806485706865, 
                'longitude' => 107.45495682977113,
                'ultg' => 'ULTG Purwakarta',
                'kondisi' => 'Operasi'
            ),
            25 => array(
                'id' => 26,
                'name' => 'GI 70KV INDORAMA',
                'latitude' => -6.554842049878655,
                'longitude' => 107.41013897868545,
                'ultg' => 'ULTG Purwakarta',
                'kondisi' => 'Operasi'
            ),
            26 => array(
                'id' => 27,
                'name' => 'GI 70KV CIGANEA',
                'latitude' => -6.547570900095691,
                'longitude' =>  107.4072103840017,
                'ultg' => 'ULTG Purwakarta',
                'kondisi' => 'Operasi'
            ),
            27 => array(
                'id' => 28,
                'name' => 'GI 70KV INDACI',
                'latitude' => -6.561981242716723, 
                'longitude' => 107.40592354722986,
                'ultg' => 'ULTG Purwakarta',
                'kondisi' => 'Operasi'
            ),
            28 => array(
                'id' => 29,
                'name' => 'GITET 500KV CIRATA',
                'latitude' => -6.672993021400723,
                'longitude' =>  107.34893688532088,
                'ultg' => 'ULTG Purwakarta',
                'kondisi' => 'Operasi'
            ),
            29 => array(
                'id' => 30,
                'name' => 'GI 150KV CIRATA',
                'latitude' => -6.671772606077745, 
                'longitude' => 107.34980308360467,
                'ultg' => 'ULTG Purwakarta',
                'kondisi' => 'Operasi'
            ),
            30 => array(
                'id' => 31,
                'name' => 'GI 70KV CIRATA',
                'latitude' => -6.671021903295183,
                'longitude' => 107.34978707248453,
                'ultg' => 'ULTG Purwakarta',
                'kondisi' => 'Operasi'
            ),
        ));
    }
}
