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
    public function __invoke(Request $request): Response
    {
        $user = $request->user()->load(['meals' => fn ($query) => $query->latest('logged_at')]);
        $featuredMeal = $user->meals->first();
        $recentMeals = $user->meals->take(8)->values();

        return Inertia::render('Chat', [
            'pageMeta' => [
                'title' => 'AI Chat',
                'activeNav' => 'chat',
                'calorieTarget' => $user->daily_calorie_goal,
                'userInitial' => strtoupper(substr($user->name, 0, 1)),
                'theme' => $user->theme ?? 'light',
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
                    'note' => session('analysis_note', $this->buildAnalysisNote($featuredMeal, $user)),
                    'confidence' => $featuredMeal?->confidence_score,
                    'confidenceLabel' => $this->confidenceLabel($featuredMeal?->confidence_score),
                    'confidenceLevel' => $this->confidenceLevel($featuredMeal?->confidence_score),
                ],
                'chips' => ['Add to Daily Log', 'Adjust Quantities', 'View Recipes'],
                'photoPrompt' => 'How about this dinner?',
                'draft' => '',
                'editingMeal' => session('editing_meal'),
                'mealTypes' => ['Breakfast', 'Lunch', 'Dinner', 'Snack'],
                'recentMeals' => $recentMeals->map(fn (Meal $meal) => [
                    'id' => $meal->id,
                    'description' => $meal->description,
                    'meal_type' => $meal->meal_type ?: 'Meal',
                    'notes' => $meal->notes,
                    'calories' => $meal->calories,
                    'protein' => $meal->protein_g,
                    'carbs' => $meal->carbs_g,
                    'fat' => $meal->fat_g,
                    'fiber' => $meal->fiber_g,
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
            'meal_type' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $user = $request->user();
        $message = trim($validated['message']);
        $estimate = NutritionEstimator::estimate($message);

        Meal::query()->create([
            'user_id' => $user->id,
            'description' => $estimate['description'],
            'meal_type' => $validated['meal_type'] ?? $this->guessMealType(),
            'notes' => $validated['notes'] ?? null,
            'calories' => $estimate['calories'],
            'protein_g' => $estimate['protein_g'],
            'carbs_g' => $estimate['carbs_g'],
            'fat_g' => $estimate['fat_g'],
            'fiber_g' => $estimate['fiber_g'],
            'confidence_score' => $estimate['confidence_score'],
            'logged_at' => now(),
        ]);

        $user->updateStreak();

        return redirect()->route('chat.index')
            ->with('success', 'Meal logged and analyzed from your text input.')
            ->with('analysis_note', $estimate['note']);
    }

    public function update(Request $request, Meal $meal): RedirectResponse
    {
        $validated = $request->validate([
            'description' => ['required', 'string', 'max:255'],
            'meal_type' => ['nullable', 'string', 'max:50'],
            'notes' => ['nullable', 'string', 'max:500'],
            'calories' => ['required', 'integer', 'min:0'],
            'protein_g' => ['required', 'integer', 'min:0'],
            'carbs_g' => ['required', 'integer', 'min:0'],
            'fat_g' => ['required', 'integer', 'min:0'],
            'fiber_g' => ['required', 'integer', 'min:0'],
        ]);

        $meal->update($validated);

        return redirect()->route('chat.index')
            ->with('success', 'Meal log updated.')
            ->with('editing_meal', $meal->id);
    }

    public function destroy(Request $request, Meal $meal): RedirectResponse
    {
        abort_if($meal->user_id !== $request->user()->id, 403);
        $meal->delete();

        return redirect()->route('chat.index')->with('success', 'Meal log removed.');
    }

    protected function guessMealType(): string
    {
        $hour = (int) now()->format('G');

        return match (true) {
            $hour < 10 => 'Breakfast',
            $hour < 15 => 'Lunch',
            $hour < 20 => 'Dinner',
            default => 'Snack',
        };
    }

    protected function confidenceLabel(?float $confidence): string
    {
        $score = (float) ($confidence ?? 0);

        return match (true) {
            $score >= 0.85 => 'High confidence',
            $score >= 0.65 => 'Medium confidence',
            default => 'Low confidence',
        };
    }

    protected function confidenceLevel(?float $confidence): string
    {
        $score = (float) ($confidence ?? 0);

        return match (true) {
            $score >= 0.85 => 'high',
            $score >= 0.65 => 'medium',
            default => 'low',
        };
    }

    protected function buildAnalysisNote(?Meal $meal, User $user): string
    {
        if (! $meal) {
            return 'Log a meal and Altafit will start tailoring nutrition feedback to your actual targets.';
        }

        if ($meal->protein_g >= 30) {
            return 'Strong protein hit. This kind of meal supports recovery and makes it easier to stay on target later.';
        }

        if ($meal->fiber_g >= 6) {
            return 'Nice fiber density. Meals like this usually help with fullness and steadier appetite control.';
        }

        if ($meal->calories > (int) round($user->daily_calorie_goal * 0.4)) {
            return 'This meal used a big chunk of today\'s calories, so keep the next one lighter and protein-forward.';
        }

        return 'Solid log. You still have room to improve the day by balancing protein, hydration, and your next meal choice.';
    }
}
