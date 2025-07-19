<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Anomali extends Model
{
    /** @use HasFactory<\Database\Factories\AnomaliFactory> */
    use HasFactory;

    protected $guarded = [
        'id'
    ];

    public function garduInduk()
    {
        return $this->belongsTo(GarduInduk::class, 'gardu_id');
    }

    public function kategori()
    {
        return $this->belongsTo(Kategori::class, 'kategori_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
