<?php

namespace Database\Seeders;

use App\Models\Meal;
use App\Models\Milestone;
use App\Models\Plan;
use App\Models\User;
use App\Models\WaterLog;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    public function run(): void
    {
        $user = User::query()->updateOrCreate(
            ['email' => 'elena@altafit.local'],
            [
                'name' => 'Elena Vance',
                'password' => 'password',
                'current_weight' => 64.2,
                'goal_weight' => 62.0,
                'daily_calorie_goal' => 2400,
                'protein_goal_g' => 120,
                'carbs_goal_g' => 240,
                'fat_goal_g' => 65,
                'hydration_goal_ml' => 2500,
                'reminders_enabled' => true,
            ]
        );

        Meal::query()->where('user_id', $user->id)->delete();
        WaterLog::query()->where('user_id', $user->id)->delete();
        Plan::query()->where('user_id', $user->id)->delete();

        $today = Carbon::now();

        $user->meals()->createMany([
            [
                'description' => 'Greek Yogurt Bowl',
                'meal_type' => 'Breakfast',
                'notes' => 'Blueberries and almonds',
                'calories' => 320,
                'protein_g' => 22,
                'carbs_g' => 28,
                'fat_g' => 10,
                'fiber_g' => 5,
                'confidence_score' => 0.94,
                'logged_at' => $today->copy()->setTime(8, 10),
            ],
            [
                'description' => 'Grilled Chicken Tacos',
                'meal_type' => 'Lunch',
                'notes' => '2 tacos + guacamole',
                'calories' => 540,
                'protein_g' => 32,
                'carbs_g' => 24,
                'fat_g' => 18,
                'fiber_g' => 6,
                'confidence_score' => 0.95,
                'logged_at' => $today->copy()->setTime(12, 45),
            ],
            [
                'description' => 'Quinoa Bowl',
                'meal_type' => 'Dinner',
                'notes' => 'Roasted vegetables',
                'calories' => 310,
                'protein_g' => 12,
                'carbs_g' => 45,
                'fat_g' => 9,
                'fiber_g' => 7,
                'confidence_score' => 0.92,
                'logged_at' => $today->copy()->setTime(19, 10),
            ],
            [
                'description' => 'Salmon Rice Bowl',
                'meal_type' => 'Dinner',
                'notes' => 'Yesterday dinner',
                'calories' => 610,
                'protein_g' => 36,
                'carbs_g' => 48,
                'fat_g' => 22,
                'fiber_g' => 4,
                'confidence_score' => 0.91,
                'logged_at' => $today->copy()->subDay()->setTime(18, 50),
            ],
            [
                'description' => 'Egg Toast',
                'meal_type' => 'Breakfast',
                'notes' => '2 eggs and sourdough',
                'calories' => 290,
                'protein_g' => 16,
                'carbs_g' => 22,
                'fat_g' => 14,
                'fiber_g' => 3,
                'confidence_score' => 0.89,
                'logged_at' => $today->copy()->subDays(2)->setTime(7, 40),
            ],
        ]);

        $user->waterLogs()->createMany([
            ['amount_ml' => 600, 'logged_at' => $today->copy()->setTime(8, 30)],
            ['amount_ml' => 600, 'logged_at' => $today->copy()->setTime(13, 15)],
            ['amount_ml' => 300, 'logged_at' => $today->copy()->setTime(17, 45)],
            ['amount_ml' => 500, 'logged_at' => $today->copy()->subDay()->setTime(9, 15)],
        ]);

        $plan = Plan::query()->create([
            'user_id' => $user->id,
            'title' => 'Weight Loss',
            'subtitle' => 'Focused Caloric Deficit',
            'goal_unit' => 'kg',
            'goal_target' => 62.0,
            'goal_remaining' => 2.0,
            'progress_percent' => 75,
            'tip' => 'Swap your afternoon granola bar for a handful of raw walnuts. The omega-3s help regulate cortisol levels during your peak stress hours.',
            'is_active' => true,
        ]);

        Plan::query()->create([
            'user_id' => $user->id,
            'title' => 'Lean Muscle',
            'subtitle' => 'High Protein Recomp',
            'goal_unit' => 'kg',
            'goal_target' => 66.0,
            'goal_remaining' => 1.8,
            'progress_percent' => 42,
            'tip' => 'Prioritize 25-35g protein in your first meal to make the rest of the day easier.',
            'is_active' => false,
        ]);

        foreach ([
            ['Mon', true],
            ['Tue', true],
            ['Wed', false],
            ['Thu', true],
            ['Fri', false],
            ['Sat', false],
            ['Sun', false],
        ] as $index => [$label, $done]) {
            Milestone::query()->create([
                'plan_id' => $plan->id,
                'label' => $label,
                'sort_order' => $index + 1,
                'is_completed' => $done,
            ]);
        }
    }
}
