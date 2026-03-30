<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $weightDelta = round((float) $user->current_weight - (float) $user->goal_weight, 1);

        return Inertia::render('Profile', [
            'pageMeta' => [
                'title' => 'Profile',
                'activeNav' => 'profile',
                'calorieTarget' => $user->daily_calorie_goal,
                'userInitial' => strtoupper(substr($user->name, 0, 1)),
                'theme' => $user->theme ?? 'light',
            ],
            'profile' => [
                'name' => $user->name,
                'weight' => number_format((float) $user->current_weight, 1).' kg',
                'goalWeight' => number_format((float) $user->goal_weight, 1).' kg',
                'dailyTarget' => number_format($user->daily_calorie_goal).' kcal',
                'hydrationTarget' => number_format($user->hydration_goal_ml / 1000, 1).' Liters',
                'macroTargets' => [
                    'protein' => $user->protein_goal_g.'g',
                    'carbs' => $user->carbs_goal_g.'g',
                    'fat' => $user->fat_goal_g.'g',
                ],
                'goalDelta' => ($weightDelta > 0 ? '-' : '+').number_format(abs($weightDelta), 1).' kg to target',
                'settings' => [
                    ['title' => 'Smart Reminders', 'description' => 'Meal and water alerts', 'type' => 'toggle', 'value' => $user->reminders_enabled],
                    ['title' => 'Apple Health Sync', 'description' => 'Coming soon — integration planned', 'type' => 'info'],
                    ['title' => 'Units & Measurements', 'description' => 'Metric (kg, ml) · default', 'type' => 'info'],
                ],
                'form' => [
                    'name' => $user->name,
                    'current_weight' => (string) $user->current_weight,
                    'goal_weight' => (string) $user->goal_weight,
                    'daily_calorie_goal' => (string) $user->daily_calorie_goal,
                    'protein_goal_g' => (string) $user->protein_goal_g,
                    'carbs_goal_g' => (string) $user->carbs_goal_g,
                    'fat_goal_g' => (string) $user->fat_goal_g,
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
            'protein_goal_g' => ['required', 'integer', 'min:0'],
            'carbs_goal_g' => ['required', 'integer', 'min:0'],
            'fat_goal_g' => ['required', 'integer', 'min:0'],
            'hydration_goal_ml' => ['required', 'integer', 'min:100'],
            'reminders_enabled' => ['nullable', 'boolean'],
        ]);

        /** @var User $user */
        $user = $request->user();
        
        $oldWeight = $user->current_weight;
        
        $user->update([
            ...$validated,
            'reminders_enabled' => (bool) ($validated['reminders_enabled'] ?? false),
        ]);

        if (abs((float)$oldWeight - (float)$validated['current_weight']) > 0.01) {
            $user->weightLogs()->updateOrCreate(
                ['logged_date' => now()->toDateString()],
                ['weight_kg' => $validated['current_weight']]
            );
        }

        return redirect()->route('profile.index')->with('success', 'Profile goals updated.');
    }

    public function toggleTheme(Request $request): RedirectResponse
    {
        /** @var User $user */
        $user = $request->user();
        $user->update([
            'theme' => $user->theme === 'dark' ? 'light' : 'dark',
        ]);

        return redirect()->back();
    }
}
