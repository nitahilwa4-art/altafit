<?php

namespace App\Support;

class NutritionEstimator
{
    public static function estimate(string $message): array
    {
        $normalized = mb_strtolower(trim($message));

        $presets = [
            'taco' => ['calories' => 180, 'protein' => 9, 'carbs' => 14, 'fat' => 9, 'fiber' => 2],
            'guacamole' => ['calories' => 120, 'protein' => 2, 'carbs' => 8, 'fat' => 10, 'fiber' => 5],
            'salad' => ['calories' => 160, 'protein' => 6, 'carbs' => 12, 'fat' => 9, 'fiber' => 4],
            'rice' => ['calories' => 205, 'protein' => 4, 'carbs' => 45, 'fat' => 0, 'fiber' => 1],
            'egg' => ['calories' => 78, 'protein' => 6, 'carbs' => 1, 'fat' => 5, 'fiber' => 0],
            'oatmeal' => ['calories' => 150, 'protein' => 5, 'carbs' => 27, 'fat' => 3, 'fiber' => 4],
            'chicken' => ['calories' => 220, 'protein' => 32, 'carbs' => 0, 'fat' => 8, 'fiber' => 0],
            'salmon' => ['calories' => 280, 'protein' => 29, 'carbs' => 0, 'fat' => 18, 'fiber' => 0],
            'quinoa' => ['calories' => 180, 'protein' => 7, 'carbs' => 32, 'fat' => 3, 'fiber' => 5],
            'avocado' => ['calories' => 160, 'protein' => 2, 'carbs' => 9, 'fat' => 15, 'fiber' => 7],
            'bread' => ['calories' => 80, 'protein' => 3, 'carbs' => 15, 'fat' => 1, 'fiber' => 2],
            'toast' => ['calories' => 80, 'protein' => 3, 'carbs' => 15, 'fat' => 1, 'fiber' => 2],
            'burger' => ['calories' => 520, 'protein' => 26, 'carbs' => 40, 'fat' => 28, 'fiber' => 2],
            'pizza' => ['calories' => 285, 'protein' => 12, 'carbs' => 36, 'fat' => 10, 'fiber' => 2],
            'coffee' => ['calories' => 5, 'protein' => 0, 'carbs' => 1, 'fat' => 0, 'fiber' => 0],
            'banana' => ['calories' => 105, 'protein' => 1, 'carbs' => 27, 'fat' => 0, 'fiber' => 3],
            'apple' => ['calories' => 95, 'protein' => 0, 'carbs' => 25, 'fat' => 0, 'fiber' => 4],
            'milk' => ['calories' => 103, 'protein' => 8, 'carbs' => 12, 'fat' => 2, 'fiber' => 0],
            'yogurt' => ['calories' => 120, 'protein' => 10, 'carbs' => 14, 'fat' => 3, 'fiber' => 0],
            'noodle' => ['calories' => 220, 'protein' => 7, 'carbs' => 40, 'fat' => 4, 'fiber' => 2],
            'mie' => ['calories' => 220, 'protein' => 7, 'carbs' => 40, 'fat' => 4, 'fiber' => 2],
            'tempe' => ['calories' => 193, 'protein' => 19, 'carbs' => 9, 'fat' => 11, 'fiber' => 2],
            'tofu' => ['calories' => 144, 'protein' => 17, 'carbs' => 3, 'fat' => 9, 'fiber' => 1],
            'nasi goreng' => ['calories' => 520, 'protein' => 12, 'carbs' => 68, 'fat' => 20, 'fiber' => 3],
            'rendang' => ['calories' => 320, 'protein' => 24, 'carbs' => 6, 'fat' => 22, 'fiber' => 1],
            'sate' => ['calories' => 260, 'protein' => 22, 'carbs' => 8, 'fat' => 15, 'fiber' => 1],
            'gado-gado' => ['calories' => 380, 'protein' => 14, 'carbs' => 28, 'fat' => 22, 'fiber' => 6],
            'es teh manis' => ['calories' => 120, 'protein' => 0, 'carbs' => 30, 'fat' => 0, 'fiber' => 0],
            'teh manis' => ['calories' => 120, 'protein' => 0, 'carbs' => 30, 'fat' => 0, 'fiber' => 0],
            'bakso' => ['calories' => 420, 'protein' => 18, 'carbs' => 45, 'fat' => 16, 'fiber' => 2],
            'soto' => ['calories' => 280, 'protein' => 18, 'carbs' => 20, 'fat' => 12, 'fiber' => 1],
            'ayam geprek' => ['calories' => 480, 'protein' => 28, 'carbs' => 24, 'fat' => 28, 'fiber' => 2],
            'pecel' => ['calories' => 340, 'protein' => 10, 'carbs' => 32, 'fat' => 18, 'fiber' => 7],
            'bubur ayam' => ['calories' => 290, 'protein' => 12, 'carbs' => 36, 'fat' => 9, 'fiber' => 1],
            'martabak' => ['calories' => 410, 'protein' => 10, 'carbs' => 38, 'fat' => 24, 'fiber' => 1],
            'siomay' => ['calories' => 300, 'protein' => 14, 'carbs' => 30, 'fat' => 14, 'fiber' => 3],
            'nasi padang' => ['calories' => 650, 'protein' => 28, 'carbs' => 72, 'fat' => 26, 'fiber' => 3],
            'sushi' => ['calories' => 240, 'protein' => 10, 'carbs' => 38, 'fat' => 5, 'fiber' => 1],
            'pasta' => ['calories' => 340, 'protein' => 11, 'carbs' => 56, 'fat' => 8, 'fiber' => 3],
            'steak' => ['calories' => 420, 'protein' => 34, 'carbs' => 4, 'fat' => 28, 'fiber' => 0],
            'smoothie' => ['calories' => 210, 'protein' => 6, 'carbs' => 34, 'fat' => 5, 'fiber' => 4],
            'granola' => ['calories' => 210, 'protein' => 5, 'carbs' => 30, 'fat' => 8, 'fiber' => 4],
            'sandwich' => ['calories' => 290, 'protein' => 14, 'carbs' => 30, 'fat' => 11, 'fiber' => 3],
            'soup' => ['calories' => 140, 'protein' => 8, 'carbs' => 14, 'fat' => 6, 'fiber' => 2],
            'kentang goreng' => ['calories' => 320, 'protein' => 4, 'carbs' => 41, 'fat' => 15, 'fiber' => 4],
            'fries' => ['calories' => 320, 'protein' => 4, 'carbs' => 41, 'fat' => 15, 'fiber' => 4],
        ];

        $segments = preg_split('/\s*(?:\+|,| dan | with | & )\s*/u', $normalized) ?: [$normalized];

        $totals = [
            'calories' => 0,
            'protein_g' => 0,
            'carbs_g' => 0,
            'fat_g' => 0,
            'fiber_g' => 0,
        ];
        $matchedKeywords = [];
        $segmentCount = 0;

        foreach ($segments as $segment) {
            $segment = trim($segment);
            if ($segment === '') {
                continue;
            }

            $segmentCount++;
            $segmentMultiplier = self::extractMultiplier($segment);

            foreach ($presets as $keyword => $values) {
                if (! str_contains($segment, $keyword)) {
                    continue;
                }

                $matchedKeywords[] = $keyword;
                $totals['calories'] += $values['calories'] * $segmentMultiplier;
                $totals['protein_g'] += $values['protein'] * $segmentMultiplier;
                $totals['carbs_g'] += $values['carbs'] * $segmentMultiplier;
                $totals['fat_g'] += $values['fat'] * $segmentMultiplier;
                $totals['fiber_g'] += $values['fiber'] * $segmentMultiplier;
            }
        }

        if ($matchedKeywords === []) {
            return [
                'description' => self::headline($message),
                'calories' => 320,
                'protein_g' => 14,
                'carbs_g' => 28,
                'fat_g' => 12,
                'fiber_g' => 4,
                'confidence_score' => 0.42,
                'note' => 'I made a broad estimate because the meal description is still quite general.',
            ];
        }

        foreach ($totals as $key => $value) {
            $totals[$key] = (int) round($value);
        }

        $uniqueMatches = count(array_unique($matchedKeywords));
        $coverageRatio = min($uniqueMatches / max($segmentCount, 1), 1);
        $confidence = min(0.45 + ($uniqueMatches * 0.06) + ($coverageRatio * 0.18), 0.96);
        $note = $uniqueMatches > 1
            ? 'Estimated from multiple foods in your message. Portions look reasonably captured, but you can still fine-tune.'
            : 'Estimated from a specific food match in your message. Adjust portions if your serving was larger or smaller.';

        return [
            'description' => self::headline($message),
            ...$totals,
            'confidence_score' => round($confidence, 2),
            'note' => $note,
        ];
    }

    protected static function extractMultiplier(string $message): float
    {
        if (preg_match('/\b([2-9]|10)(?:\s*(?:x|×|porsi|portion|pcs|buah|gelas|cup))?\b/u', $message, $matches)) {
            return (float) $matches[1];
        }

        return match (true) {
            str_contains($message, 'half'), str_contains($message, 'setengah') => 0.5,
            str_contains($message, 'double') => 2.0,
            str_contains($message, 'large'), str_contains($message, 'besar'), str_contains($message, 'sepiring'), str_contains($message, 'satu porsi') => 1.5,
            str_contains($message, 'small'), str_contains($message, 'kecil'), str_contains($message, 'setengah porsi') => 0.75,
            str_contains($message, 'medium'), str_contains($message, 'sedang'), str_contains($message, 'segelas') => 1.0,
            default => 1.0,
        };
    }

    protected static function headline(string $message): string
    {
        $trimmed = trim($message);
        return mb_convert_case($trimmed !== '' ? $trimmed : 'Meal entry', MB_CASE_TITLE, 'UTF-8');
    }
}
