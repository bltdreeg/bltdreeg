<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Feature 1/4/5: lifecycle audit log of a reservation. type: join | auto_join |
 * skip | postpone | absent | cancel | service_change | staff_remove | finish.
 * positions carries 1..3 for postpone/skip; detail is a free-form jsonb-style
 * event payload (e.g. {service_before, service_after}).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('queue_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('reservation_id')->constrained('reservations')->cascadeOnDelete();
            $table->string('type');
            $table->smallInteger('positions')->nullable();
            $table->json('detail')->nullable();
            $table->foreignId('actor_employee_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('at')->nullable();
            $table->timestamps();

            $table->index(['reservation_id', 'at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('queue_events');
    }
};