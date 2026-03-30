<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Services\CalorieCalculator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $user = $request->user();
        $calc = new CalorieCalculator();
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
                    ['title' => 'Age', 'description' => $user->age ? $user->age.' years old' : 'Not set', 'type' => 'info'],
                    ['title' => 'Height', 'description' => $user->height_cm ? $user->height_cm.' cm' : 'Not set', 'type' => 'info'],
                    ['title' => 'Gender', 'description' => $this->genderLabel($user->gender), 'type' => 'info'],
                ],
                'form' => [
                    'name' => $user->name,
                    'age' => (string) ($user->age ?? ''),
                    'height_cm' => (string) ($user->height_cm ?? ''),
                    'gender' => $user->gender ?? '',
                    'current_weight' => (string) $user->current_weight,
                    'goal_weight' => (string) $user->goal_weight,
                    'daily_calorie_goal' => (string) $user->daily_calorie_goal,
                    'protein_goal_g' => (string) $user->protein_goal_g,
                    'carbs_goal_g' => (string) $user->carbs_goal_g,
                    'fat_goal_g' => (string) $user->fat_goal_g,
                    'hydration_goal_ml' => (string) $user->hydration_goal_ml,
                    'reminders_enabled' => $user->reminders_enabled,
                    'activity_level' => $user->activity_level ?? 'light',
                    'weight_goal' => $user->weight_goal ?? 'maintain',
                    'dietary_restrictions' => $user->dietary_restrictions ?? [],
                    'food_preferences' => $user->food_preferences ?? [],
                ],
                'activityOptions' => $calc->getActivityOptions(),
                'goalOptions' => $calc->getGoalOptions(),
                'dietaryOptions' => $calc->getDietaryOptions(),
                'cuisineOptions' => $calc->getCuisineOptions(),
                'canAutoCalculate' => $calc->canCalculate($user),
                'computedTargets' => $calc->canCalculate($user) ? $calc->calculate($user) : null,
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
            'age' => ['nullable', 'integer', 'min:10', 'max:120'],
            'height_cm' => ['nullable', 'integer', 'min:80', 'max:300'],
            'gender' => ['nullable', 'string', 'in:male,female,other,prefer_not'],
            'current_weight' => ['required', 'numeric', 'min:1'],
            'goal_weight' => ['required', 'numeric', 'min:1'],
            'daily_calorie_goal' => ['required', 'integer', 'min:100'],
            'protein_goal_g' => ['required', 'integer', 'min:0'],
            'carbs_goal_g' => ['required', 'integer', 'min:0'],
            'fat_goal_g' => ['required', 'integer', 'min:0'],
            'hydration_goal_ml' => ['required', 'integer', 'min:100'],
            'reminders_enabled' => ['nullable', 'boolean'],
            'activity_level' => ['nullable', 'string', 'in:sedentary,light,moderate,very_active,extra_active'],
            'weight_goal' => ['nullable', 'string', 'in:lose,maintain,gain'],
            'dietary_restrictions' => ['nullable', 'array'],
            'dietary_restrictions.*' => ['string'],
            'food_preferences' => ['nullable', 'array'],
            'food_preferences.*' => ['string', 'max:100'],
        ]);

        /** @var User $user */
        $user = $request->user();
        $oldWeight = $user->current_weight;

        $user->update([
            'name' => $validated['name'],
            'age' => $validated['age'] ?? null,
            'height_cm' => $validated['height_cm'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'current_weight' => $validated['current_weight'],
            'goal_weight' => $validated['goal_weight'],
            'daily_calorie_goal' => $validated['daily_calorie_goal'],
            'protein_goal_g' => $validated['protein_goal_g'],
            'carbs_goal_g' => $validated['carbs_goal_g'],
            'fat_goal_g' => $validated['fat_goal_g'],
            'hydration_goal_ml' => $validated['hydration_goal_ml'],
            'reminders_enabled' => (bool) ($validated['reminders_enabled'] ?? false),
            'activity_level' => $validated['activity_level'] ?? null,
            'weight_goal' => $validated['weight_goal'] ?? null,
            'dietary_restrictions' => $validated['dietary_restrictions'] ?? null,
            'food_preferences' => $validated['food_preferences'] ?? null,
        ]);

        if (abs((float) $oldWeight - (float) $validated['current_weight']) > 0.01) {
            $user->weightLogs()->updateOrCreate(
                ['logged_date' => now()->toDateString()],
                ['weight_kg' => $validated['current_weight']]
            );
        }

        return redirect()->route('profile.index')->with('success', 'Profile updated successfully.');
    }

    public function recalculate(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'activity_level' => ['required', 'string', 'in:sedentary,light,moderate,very_active,extra_active'],
            'weight_goal' => ['required', 'string', 'in:lose,maintain,gain'],
        ]);

        /** @var User $user */
        $user = $request->user();
        $calc = new CalorieCalculator();

        $user->update([
            'activity_level' => $validated['activity_level'],
            'weight_goal' => $validated['weight_goal'],
        ]);

        if ($calc->canCalculate($user)) {
            $targets = $calc->calculate($user);
            $user->update([
                'daily_calorie_goal' => $targets['calories'],
                'protein_goal_g' => $targets['protein_g'],
                'carbs_goal_g' => $targets['carbs_g'],
                'fat_goal_g' => $targets['fat_g'],
            ]);
            return redirect()->route('profile.index')->with('success', "Targets recalculated: {$targets['calories']} kcal/day.");
        }

        return redirect()->route('profile.index')->with('success', 'Activity and goal updated. Fill in age, height, and gender to enable auto-calculation.');
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

    protected function genderLabel(?string $gender): string
    {
        return match ($gender) {
            'male' => 'Male',
            'female' => 'Female',
            'other' => 'Other',
            'prefer_not' => 'Prefer not to say',
            default => 'Not set',
        };
    }
}
