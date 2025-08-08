<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Anomali extends Model
{
    /** @use HasFactory<\Database\Factories\AnomaliFactory> */
    use HasFactory;

    protected $guarded = [
        'id'
    ];

    public function gardu_induk()
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

    public function assignedUser()
    {
        return $this->belongsTo(User::class, 'assign_to');
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approve_by');
    }

    /**
     * Get the timeline entries for the anomali.
     */
    public function timelines()
    {
        return $this->hasMany(AnomaliTimeline::class)->with('user')->orderBy('created_at', 'desc');
    }

    /**
     * Add a timeline entry for this anomali
     */
    public function addTimelineEntry($eventType, $description, $userId, $oldValue = null, $newValue = null, $comment = null)
    {
        return $this->timelines()->create([
            'event_type' => $eventType,
            'old_value' => $oldValue,
            'new_value' => $newValue,
            'description' => $description,
            'comment' => $comment,
            'user_id' => $userId
        ]);
    }

    /**
     * Boot the model.
     */
    protected static function boot()
    {
        parent::boot();

        static::creating(function ($anomali) {
            if (empty($anomali->slug)) {
                $anomali->slug = static::generateUniqueSlug($anomali->judul);
            }
        });

        static::updating(function ($anomali) {
            if ($anomali->isDirty('judul') && empty($anomali->slug)) {
                $anomali->slug = static::generateUniqueSlug($anomali->judul);
            }
        });
    }

    /**
     * Generate a unique slug for the anomali.
     */
    protected static function generateUniqueSlug($title)
    {
        $baseSlug = Str::slug($title);
        $slug = $baseSlug;
        $counter = 1;

        while (static::where('slug', $slug)->exists()) {
            $slug = $baseSlug . '-' . $counter;
            $counter++;
        }

        return $slug;
    }
}
