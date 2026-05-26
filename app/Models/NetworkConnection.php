<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class NetworkConnection extends Model
{
    protected $guarded = ['id'];

    public function source()
    {
        return $this->belongsTo(NetworkDevice::class, 'source_id');
    }

    public function target()
    {
        return $this->belongsTo(NetworkDevice::class, 'target_id');
    }
}
