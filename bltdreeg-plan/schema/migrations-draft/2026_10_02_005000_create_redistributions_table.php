<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Feature 4: emergency chair disabling — displaced customers move to live chairs
 * in the SAME branch only, merged purely by join time. mode: ask_first |
 * swap_then_notify. status: offered | accepted | declined | cancelled | placed.
 * impact_preview stores the positions/waits consumers saw before confirming.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('redistributions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('reservation_id')->constrained('reservations')->cascadeOnDelete();
            $table->foreignId('from_chair_id')->constrained('chairs')->cascadeOnDelete();
            $table->foreignId('to_chair_id')->nullable()->constrained('chairs')->nullOnDelete();
            $table->string('mode');
            $table->string('status')->default('offered');
            $table->foreignId('decided_by_emp')->nullable()->constrained('users')->nullOnDelete();
            $table->json('impact_preview')->nullable();
            $table->timestamps();

            $table->index(['from_chair_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('redistributions');
    }
};