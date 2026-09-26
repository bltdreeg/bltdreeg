<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Feature 7/8: one commission line per QR-verified (app-sourced) visit. NULL
 * until the monthly invoice attaches it. Rounding differences go to the
 * platform (platform_share). The invoice only issues at >= 3 accumulated
 * un-invoiced lines.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('commission_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visit_id')->constrained('visits')->cascadeOnDelete();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->foreignId('invoice_id')->nullable()->constrained('invoices')->nullOnDelete();
            $table->decimal('total_price', 10, 2);
            $table->decimal('discount_total', 10, 2);
            $table->decimal('customer_share', 10, 2);
            $table->decimal('platform_share', 10, 2);
            $table->timestamps();

            $table->unique('visit_id');
            $table->index(['tenant_id', 'invoice_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('commission_lines');
    }
};