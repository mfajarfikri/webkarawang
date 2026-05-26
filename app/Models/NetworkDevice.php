<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NetworkDevice extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'snmp_data' => 'array',
        'last_seen' => 'datetime',
    ];

    public function gardu_induk()
    {
        return $this->belongsTo(GarduInduk::class);
    }

    public function connections_as_source()
    {
        return $this->hasMany(NetworkConnection::class, 'source_id');
    }

    public function connections_as_target()
    {
        return $this->hasMany(NetworkConnection::class, 'target_id');
    }
}
