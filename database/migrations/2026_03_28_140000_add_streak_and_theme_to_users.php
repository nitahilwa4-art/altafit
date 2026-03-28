<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedInteger('current_streak')->default(0)->after('reminders_enabled');
            $table->unsignedInteger('longest_streak')->default(0)->after('current_streak');
            $table->date('last_logged_date')->nullable()->after('longest_streak');
            $table->string('theme', 10)->default('light')->after('last_logged_date');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['current_streak', 'longest_streak', 'last_logged_date', 'theme']);
        });
    }
};
