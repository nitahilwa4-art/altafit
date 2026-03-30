<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\CalorieCalculator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function create(): Response
    {
        $calc = new CalorieCalculator();
        return Inertia::render('Auth/Register', [
            'activityOptions' => $calc->getActivityOptions(),
            'goalOptions' => $calc->getGoalOptions(),
            'dietaryOptions' => $calc->getDietaryOptions(),
            'cuisineOptions' => $calc->getCuisineOptions(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'confirmed', 'min:8'],
            'age' => ['nullable', 'integer', 'min:10', 'max:120'],
            'height_cm' => ['nullable', 'integer', 'min:80', 'max:300'],
            'gender' => ['nullable', 'string', 'in:male,female,other,prefer_not'],
            'activity_level' => ['nullable', 'string', 'in:sedentary,light,moderate,very_active,extra_active'],
            'weight_goal' => ['nullable', 'string', 'in:lose,maintain,gain'],
            'current_weight' => ['nullable', 'numeric', 'min:20', 'max:500'],
            'goal_weight' => ['nullable', 'numeric', 'min:20', 'max:500'],
            'hydration_goal_ml' => ['nullable', 'integer', 'min:100', 'max:10000'],
            'dietary_restrictions' => ['nullable', 'array'],
            'food_preferences' => ['nullable', 'array'],
        ]);

        $activity = $validated['activity_level'] ?? 'light';
        $goal = $validated['weight_goal'] ?? 'maintain';

        // Build a temporary user object to pass to calculator
        $tmpUser = new User([
            'current_weight' => $validated['current_weight'] ?? 70,
            'age' => $validated['age'] ?? null,
            'height_cm' => $validated['height_cm'] ?? null,
            'gender' => $validated['gender'] ?? 'prefer_not',
            'activity_level' => $activity,
            'weight_goal' => $goal,
        ]);

        $calc = new CalorieCalculator();
        $canCalc = $validated['current_weight']
            && $validated['age']
            && $validated['height_cm']
            && $validated['gender'];

        $targets = $canCalc ? $calc->calculate($tmpUser) : [
            'calories' => 2000,
            'protein_g' => 100,
            'carbs_g' => 200,
            'fat_g' => 60,
        ];

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'age' => $validated['age'] ?? null,
            'height_cm' => $validated['height_cm'] ?? null,
            'gender' => $validated['gender'] ?? null,
            'activity_level' => $activity,
            'weight_goal' => $goal,
            'current_weight' => $validated['current_weight'] ?? null,
            'goal_weight' => $validated['goal_weight'] ?? null,
            'daily_calorie_goal' => $targets['calories'],
            'protein_goal_g' => $targets['protein_g'],
            'carbs_goal_g' => $targets['carbs_g'],
            'fat_goal_g' => $targets['fat_g'],
            'hydration_goal_ml' => $validated['hydration_goal_ml'] ?? 2500,
            'dietary_restrictions' => ! empty($validated['dietary_restrictions']) ? $validated['dietary_restrictions'] : null,
            'food_preferences' => ! empty($validated['food_preferences']) ? $validated['food_preferences'] : null,
            'reminders_enabled' => true,
        ]);

        if ($user->current_weight) {
            $user->weightLogs()->create([
                'logged_date' => now()->toDateString(),
                'weight_kg' => $user->current_weight,
            ]);
        }

        // Create a default starter plan so Plans page doesn't crash
        $user->plans()->create([
            'title' => 'My Fitness Journey',
            'subtitle' => 'Getting started with Altafit',
            'goal_unit' => 'kg',
            'goal_target' => $validated['goal_weight'] ?? $validated['current_weight'] ?? 70,
            'goal_remaining' => abs(($validated['current_weight'] ?? 70) - ($validated['goal_weight'] ?? 70)),
            'progress_percent' => 0,
            'tip' => 'Start by logging your meals consistently. Small wins build big habits!',
            'is_active' => true,
        ]);

        // Auto-login after registration, redirect to dashboard
        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->intended(route('dashboard.index'));
    }
}
