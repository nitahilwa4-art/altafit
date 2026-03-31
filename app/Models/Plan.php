<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'subtitle',
        'goal_unit',
        'goal_target',
        'goal_remaining',
        'progress_percent',
        'tip',
        'is_active',
        'target_date',
        'weekly_rate',
        'estimated_date',
    ];

    protected function casts(): array
    {
        return [
            'goal_target' => 'decimal:2',
            'goal_remaining' => 'decimal:2',
            'is_active' => 'boolean',
            'target_date' => 'date',
            'estimated_date' => 'date',
            'weekly_rate' => 'decimal:2',
        ];
    }

    /**
     * Auto-compute remaining from current vs goal weight.
     * remaining = abs(goal_target - current_weight)
     */
    public function computedRemaining(?float $currentWeight): ?float
    {
        if ($this->goal_target === null || $currentWeight === null) {
            return null;
        }
        return round(abs((float) $this->goal_target - $currentWeight), 1);
    }

    /**
     * Auto-compute progress from goal_target and current_weight.
     */
    public function computedProgress(?float $currentWeight): ?float
    {
        if ($this->goal_target === null || $currentWeight === null) {
            return null;
        }
        $total = abs((float) $this->goal_target - ($currentWeight + $this->computedRemaining($currentWeight)));
        // If no movement yet, return stored progress
        if ($total <= 0) {
            return 100;
        }
        $done = abs($currentWeight - ($currentWeight + $this->computedRemaining($currentWeight)));
        return round(max(0, min(100, ($done / $total) * 100)));
    }

    /**
     * Direction: 'lose' if goal < current, 'gain' if goal > current, 'maintain' if equal
     */
    public function direction(?float $currentWeight): string
    {
        if ($currentWeight === null) return 'maintain';
        if ((float) $this->goal_target < $currentWeight) return 'lose';
        if ((float) $this->goal_target > $currentWeight) return 'gain';
        return 'maintain';
    }

    /**
     * Generate weekly milestones from today until target_date or estimated_date.
     */
    public function generateMilestones(\DateTimeInterface $from, \DateTimeInterface $until): array
    {
        $milestones = [];
        $current = (new \DateTime($from->format('Y-m-d')));
        $end = (new \DateTime($until->format('Y-m-d')));
        $week = 1;

        while ($current <= $end) {
            $milestones[] = [
                'label' => "Week {$week} — {$current->format('M d')}",
                'sort_order' => $week,
            ];
            $current->modify('+1 week');
            $week++;
        }

        return $milestones;
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function milestones(): HasMany
    {
        return $this->hasMany(Milestone::class)->orderBy('sort_order');
    }
}
