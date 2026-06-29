<?php

namespace Database\Seeders;

use App\Models\Review;
use App\Models\Recipe;
use App\Models\User;
use Illuminate\Database\Seeder;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $recipes = Recipe::limit(15)->get();
        $admin = User::where('email', 'admin@studenteats.com')->first();
        $student = User::where('email', 'student@studenteats.com')->first();

        if (!$admin || !$student || $recipes->count() === 0) {
            return;
        }

        $comments = [
            ['rating' => 5, 'comment' => 'This was incredibly simple to make and fits my student budget perfectly! Highly recommend.'],
            ['rating' => 4, 'comment' => 'Tastes great! I added some extra garlic and chili flakes to spice it up. Super cheap.'],
            ['rating' => 5, 'comment' => 'Absolutely love this recipe! Made it in under 15 minutes, which is perfect during exam weeks.'],
            ['rating' => 4, 'comment' => 'A solid quick meal. It is cheap, nutritious, and very filling.'],
            ['rating' => 5, 'comment' => 'My go-to breakfast. So easy to prepare and cheap.'],
        ];

        foreach ($recipes as $idx => $recipe) {
            // Seed a review from the student
            $commentData1 = $comments[$idx % count($comments)];
            Review::create([
                'user_id' => $student->id,
                'recipe_id' => $recipe->id,
                'rating' => $commentData1['rating'],
                'comment' => $commentData1['comment'],
            ]);

            // Seed a review from the admin for every second recipe to mix it up
            if ($idx % 2 === 0) {
                $commentData2 = $comments[($idx + 1) % count($comments)];
                Review::create([
                    'user_id' => $admin->id,
                    'recipe_id' => $recipe->id,
                    'rating' => $commentData2['rating'],
                    'comment' => 'Tried this out today, verified the cooking instructions and cost baseline. Excellent recipe choice.',
                ]);
            }
        }
    }
}
