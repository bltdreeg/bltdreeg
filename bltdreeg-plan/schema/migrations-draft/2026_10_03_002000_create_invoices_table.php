<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Feature 8: monthly invoice issued on the 1st for the previous calendar month(s),
 * only when accumulated commission lines >= 3 (else rolls over). Paid in full or
 * stays due — NO partial state. gateway_transactions records the webhook/lookup
 * payment; gateway_ref is globally unique so retries never double-record.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->date('period_start');
            $table->date('period_end');
            $table->date('issued_at');
            $table->string('status')->default('due');
            $table->decimal('app_share', 10, 2);
            $table->decimal('transfer_fee', 10, 2)->default(0);
            $table->decimal('total_to_pay', 10, 2);
            $table->integer('visit_count')->default(0);
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['tenant_id', 'status']);
        });

        Schema::create('gateway_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('invoice_id')->constrained('invoices')->cascadeOnDelete();
            $table->string('type');
            $table->string('gateway_ref')->unique();
            $table->string('method');
            $table->decimal('amount', 10, 2);
            $table->timestamp('executed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('gateway_transactions');
        Schema::dropIfExists('invoices');
    }
};