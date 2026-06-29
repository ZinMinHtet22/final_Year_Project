<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Recipe;
use App\Models\Review;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RecipeController extends Controller
{
    private function getRecipeNutrition($id)
    {
        return [
            'calories' => ($id * 73) % 400 + 200,
            'protein' => ($id * 17) % 25 + 5,
            'carbs' => ($id * 31) % 50 + 10,
            'fat' => ($id * 11) % 20 + 2,
        ];
    }

    public function index(Request $request)
    {
        $query = Recipe::with(['dietaryTags', 'ingredients'])->where('is_approved', true);

        if ($request->cuisine && $request->cuisine !== 'All') {
            $query->where('cuisine', $request->cuisine);
        }

        if ($request->category && $request->category !== 'All') {
            $query->where('category', $request->category);
        }

        if ($request->max_budget) {
            $query->where('cost_per_serving', '<=', $request->max_budget);
        }

        if ($request->max_cook_time) {
            $query->where('cook_time', '<=', $request->max_cook_time);
        }

        if ($request->student_only == 'true') {
            $query->where('is_student_pick', true);
        }

        if ($request->dietary_tags) {
            $tags = explode(',', $request->dietary_tags);
            $query->whereHas('dietaryTags', function ($q) use ($tags) {
                $q->whereIn('name', $tags);
            });
        }

        if ($request->search) {
            $search = trim($request->search);
            $stopWords = ['with', 'and', 'the', 'for', 'about', 'your', 'this', 'that', 'from', 'here', 'recipe', 'recipes', 'dishes', 'dish', 'meals', 'meal', 'food'];
            $words = array_filter(explode(' ', $search), function ($word) use ($stopWords) {
                $w = strtolower(trim($word));
                return strlen($w) > 2 && !in_array($w, $stopWords);
            });

            $query->where(function ($q) use ($search, $words) {
                // Match the full exact search phrase first
                $q->where('name', 'like', "%$search%")
                  ->orWhere('description', 'like', "%$search%")
                  ->orWhere('cuisine', 'like', "%$search%")
                  ->orWhereHas('ingredients', function ($qi) use ($search) {
                      $qi->where('name', 'like', "%$search%");
                  });

                // Match individual words if they are long enough and not stop words
                if (!empty($words)) {
                    foreach ($words as $word) {
                        $q->orWhere('name', 'like', "%$word%")
                          ->orWhere('description', 'like', "%$word%")
                          ->orWhere('cuisine', 'like', "%$word%")
                          ->orWhereHas('ingredients', function ($qi) use ($word) {
                              $qi->where('name', 'like', "%$word%");
                          });
                    }
                }
            });
        }

        $searched = [];
        $hasSearchIngredients = false;
        if ($request->ingredients) {
            $ingredients = explode(',', $request->ingredients);
            $searched = array_map('trim', array_map('strtolower', $ingredients));
            $hasSearchIngredients = true;
            
            // Filter to show recipes that contain at least one of these ingredients
            $query->whereHas('ingredients', function ($q) use ($ingredients) {
                $q->whereIn('ingredients.name', $ingredients);
            });
        }

        // Apply Sorting at DB level where possible
        $sort = $request->query('sort');
        $query->withCount('ingredients');
        if ($sort === 'cheapest') {
            $query->orderBy('cost_per_serving', 'asc');
        } elseif ($sort === 'fastest') {
            $query->orderBy('cook_time', 'asc');
        } elseif ($sort === 'fewest') {
            $query->orderBy('ingredients_count', 'asc');
        } else {
            $query->orderBy('id', 'desc');
        }

        $total = $query->count();

        $pantry = $this->getUserPantry();
        $user = auth('sanctum')->user() ?: request()->user();
        $pantryEmpty = !empty($user) && empty($pantry);

        $recipes = $query->get()->map(function ($recipe) use ($searched, $hasSearchIngredients, $pantry, $pantryEmpty) {
            $pantryMetrics = $this->calculatePantryMetrics($recipe, $pantry, $pantryEmpty);

            $matchedIngredients = [];
            $missingIngredients = [];

            if ($hasSearchIngredients) {
                foreach ($recipe->ingredients as $ing) {
                    $ingName = strtolower($ing->name);
                    $isMatched = false;
                    foreach ($searched as $term) {
                        if (str_contains($ingName, $term) || str_contains($term, $ingName)) {
                            $isMatched = true;
                            break;
                        }
                    }

                    $ingData = [
                        'id' => $ing->id,
                        'name' => $ing->name,
                        'quantity' => $ing->pivot->quantity,
                        'unit' => $ing->unit,
                    ];

                    if ($isMatched) {
                        $matchedIngredients[] = $ingData;
                    } else {
                        $missingIngredients[] = $ingData;
                    }
                }
            } else {
                $missingIngredients = $pantryMetrics['missing_ingredients'];
                $matchedIngredients = $pantryMetrics['matched_ingredients'];
            }

            $avgRating = round($recipe->reviews()->avg('rating') ?? 0, 1);
            $reviewsCount = $recipe->reviews()->count();

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
                'total_cost' => round($recipe->cost_per_serving * $recipe->servings, 2),
                'matched_ingredients' => $hasSearchIngredients ? $matchedIngredients : $matchedIngredients,
                'missing_ingredients' => $hasSearchIngredients ? $missingIngredients : $missingIngredients,
                'missing_count' => $pantryMetrics['missing_count'],
                'estimated_shopping_cost' => $pantryMetrics['estimated_shopping_cost'],
                'pantry_empty' => $pantryMetrics['pantry_empty'] ?? false,
                'ingredients_count' => count($recipe->ingredients),
                'average_rating' => $avgRating,
                'reviews_count' => $reviewsCount,
                'nutrition' => $this->getRecipeNutrition($recipe->id),
            ];
        });

        // If searched by ingredients, sort by fewest missing ingredients (best match first) by default
        if ($request->ingredients && (!$sort || $sort === 'default')) {
            $recipes = $recipes->sortBy('missing_count')->values();
        }

        return response()->json([
            'total' => $total,
            'recipes' => $recipes
        ]);
    }

    public function show($id)
    {
        $recipe = Recipe::with(['dietaryTags', 'ingredients'])->findOrFail($id);

        $costBreakdown = $recipe->ingredients->map(function ($ingredient) {
            $quantity = $ingredient->pivot->quantity;
            $cost = round($ingredient->cost_per_unit * $quantity, 2);
            return [
                'name' => $ingredient->name,
                'quantity' => $quantity,
                'unit' => $ingredient->unit,
                'cost' => $cost,
            ];
        });

        $pantry = $this->getUserPantry();
        $user = auth('sanctum')->user() ?: request()->user();
        $pantryEmpty = !empty($user) && empty($pantry);
        $pantryMetrics = $this->calculatePantryMetrics($recipe, $pantry, $pantryEmpty);

        $avgRating = round($recipe->reviews()->avg('rating') ?? 0, 1);
        $reviewsCount = $recipe->reviews()->count();

        return response()->json([
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
            'cost_breakdown' => $costBreakdown,
            'total_cost' => round($recipe->cost_per_serving * $recipe->servings, 2),
            'average_rating' => $avgRating,
            'reviews_count' => $reviewsCount,
            'nutrition' => $this->getRecipeNutrition($recipe->id),
            'missing_count' => $pantryMetrics['missing_count'],
            'estimated_shopping_cost' => $pantryMetrics['estimated_shopping_cost'],
            'missing_ingredients' => $pantryMetrics['missing_ingredients'],
            'matched_ingredients' => $pantryMetrics['matched_ingredients'],
            'pantry_empty' => $pantryMetrics['pantry_empty'] ?? false,
        ]);
    }

    public function recommendations(Request $request)
    {
        // Check if user is authenticated via Sanctum guard
        $user = auth('sanctum')->user();

        if ($user) {
            // Fetch user favorites
            $favoritedRecipeIds = \App\Models\Favorite::where('user_id', $user->id)
                ->pluck('recipe_id')
                ->toArray();

            if (count($favoritedRecipeIds) > 0) {
                // Get favorite cuisines and tag names
                $favorites = Recipe::whereIn('id', $favoritedRecipeIds)->with('dietaryTags')->get();
                $cuisines = $favorites->pluck('cuisine')->unique()->filter()->toArray();
                
                $tagNames = [];
                foreach ($favorites as $fav) {
                    $tagNames = array_merge($tagNames, $fav->dietaryTags->pluck('name')->toArray());
                }
                $tagNames = array_unique($tagNames);

                // Build recommendations query
                $query = Recipe::whereNotIn('id', $favoritedRecipeIds)
                    ->where('is_approved', true)
                    ->with(['dietaryTags', 'ingredients']);

                $query->where(function ($q) use ($cuisines, $tagNames) {
                    if (count($cuisines) > 0) {
                        $q->whereIn('cuisine', $cuisines);
                    }
                    if (count($tagNames) > 0) {
                        $q->orWhereHas('dietaryTags', function ($sq) use ($tagNames) {
                            $sq->whereIn('name', $tagNames);
                        });
                    }
                });

                $recommended = $query->inRandomOrder()->limit(6)->get();

                if ($recommended->count() > 0) {
                    return response()->json($this->mapRecipesWithRating($recommended));
                }
            }
        }

        // Default Guest Recommendations: Cheapest student-friendly recipes
        $cheapRecipes = Recipe::where('is_student_pick', true)
            ->where('is_approved', true)
            ->with(['dietaryTags', 'ingredients'])
            ->inRandomOrder()
            ->limit(6)
            ->get();

        return response()->json($this->mapRecipesWithRating($cheapRecipes));
    }

    private function mapRecipesWithRating($recipes)
    {
        $pantry = $this->getUserPantry();
        $user = auth('sanctum')->user() ?: request()->user();
        $pantryEmpty = !empty($user) && empty($pantry);
        return $recipes->map(function ($recipe) use ($pantry, $pantryEmpty) {
            $pantryMetrics = $this->calculatePantryMetrics($recipe, $pantry, $pantryEmpty);
            return [
                'id' => $recipe->id,
                'name' => $recipe->name,
                'description' => $recipe->description,
                'cuisine' => $recipe->cuisine,
                'category' => $recipe->category,
                'difficulty' => $recipe->difficulty,
                'cook_time' => $recipe->cook_time,
                'servings' => $recipe->servings,
                'cost_per_serving' => $recipe->cost_per_serving,
                'image_url' => $recipe->image_url,
                'is_student_pick' => $recipe->is_student_pick,
                'dietary_tags' => $recipe->dietaryTags->map(fn($t) => ['name' => $t->name, 'color' => $t->color]),
                'total_cost' => round($recipe->cost_per_serving * $recipe->servings, 2),
                'average_rating' => round($recipe->reviews()->avg('rating') ?? 0, 1),
                'reviews_count' => $recipe->reviews()->count(),
                'nutrition' => $this->getRecipeNutrition($recipe->id),
                'missing_count' => $pantryMetrics['missing_count'],
                'estimated_shopping_cost' => $pantryMetrics['estimated_shopping_cost'],
                'pantry_empty' => $pantryMetrics['pantry_empty'] ?? false,
            ];
        });
    }

    public function getReviews($recipeId)
    {
        $reviews = Review::where('recipe_id', $recipeId)
            ->with('user:id,name,profile_image')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($review) {
                return [
                    'id' => $review->id,
                    'rating' => $review->rating,
                    'comment' => $review->comment,
                    'created_at' => $review->created_at,
                    'user' => [
                        'name' => $review->user->name,
                        'profile_image_url' => $review->user->profile_image 
                            ? asset('storage/' . $review->user->profile_image) 
                            : null,
                    ]
                ];
            });

        return response()->json($reviews);
    }

    public function storeReview(Request $request, $recipeId)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:1000',
        ]);

        $user = $request->user();

        // Check if user has already reviewed this recipe
        $existing = Review::where('user_id', $user->id)
            ->where('recipe_id', $recipeId)
            ->first();

        if ($existing) {
            return response()->json(['message' => 'You have already reviewed this recipe.'], 422);
        }

        $review = Review::create([
            'user_id' => $user->id,
            'recipe_id' => $recipeId,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return response()->json($review, 201);
    }

    public function storeUserRecipe(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'cuisine' => 'required|string|max:255',
            'category' => 'required|in:Breakfast,Lunch,Dinner,Snacks',
            'difficulty' => 'required|in:Easy,Medium,Hard,Expert',
            'cook_time' => 'required|integer|min:1',
            'servings' => 'required|integer|min:1',
            'image_url' => 'nullable|string',
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
                $ing = \App\Models\Ingredient::findOrFail($item['id']);
                $totalCost += $ing->cost_per_unit * $item['quantity'];
            }
            $costPerServing = round($totalCost / $request->servings, 2);

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
                'is_student_pick' => false,
                'instructions' => $request->instructions ?? [],
                'user_id' => $request->user()->id,
                'is_approved' => false, // Pending approval!
            ]);

            // Sync ingredients
            $syncData = [];
            foreach ($request->ingredients as $item) {
                $syncData[$item['id']] = ['quantity' => $item['quantity']];
            }
            $recipe->ingredients()->sync($syncData);

            // Sync tags
            $tagIds = [];
            if ($request->has('dietary_tags')) {
                foreach ($request->dietary_tags as $tagName) {
                    $tag = \App\Models\DietaryTag::firstOrCreate(
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

    public function allIngredients()
    {
        return response()->json(\App\Models\Ingredient::orderBy('name')->get());
    }

    private function getUserPantry()
    {
        // Check both authenticated user and sanctum guard session explicitly
        $user = auth('sanctum')->user() ?: request()->user();
        if (!$user) {
            return [];
        }
        return \App\Models\PantryItem::where('user_id', $user->id)
            ->get()
            ->pluck('quantity', 'ingredient_name')
            ->mapWithKeys(function ($qty, $name) {
                return [strtolower(trim($name)) => floatval($qty)];
            })
            ->toArray();
    }

    private function calculatePantryMetrics($recipe, $pantry, $pantryEmpty = false)
    {
        $missingCount = 0;
        $estimatedCost = 0.0;
        $missingIngredients = [];
        $matchedIngredients = [];

        foreach ($recipe->ingredients as $ing) {
            $ingName = strtolower(trim($ing->name));
            $requiredQty = floatval($ing->pivot->quantity);
            $pantryQty = isset($pantry[$ingName]) ? $pantry[$ingName] : 0.0;

            $ingData = [
                'id' => $ing->id,
                'name' => $ing->name,
                'quantity' => $requiredQty,
                'unit' => $ing->unit,
                'pantry_quantity' => $pantryQty,
            ];

            if ($pantryQty >= $requiredQty) {
                $matchedIngredients[] = $ingData;
            } else {
                $missingQty = $requiredQty - $pantryQty;
                $missingCount++;
                $estimatedCost += $missingQty * floatval($ing->cost_per_unit);
                
                $ingData['missing_quantity'] = $missingQty;
                $ingData['cost_per_unit'] = floatval($ing->cost_per_unit);
                $ingData['estimated_cost'] = round($missingQty * floatval($ing->cost_per_unit), 2);
                $missingIngredients[] = $ingData;
            }
        }

        // If not logged in, the estimated shopping cost is simply the total cost of all ingredients
        if (empty($pantry)) {
            $estimatedCost = 0.0;
            foreach ($recipe->ingredients as $ing) {
                $estimatedCost += floatval($ing->pivot->quantity) * floatval($ing->cost_per_unit);
            }
        }

        return [
            'missing_count' => $missingCount,
            'estimated_shopping_cost' => round($estimatedCost, 2),
            'missing_ingredients' => $missingIngredients,
            'matched_ingredients' => $matchedIngredients,
            'pantry_empty' => $pantryEmpty,
        ];
    }
}
