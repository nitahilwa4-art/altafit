<?php

namespace App\Http\Controllers;

use App\Models\Meal;
use App\Models\Milestone;
use App\Models\Plan;
use App\Models\User;
use App\Services\PlanEstimator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class PlansController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user()->load([
            'plans' => fn ($query) => $query->with('milestones'),
            'meals',
            'waterLogs',
            'weightLogs' => fn ($query) => $query->orderBy('logged_date', 'desc')->take(30),
        ]);

        $plans = $user->plans()->with('milestones')->latest('is_active')->latest('updated_at')->get();
        $plan = $plans->firstWhere('is_active', true) ?? $plans->firstOrFail();
        $recommendedMeals = Meal::query()->where('user_id', $user->id)->latest('logged_at')->take(3)->get();

        $today = Carbon::now()->toDateString();
        $todayMeals = $user->meals->filter(fn ($meal) => optional($meal->logged_at)->toDateString() === $today);
        $todayWater = (int) $user->waterLogs->filter(fn ($log) => optional($log->logged_at)->toDateString() === $today)->sum('amount_ml');

        // ── Weight-based remaining & progress ──
        $direction = $plan->direction((float) $user->current_weight);
        $computedRemaining = $plan->computedRemaining((float) $user->current_weight);
        $computedProgress = $plan->computedProgress((float) $user->current_weight);

        // Use stored values if computed not available, else use computed
        $displayRemaining = $computedRemaining !== null
            ? rtrim(rtrim(number_format($computedRemaining, 1), '0'), '.').$plan->goal_unit
            : rtrim(rtrim(number_format((float) $plan->goal_remaining, 1), '0'), '.').$plan->goal_unit;
        $displayProgress = $computedProgress !== null ? (int) $computedProgress : $plan->progress_percent;

        // ── Estimation ──
        $weightHistory = $user->weightLogs->map(fn ($log) => [
            'date' => $log->logged_date,
            'weight_kg' => (float) $log->weight_kg,
        ])->toArray();

        $estimator = new PlanEstimator();
        $estimation = $estimator->estimateCompletion(
            $weightHistory,
            (float) $plan->goal_target,
            (float) $user->current_weight,
            (int) $plan->weekly_rate
        );

        // ── Daily score ──
        $milestones = $plan->milestones;
        $completedMilestones = $milestones->where('is_completed', true)->count();
        $milestonePercent = $milestones->count() > 0 ? (int) round(($completedMilestones / $milestones->count()) * 100) : 0;
        $hydrationPercent = $user->hydration_goal_ml > 0 ? min((int) round(($todayWater / $user->hydration_goal_ml) * 100), 100) : 0;
        $mealConsistency = min($todayMeals->count() * 25, 100);
        $dailyScore = (int) round(($milestonePercent * 0.5) + ($hydrationPercent * 0.2) + ($mealConsistency * 0.3));

        // ── Smart tip ──
        $tip = $estimator->generateTip(
            (float) $user->current_weight,
            (float) $plan->goal_target,
            (float) $todayMeals->sum('calories'),
            (float) $user->daily_calorie_goal,
            $todayMeals->count(),
            $hydrationPercent
        );

        return Inertia::render('Plans', [
            'pageMeta' => [
                'title' => 'Plans',
                'activeNav' => 'plans',
                'calorieTarget' => $user->daily_calorie_goal,
                'userInitial' => strtoupper(substr($user->name, 0, 1)),
                'theme' => $user->theme ?? 'light',
            ],
            'plansList' => $plans->map(fn (Plan $item) => [
                'id' => $item->id,
                'title' => $item->title,
                'subtitle' => $item->subtitle,
                'progress' => $item->computedProgress((float) $user->current_weight) ?? $item->progress_percent,
                'remaining' => rtrim(rtrim(number_format((float) ($item->computedRemaining((float) $user->current_weight) ?? $item->goal_remaining), 1), '0'), '.').$item->goal_unit,
                'direction' => $item->direction((float) $user->current_weight),
                'is_active' => $item->is_active,
            ])->values(),
            'plan' => [
                'id' => $plan->id,
                'title' => $plan->title,
                'subtitle' => $plan->subtitle,
                'remaining' => $displayRemaining,
                'goalTarget' => $plan->goal_target !== null
                    ? rtrim(rtrim(number_format((float) $plan->goal_target, 1), '0'), '.').$plan->goal_unit
                    : null,
                'progress' => $displayProgress,
                'dailyScore' => $dailyScore,
                'direction' => $direction,
                'goalUnit' => $plan->goal_unit,
                'targetDate' => $plan->target_date?->toDateString(),
                'estimation' => $estimation,
                'tip' => $tip,
                'todayMacros' => [
                    'calories' => $todayMeals->sum('calories'),
                    'protein' => $todayMeals->sum('protein_g'),
                    'carbs' => $todayMeals->sum('carbs_g'),
                    'fat' => $todayMeals->sum('fat_g'),
                    'calorieTarget' => $user->daily_calorie_goal,
                    'mealCount' => $todayMeals->count(),
                ],
                'insights' => [
                    ['label' => 'Milestones', 'value' => $completedMilestones, 'total' => $milestones->count(), 'icon' => 'flag', 'color' => 'primary'],
                    ['label' => 'Meals Today', 'value' => $todayMeals->count(), 'total' => null, 'icon' => 'restaurant', 'color' => 'secondary'],
                    ['label' => 'Hydration', 'value' => $hydrationPercent, 'total' => 100, 'icon' => 'water_drop', 'color' => 'tertiary'],
                ],
                'form' => [
                    'title' => $plan->title,
                    'subtitle' => $plan->subtitle ?? '',
                    'goal_target' => $plan->goal_target !== null ? (string) $plan->goal_target : '',
                    'target_date' => $plan->target_date?->toDateString() ?? '',
                    'weekly_rate' => $plan->weekly_rate !== null ? (string) $plan->weekly_rate : '',
                    'tip' => $plan->tip ?? '',
                ],
                'newMilestone' => ['label' => ''],
                'meals' => $recommendedMeals->map(fn (Meal $meal) => [
                    'name' => $meal->description,
                    'calories' => $meal->calories,
                    'protein' => $meal->protein_g.'g',
                    'extra' => $meal->carbs_g > 0 ? $meal->carbs_g.'g Carbs' : $meal->fat_g.'g Fat',
                ])->values(),
                'milestones' => $milestones->map(fn (Milestone $milestone) => [
                    'id' => $milestone->id,
                    'day' => $milestone->label,
                    'done' => $milestone->is_completed,
                ])->values(),
            ],
            'newPlanForm' => [
                'title' => '',
                'subtitle' => '',
                'goal_unit' => 'kg',
                'goal_target' => '',
                'target_date' => '',
                'weekly_rate' => '',
                'tip' => '',
            ],
            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'goal_unit' => ['required', 'string', 'max:20'],
            'goal_target' => ['nullable', 'numeric', 'min:0'],
            'target_date' => ['nullable', 'date', 'after_or_equal:today'],
            'weekly_rate' => ['nullable', 'numeric', 'min:0.1', 'max:5'],
            'tip' => ['nullable', 'string', 'max:1000'],
        ]);

        $user = $request->user();

        $plan = $user->plans()->create([
            'title' => $validated['title'],
            'subtitle' => $validated['subtitle'] ?? null,
            'goal_unit' => $validated['goal_unit'],
            'goal_target' => $validated['goal_target'] ?? null,
            'goal_remaining' => $validated['goal_target'] && $user->current_weight
                ? round(abs((float) $user->current_weight - (float) $validated['goal_target']), 1)
                : null,
            'progress_percent' => 0,
            'tip' => $validated['tip'] ?? null,
            'target_date' => $validated['target_date'] ?? null,
            'weekly_rate' => $validated['weekly_rate'] ?? null,
            'is_active' => false,
        ]);

        return redirect()->route('plans.index')->with('success', "Plan '{$plan->title}' created.");
    }

    public function update(Request $request, Plan $plan): RedirectResponse
    {
        abort_if($plan->user_id !== $request->user()->id, 403);
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'goal_target' => ['nullable', 'numeric', 'min:0'],
            'target_date' => ['nullable', 'date', 'after_or_equal:today'],
            'weekly_rate' => ['nullable', 'numeric', 'min:0.1', 'max:5'],
            'tip' => ['nullable', 'string', 'max:1000'],
        ]);

        /** @var User $user */
        $user = $request->user();

        // Auto-calculate remaining from current weight
        $goalTarget = $validated['goal_target'] ?? $plan->goal_target;
        $goalRemaining = null;
        if ($goalTarget && $user->current_weight) {
            $goalRemaining = round(abs((float) $user->current_weight - (float) $goalTarget), 1);
        }

        $plan->update([
            'title' => $validated['title'],
            'subtitle' => $validated['subtitle'] ?? null,
            'goal_target' => $goalTarget,
            'goal_remaining' => $goalRemaining,
            'tip' => $validated['tip'] ?? null,
            'target_date' => $validated['target_date'] ?? null,
            'weekly_rate' => $validated['weekly_rate'] ?? null,
        ]);

        // Recalculate estimated date
        $estimator = new PlanEstimator();
        $estimation = $estimator->estimateCompletion(
            $user->weightLogs()->orderBy('logged_date', 'desc')->take(30)->get()
                ->map(fn ($log) => ['date' => $log->logged_date, 'weight_kg' => (float) $log->weight_kg])->toArray(),
            (float) ($goalTarget ?? $plan->goal_target),
            (float) $user->current_weight,
            (int) ($validated['weekly_rate'] ?? $plan->weekly_rate)
        );

        $plan->update(['estimated_date' => $estimation['estimated_date']]);

        return redirect()->route('plans.index')->with('success', 'Plan updated.');
    }

    public function activate(Request $request, Plan $plan): RedirectResponse
    {
        abort_if($plan->user_id !== $request->user()->id, 403);
        Plan::query()->where('user_id', $plan->user_id)->update(['is_active' => false]);
        $plan->update(['is_active' => true]);

        return redirect()->route('plans.index')->with('success', 'Active plan switched.');
    }

    public function generateMilestones(Request $request, Plan $plan): RedirectResponse
    {
        abort_if($plan->user_id !== $request->user()->id, 403);
        $validated = $request->validate([
            'weeks' => ['nullable', 'integer', 'min:1', 'max:52'],
        ]);

        /** @var User $user */
        $user = $request->user();
        $weeks = $validated['weeks'] ?? 8;

        $estimator = new PlanEstimator();
        $milestones = $estimator->generateMilestones(
            (float) $user->current_weight,
            (float) ($plan->goal_target ?? $user->current_weight),
            $weeks
        );

        foreach ($milestones as $milestone) {
            $plan->milestones()->create($milestone);
        }

        return redirect()->route('plans.index')->with('success', "{$weeks} milestones generated by AI.");
    }

    public function storeMilestone(Request $request, Plan $plan)
    {
        abort_if($plan->user_id !== $request->user()->id, 403);
        $validated = $request->validate([
            'label' => ['required', 'string', 'max:100'],
        ]);

        $nextOrder = ((int) $plan->milestones()->max('sort_order')) + 1;

        $milestone = $plan->milestones()->create([
            'label' => $validated['label'],
            'sort_order' => $nextOrder,
            'is_completed' => false,
        ]);

        return response()->json(['success' => true, 'milestone' => [
            'id' => $milestone->id,
            'day' => $milestone->label,
            'done' => false,
        ]]);
    }

    public function toggleMilestone(Request $request, Milestone $milestone)
    {
        abort_if($milestone->plan->user_id !== $request->user()->id, 403);
        $milestone->update(['is_completed' => ! $milestone->is_completed]);
        return response()->json(['success' => true, 'is_completed' => $milestone->is_completed]);
    }

    public function destroyMilestone(Request $request, Milestone $milestone)
    {
        abort_if($milestone->plan->user_id !== $request->user()->id, 403);
        $milestone->delete();
        return response()->json(['success' => true]);
    }

    public function destroy(Request $request, Plan $plan): RedirectResponse
    {
        abort_if($plan->user_id !== $request->user()->id, 403);
        $wasActive = $plan->is_active;
        $userId = $plan->user_id;

        $plan->milestones()->delete();
        $plan->delete();

        if ($wasActive) {
            $nextPlan = Plan::query()->where('user_id', $userId)->latest('updated_at')->first();
            $nextPlan?->update(['is_active' => true]);
        }

        return redirect()->route('plans.index')->with('success', 'Plan deleted.');
    }
}
