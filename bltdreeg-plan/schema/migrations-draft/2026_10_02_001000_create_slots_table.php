<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Feature 1: bookable time moments on a chair with admin-set capacity (default
 * 1). A full slot is no longer bookable (app-enforced against the reservation
 * count). `full` is DERIVED and not stored. Slots are NOT gated by branch
 * open/close — only join-now is.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('slots', function (Blueprint $table) {
            $table->id();
            $table->foreignId('chair_id')->constrained('chairs')->cascadeOnDelete();
            $table->date('day');
            $table->time('start_at');
            $table->smallInteger('capacity')->default(1);
            $table->foreignId('created_by_employee')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['chair_id', 'day', 'start_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('slots');
    }
};