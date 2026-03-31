<?php

use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PlansController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::middleware('guest')->group(function () {
    Route::get('/login', [LoginController::class, 'create'])->name('login');
    Route::post('/login', [LoginController::class, 'store']);
});

Route::middleware('guest')->group(function () {
    Route::get('/register', [RegisterController::class, 'create'])->name('register');
    Route::post('/register', [RegisterController::class, 'store']);
});

Route::middleware('auth')->group(function () {
    Route::post('/logout', [LoginController::class, 'destroy'])->name('logout');

    Route::get('/dashboard', DashboardController::class)->name('dashboard.index');
    Route::post('/dashboard/hydration/add', [DashboardController::class, 'addWater'])->name('dashboard.hydration.add');
    Route::post('/dashboard/hydration/remove', [DashboardController::class, 'removeWater'])->name('dashboard.hydration.remove');
    Route::delete('/dashboard/hydration/{waterLog}', [DashboardController::class, 'destroyWater'])->name('dashboard.hydration.destroy');

    Route::get('/chat', ChatController::class)->name('chat.index');
    Route::post('/chat/log', [ChatController::class, 'store'])->name('chat.store');
    Route::patch('/chat/log/{meal}', [ChatController::class, 'update'])->name('chat.update');
    Route::delete('/chat/log/{meal}', [ChatController::class, 'destroy'])->name('chat.destroy');
    Route::get('/chat/export', [ChatController::class, 'export'])->name('chat.export');

    Route::get('/plans', PlansController::class)->name('plans.index');
    Route::post('/plans', [PlansController::class, 'store'])->name('plans.store');
    Route::patch('/plans/{plan}', [PlansController::class, 'update'])->name('plans.update');
    Route::patch('/plans/{plan}/activate', [PlansController::class, 'activate'])->name('plans.activate');
    Route::delete('/plans/{plan}', [PlansController::class, 'destroy'])->name('plans.destroy');
    Route::post('/plans/{plan}/milestones', [PlansController::class, 'storeMilestone'])->name('plans.milestones.store');
    Route::post('/plans/{plan}/milestones/generate', [PlansController::class, 'generateMilestones'])->name('plans.milestones.generate');
    Route::patch('/plans/milestones/{milestone}/toggle', [PlansController::class, 'toggleMilestone'])->name('plans.milestones.toggle');
    Route::delete('/plans/milestones/{milestone}', [PlansController::class, 'destroyMilestone'])->name('plans.milestones.destroy');

    Route::get('/profile', ProfileController::class)->name('profile.index');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::post('/profile/theme', [ProfileController::class, 'toggleTheme'])->name('profile.theme');
    Route::post('/profile/recalculate', [ProfileController::class, 'recalculate'])->name('profile.recalculate');
});
