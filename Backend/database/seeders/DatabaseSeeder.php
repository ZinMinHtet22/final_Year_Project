<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Database\Seeders\RecipeSeeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Skip if already seeded (safe to run on every boot)
        if (\App\Models\Recipe::count() > 0) {
            return;
        }

        // Seed Admin User
        User::firstOrCreate(
            ['email' => 'admin@studenteats.com'],
            [
                'name' => 'System Admin',
                'password' => \Illuminate\Support\Facades\Hash::make('admin1234'),
                'is_admin' => true,
            ]
        );

        // Seed Student User
        User::firstOrCreate(
            ['email' => 'student@studenteats.com'],
            [
                'name' => 'Jane Student',
                'password' => \Illuminate\Support\Facades\Hash::make('student1234'),
                'is_admin' => false,
            ]
        );

        $this->call([
            CurrencySeeder::class,
            RecipeSeeder::class,
            WorldRecipeSeeder::class,
            ReviewSeeder::class,
        ]);

        // Post-process to ensure 100% unique budgets and cook times while preserving realistic real-life values
        $recipes = \App\Models\Recipe::all();
        $usedCosts = [];
        $usedTimes = [];
        
        foreach ($recipes as $recipe) {
            $cost = $recipe->cost_per_serving;
            $time = $recipe->cook_time;
            
            // Increment by 1 cent until unique
            while (in_array(number_format($cost, 2), $usedCosts)) {
                $cost += 0.01;
            }
            $usedCosts[] = number_format($cost, 2);
            
            // Increment by 1 minute until unique
            while (in_array($time, $usedTimes)) {
                $time += 1;
            }
            $usedTimes[] = $time;
            
            $recipe->update([
                'cost_per_serving' => round($cost, 2),
                'cook_time' => $time
            ]);
        }
    }
}
