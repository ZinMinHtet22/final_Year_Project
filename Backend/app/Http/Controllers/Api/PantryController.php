<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PantryItem;
use Illuminate\Http\Request;

class PantryController extends Controller
{
    public function index(Request $request)
    {
        $items = PantryItem::where('user_id', $request->user()->id)
            ->orderBy('ingredient_name')
            ->get();

        return response()->json($items);
    }

    public function store(Request $request)
    {
        $request->validate([
            'ingredient_name' => 'required|string|max:255',
            'quantity' => 'required|numeric|min:0.001',
        ]);

        $name = trim($request->ingredient_name);
        $userId = $request->user()->id;

        // Check if item exists in pantry (case-insensitive)
        $item = PantryItem::where('user_id', $userId)
            ->whereRaw('LOWER(ingredient_name) = ?', [strtolower($name)])
            ->first();

        if ($item) {
            $item->quantity = $request->quantity;
            $item->save();
        } else {
            $item = PantryItem::create([
                'user_id' => $userId,
                'ingredient_name' => $name,
                'quantity' => $request->quantity,
            ]);
        }

        return response()->json($item, 201);
    }

    public function destroy(Request $request, $id)
    {
        $item = PantryItem::where('user_id', $request->user()->id)->findOrFail($id);
        $item->delete();

        return response()->json(['message' => 'Pantry item removed successfully']);
    }
}
