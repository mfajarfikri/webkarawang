<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CompanyProfileVersion extends Model
{
    use HasFactory;

    protected $fillable = [
        'company_profile_id',
        'version_number',
        'state',
        'snapshot_data',
        'change_note',
        'created_by',
    ];

    protected $casts = [
        'snapshot_data' => 'array',
    ];

    public function companyProfile()
    {
        return $this->belongsTo(CompanyProfile::class);
    }
}

