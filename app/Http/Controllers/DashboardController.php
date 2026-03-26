<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WaterLog;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $user = User::query()->with(['meals' => fn ($query) => $query->latest('logged_at'), 'waterLogs' => fn ($query) => $query->latest('logged_at')])->firstOrFail();

        $consumedCalories = (int) $user->meals->sum('calories');
        $hydrationCurrent = round($user->waterLogs->sum('amount_ml') / 1000, 1);
        $remainingCalories = max($user->daily_calorie_goal - $consumedCalories, 0);

        return Inertia::render('Dashboard', [
            'pageMeta' => [
                'title' => 'Dashboard',
                'activeNav' => 'dashboard',
                'calorieTarget' => $user->daily_calorie_goal,
            ],
            'summary' => [
                'remainingCalories' => $remainingCalories,
                'calorieTarget' => $user->daily_calorie_goal,
                'consumedCalories' => $consumedCalories,
                'protein' => $user->protein_goal_g,
                'carbs' => $user->carbs_goal_g,
                'fat' => $user->fat_goal_g,
                'hydrationCurrent' => $hydrationCurrent,
                'hydrationTarget' => round($user->hydration_goal_ml / 1000, 1),
                'weeklyWeight' => number_format((float) $user->current_weight, 1).' kg',
                'weeklyChange' => '-4% kcal',
            ],
            'chart' => [
                'labels' => ['M', 'T', 'W', 'T', 'F', 'S', 'S'],
                'points' => [75, 85, 95, 60, 80, 40, 38],
            ],
            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }

    public function addWater(): RedirectResponse
    {
        $user = User::query()->firstOrFail();

        WaterLog::query()->create([
            'user_id' => $user->id,
            'amount_ml' => 250,
            'logged_at' => now(),
        ]);

        return redirect()->route('dashboard.index')->with('success', 'Hydration updated +250 ml.');
    }

    public function removeWater(): RedirectResponse
    {
        $user = User::query()->firstOrFail();
        $latest = WaterLog::query()->where('user_id', $user->id)->latest('logged_at')->latest('id')->first();

        if ($latest) {
            $latest->delete();
        }

        return redirect()->route('dashboard.index')->with('success', 'Latest hydration entry removed.');
    }
}
