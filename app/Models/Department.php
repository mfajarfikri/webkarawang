<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama_department'
    ];

    public function karyawan() {
        return $this->hasOne(Karyawan::class);
    }
}
