<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->enum('activity_level', ['sedentary', 'light', 'moderate', 'very_active', 'extra_active'])->nullable()->after('gender');
            $table->enum('weight_goal', ['lose', 'maintain', 'gain'])->nullable()->after('activity_level');
            $table->json('dietary_restrictions')->nullable()->after('weight_goal');
            $table->json('food_preferences')->nullable()->after('dietary_restrictions');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['activity_level', 'weight_goal', 'dietary_restrictions', 'food_preferences']);
        });
    }
};
