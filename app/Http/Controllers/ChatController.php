<?php

namespace App\Http\Controllers;

use App\Models\Meal;
use App\Models\User;
use App\Support\NutritionEstimator;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ChatController extends Controller
{
    public function __invoke(): Response
    {
        $user = User::query()->with(['meals' => fn ($query) => $query->latest('logged_at')])->firstOrFail();
        $featuredMeal = $user->meals->first();
        $recentMeals = $user->meals->take(6)->values();

        return Inertia::render('Chat', [
            'pageMeta' => [
                'title' => 'AI Chat',
                'activeNav' => 'chat',
                'calorieTarget' => $user->daily_calorie_goal,
            ],
            'chat' => [
                'timestamp' => optional($featuredMeal?->logged_at)->format('l, h:i A') ?? 'Today, 12:45 PM',
                'messages' => [
                    [
                        'id' => 1,
                        'role' => 'assistant',
                        'type' => 'text',
                        'content' => "Hello! I'm your Altafit AI. Ready to log your lunch? You can type it out or send a photo.",
                    ],
                    [
                        'id' => 2,
                        'role' => 'user',
                        'type' => 'text',
                        'content' => $featuredMeal?->description ?? 'Logging 2 tacos and a side of guacamole.',
                    ],
                ],
                'analysis' => [
                    'title' => 'Analyzed: '.($featuredMeal?->description ?? 'Grilled Chicken Tacos'),
                    'protein' => $featuredMeal?->protein_g ?? 32,
                    'carbs' => $featuredMeal?->carbs_g ?? 24,
                    'fat' => $featuredMeal?->fat_g ?? 18,
                    'fiber' => $featuredMeal?->fiber_g ?? 6,
                    'calories' => $featuredMeal?->calories ?? 540,
                    'note' => session('analysis_note', 'Great choice! High protein helps with your muscle recovery plan.'),
                    'confidence' => $featuredMeal?->confidence_score,
                ],
                'chips' => ['Add to Daily Log', 'Adjust Quantities', 'View Recipes'],
                'photoPrompt' => 'How about this dinner?',
                'draft' => '',
                'recentMeals' => $recentMeals->map(fn (Meal $meal) => [
                    'id' => $meal->id,
                    'description' => $meal->description,
                    'calories' => $meal->calories,
                    'time' => optional($meal->logged_at)->format('H:i') ?? optional($meal->created_at)->format('H:i'),
                ])->all(),
            ],
            'flash' => [
                'success' => session('success'),
            ],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:255'],
        ]);

        $user = User::query()->firstOrFail();
        $message = trim($validated['message']);
        $estimate = NutritionEstimator::estimate($message);

        Meal::query()->create([
            'user_id' => $user->id,
            'description' => $estimate['description'],
            'calories' => $estimate['calories'],
            'protein_g' => $estimate['protein_g'],
            'carbs_g' => $estimate['carbs_g'],
            'fat_g' => $estimate['fat_g'],
            'fiber_g' => $estimate['fiber_g'],
            'confidence_score' => $estimate['confidence_score'],
            'logged_at' => now(),
        ]);

        return redirect()->route('chat.index')
            ->with('success', 'Meal logged and analyzed from your text input.')
            ->with('analysis_note', $estimate['note']);
    }

    public function destroy(Meal $meal): RedirectResponse
    {
        $meal->delete();

        return redirect()->route('chat.index')->with('success', 'Meal log removed.');
    }
}
