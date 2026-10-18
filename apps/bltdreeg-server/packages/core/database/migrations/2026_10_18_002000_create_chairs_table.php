<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Feature 1/3/4: a chair is a physical workstation at a branch. The queue and
 * the slots belong to the chair. status: active | off | disabled_emergency.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chairs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->smallInteger('position_no');
            $table->string('status')->default('active');
            $table->foreignId('toggled_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('toggled_at')->nullable();
            $table->timestamps();

            $table->unique(['branch_id', 'position_no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chairs');
    }
};