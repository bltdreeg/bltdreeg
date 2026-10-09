<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Weekly bookable windows, branch-local wall clock (spec §4.6). Multiple rows per
 * weekday are expected: two windows are a split shift, and a lunch break is the
 * space between them. Branches have no opening-hours columns, so these windows are
 * the only source of bookable time.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barber_schedules', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedTinyInteger('weekday'); // 0 = Sunday
            $table->time('start_time');
            $table->time('end_time');
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['branch_id', 'user_id', 'weekday', 'start_time']);
            $table->index(['branch_id', 'user_id', 'weekday']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barber_schedules');
    }
};
