<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('dietary_tags', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // Vegan, Vegetarian, Gluten-Free, etc.
            $table->string('color')->default('#22c55e'); // badge color
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('dietary_tags');
    }
};
