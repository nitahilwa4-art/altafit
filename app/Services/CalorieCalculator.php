<?php

namespace App\Services;

use App\Models\User;

class CalorieCalculator
{
    private const ACTIVITY_MULTIPLIERS = [
        'sedentary'   => 1.2,
        'light'       => 1.375,
        'moderate'    => 1.55,
        'very_active' => 1.725,
        'extra_active'=> 1.9,
    ];

    private const GOAL_ADJUSTMENTS = [
        'lose'    => -500,
        'maintain'=> 0,
        'gain'    => +300,
    ];

    private const PROTEIN_MULTIPLIERS = [
        'lose'    => 2.0,
        'maintain'=> 1.8,
        'gain'    => 2.2,
    ];

    public function calculate(User $user): array
    {
        $weight   = (float) $user->current_weight;
        $height   = (int)    $user->height_cm;
        $age      = (int)    $user->age;
        $gender   = $user->gender ?? 'prefer_not';
        $activity = $user->activity_level ?? 'light';
        $goal     = $user->weight_goal ?? 'maintain';

        $bmr = $this->bmr($weight, $height, $age, $gender);
        $tdee = $bmr * (self::ACTIVITY_MULTIPLIERS[$activity] ?? 1.375);
        $calorieTarget = (int) round($tdee + (self::GOAL_ADJUSTMENTS[$goal] ?? 0));

        $proteinMultiplier = self::PROTEIN_MULTIPLIERS[$goal] ?? 1.8;
        $proteinG = (int) round($weight * $proteinMultiplier);
        $fatG = (int) round($weight * 0.9);
        $carbCalories = max(0, $calorieTarget - ($proteinG * 4) - ($fatG * 9));
        $carbsG = (int) round($carbCalories / 4);

        return [
            'calories'   => max(500, $calorieTarget),
            'protein_g'  => $proteinG,
            'carbs_g'    => $carbsG,
            'fat_g'      => $fatG,
        ];
    }

    public function bmr(float $weight, int $height, int $age, string $gender): float
    {
        $base = (10 * $weight) + (6.25 * $height) - (5 * $age);

        return match ($gender) {
            'male'       => $base + 5,
            'female'     => $base - 161,
            default      => $base - 78, // 'other' or 'prefer_not'
        };
    }

    public function getActivityOptions(): array
    {
        return [
            ['value' => 'sedentary',   'label' => 'Sedentary',   'desc' => 'Little to no exercise, desk job'],
            ['value' => 'light',       'label' => 'Light',       'desc' => 'Light exercise 1–3 days/week'],
            ['value' => 'moderate',    'label' => 'Moderate',    'desc' => 'Moderate exercise 3–5 days/week'],
            ['value' => 'very_active', 'label' => 'Very Active','desc' => 'Hard exercise 6–7 days/week'],
            ['value' => 'extra_active','label' => 'Extra Active','desc' => 'Physical job + hard training daily'],
        ];
    }

    public function getGoalOptions(): array
    {
        return [
            ['value' => 'lose',    'label' => 'Lose Weight', 'desc' => '-500 kcal/day'],
            ['value' => 'maintain', 'label' => 'Maintain',     'desc' => 'Keep current weight'],
            ['value' => 'gain',    'label' => 'Gain Weight',  'desc' => '+300 kcal/day'],
        ];
    }

    public function getDietaryOptions(): array
    {
        return [
            ['value' => 'vegetarian',   'label' => 'Vegetarian'],
            ['value' => 'vegan',        'label' => 'Vegan'],
            ['value' => 'gluten_free',  'label' => 'Gluten-Free'],
            ['value' => 'dairy_free',   'label' => 'Dairy-Free'],
            ['value' => 'nut_allergy',  'label' => 'Nut Allergy'],
        ];
    }

    public function getCuisineOptions(): array
    {
        return [
            'Italian', 'Asian', 'Mediterranean', 'Mexican',
            'Indian', 'American', 'Middle Eastern', 'Japanese',
        ];
    }

    public function canCalculate(User $user): bool
    {
        return $user->current_weight
            && $user->age
            && $user->height_cm
            && $user->gender;
    }
}
