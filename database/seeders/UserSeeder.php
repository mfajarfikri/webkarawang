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
                'name' => 'Admin',
                'email' => 'admin@gmail.com',
                'password' => bcrypt('12345678'),
                'created_at' => now(),
                'updated_at' => now(),
            ),
            1 => array(
                'id' => 2,
                'name' => '',
                'email' => 'muhammadfajarfikrifadilah@gmail.com',
                'password' => bcrypt('12345678'),
                'created_at' => now(),
                'updated_at' => now(),
            ),
            2 => array(
                'id' => 3,
                'name' => 'Muhammad Fajar Fikri Fadilah',
                'email' => 'fajarfikri31@gmail.com',
                'password' => bcrypt('Tjbt4pp04'),
                'created_at' => now(),
                'updated_at' => now(),
            ),
        ));
        $user = User::first();


        $permissions = [
            'View Role', 
            'View Anomali', 
            'View Anomali Create', 
            'View Ktt', 
            'Anomali Dashboard', 
            'Review Anomali',
            'Approve Anomali',
            'Dashboard Berita',
            'Buat Berita',
            'Berita Home',
            'Detail Berita',
            'Edit Berita',
            'Hapus Berita',
            'Buat Ktt', 
            'Detail Ktt'];
        $descriptions = [
            'Akses ke halaman manajemen role',
            'Akses ke halaman anomali',
            'Akses ke halaman pembuatan anomali',
            'Akses ke halaman utama KTT',
            'Akses ke halaman persetujuan anomali',
            'Akses ke berita pada halaman home',
            'Akses ke halaman dashboard anomali',
            'Akses ke halaman pembuatan KTT',
            'Akses ke halaman detail KTT',
            'Akses ke halaman dashboard berita',
            'Akses ke halaman pembuatan berita',
            'Akses ke halaman detail berita',
            'Akses ke halaman edit berita',
            'Akses ke halaman hapus berita',
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
