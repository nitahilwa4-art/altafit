<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->date('target_date')->nullable()->after('tip');
            $table->unsignedSmallInteger('weekly_rate')->default(0)->after('target_date');
            $table->date('estimated_date')->nullable()->after('weekly_rate');
        });
    }

    public function down(): void
    {
        Schema::table('plans', function (Blueprint $table) {
            $table->dropColumn(['target_date', 'weekly_rate', 'estimated_date']);
        });
    }
};
