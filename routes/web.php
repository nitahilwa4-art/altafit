<?php

use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PlansController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

Route::get('/', DashboardController::class)->name('dashboard');
Route::get('/dashboard', DashboardController::class)->name('dashboard.index');
Route::post('/dashboard/hydration/add', [DashboardController::class, 'addWater'])->name('dashboard.hydration.add');
Route::post('/dashboard/hydration/remove', [DashboardController::class, 'removeWater'])->name('dashboard.hydration.remove');

Route::get('/chat', ChatController::class)->name('chat.index');
Route::post('/chat/log', [ChatController::class, 'store'])->name('chat.store');
Route::delete('/chat/log/{meal}', [ChatController::class, 'destroy'])->name('chat.destroy');

Route::get('/plans', PlansController::class)->name('plans.index');

Route::get('/profile', ProfileController::class)->name('profile.index');
Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
