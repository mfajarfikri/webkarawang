<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Karyawan extends Model
{
    /** @use HasFactory<\Database\Factories\KaryawanFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'jabatan',
        'kedudukan',
        'foto_profil',
        'created_by',
    ];

    public function user()
    {
        return $this->hasOne(User::class);
    }

    public function berita()
    {
        return $this->hasMany(Berita::class);
    }
}
