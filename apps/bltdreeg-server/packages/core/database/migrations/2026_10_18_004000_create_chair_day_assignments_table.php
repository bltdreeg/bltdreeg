<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Feature 3: the day's roster. On any given day the salon seats a barber on a
 * chair; the chair's queue/slots carry that day's customers. check_in_at null =
 * not checked in; the chair's queue runs only while the barber is checked in.
 * Note: HR employee_attendances remains a separate HR record (feature scope).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('chair_day_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->foreignId('chair_id')->constrained('chairs')->cascadeOnDelete();
            $table->foreignId('barber_profile_id')->constrained('barber_profiles')->cascadeOnDelete();
            $table->date('day');
            $table->timestamp('check_in_at')->nullable();
            $table->timestamp('check_out_at')->nullable();
            $table->foreignId('created_by_emp')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['branch_id', 'chair_id', 'day']);
            $table->index(['barber_profile_id', 'day']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('chair_day_assignments');
    }
};