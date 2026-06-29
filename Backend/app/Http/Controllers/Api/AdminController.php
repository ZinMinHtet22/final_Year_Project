<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Recipe;
use App\Models\Ingredient;
use App\Models\User;
use App\Models\DietaryTag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AdminController extends Controller
{
    private function authorizeAdmin(Request $request)
    {
        if (!$request->user() || !$request->user()->is_admin) {
            abort(response()->json(['error' => 'Unauthorized. Admin access required.'], 403));
        }
    }

    public function stats(Request $request)
    {
        $this->authorizeAdmin($request);

        $totalUsers = User::count();
        $totalRecipes = Recipe::count();
        $totalIngredients = Ingredient::count();
        $averageCost = round(Recipe::avg('cost_per_serving') ?? 0, 2);

        $mostSaved = Recipe::withCount('favorites')
            ->orderBy('favorites_count', 'desc')
            ->limit(3)
            ->get(['id', 'name'])
            ->map(fn($r) => [
                'id' => $r->id,
                'name' => $r->name,
                'favorites_count' => $r->favorites_count,
            ]);

        $popularIngredients = Ingredient::withCount('recipes')
            ->orderBy('recipes_count', 'desc')
            ->limit(3)
            ->get(['id', 'name'])
            ->map(fn($i) => [
                'id' => $i->id,
                'name' => $i->name,
                'recipes_count' => $i->recipes_count,
            ]);

        return response()->json([
            'total_users' => $totalUsers,
            'total_recipes' => $totalRecipes,
            'total_ingredients' => $totalIngredients,
            'average_cost_per_serving' => $averageCost,
            'most_saved_recipes' => $mostSaved,
            'popular_ingredients' => $popularIngredients,
        ]);
    }

    // --- RECIPES CRUD ---

    public function indexRecipes(Request $request)
    {
        $this->authorizeAdmin($request);

        $recipes = Recipe::with(['dietaryTags', 'ingredients'])->withCount('favorites')->get()->map(function ($recipe) {
            return [
                'id' => $recipe->id,
                'name' => $recipe->name,
                'description' => $recipe->description,
                'cuisine' => $recipe->cuisine,
                'category' => $recipe->category,
                'instructions' => $recipe->instructions,
                'difficulty' => $recipe->difficulty,
                'cook_time' => $recipe->cook_time,
                'servings' => $recipe->servings,
                'cost_per_serving' => $recipe->cost_per_serving,
                'image_url' => $recipe->image_url,
                'is_student_pick' => $recipe->is_student_pick,
                'dietary_tags' => $recipe->dietaryTags->map(fn($t) => ['name' => $t->name, 'color' => $t->color]),
                'ingredients' => $recipe->ingredients->map(fn($i) => [
                    'id' => $i->id,
                    'name' => $i->name,
                    'quantity' => $i->pivot->quantity,
                    'unit' => $i->unit,
                    'cost_per_unit' => $i->cost_per_unit
                ]),
                'total_cost' => round($recipe->cost_per_serving * $recipe->servings, 2),
                'favorites_count' => $recipe->favorites_count,
            ];
        });

        return response()->json($recipes);
    }

    public function storeRecipe(Request $request)
    {
        $this->authorizeAdmin($request);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'cuisine' => 'required|string|max:255',
            'category' => 'required|in:Breakfast,Lunch,Dinner,Snacks',
            'difficulty' => 'required|in:Easy,Medium,Hard',
            'cook_time' => 'required|integer|min:1',
            'servings' => 'required|integer|min:1',
            'image_url' => 'nullable|string',
            'is_student_pick' => 'boolean',
            'dietary_tags' => 'nullable|array',
            'ingredients' => 'required|array|min:1',
            'ingredients.*.id' => 'required|exists:ingredients,id',
            'ingredients.*.quantity' => 'required|numeric|min:0.01',
            'instructions' => 'nullable|array',
            'instructions.*' => 'required|string',
        ]);

        return DB::transaction(function () use ($request) {
            // Compute costs
            $totalCost = 0;
            foreach ($request->ingredients as $item) {
                $ing = Ingredient::findOrFail($item['id']);
                $totalCost += $ing->cost_per_unit * $item['quantity'];
            }
            $costPerServing = round($totalCost / $request->servings, 2);

            // Create recipe
            $recipe = Recipe::create([
                'name' => $request->name,
                'description' => $request->description,
                'cuisine' => $request->cuisine,
                'category' => $request->category,
                'difficulty' => $request->difficulty,
                'cook_time' => $request->cook_time,
                'servings' => $request->servings,
                'cost_per_serving' => $costPerServing,
                'image_url' => $request->image_url,
                'is_student_pick' => $request->is_student_pick ?? false,
                'instructions' => $request->instructions ?? [],
            ]);

            // Sync ingredients
            $syncData = [];
            foreach ($request->ingredients as $item) {
                $syncData[$item['id']] = ['quantity' => $item['quantity']];
            }
            $recipe->ingredients()->sync($syncData);

            // Sync dietary tags
            $tagIds = [];
            if ($request->has('dietary_tags')) {
                foreach ($request->dietary_tags as $tagName) {
                    $tag = DietaryTag::firstOrCreate(
                        ['name' => $tagName],
                        ['color' => '#' . substr(md5($tagName), 0, 6)]
                    );
                    $tagIds[] = $tag->id;
                }
            }
            $recipe->dietaryTags()->sync($tagIds);

            return response()->json($recipe->load(['ingredients', 'dietaryTags']), 201);
        });
    }

    public function updateRecipe(Request $request, $id)
    {
        $this->authorizeAdmin($request);
        $recipe = Recipe::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'cuisine' => 'required|string|max:255',
            'category' => 'required|in:Breakfast,Lunch,Dinner,Snacks',
            'difficulty' => 'required|in:Easy,Medium,Hard',
            'cook_time' => 'required|integer|min:1',
            'servings' => 'required|integer|min:1',
            'image_url' => 'nullable|string',
            'is_student_pick' => 'boolean',
            'dietary_tags' => 'nullable|array',
            'ingredients' => 'required|array|min:1',
            'ingredients.*.id' => 'required|exists:ingredients,id',
            'ingredients.*.quantity' => 'required|numeric|min:0.01',
            'instructions' => 'nullable|array',
            'instructions.*' => 'required|string',
        ]);

        return DB::transaction(function () use ($request, $recipe) {
            // Compute costs
            $totalCost = 0;
            foreach ($request->ingredients as $item) {
                $ing = Ingredient::findOrFail($item['id']);
                $totalCost += $ing->cost_per_unit * $item['quantity'];
            }
            $costPerServing = round($totalCost / $request->servings, 2);

            // Update recipe
            $recipe->update([
                'name' => $request->name,
                'description' => $request->description,
                'cuisine' => $request->cuisine,
                'category' => $request->category,
                'difficulty' => $request->difficulty,
                'cook_time' => $request->cook_time,
                'servings' => $request->servings,
                'cost_per_serving' => $costPerServing,
                'image_url' => $request->image_url,
                'is_student_pick' => $request->is_student_pick ?? false,
                'instructions' => $request->instructions ?? [],
            ]);

            // Sync ingredients
            $syncData = [];
            foreach ($request->ingredients as $item) {
                $syncData[$item['id']] = ['quantity' => $item['quantity']];
            }
            $recipe->ingredients()->sync($syncData);

            // Sync dietary tags
            $tagIds = [];
            if ($request->has('dietary_tags')) {
                foreach ($request->dietary_tags as $tagName) {
                    $tag = DietaryTag::firstOrCreate(
                        ['name' => $tagName],
                        ['color' => '#' . substr(md5($tagName), 0, 6)]
                    );
                    $tagIds[] = $tag->id;
                }
            }
            $recipe->dietaryTags()->sync($tagIds);

            return response()->json($recipe->load(['ingredients', 'dietaryTags']));
        });
    }

    public function destroyRecipe(Request $request, $id)
    {
        $this->authorizeAdmin($request);
        $recipe = Recipe::findOrFail($id);
        $recipe->delete();

        return response()->json(['message' => 'Recipe deleted successfully']);
    }

    // --- INGREDIENTS CRUD ---

    public function indexIngredients(Request $request)
    {
        $this->authorizeAdmin($request);
        return response()->json(Ingredient::orderBy('name')->get());
    }

    public function storeIngredient(Request $request)
    {
        $this->authorizeAdmin($request);

        $request->validate([
            'name' => 'required|string|max:255|unique:ingredients,name',
            'unit' => 'required|string|max:50',
            'cost_per_unit' => 'required|numeric|min:0.0001',
        ]);

        $ingredient = Ingredient::create([
            'name' => $request->name,
            'unit' => $request->unit,
            'cost_per_unit' => $request->cost_per_unit,
        ]);

        return response()->json($ingredient, 201);
    }

    public function updateIngredient(Request $request, $id)
    {
        $this->authorizeAdmin($request);
        $ingredient = Ingredient::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:ingredients,name,' . $id,
            'unit' => 'required|string|max:50',
            'cost_per_unit' => 'required|numeric|min:0.0001',
        ]);

        $ingredient->update([
            'name' => $request->name,
            'unit' => $request->unit,
            'cost_per_unit' => $request->cost_per_unit,
        ]);

        // Recalculate costs for all recipes using this ingredient
        $recipes = $ingredient->recipes;
        foreach ($recipes as $recipe) {
            $totalCost = 0;
            foreach ($recipe->ingredients as $ing) {
                $qty = $ing->pivot->quantity;
                $totalCost += $ing->cost_per_unit * $qty;
            }
            $recipe->cost_per_serving = round($totalCost / $recipe->servings, 2);
            $recipe->save();
        }

        return response()->json($ingredient);
    }

    public function destroyIngredient(Request $request, $id)
    {
        $this->authorizeAdmin($request);
        $ingredient = Ingredient::findOrFail($id);
        $ingredient->delete();

        return response()->json(['message' => 'Ingredient deleted successfully']);
    }

    // --- USERS MANAGEMENT ---

    public function indexUsers(Request $request)
    {
        $this->authorizeAdmin($request);
        return response()->json(User::orderBy('name')->get(['id', 'name', 'email', 'is_admin', 'created_at']));
    }

    public function toggleUserRole(Request $request, $id)
    {
        $this->authorizeAdmin($request);
        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json(['error' => 'You cannot change your own admin status.'], 400);
        }

        $user->is_admin = !$user->is_admin;
        $user->save();

        return response()->json($user);
    }

    public function destroyUser(Request $request, $id)
    {
        $this->authorizeAdmin($request);
        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json(['error' => 'You cannot delete yourself.'], 400);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    // --- FEEDBACK MANAGEMENT ---

    public function indexFeedback(Request $request)
    {
        $this->authorizeAdmin($request);
        return response()->json(\App\Models\Feedback::orderBy('created_at', 'desc')->get());
    }

    public function destroyFeedback(Request $request, $id)
    {
        $this->authorizeAdmin($request);
        $feedback = \App\Models\Feedback::findOrFail($id);
        $feedback->delete();

        return response()->json(['message' => 'Feedback deleted successfully']);
    }

    // --- CURRENCIES MANAGEMENT ---

    public function indexCurrencies(Request $request)
    {
        $this->authorizeAdmin($request);
        return response()->json(\App\Models\Currency::orderBy('code')->get());
    }

    public function updateCurrencyRate(Request $request, $code)
    {
        $this->authorizeAdmin($request);
        $request->validate([
            'exchange_rate' => 'required|numeric|min:0.000001',
        ]);
        $currency = \App\Models\Currency::where('code', $code)->firstOrFail();
        $currency->update([
            'exchange_rate' => $request->exchange_rate,
        ]);

        return response()->json($currency);
    }

    public function indexPendingRecipes(Request $request)
    {
        $this->authorizeAdmin($request);

        $recipes = Recipe::with(['dietaryTags', 'ingredients', 'user'])
            ->where('is_approved', false)
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($recipe) {
                return [
                    'id' => $recipe->id,
                    'name' => $recipe->name,
                    'description' => $recipe->description,
                    'cuisine' => $recipe->cuisine,
                    'category' => $recipe->category,
                    'instructions' => $recipe->instructions,
                    'difficulty' => $recipe->difficulty,
                    'cook_time' => $recipe->cook_time,
                    'servings' => $recipe->servings,
                    'cost_per_serving' => $recipe->cost_per_serving,
                    'image_url' => $recipe->image_url,
                    'is_student_pick' => $recipe->is_student_pick,
                    'dietary_tags' => $recipe->dietaryTags->map(fn($t) => ['name' => $t->name, 'color' => $t->color]),
                    'ingredients' => $recipe->ingredients->map(fn($i) => [
                        'id' => $i->id,
                        'name' => $i->name,
                        'quantity' => $i->pivot->quantity,
                        'unit' => $i->unit,
                        'cost_per_unit' => $i->cost_per_unit
                    ]),
                    'total_cost' => round($recipe->cost_per_serving * $recipe->servings, 2),
                    'author' => $recipe->user ? $recipe->user->name : 'System',
                ];
            });

        return response()->json($recipes);
    }

    public function approveRecipe(Request $request, $id)
    {
        $this->authorizeAdmin($request);

        $recipe = Recipe::findOrFail($id);
        $recipe->is_approved = true;
        $recipe->save();

        return response()->json($recipe);
    }

    public function systemStats(Request $request)
    {
        $this->authorizeAdmin($request);

        $totalUsers = \App\Models\User::count();
        
        $logs = \App\Models\LoginLog::orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $maintenanceModeActive = \Illuminate\Support\Facades\Cache::get('maintenance_mode_active', false);

        return response()->json([
            'total_users' => $totalUsers,
            'latest_logins' => $logs,
            'maintenance_mode' => $maintenanceModeActive,
        ]);
    }

    public function toggleMaintenance(Request $request)
    {
        $this->authorizeAdmin($request);

        $request->validate([
            'active' => 'required|boolean',
        ]);

        \Illuminate\Support\Facades\Cache::forever('maintenance_mode_active', $request->active);

        return response()->json([
            'message' => 'Maintenance mode status updated.',
            'maintenance_mode' => $request->active,
        ]);
    }
}
