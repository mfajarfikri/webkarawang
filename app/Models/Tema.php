<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tema extends Model
{
    protected $fillable = ['nama', 'slug'];

    public function beritas()
    {
        return $this->hasMany(Berita::class);
    }
}
