<?php

namespace Database\Seeders;

// use Illuminate\Database\Console\Seeds\WithoutModelEvents;   
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use App\Models\User;

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
                'created_at' => now(),
                'updated_at' => now(),
            ),
        ));
        $user = User::first();


        $permissions = ['View Role','View Anomali', 'View Anomali Create', 'View Ktt'];
        $descriptions = [
            'Mengakses halaman manajemen role',
            'Mengakses halaman anomali',
            'Mengakses halaman pembuatan anomali',
            'Mengakses halaman utama KTT'
        ];
        foreach ($permissions as $i => $perm) {
            Permission::firstOrCreate(
                ['name' => $perm],
                ['description' => $descriptions[$i] ?? null]
            );
        }
        $superAdminRole = Role::firstOrCreate(['name' => 'Super Admin']);
        $superAdminRole->syncPermissions($permissions);
        $user->assignRole($superAdminRole);
    }
}
