<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AnomaliTimeline extends Model
{
    use HasFactory;

    protected $fillable = [
        'anomali_id',
        'event_type',
        'old_value',
        'new_value',
        'description',
        'comment',
        'user_id'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the anomali that owns the timeline.
     */
    public function anomali()
    {
        return $this->belongsTo(Anomali::class);
    }

    /**
     * Get the user that created the timeline entry.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope untuk mengurutkan timeline berdasarkan waktu terbaru
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('created_at', 'desc');
    }

    /**
     * Scope untuk mengurutkan timeline berdasarkan waktu terlama
     */
    public function scopeOldest($query)
    {
        return $query->orderBy('created_at', 'asc');
    }

    /**
     * Get timeline entries by event type
     */
    public function scopeByEventType($query, $eventType)
    {
        return $query->where('event_type', $eventType);
    }
}