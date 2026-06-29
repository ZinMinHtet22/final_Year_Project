<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Favorite;
use App\Models\Recipe;
use Illuminate\Http\Request;

class FavoriteController extends Controller
{
    public function index(Request $request)
    {
        $favorites = Favorite::where('user_id', $request->user()->id)
            ->with(['recipe.dietaryTags'])
            ->get()
            ->map(fn($f) => [
                'id' => $f->id,
                'recipe' => [
                    'id' => $f->recipe->id,
                    'name' => $f->recipe->name,
                    'description' => $f->recipe->description,
                    'cuisine' => $f->recipe->cuisine,
                    'difficulty' => $f->recipe->difficulty,
                    'cook_time' => $f->recipe->cook_time,
                    'servings' => $f->recipe->servings,
                    'cost_per_serving' => $f->recipe->cost_per_serving,
                    'image_url' => $f->recipe->image_url,
                    'is_student_pick' => $f->recipe->is_student_pick,
                    'dietary_tags' => $f->recipe->dietaryTags->map(fn($t) => ['name' => $t->name, 'color' => $t->color]),
                ],
            ]);

        return response()->json($favorites);
    }

    public function store(Request $request)
    {
        $request->validate(['recipe_id' => 'required|exists:recipes,id']);

        $favorite = Favorite::firstOrCreate([
            'user_id' => $request->user()->id,
            'recipe_id' => $request->recipe_id,
        ]);

        return response()->json(['message' => 'Added to favorites', 'id' => $favorite->id], 201);
    }

    public function destroy(Request $request, $recipeId)
    {
        Favorite::where('user_id', $request->user()->id)
            ->where('recipe_id', $recipeId)
            ->delete();

        return response()->json(['message' => 'Removed from favorites']);
    }
}
