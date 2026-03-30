<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->unsignedTinyInteger('age')->nullable()->after('fat_goal_g');
            $table->unsignedSmallInteger('height_cm')->nullable()->after('age');
            $table->enum('gender', ['male', 'female', 'other', 'prefer_not'])->nullable()->after('height_cm');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['age', 'height_cm', 'gender']);
        });
    }
};
