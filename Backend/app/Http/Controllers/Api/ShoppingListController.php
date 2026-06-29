<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ShoppingListItem;
use App\Models\Recipe;
use Illuminate\Http\Request;

class ShoppingListController extends Controller
{
    public function index(Request $request)
    {
        $items = ShoppingListItem::where('user_id', $request->user()->id)
            ->with('ingredient')
            ->get()
            ->map(fn($item) => [
                'id' => $item->id,
                'ingredient' => $item->ingredient->name,
                'unit' => $item->ingredient->unit,
                'quantity' => $item->quantity,
                'cost' => round($item->ingredient->cost_per_unit * $item->quantity, 2),
                'is_checked' => $item->is_checked,
            ]);

        return response()->json($items);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'quantity' => 'required|numeric|min:0.01',
            'unit' => 'nullable|string|max:50',
        ]);

        $name = trim($request->input('name'));
        $qty = $request->input('quantity');
        $unit = $request->input('unit') ?: 'pcs';

        // Find or create the ingredient
        $ingredient = \App\Models\Ingredient::firstOrCreate(
            ['name' => $name],
            ['unit' => $unit, 'cost_per_unit' => 0.10]
        );

        $item = ShoppingListItem::updateOrCreate(
            ['user_id' => $request->user()->id, 'ingredient_id' => $ingredient->id],
            ['quantity' => $qty, 'is_checked' => false]
        );

        return response()->json([
            'id' => $item->id,
            'ingredient' => $ingredient->name,
            'unit' => $ingredient->unit,
            'quantity' => $item->quantity,
            'cost' => round($ingredient->cost_per_unit * $item->quantity, 2),
            'is_checked' => $item->is_checked,
        ]);
    }

    public function addFromRecipe(Request $request)
    {
        $request->validate(['recipe_id' => 'required|exists:recipes,id']);
        $recipe = Recipe::with('ingredients')->findOrFail($request->recipe_id);

        foreach ($recipe->ingredients as $ingredient) {
            ShoppingListItem::updateOrCreate(
                ['user_id' => $request->user()->id, 'ingredient_id' => $ingredient->id],
                ['quantity' => $ingredient->pivot->quantity, 'is_checked' => false]
            );
        }

        return response()->json(['message' => 'Ingredients added to shopping list']);
    }

    public function toggle(Request $request, $id)
    {
        $item = ShoppingListItem::where('user_id', $request->user()->id)->findOrFail($id);
        $item->update(['is_checked' => !$item->is_checked]);
        return response()->json(['is_checked' => $item->is_checked]);
    }

    public function destroy(Request $request, $id)
    {
        ShoppingListItem::where('user_id', $request->user()->id)->findOrFail($id)->delete();
        return response()->json(['message' => 'Item removed']);
    }

    public function clear(Request $request)
    {
        ShoppingListItem::where('user_id', $request->user()->id)->delete();
        return response()->json(['message' => 'Shopping list cleared']);
    }
}
