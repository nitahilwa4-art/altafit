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
                'description' => 'Grilled Chicken Tacos',
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
                'calories' => 310,
                'protein_g' => 12,
                'carbs_g' => 45,
                'fat_g' => 9,
                'fiber_g' => 7,
                'confidence_score' => 0.92,
                'logged_at' => $today->copy()->setTime(19, 10),
            ],
        ]);

        $user->waterLogs()->createMany([
            ['amount_ml' => 600, 'logged_at' => $today->copy()->setTime(8, 30)],
            ['amount_ml' => 600, 'logged_at' => $today->copy()->setTime(13, 15)],
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
