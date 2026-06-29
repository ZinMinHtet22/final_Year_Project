<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recipes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->string('cuisine');
            $table->enum('difficulty', ['Easy', 'Medium', 'Hard'])->default('Easy');
            $table->integer('cook_time'); // in minutes
            $table->integer('servings')->default(1);
            $table->decimal('cost_per_serving', 8, 2);
            $table->string('image_url')->nullable();
            $table->boolean('is_student_pick')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recipes');
    }
};
