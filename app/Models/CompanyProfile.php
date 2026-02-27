<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyProfile extends Model
{
    use HasFactory;

    protected $fillable = [
        'draft_data',
        'published_data',
        'status',
        'published_version_id',
        'published_at',
        'updated_by',
    ];

    protected $casts = [
        'draft_data' => 'array',
        'published_data' => 'array',
        'published_at' => 'datetime',
    ];

    public function versions()
    {
        return $this->hasMany(CompanyProfileVersion::class);
    }
}

