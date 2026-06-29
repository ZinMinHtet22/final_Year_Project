<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RecipeController;
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\ShoppingListController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\FeedbackController;
use App\Http\Controllers\Api\PantryController;
use App\Http\Controllers\Api\AnalyticsController;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/google', [AuthController::class, 'googleLogin']);
Route::get('/recipes', [RecipeController::class, 'index']);
Route::get('/recipes/recommendations', [RecipeController::class, 'recommendations']);
Route::get('/recipes/{id}', [RecipeController::class, 'show']);
Route::get('/recipes/{id}/reviews', [RecipeController::class, 'getReviews']);
Route::get('/ingredients', [RecipeController::class, 'allIngredients']);
Route::post('/chat', [ChatController::class, 'chat']);
Route::post('/feedback', [FeedbackController::class, 'store']);
Route::get('/currencies', function () {
    return response()->json(\App\Models\Currency::orderBy('code')->get());
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/user/profile', [AuthController::class, 'updateProfile']);
    Route::post('/user/profile/image', [AuthController::class, 'uploadProfileImage']);
    Route::delete('/user/profile/image', [AuthController::class, 'deleteProfileImage']);

    Route::get('/favorites', [FavoriteController::class, 'index']);
    Route::post('/favorites', [FavoriteController::class, 'store']);
    Route::delete('/favorites/{recipeId}', [FavoriteController::class, 'destroy']);

    Route::get('/shopping-list', [ShoppingListController::class, 'index']);
    Route::post('/shopping-list', [ShoppingListController::class, 'store']);
    Route::post('/shopping-list/add-recipe', [ShoppingListController::class, 'addFromRecipe']);
    Route::patch('/shopping-list/{id}/toggle', [ShoppingListController::class, 'toggle']);
    Route::delete('/shopping-list/{id}', [ShoppingListController::class, 'destroy']);
    Route::delete('/shopping-list', [ShoppingListController::class, 'clear']);

    // Admin routes
    Route::get('/admin/stats', [\App\Http\Controllers\Api\AdminController::class, 'stats']);
    
    Route::get('/admin/recipes', [\App\Http\Controllers\Api\AdminController::class, 'indexRecipes']);
    Route::post('/admin/recipes', [\App\Http\Controllers\Api\AdminController::class, 'storeRecipe']);
    Route::put('/admin/recipes/{id}', [\App\Http\Controllers\Api\AdminController::class, 'updateRecipe']);
    Route::delete('/admin/recipes/{id}', [\App\Http\Controllers\Api\AdminController::class, 'destroyRecipe']);

    Route::get('/admin/ingredients', [\App\Http\Controllers\Api\AdminController::class, 'indexIngredients']);
    Route::post('/admin/ingredients', [\App\Http\Controllers\Api\AdminController::class, 'storeIngredient']);
    Route::put('/admin/ingredients/{id}', [\App\Http\Controllers\Api\AdminController::class, 'updateIngredient']);
    Route::delete('/admin/ingredients/{id}', [\App\Http\Controllers\Api\AdminController::class, 'destroyIngredient']);

    Route::get('/admin/users', [\App\Http\Controllers\Api\AdminController::class, 'indexUsers']);
    Route::put('/admin/users/{id}/role', [\App\Http\Controllers\Api\AdminController::class, 'toggleUserRole']);
    Route::delete('/admin/users/{id}', [\App\Http\Controllers\Api\AdminController::class, 'destroyUser']);

    Route::get('/admin/feedback', [\App\Http\Controllers\Api\AdminController::class, 'indexFeedback']);
    Route::delete('/admin/feedback/{id}', [\App\Http\Controllers\Api\AdminController::class, 'destroyFeedback']);

    Route::get('/admin/currencies', [\App\Http\Controllers\Api\AdminController::class, 'indexCurrencies']);
    Route::put('/admin/currencies/{code}', [\App\Http\Controllers\Api\AdminController::class, 'updateCurrencyRate']);

    Route::post('/recipes/{id}/reviews', [RecipeController::class, 'storeReview']);

    Route::post('/user/recipes', [RecipeController::class, 'storeUserRecipe']);
    Route::get('/admin/recipes/pending', [\App\Http\Controllers\Api\AdminController::class, 'indexPendingRecipes']);
    Route::put('/admin/recipes/{id}/approve', [\App\Http\Controllers\Api\AdminController::class, 'approveRecipe']);

    // Smart Pantry routes
    Route::get('/pantry', [PantryController::class, 'index']);
    Route::post('/pantry', [PantryController::class, 'store']);
    Route::delete('/pantry/{id}', [PantryController::class, 'destroy']);

    // Analytics Engine routes
    Route::get('/analytics/dashboard', [AnalyticsController::class, 'dashboard']);
    Route::post('/cooked-recipes', [AnalyticsController::class, 'markCooked']);

    // Jeffery Admin Command Center
    Route::middleware([\App\Http\Middleware\CheckAdmin::class])->group(function () {
        Route::get('/admin/system-stats', [\App\Http\Controllers\Api\AdminController::class, 'systemStats']);
        Route::post('/admin/toggle-maintenance', [\App\Http\Controllers\Api\AdminController::class, 'toggleMaintenance']);
    });
});
