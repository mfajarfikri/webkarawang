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

        // Relasikan user dengan role dan permission
        $user = User::first();

        // Pastikan permissions ada
        $permissions = ['manage role', 'edit berita'];
        foreach ($permissions as $perm) {
            Permission::firstOrCreate(['name' => $perm]);
        }

        // Buat role Super Admin jika belum ada
        $superAdminRole = Role::firstOrCreate(['name' => 'Super Admin']);

        // Relasikan permission ke role
        $superAdminRole->syncPermissions($permissions);

        // Relasikan user ke role
        $user->assignRole($superAdminRole);
    }
}
