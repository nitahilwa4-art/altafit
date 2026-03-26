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
        ];
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
}
