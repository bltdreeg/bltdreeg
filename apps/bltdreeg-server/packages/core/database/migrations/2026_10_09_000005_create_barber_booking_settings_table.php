<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * One row per (branch, barber), created lazily from the branch defaults on first
 * edit (spec §4.5). Nullable columns mean "use the branch value".
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barber_booking_settings', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->unsignedSmallInteger('slot_step_minutes')->default(15);
            $table->unsignedSmallInteger('gap_minutes')->default(0);
            $table->boolean('is_paused')->default(false);
            $table->unsignedSmallInteger('max_days_ahead')->nullable();
            $table->unsignedSmallInteger('min_notice_minutes')->nullable();
            $table->timestamps();

            $table->unique(['branch_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barber_booking_settings');
    }
};
