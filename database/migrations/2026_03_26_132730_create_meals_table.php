<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('meals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('description');
            $table->string('image_path')->nullable();
            $table->unsignedInteger('calories');
            $table->unsignedInteger('protein_g')->default(0);
            $table->unsignedInteger('carbs_g')->default(0);
            $table->unsignedInteger('fat_g')->default(0);
            $table->unsignedInteger('fiber_g')->default(0);
            $table->decimal('confidence_score', 4, 2)->nullable();
            $table->timestamp('logged_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('meals');
    }
};
