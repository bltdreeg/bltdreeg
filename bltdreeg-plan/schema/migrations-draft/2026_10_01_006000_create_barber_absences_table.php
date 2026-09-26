<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Feature 2 absence flow: booked customers of an absent barber are offered swap
 * or cancel, and the salon admin may override at any time. absence rows track
 * the day + reason + resolution.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barber_absences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('barber_profile_id')->constrained('barber_profiles')->cascadeOnDelete();
            $table->date('day');
            $table->string('reason')->nullable();
            $table->boolean('resolved')->default(false);
            $table->foreignId('resolved_by_emp')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['barber_profile_id', 'day']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barber_absences');
    }
};