<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Menu extends Model
{
    protected $fillable = [
        'parent_id',
        'title',
        'url',
        'order',
        'is_active',
    ];

    public function parent()
    {
        return $this->belongsTo(Menu::class, 'parent_id');
    }

    public function submenus()
    {
        return $this->hasMany(Menu::class, 'parent_id')->with('submenus')->orderBy('order');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}
