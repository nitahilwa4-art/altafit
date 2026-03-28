<?php

namespace App\Http\Controllers;

use App\Models\Meal;
use App\Models\Milestone;
use App\Models\Plan;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class PlansController extends Controller
{
    public function __invoke(): Response
    {
        $user = User::query()->with(['plans.milestones', 'meals', 'waterLogs'])->firstOrFail();
        $plans = $user->plans()->with('milestones')->latest('is_active')->latest('updated_at')->get();
        $plan = $plans->firstWhere('is_active', true) ?? $plans->firstOrFail();
        $recommendedMeals = Meal::query()->where('user_id', $user->id)->latest('logged_at')->take(3)->get();

        $today = Carbon::now()->toDateString();
        $todayMeals = $user->meals->filter(fn ($meal) => optional($meal->logged_at)->toDateString() === $today);
        $todayWater = (int) $user->waterLogs->filter(fn ($log) => optional($log->logged_at)->toDateString() === $today)->sum('amount_ml');

        $milestones = $plan->milestones;
        $completedMilestones = $milestones->where('is_completed', true)->count();
        $milestonePercent = $milestones->count() > 0 ? (int) round(($completedMilestones / $milestones->count()) * 100) : 0;
        $hydrationPercent = $user->hydration_goal_ml > 0 ? min((int) round(($todayWater / $user->hydration_goal_ml) * 100), 100) : 0;
        $mealConsistency = min($todayMeals->count() * 25, 100);
        $smartProgress = (int) round(($milestonePercent * 0.5) + ($hydrationPercent * 0.2) + ($mealConsistency * 0.3));

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
                'progress' => $item->progress_percent,
                'remaining' => rtrim(rtrim(number_format((float) $item->goal_remaining, 2), '0'), '.').$item->goal_unit,
                'is_active' => $item->is_active,
            ])->values(),
            'plan' => [
                'id' => $plan->id,
                'title' => $plan->title,
                'subtitle' => $plan->subtitle,
                'remaining' => rtrim(rtrim(number_format((float) $plan->goal_remaining, 2), '0'), '.').$plan->goal_unit,
                'progress' => $plan->progress_percent,
                'smartProgress' => $smartProgress,
                'tip' => $plan->tip,
                'goalUnit' => $plan->goal_unit,
                'insights' => [
                    'milestones' => $completedMilestones.'/'.$milestones->count().' milestones done',
                    'meals' => $todayMeals->count().' meals logged today',
                    'hydration' => $hydrationPercent.'% hydration target reached',
                ],
                'form' => [
                    'title' => $plan->title,
                    'subtitle' => $plan->subtitle ?? '',
                    'goal_target' => $plan->goal_target !== null ? (string) $plan->goal_target : '',
                    'goal_remaining' => $plan->goal_remaining !== null ? (string) $plan->goal_remaining : '',
                    'progress_percent' => (string) $plan->progress_percent,
                    'tip' => $plan->tip ?? '',
                ],
                'newMilestone' => [
                    'label' => '',
                ],
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
                'goal_remaining' => '',
                'progress_percent' => '0',
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
            'goal_remaining' => ['nullable', 'numeric', 'min:0'],
            'progress_percent' => ['required', 'integer', 'between:0,100'],
            'tip' => ['nullable', 'string', 'max:1000'],
        ]);

        $user = User::query()->firstOrFail();

        $plan = $user->plans()->create([
            ...$validated,
            'is_active' => false,
        ]);

        return redirect()->route('plans.index')->with('success', "Plan {$plan->title} created.");
    }

    public function update(Request $request, Plan $plan): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => ['nullable', 'string', 'max:255'],
            'goal_target' => ['nullable', 'numeric', 'min:0'],
            'goal_remaining' => ['nullable', 'numeric', 'min:0'],
            'progress_percent' => ['required', 'integer', 'between:0,100'],
            'tip' => ['nullable', 'string', 'max:1000'],
        ]);

        $plan->update($validated);

        return redirect()->route('plans.index')->with('success', 'Active plan updated.');
    }

    public function activate(Plan $plan): RedirectResponse
    {
        Plan::query()->where('user_id', $plan->user_id)->update(['is_active' => false]);
        $plan->update(['is_active' => true]);

        return redirect()->route('plans.index')->with('success', 'Active plan switched.');
    }

    public function storeMilestone(Request $request, Plan $plan): RedirectResponse
    {
        $validated = $request->validate([
            'label' => ['required', 'string', 'max:100'],
        ]);

        $nextOrder = ((int) $plan->milestones()->max('sort_order')) + 1;

        $plan->milestones()->create([
            'label' => $validated['label'],
            'sort_order' => $nextOrder,
            'is_completed' => false,
        ]);

        return redirect()->route('plans.index')->with('success', 'Milestone added.');
    }

    public function toggleMilestone(Milestone $milestone): RedirectResponse
    {
        $milestone->update([
            'is_completed' => ! $milestone->is_completed,
        ]);

        return redirect()->route('plans.index')->with('success', 'Milestone status updated.');
    }

    public function destroyMilestone(Milestone $milestone): RedirectResponse
    {
        $milestone->delete();

        return redirect()->route('plans.index')->with('success', 'Milestone removed.');
    }

    public function destroy(Plan $plan): RedirectResponse
    {
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
