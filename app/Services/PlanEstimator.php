<?php

namespace App\Services;

/**
 * PlanEstimator — Estimates goal completion date and generates milestones.
 *
 * Currently uses formula-based estimation (Mifflin-St Jeor + rate of change).
 * In the future, this can be replaced with an AI model call.
 */
class PlanEstimator
{
    /**
     * Estimate when the user will reach their goal based on current rate.
     *
     * @param  array  $weightHistory  Array of ['date' => 'Y-m-d', 'weight_kg' => float]
     * @param  float $goalWeight
     * @param  float $currentWeight
     * @param  int   $weeklyRateKg  Estimated kg lost/gained per week (auto-calculated if 0)
     * @return array ['estimated_date' => 'Y-m-d', 'weeks_remaining' => int, 'confidence' => 'low|medium|high']
     */
    public function estimateCompletion(
        array $weightHistory,
        float $goalWeight,
        float $currentWeight,
        int $weeklyRateKg = 0
    ): array {
        $direction = $goalWeight < $currentWeight ? 'lose' : ($goalWeight > $currentWeight ? 'gain' : 'maintain');
        $remaining = abs($goalWeight - $currentWeight);

        if ($remaining <= 0) {
            return [
                'estimated_date' => now()->toDateString(),
                'weeks_remaining' => 0,
                'days_remaining' => 0,
                'confidence' => 'high',
                'reason' => 'Goal already reached.',
            ];
        }

        // Auto-calculate weekly rate from weight history
        if ($weeklyRateKg === 0 && count($weightHistory) >= 2) {
            $weeklyRateKg = $this->calculateWeeklyRate($weightHistory, $direction);
        }

        // Default safe rate: 0.5kg/week lose, 0.3kg/week gain
        $safeRate = $weeklyRateKg > 0 ? $weeklyRateKg : ($direction === 'lose' ? 0.5 : 0.3);

        $weeksNeeded = $remaining / $safeRate;
        $daysNeeded = (int) ceil($weeksNeeded * 7);

        $estimatedDate = now()->addDays($daysNeeded)->toDateString();

        $confidence = count($weightHistory) >= 4 ? 'medium' : 'low';
        if ($weeklyRateKg > 0 && count($weightHistory) >= 6) {
            $confidence = 'high';
        }

        $reason = $confidence === 'low'
            ? 'Not enough data — estimation based on average rate. Keep tracking!'
            : ($confidence === 'medium'
                ? 'Based on your recent rate of change. Consistency improves accuracy.'
                : 'High confidence — estimation from consistent tracking data.');

        return [
            'estimated_date' => $estimatedDate,
            'weeks_remaining' => (int) ceil($weeksNeeded),
            'days_remaining' => $daysNeeded,
            'weekly_rate' => $safeRate,
            'confidence' => $confidence,
            'reason' => $reason,
        ];
    }

    /**
     * Calculate weekly weight change rate from history.
     */
    protected function calculateWeeklyRate(array $weightHistory, string $direction): float
    {
        if (count($weightHistory) < 2) {
            return $direction === 'lose' ? 0.5 : 0.3;
        }

        usort($weightHistory, fn ($a, $b) => $a['date'] <=> $b['date']);

        $first = $weightHistory[0];
        $last = end($weightHistory);

        $daysDiff = max(1, (new \DateTime($last['date']))->diff((new \DateTime($first['date'])))->days);
        $weightDiff = abs((float) $last['weight_kg'] - (float) $first['weight_kg']);
        $weeks = $daysDiff / 7;

        if ($weeks < 0.1) {
            return $direction === 'lose' ? 0.5 : 0.3;
        }

        return round($weightDiff / $weeks, 2);
    }

    /**
     * Generate milestone labels with AI-flavored motivational labels.
     * Currently uses formula. Replace body with AI call when connected.
     *
     * @return array of ['label' => string, 'sort_order' => int, 'is_completed' => bool]
     */
    public function generateMilestones(
        float $currentWeight,
        float $goalWeight,
        int $weeksCount = 8
    ): array {
        $remaining = abs($goalWeight - $currentWeight);
        $direction = $goalWeight < $currentWeight ? 'lose' : ($goalWeight > $currentWeight ? 'gain' : 'maintain');
        $perWeek = $weeksCount > 0 ? round($remaining / $weeksCount, 1) : 0;

        $labels = $this->getMilestoneTemplates($direction);
        $milestones = [];

        for ($i = 1; $i <= $weeksCount; $i++) {
            $targetWeight = $direction === 'lose'
                ? round($currentWeight - ($perWeek * $i), 1)
                : round($currentWeight + ($perWeek * $i), 1);

            $label = $labels[($i - 1) % count($labels)] ?? "Week {$i}";
            $milestones[] = [
                'label' => "{$label} — {$targetWeight} kg",
                'sort_order' => $i,
                'is_completed' => false,
            ];
        }

        return $milestones;
    }

    /**
     * Get AI-flavored milestone label templates.
     * Replace with AI-generated personalized labels when API is connected.
     */
    protected function getMilestoneTemplates(string $direction): array
    {
        if ($direction === 'lose') {
            return [
                'First Step',
                'Building Momentum',
                'Breaking Old Habits',
                'Halfway There',
                'Pushing Through',
                'Almost at Goal',
                'Final Push',
                'Goal Week',
            ];
        }

        if ($direction === 'gain') {
            return [
                'Getting Started',
                'Building Strength',
                'Gaining Momentum',
                'Halfway Point',
                'Getting Stronger',
                'Almost There',
                'Final Phase',
                'Goal Week',
            ];
        }

        return [
            'Week 1',
            'Week 2',
            'Week 3',
            'Week 4',
            'Week 5',
            'Week 6',
            'Week 7',
            'Week 8',
        ];
    }

    /**
     * Generate a motivational coaching tip based on current progress.
     * Replace with AI-generated tip when API is connected.
     */
    public function generateTip(
        float $currentWeight,
        float $goalWeight,
        float $dailyCaloriesConsumed,
        float $dailyCalorieGoal,
        int $mealsLoggedToday,
        int $hydrationPercent
    ): string {
        $remaining = abs($goalWeight - $currentWeight);
        $direction = $goalWeight < $currentWeight ? 'lose' : ($goalWeight > $currentWeight ? 'gain' : 'maintain');

        $calorieBalance = $dailyCaloriesConsumed - $dailyCalorieGoal;
        $tips = [];

        // Based on calorie deficit/surplus
        if ($direction === 'lose') {
            if ($calorieBalance > 200) {
                $tips[] = "Today's a bit over — a good walk can help balance the deficit.";
            } elseif ($calorieBalance < -200) {
                $tips[] = "Great deficit today! Stay consistent and the results will compound.";
            }
            if ($remaining > 5) {
                $tips[] = "Focus on consistency over perfection — small daily wins add up fast.";
            } elseif ($remaining < 2) {
                $tips[] = "You're in the final stretch! Keep the momentum going.";
            }
        } elseif ($direction === 'gain') {
            if ($calorieBalance < -200) {
                $tips[] = "Not enough surplus today — try adding a protein-rich snack before bed.";
            } else {
                $tips[] = "Keep your meals consistent to support steady muscle growth.";
            }
        }

        // Based on tracking habits
        if ($mealsLoggedToday === 0) {
            $tips[] = "Start your first meal today — the first log builds the habit.";
        } elseif ($mealsLoggedToday === 1) {
            $tips[] = "One meal logged — add a second to round out today's data.";
        } elseif ($mealsLoggedToday >= 3) {
            $tips[] = "Excellent tracking today! More data = smarter insights for you.";
        }

        // Based on hydration
        if ($hydrationPercent < 50) {
            $tips[] = "Hydration is lagging — water supports metabolism and appetite control.";
        } elseif ($hydrationPercent >= 80) {
            $tips[] = "Great hydration today! Keep it consistent throughout the evening.";
        }

        if (empty($tips)) {
            $tips[] = $direction === 'lose'
                ? "Trust the process — consistent tracking beats perfect days."
                : "Every meal logged helps your AI learn your pattern better.";
        }

        return $tips[array_rand($tips)];
    }
}
