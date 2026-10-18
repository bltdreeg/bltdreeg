<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Feature 2: barber profiles are salon-owned, never deleted (deactivated only).
 * A profile pair is per (salon, barber); moving salons = a new profile and the
 * rating restarts at zero. leaving_status: active | absent.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('barber_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('name');
            $table->text('photo_url')->nullable();
            $table->boolean('is_active')->default(true);
            $table->foreignId('default_chair_id')->nullable()->constrained('chairs')->nullOnDelete();
            $table->string('leaving_status')->default('active');
            $table->timestamps();

            $table->index('tenant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('barber_profiles');
    }
};