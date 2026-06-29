<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('recipes', function (Blueprint $table) {
            $table->enum('category', ['Breakfast', 'Lunch', 'Dinner', 'Snacks'])->default('Dinner')->after('cuisine');
            $table->json('instructions')->nullable()->after('image_url');
        });
    }

    public function down(): void
    {
        Schema::table('recipes', function (Blueprint $table) {
            $table->dropColumn(['category', 'instructions']);
        });
    }
};
