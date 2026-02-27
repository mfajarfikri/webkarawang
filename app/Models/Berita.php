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
        'content_json',
        'gambar',
        'user_id',
        'tema_id',
        'created_by',
        'read_count',
        'enabled',
    ];

    protected $casts = [
        'gambar' => 'array',
        'content_json' => 'array',
        'enabled' => 'boolean',
    ];

    // public function karyawan()
    // {
    //     return $this->belongsTo(Karyawan::class);
    // }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function tema()
    {
        return $this->belongsTo(Tema::class);
    }
}
