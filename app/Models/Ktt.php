<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Ktt extends Model
{
    protected $fillable = [
        'name',
        'lokasi',
        'tipe',
        'kapasitas',
        'latitude',
        'longitude'
    ];
}
