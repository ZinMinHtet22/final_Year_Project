<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Recipe extends Model
{
    protected $fillable = [
        'name', 'description', 'cuisine', 'category', 'difficulty',
        'cook_time', 'servings', 'cost_per_serving',
        'image_url', 'is_student_pick', 'instructions', 'user_id', 'is_approved'
    ];

    protected $casts = [
        'is_student_pick' => 'boolean',
        'is_approved' => 'boolean',
        'cost_per_serving' => 'float',
        'instructions' => 'array',
    ];

    public function ingredients(): BelongsToMany
    {
        return $this->belongsToMany(Ingredient::class, 'recipe_ingredients')
                    ->withPivot('quantity')
                    ->withTimestamps();
    }

    public function dietaryTags(): BelongsToMany
    {
        return $this->belongsToMany(DietaryTag::class, 'recipe_dietary_tag')->withTimestamps();
    }

    public function favorites(): HasMany
    {
        return $this->hasMany(Favorite::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function user(): \Illuminate\Database\Eloquent\Relations\BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
