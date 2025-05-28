<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Berita extends Model
{
    /** @use HasFactory<\Database\Factories\BeritaFactory> */
    use HasFactory;

    protected $fillable = [
        'judul',
        'slug',
        'excerpt',
        'isi',
        'gambar',
        'user_id',
        'created_by',
        'read_count',
    ];

    protected $casts = [
        'gambar' => 'array'
    ];

    // public function karyawan()
    // {
    //     return $this->belongsTo(Karyawan::class);
    // }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
