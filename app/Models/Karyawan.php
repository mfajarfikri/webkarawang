<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Karyawan extends Model
{
    /** @use HasFactory<\Database\Factories\KaryawanFactory> */
    use HasFactory;

    protected $fillable = [
        'nip',
        'name',
        'email',
        'jabatan_id',
        'jenis_kelamin',
        'department_id',
        'parent_id',
        'kedudukan',
        'foto_profil',
        'is_active',
        'created_by',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function berita()
    {
        return $this->hasMany(Berita::class);
    }
    
    public function department()
    {
        return $this->belongsTo(Department::class,);
    }
}
