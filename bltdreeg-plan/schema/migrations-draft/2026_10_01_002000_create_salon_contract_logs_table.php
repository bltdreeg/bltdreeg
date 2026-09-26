<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Feature 7 (revenue model) Q3: contract renegotiations apply to new bookings
 * only. Every terms change is recorded here as an auditable history row with
 * an effective_at date; bookings snapshot live from this history.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salon_contract_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->decimal('contract_discount_pct', 5, 2);
            $table->date('effective_at');
            $table->timestamp('recorded_at')->nullable();
            $table->timestamps();

            $table->index('tenant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salon_contract_logs');
    }
};