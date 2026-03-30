<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'confirmed', 'min:8'],
            'current_weight' => ['nullable', 'numeric', 'min:20', 'max:500'],
            'goal_weight' => ['nullable', 'numeric', 'min:20', 'max:500'],
            'daily_calorie_goal' => ['nullable', 'integer', 'min:500', 'max:10000'],
            'protein_goal_g' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'carbs_goal_g' => ['nullable', 'integer', 'min:0', 'max:1000'],
            'fat_goal_g' => ['nullable', 'integer', 'min:0', 'max:500'],
            'hydration_goal_ml' => ['nullable', 'integer', 'min:100', 'max:10000'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'current_weight' => $validated['current_weight'] ?? null,
            'goal_weight' => $validated['goal_weight'] ?? null,
            'daily_calorie_goal' => $validated['daily_calorie_goal'] ?? 2000,
            'protein_goal_g' => $validated['protein_goal_g'] ?? 100,
            'carbs_goal_g' => $validated['carbs_goal_g'] ?? 200,
            'fat_goal_g' => $validated['fat_goal_g'] ?? 60,
            'hydration_goal_ml' => $validated['hydration_goal_ml'] ?? 2500,
            'reminders_enabled' => true,
        ]);

        // Log the initial weight entry
        if ($user->current_weight) {
            $user->weightLogs()->create([
                'logged_date' => now()->toDateString(),
                'weight_kg' => $user->current_weight,
            ]);
        }

        return redirect()->route('login')->with('success', 'Account created! Please sign in.');
    }
}
