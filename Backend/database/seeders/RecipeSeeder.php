<?php

namespace Database\Seeders;

use App\Models\DietaryTag;
use App\Models\Ingredient;
use App\Models\Recipe;
use Illuminate\Database\Seeder;

class RecipeSeeder extends Seeder
{
    public function run(): void
    {
        // Create dietary tags
        $tags = [
            ['name' => 'Vegan', 'color' => '#16a34a'],
            ['name' => 'Vegetarian', 'color' => '#15803d'],
            ['name' => 'Gluten-Free', 'color' => '#ca8a04'],
            ['name' => 'Dairy-Free', 'color' => '#2563eb'],
            ['name' => 'Nut-Free', 'color' => '#dc2626'],
            ['name' => 'High-Protein', 'color' => '#9333ea'],
        ];
        foreach ($tags as $tag) {
            DietaryTag::firstOrCreate(['name' => $tag['name']], $tag);
        }

        // Create ingredients
        $ingredients = [
            ['name' => 'Spaghetti', 'unit' => 'g', 'cost_per_unit' => 0.002],
            ['name' => 'Garlic', 'unit' => 'clove', 'cost_per_unit' => 0.10],
            ['name' => 'Olive Oil', 'unit' => 'tbsp', 'cost_per_unit' => 0.15],
            ['name' => 'Parsley', 'unit' => 'g', 'cost_per_unit' => 0.01],
            ['name' => 'Rice', 'unit' => 'g', 'cost_per_unit' => 0.001],
            ['name' => 'Mixed Vegetables', 'unit' => 'g', 'cost_per_unit' => 0.003],
            ['name' => 'Soy Sauce', 'unit' => 'tbsp', 'cost_per_unit' => 0.05],
            ['name' => 'Bread', 'unit' => 'slice', 'cost_per_unit' => 0.20],
            ['name' => 'Avocado', 'unit' => 'piece', 'cost_per_unit' => 0.80],
            ['name' => 'Lemon', 'unit' => 'piece', 'cost_per_unit' => 0.30],
            ['name' => 'Red Lentils', 'unit' => 'g', 'cost_per_unit' => 0.003],
            ['name' => 'Onion', 'unit' => 'piece', 'cost_per_unit' => 0.25],
            ['name' => 'Tomatoes', 'unit' => 'g', 'cost_per_unit' => 0.003],
            ['name' => 'Cumin', 'unit' => 'tsp', 'cost_per_unit' => 0.05],
            ['name' => 'Eggs', 'unit' => 'piece', 'cost_per_unit' => 0.30],
            ['name' => 'Chickpeas', 'unit' => 'g', 'cost_per_unit' => 0.002],
            ['name' => 'Coconut Milk', 'unit' => 'ml', 'cost_per_unit' => 0.003],
            ['name' => 'Garam Masala', 'unit' => 'tsp', 'cost_per_unit' => 0.08],
            ['name' => 'Oats', 'unit' => 'g', 'cost_per_unit' => 0.002],
            ['name' => 'Peanut Butter', 'unit' => 'tbsp', 'cost_per_unit' => 0.20],
            ['name' => 'Banana', 'unit' => 'piece', 'cost_per_unit' => 0.25],
            ['name' => 'Milk', 'unit' => 'ml', 'cost_per_unit' => 0.001],
            ['name' => 'Chicken Breast', 'unit' => 'g', 'cost_per_unit' => 0.008],
            ['name' => 'Lettuce', 'unit' => 'g', 'cost_per_unit' => 0.004],
            ['name' => 'Cherry Tomatoes', 'unit' => 'g', 'cost_per_unit' => 0.006],
            ['name' => 'Black Beans', 'unit' => 'g', 'cost_per_unit' => 0.002],
            ['name' => 'Flour Tortillas', 'unit' => 'piece', 'cost_per_unit' => 0.30],
            ['name' => 'Cheddar Cheese', 'unit' => 'g', 'cost_per_unit' => 0.010],
            ['name' => 'Pasta', 'unit' => 'g', 'cost_per_unit' => 0.002],
            ['name' => 'Mozzarella', 'unit' => 'g', 'cost_per_unit' => 0.012],
        ];

        $ingredientModels = [];
        foreach ($ingredients as $ing) {
            $ingredientModels[$ing['name']] = Ingredient::firstOrCreate(['name' => $ing['name']], $ing);
        }

        // Helper to get tag ids
        $getTagIds = fn($names) => DietaryTag::whereIn('name', $names)->pluck('id')->toArray();

        // Recipes
        $recipes = [
            [
                'recipe' => [
                    'name' => 'Spaghetti Aglio e Olio',
                    'description' => 'Classic Italian pasta with garlic, olive oil and a hint of chili. Simple, delicious and very affordable.',
                    'cuisine' => 'Italian',
                    'category' => 'Dinner',
                    'difficulty' => 'Easy',
                    'cook_time' => 15,
                    'servings' => 2,
                    'cost_per_serving' => 1.64,
                    'image_url' => 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400',
                    'is_student_pick' => true,
                    'instructions' => [
                        'Bring a large pot of salted water to a boil and cook spaghetti according to package directions.',
                        'Peel and thinly slice the garlic cloves.',
                        'In a large pan, add olive oil and heat over medium-low. Add sliced garlic and cook slowly until lightly golden.',
                        'Drain pasta, reserving a small splash of pasta water. Add pasta and water to the pan and toss with parsley.',
                        'Serve hot, garnished with extra chili flakes if desired.'
                    ]
                ],
                'ingredients' => [
                    ['name' => 'Spaghetti', 'quantity' => 200],
                    ['name' => 'Garlic', 'quantity' => 4],
                    ['name' => 'Olive Oil', 'quantity' => 3],
                    ['name' => 'Parsley', 'quantity' => 10],
                ],
                'tags' => ['Vegan', 'Dairy-Free'],
            ],
            [
                'recipe' => [
                    'name' => 'Veggie Stir Fry & Rice',
                    'description' => 'Colorful vegetables tossed in soy sauce with fluffy steamed rice. A healthy, filling student meal.',
                    'cuisine' => 'Asian',
                    'category' => 'Lunch',
                    'difficulty' => 'Easy',
                    'cook_time' => 15,
                    'servings' => 2,
                    'cost_per_serving' => 1.22,
                    'image_url' => 'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400',
                    'is_student_pick' => true,
                    'instructions' => [
                        'Rinse and steam the rice according to instructions until fluffy.',
                        'Heat olive oil in a large skillet or wok over medium-high heat.',
                        'Toss in mixed vegetables and stir-fry for 5-7 minutes until tender-crisp.',
                        'Drizzle soy sauce over the vegetables, stir well, and cook for another minute.',
                        'Serve the hot stir-fry vegetables over a bed of warm steamed rice.'
                    ]
                ],
                'ingredients' => [
                    ['name' => 'Rice', 'quantity' => 200],
                    ['name' => 'Mixed Vegetables', 'quantity' => 200],
                    ['name' => 'Soy Sauce', 'quantity' => 2],
                    ['name' => 'Olive Oil', 'quantity' => 1],
                ],
                'tags' => ['Vegan', 'Gluten-Free', 'Dairy-Free'],
            ],
            [
                'recipe' => [
                    'name' => 'Avocado Toast',
                    'description' => 'Creamy smashed avocado on toasted sourdough with lemon and red pepper flakes.',
                    'cuisine' => 'American',
                    'category' => 'Breakfast',
                    'difficulty' => 'Easy',
                    'cook_time' => 10,
                    'servings' => 1,
                    'cost_per_serving' => 2.15,
                    'image_url' => 'https://images.unsplash.com/photo-1541519227354-08fa5d50c820?w=400',
                    'is_student_pick' => false,
                    'instructions' => [
                        'Toast the slices of bread in a toaster until golden-brown and crispy.',
                        'Cut open the avocado, scoop out the flesh, and mash it in a bowl with a fork.',
                        'Squeeze fresh lemon juice over the mashed avocado, and season with salt and pepper.',
                        'Spread the seasoned avocado mixture evenly over the toasted bread slices.',
                        'Garnish with red pepper flakes and serve immediately.'
                    ]
                ],
                'ingredients' => [
                    ['name' => 'Bread', 'quantity' => 2],
                    ['name' => 'Avocado', 'quantity' => 1],
                    ['name' => 'Lemon', 'quantity' => 0.5],
                ],
                'tags' => ['Vegan', 'Dairy-Free'],
            ],
            [
                'recipe' => [
                    'name' => 'Red Lentil Soup',
                    'description' => 'Hearty warming red lentil soup with cumin, turmeric and tomatoes. Protein-packed and ultra cheap.',
                    'cuisine' => 'Mediterranean',
                    'category' => 'Dinner',
                    'difficulty' => 'Easy',
                    'cook_time' => 35,
                    'servings' => 4,
                    'cost_per_serving' => 1.00,
                    'image_url' => 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400',
                    'is_student_pick' => true,
                    'instructions' => [
                        'Heat olive oil in a large soup pot and sauté diced onion and minced garlic until soft.',
                        'Rinse red lentils thoroughly under cold water.',
                        'Add cumin and lentils to the pot, toast for 1 minute, then add diced tomatoes and water.',
                        'Bring the soup to a boil, then reduce heat, cover, and simmer for 20-25 minutes until lentils are soft.',
                        'Ladle into bowls and serve warm, optionally with a squeeze of fresh lemon.'
                    ]
                ],
                'ingredients' => [
                    ['name' => 'Red Lentils', 'quantity' => 300],
                    ['name' => 'Onion', 'quantity' => 1],
                    ['name' => 'Tomatoes', 'quantity' => 200],
                    ['name' => 'Cumin', 'quantity' => 2],
                    ['name' => 'Olive Oil', 'quantity' => 2],
                ],
                'tags' => ['Vegan', 'Gluten-Free', 'Dairy-Free', 'High-Protein'],
            ],
            [
                'recipe' => [
                    'name' => 'Egg Fried Rice',
                    'description' => 'Quick and satisfying fried rice with eggs, soy sauce and spring onions. Perfect for leftover rice.',
                    'cuisine' => 'Asian',
                    'category' => 'Lunch',
                    'difficulty' => 'Easy',
                    'cook_time' => 15,
                    'servings' => 2,
                    'cost_per_serving' => 1.07,
                    'image_url' => 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400',
                    'is_student_pick' => true,
                    'instructions' => [
                        'Heat olive oil in a skillet or wok over medium heat.',
                        'Pour in beaten eggs and scramble them lightly until set. Remove eggs from pan and set aside.',
                        'Add a tiny bit of oil, toss in pre-cooked/leftover rice, and stir-fry for 3-4 minutes to dry it out.',
                        'Return the eggs to the pan, drizzle soy sauce, and stir-fry everything together.',
                        'Garnish with spring onions, remove from heat, and serve hot.'
                    ]
                ],
                'ingredients' => [
                    ['name' => 'Rice', 'quantity' => 200],
                    ['name' => 'Eggs', 'quantity' => 2],
                    ['name' => 'Soy Sauce', 'quantity' => 2],
                    ['name' => 'Olive Oil', 'quantity' => 1],
                ],
                'tags' => ['Dairy-Free', 'Gluten-Free'],
            ],
            [
                'recipe' => [
                    'name' => 'Chickpea Curry',
                    'description' => 'Fragrant and creamy chickpea curry with coconut milk and aromatic spices. Serve with rice.',
                    'cuisine' => 'Indian',
                    'category' => 'Dinner',
                    'difficulty' => 'Medium',
                    'cook_time' => 30,
                    'servings' => 3,
                    'cost_per_serving' => 1.48,
                    'image_url' => 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
                    'is_student_pick' => true,
                    'instructions' => [
                        'Sauté diced onion and garlic in a pan until lightly golden.',
                        'Stir in garam masala and cook for 30 seconds until highly fragrant.',
                        'Add rinsed chickpeas and chopped tomatoes, cooking for 5 minutes.',
                        'Pour in the coconut milk, bring to a gentle simmer, and cook for 15 minutes to let flavors meld.',
                        'Season with salt and serve hot, ideally over steamed rice.'
                    ]
                ],
                'ingredients' => [
                    ['name' => 'Chickpeas', 'quantity' => 400],
                    ['name' => 'Coconut Milk', 'quantity' => 200],
                    ['name' => 'Tomatoes', 'quantity' => 200],
                    ['name' => 'Onion', 'quantity' => 1],
                    ['name' => 'Garam Masala', 'quantity' => 2],
                ],
                'tags' => ['Vegan', 'Gluten-Free', 'Dairy-Free', 'High-Protein'],
            ],
            [
                'recipe' => [
                    'name' => 'Peanut Butter Overnight Oats',
                    'description' => 'Creamy overnight oats with peanut butter and banana. Prep in 5 minutes the night before.',
                    'cuisine' => 'American',
                    'category' => 'Breakfast',
                    'difficulty' => 'Easy',
                    'cook_time' => 5,
                    'servings' => 1,
                    'cost_per_serving' => 1.60,
                    'image_url' => 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=400',
                    'is_student_pick' => true,
                    'instructions' => [
                        'In a jar or container, combine rolled oats and milk.',
                        'Stir in the peanut butter until relatively smooth and well integrated.',
                        'Top with sliced banana and seal the container.',
                        'Refrigerate overnight (or for at least 4 hours) to allow oats to absorb the milk.',
                        'Stir once before eating in the morning and enjoy cold.'
                    ]
                ],
                'ingredients' => [
                    ['name' => 'Oats', 'quantity' => 80],
                    ['name' => 'Peanut Butter', 'quantity' => 2],
                    ['name' => 'Banana', 'quantity' => 1],
                    ['name' => 'Milk', 'quantity' => 150],
                ],
                'tags' => ['Vegetarian', 'High-Protein'],
            ],
            [
                'recipe' => [
                    'name' => 'Grilled Chicken Salad',
                    'description' => 'Lean grilled chicken over fresh greens with cherry tomatoes, cucumber and a light dressing.',
                    'cuisine' => 'American',
                    'category' => 'Lunch',
                    'difficulty' => 'Medium',
                    'cook_time' => 20,
                    'servings' => 1,
                    'cost_per_serving' => 4.35,
                    'image_url' => 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
                    'is_student_pick' => false,
                    'instructions' => [
                        'Season chicken breast with salt, pepper, and lemon juice.',
                        'Grill in a hot skillet for 5-6 minutes on each side until fully cooked through. Slice into strips.',
                        'Chop the lettuce and place it in a large bowl.',
                        'Add cherry tomatoes and sliced cucumber to the greens.',
                        'Top with the grilled chicken strips and drizzle with olive oil and extra lemon juice.'
                    ]
                ],
                'ingredients' => [
                    ['name' => 'Chicken Breast', 'quantity' => 150],
                    ['name' => 'Lettuce', 'quantity' => 100],
                    ['name' => 'Cherry Tomatoes', 'quantity' => 80],
                    ['name' => 'Olive Oil', 'quantity' => 1],
                    ['name' => 'Lemon', 'quantity' => 0.5],
                ],
                'tags' => ['Gluten-Free', 'Dairy-Free', 'High-Protein'],
            ],
            [
                'recipe' => [
                    'name' => 'Black Bean Quesadillas',
                    'description' => 'Crispy flour tortillas stuffed with seasoned black beans, melted cheddar and salsa.',
                    'cuisine' => 'Mexican',
                    'category' => 'Snacks',
                    'difficulty' => 'Easy',
                    'cook_time' => 15,
                    'servings' => 2,
                    'cost_per_serving' => 2.00,
                    'image_url' => 'https://images.unsplash.com/photo-1618040996337-56904b7850b9?w=400',
                    'is_student_pick' => true,
                    'instructions' => [
                        'Rinse and drain black beans. Season them with a pinch of cumin and salt.',
                        'Place two tortillas flat on a clean surface and spread black beans over half of each tortilla.',
                        'Sprinkle cheddar cheese generously over the beans.',
                        'Fold the tortillas in half, then toast them in a hot dry skillet for 2-3 minutes per side until crispy and cheese is melted.',
                        'Cut into wedges and serve warm with your favorite salsa.'
                    ]
                ],
                'ingredients' => [
                    ['name' => 'Black Beans', 'quantity' => 200],
                    ['name' => 'Flour Tortillas', 'quantity' => 4],
                    ['name' => 'Cheddar Cheese', 'quantity' => 80],
                    ['name' => 'Olive Oil', 'quantity' => 1],
                ],
                'tags' => ['Vegetarian', 'High-Protein'],
            ],
            [
                'recipe' => [
                    'name' => 'Tomato Mozzarella Pasta Bake',
                    'description' => 'Comforting baked pasta with rich tomato sauce, fresh basil and bubbling mozzarella on top.',
                    'cuisine' => 'Italian',
                    'category' => 'Dinner',
                    'difficulty' => 'Medium',
                    'cook_time' => 40,
                    'servings' => 4,
                    'cost_per_serving' => 1.50,
                    'image_url' => 'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=400',
                    'is_student_pick' => false,
                    'instructions' => [
                        'Boil pasta in a pot of salted water until al dente. Drain and set aside.',
                        'Sauté minced garlic in olive oil in a saucepan, add tomatoes, and simmer to create a sauce.',
                        'Preheat your oven to 375°F (190°C).',
                        'Mix the cooked pasta with the tomato sauce, then transfer to a baking dish.',
                        'Scatter mozzarella cubes on top and bake for 20 minutes until the top is bubbling and golden.'
                    ]
                ],
                'ingredients' => [
                    ['name' => 'Pasta', 'quantity' => 300],
                    ['name' => 'Tomatoes', 'quantity' => 400],
                    ['name' => 'Mozzarella', 'quantity' => 150],
                    ['name' => 'Garlic', 'quantity' => 3],
                    ['name' => 'Olive Oil', 'quantity' => 2],
                ],
                'tags' => ['Vegetarian'],
            ],
        ];

        foreach ($recipes as $index => $data) {
            $recipeData = $data['recipe'];
            $recipe = Recipe::create($recipeData);

            foreach ($data['ingredients'] as $ing) {
                if (isset($ingredientModels[$ing['name']])) {
                    $recipe->ingredients()->attach($ingredientModels[$ing['name']]->id, [
                        'quantity' => $ing['quantity'],
                    ]);
                }
            }

            $tagIds = $getTagIds($data['tags']);
            $recipe->dietaryTags()->sync($tagIds);
        }
    }
}
