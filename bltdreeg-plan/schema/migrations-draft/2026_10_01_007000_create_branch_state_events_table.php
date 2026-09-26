<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Feature 3: audit log of every open/close switch on a branch. branches.is_open
 * is the live state; this table keeps who flipped it and when.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branch_state_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->string('state');
            $table->foreignId('actor_employee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('at')->nullable();
            $table->timestamps();

            $table->index('branch_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branch_state_events');
    }
};