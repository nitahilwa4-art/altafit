<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WaterLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(): Response
    {
        $user = User::query()->with([
            'meals' => fn ($query) => $query->latest('logged_at'),
            'waterLogs' => fn ($query) => $query->latest('logged_at'),
        ])->firstOrFail();

        $today = Carbon::now()->toDateString();
        $todayMeals = $user->meals->filter(fn ($meal) => optional($meal->logged_at)->toDateString() === $today);
        $todayWaterLogs = $user->waterLogs->filter(fn ($log) => optional($log->logged_at)->toDateString() === $today);

        $consumedCalories = (int) $todayMeals->sum('calories');
        $hydrationCurrentMl = (int) $todayWaterLogs->sum('amount_ml');
        $hydrationCurrent = round($hydrationCurrentMl / 1000, 1);
        $remainingCalories = max($user->daily_calorie_goal - $consumedCalories, 0);

        $consumedProtein = (int) $todayMeals->sum('protein_g');
        $consumedCarbs = (int) $todayMeals->sum('carbs_g');
        $consumedFat = (int) $todayMeals->sum('fat_g');

        $proteinRemaining = max($user->protein_goal_g - $consumedProtein, 0);
        $carbsRemaining = max($user->carbs_goal_g - $consumedCarbs, 0);
        $fatRemaining = max($user->fat_goal_g - $consumedFat, 0);

        $weekDays = collect(range(6, 0))->map(function (int $offset) {
            $date = Carbon::now()->subDays($offset);
            return [
                'date' => $date->toDateString(),
                'label' => strtoupper($date->format('D')[0]),
            ];
        });

        $caloriesByDay = $user->meals
            ->groupBy(fn ($meal) => optional($meal->logged_at)->toDateString())
            ->map(fn ($dayMeals) => (int) $dayMeals->sum('calories'));

        $weekCalories = $weekDays->map(fn (array $day) => (int) ($caloriesByDay[$day['date']] ?? 0))->values();
        $averageCalories = (int) round($weekCalories->avg() ?? 0);
        $yesterdayCalories = (int) ($weekCalories->slice(-2, 1)->first() ?? 0);
        $deltaCalories = $consumedCalories - $yesterdayCalories;
        $deltaPrefix = $deltaCalories > 0 ? '+' : '';
        $weeklyChange = $deltaCalories === 0
            ? 'No change'
            : $deltaPrefix.$deltaCalories.' kcal vs yesterday';

        $chartPoints = $weekDays->map(function (array $day) use ($caloriesByDay, $user) {
            $value = (int) ($caloriesByDay[$day['date']] ?? 0);
            $ratio = $user->daily_calorie_goal > 0 ? min($value / $user->daily_calorie_goal, 1) : 0;
            return max(10, (int) round(100 - ($ratio * 90)));
        })->values();

        $ringProgress = $user->daily_calorie_goal > 0
            ? min((int) round(($consumedCalories / $user->daily_calorie_goal) * 100), 100)
            : 0;
        $proteinPercent = $user->protein_goal_g > 0 ? min((int) round(($consumedProtein / $user->protein_goal_g) * 100), 100) : 0;
        $carbsPercent = $user->carbs_goal_g > 0 ? min((int) round(($consumedCarbs / $user->carbs_goal_g) * 100), 100) : 0;
        $fatPercent = $user->fat_goal_g > 0 ? min((int) round(($consumedFat / $user->fat_goal_g) * 100), 100) : 0;

        $chartMax = max($weekCalories->max() ?: 0, $user->daily_calorie_goal, 1000);
        $step = (int) ceil($chartMax / 3 / 100) * 100;
        $chartTop = max($step * 3, 300);
        $yAxisLabels = collect([$chartTop, (int) round($chartTop * 0.66), (int) round($chartTop * 0.33), 0])
            ->map(fn ($value) => $value >= 1000 ? rtrim(rtrim(number_format($value / 1000, 1), '0'), '.').'k' : (string) $value)
            ->all();

        $hydrationHistory = $todayWaterLogs->take(8)->map(fn ($log) => [
            'id' => $log->id,
            'amount' => $log->amount_ml,
            'time' => optional($log->logged_at)->format('H:i') ?? optional($log->created_at)->format('H:i'),
        ])->values();

        $coachingTip = $this->buildCoachingTip(
            remainingCalories: $remainingCalories,
            proteinRemaining: $proteinRemaining,
            carbsRemaining: $carbsRemaining,
            fatRemaining: $fatRemaining,
            hydrationCurrentMl: $hydrationCurrentMl,
            hydrationGoalMl: $user->hydration_goal_ml,
            mealCount: $todayMeals->count(),
        );

        return Inertia::render('Dashboard', [
            'pageMeta' => [
                'title' => 'Dashboard',
                'activeNav' => 'dashboard',
                'calorieTarget' => $user->daily_calorie_goal,
                'userInitial' => strtoupper(substr($user->name, 0, 1)),
                'theme' => $user->theme ?? 'light',
            ],
            'summary' => [
                'remainingCalories' => $remainingCalories,
                'calorieTarget' => $user->daily_calorie_goal,
                'consumedCalories' => $consumedCalories,
                'ringProgress' => $ringProgress,
                'consumedProtein' => $consumedProtein,
                'consumedCarbs' => $consumedCarbs,
                'consumedFat' => $consumedFat,
                'proteinPercent' => $proteinPercent,
                'carbsPercent' => $carbsPercent,
                'fatPercent' => $fatPercent,
                'proteinGoal' => $user->protein_goal_g,
                'carbsGoal' => $user->carbs_goal_g,
                'fatGoal' => $user->fat_goal_g,
                'hydrationCurrent' => $hydrationCurrent,
                'hydrationTarget' => round($user->hydration_goal_ml / 1000, 1),
                'hydrationPercent' => $user->hydration_goal_ml > 0 ? min((int) round(($hydrationCurrentMl / $user->hydration_goal_ml) * 100), 100) : 0,
                'weeklyWeight' => number_format((float) $user->current_weight, 1).' kg',
                'weeklyChange' => $weeklyChange,
                'averageCalories' => $averageCalories,
                'todayMealsCount' => $todayMeals->count(),
                'coachingTip' => $coachingTip,
                'currentStreak' => $user->current_streak,
                'longestStreak' => $user->longest_streak,
            ],
            'chart' => [
                'labels' => $weekDays->pluck('label')->all(),
                'points' => $chartPoints->all(),
                'yAxisLabels' => $yAxisLabels,
            ],
            'hydrationPresets' => [150, 250, 500],
            'hydrationHistory' => $hydrationHistory,
            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }

    public function addWater(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'amount_ml' => ['nullable', 'integer', 'min:50', 'max:2000'],
        ]);

        $user = User::query()->firstOrFail();
        $amount = (int) ($validated['amount_ml'] ?? 250);

        WaterLog::query()->create([
            'user_id' => $user->id,
            'amount_ml' => $amount,
            'logged_at' => now(),
        ]);

        return redirect()->route('dashboard.index')->with('success', "Hydration updated +{$amount} ml.");
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

    public function destroyWater(WaterLog $waterLog): RedirectResponse
    {
        $waterLog->delete();

        return redirect()->route('dashboard.index')->with('success', 'Hydration history item removed.');
    }

    protected function buildCoachingTip(int $remainingCalories, int $proteinRemaining, int $carbsRemaining, int $fatRemaining, int $hydrationCurrentMl, int $hydrationGoalMl, int $mealCount): string
    {
        if ($mealCount === 0) {
            return 'Start with a balanced first meal today so Altafit can learn your pattern and tailor better insights.';
        }

        if ($hydrationGoalMl > 0 && $hydrationCurrentMl < (int) round($hydrationGoalMl * 0.5)) {
            return 'Hydration is behind target. Add 250–500 ml soon to keep energy and hunger cues steadier through the day.';
        }

        if ($proteinRemaining >= 30) {
            return 'Protein is still below target. A lean, high-protein meal or snack would improve recovery and satiety.';
        }

        if ($remainingCalories <= 300) {
            return 'You are close to your calorie target. Keep the next meal light and prioritize fiber or hydration.';
        }

        if ($carbsRemaining > $proteinRemaining && $carbsRemaining > $fatRemaining) {
            return 'You still have room for quality carbs today. A whole-food carb source could support energy without overshooting fats.';
        }

        return 'Today looks reasonably balanced. Keep portions consistent and use the final meal to close the remaining macro gaps.';
    }
}
