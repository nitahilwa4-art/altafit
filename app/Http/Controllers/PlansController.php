<?php

namespace App\Http\Controllers;

use App\Models\Meal;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class PlansController extends Controller
{
    public function __invoke(): Response
    {
        $user = User::query()->with(['plans.milestones'])->firstOrFail();
        $plan = $user->plans->firstOrFail();
        $recommendedMeals = Meal::query()->where('user_id', $user->id)->latest('logged_at')->take(2)->get();

        return Inertia::render('Plans', [
            'pageMeta' => [
                'title' => 'Plans',
                'activeNav' => 'plans',
                'calorieTarget' => $user->daily_calorie_goal,
            ],
            'plan' => [
                'title' => $plan->title,
                'subtitle' => $plan->subtitle,
                'remaining' => rtrim(rtrim(number_format((float) $plan->goal_remaining, 2), '0'), '.').$plan->goal_unit,
                'progress' => $plan->progress_percent,
                'tip' => $plan->tip,
                'meals' => $recommendedMeals->map(fn (Meal $meal) => [
                    'name' => $meal->description,
                    'calories' => $meal->calories,
                    'protein' => $meal->protein_g.'g',
                    'extra' => $meal->carbs_g > 0 ? $meal->carbs_g.'g Carbs' : $meal->fat_g.'g Fat',
                ])->values(),
                'milestones' => $plan->milestones->map(fn ($milestone) => [
                    'day' => $milestone->label,
                    'done' => $milestone->is_completed,
                ])->values(),
            ],
        ]);
    }
}
