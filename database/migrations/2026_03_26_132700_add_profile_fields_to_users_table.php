<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('profile_photo_path')->nullable()->after('password');
            $table->decimal('current_weight', 5, 2)->nullable()->after('profile_photo_path');
            $table->decimal('goal_weight', 5, 2)->nullable()->after('current_weight');
            $table->unsignedInteger('daily_calorie_goal')->default(2400)->after('goal_weight');
            $table->unsignedInteger('protein_goal_g')->default(120)->after('daily_calorie_goal');
            $table->unsignedInteger('carbs_goal_g')->default(240)->after('protein_goal_g');
            $table->unsignedInteger('fat_goal_g')->default(65)->after('carbs_goal_g');
            $table->unsignedInteger('hydration_goal_ml')->default(2500)->after('fat_goal_g');
            $table->boolean('reminders_enabled')->default(true)->after('hydration_goal_ml');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'profile_photo_path',
                'current_weight',
                'goal_weight',
                'daily_calorie_goal',
                'protein_goal_g',
                'carbs_goal_g',
                'fat_goal_g',
                'hydration_goal_ml',
                'reminders_enabled',
            ]);
        });
    }
};
