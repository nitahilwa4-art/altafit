<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __invoke(): Response
    {
        $user = User::query()->firstOrFail();

        return Inertia::render('Profile', [
            'pageMeta' => [
                'title' => 'Profile',
                'activeNav' => 'profile',
                'calorieTarget' => $user->daily_calorie_goal,
            ],
            'profile' => [
                'name' => $user->name,
                'weight' => number_format((float) $user->current_weight, 1).' kg',
                'goalWeight' => number_format((float) $user->goal_weight, 1).' kg',
                'dailyTarget' => number_format($user->daily_calorie_goal).' kcal',
                'hydrationTarget' => number_format($user->hydration_goal_ml / 1000, 1).' Liters',
                'settings' => [
                    ['title' => 'Smart Reminders', 'description' => 'Meal and water alerts', 'type' => 'toggle', 'value' => $user->reminders_enabled],
                    ['title' => 'Apple Health Sync', 'description' => 'Last synced 2m ago', 'type' => 'link'],
                    ['title' => 'Units & Measurements', 'description' => 'Metric (kg, ml)', 'type' => 'link'],
                ],
                'form' => [
                    'name' => $user->name,
                    'current_weight' => (string) $user->current_weight,
                    'goal_weight' => (string) $user->goal_weight,
                    'daily_calorie_goal' => (string) $user->daily_calorie_goal,
                    'hydration_goal_ml' => (string) $user->hydration_goal_ml,
                    'reminders_enabled' => $user->reminders_enabled,
                ],
            ],
            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'current_weight' => ['required', 'numeric', 'min:1'],
            'goal_weight' => ['required', 'numeric', 'min:1'],
            'daily_calorie_goal' => ['required', 'integer', 'min:100'],
            'hydration_goal_ml' => ['required', 'integer', 'min:100'],
            'reminders_enabled' => ['nullable', 'boolean'],
        ]);

        $user = User::query()->firstOrFail();
        $user->update([
            ...$validated,
            'reminders_enabled' => (bool) ($validated['reminders_enabled'] ?? false),
        ]);

        return redirect()->route('profile.index')->with('success', 'Profile goals updated.');
    }
}
