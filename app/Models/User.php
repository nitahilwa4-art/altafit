<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'profile_photo_path',
        'current_weight',
        'goal_weight',
        'daily_calorie_goal',
        'protein_goal_g',
        'carbs_goal_g',
        'fat_goal_g',
        'hydration_goal_ml',
        'reminders_enabled',
        'current_streak',
        'longest_streak',
        'last_logged_date',
        'theme',
        'age',
        'height_cm',
        'gender',
        'activity_level',
        'weight_goal',
        'dietary_restrictions',
        'food_preferences',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'current_weight' => 'decimal:2',
            'goal_weight' => 'decimal:2',
            'reminders_enabled' => 'boolean',
            'last_logged_date' => 'date',
            'dietary_restrictions' => 'array',
            'food_preferences' => 'array',
        ];
    }

    public function updateStreak(): void
    {
        $today = now()->toDateString();

        if ($this->last_logged_date?->toDateString() === $today) {
            return;
        }

        $yesterday = now()->subDay()->toDateString();
        $isConsecutive = $this->last_logged_date?->toDateString() === $yesterday;

        $newStreak = $isConsecutive ? $this->current_streak + 1 : 1;

        $this->update([
            'current_streak' => $newStreak,
            'longest_streak' => max($this->longest_streak, $newStreak),
            'last_logged_date' => $today,
        ]);
    }

    public function meals(): HasMany
    {
        return $this->hasMany(Meal::class);
    }

    public function waterLogs(): HasMany
    {
        return $this->hasMany(WaterLog::class);
    }

    public function plans(): HasMany
    {
        return $this->hasMany(Plan::class);
    }

    public function weightLogs(): HasMany
    {
        return $this->hasMany(WeightLog::class);
    }
}
