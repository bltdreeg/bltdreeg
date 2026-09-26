<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Features 7-9: one bill per service event. A reservation resolves to a visit
 * when served; walk-ins have reservation_id/customer_id NULL with name/phone
 * registered by staff. app_sourced is DERIVED (reservation + qr_scan present),
 * not stored. Only app-sourced visits produce a commission_line.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('visits', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->nullable()->constrained('reservations')->nullOnDelete();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->foreignId('qr_scan_id')->nullable()->constrained('qr_scans')->nullOnDelete();
            $table->string('walk_in_name')->nullable();
            $table->string('walk_in_phone_eg')->nullable();
            $table->foreignId('registered_by_employee')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('in_progress');
            $table->decimal('total_price', 10, 2)->default(0);
            $table->decimal('discount_total', 10, 2)->default(0);
            $table->decimal('customer_paid', 10, 2)->default(0);
            $table->decimal('platform_commission', 10, 2)->default(0);
            $table->timestamp('service_started_at')->nullable();
            $table->timestamp('service_finished_at')->nullable();
            $table->timestamps();

            $table->index(['branch_id', 'status']);
            $table->index('customer_id');
        });

        Schema::create('visit_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('visit_id')->constrained('visits')->cascadeOnDelete();
            $table->smallInteger('line_no');
            $table->string('item_type');
            $table->foreignId('service_id')->nullable()->constrained('services')->nullOnDelete();
            $table->foreignId('package_id')->nullable()->constrained('packages')->nullOnDelete();
            $table->decimal('price', 10, 2);
            $table->integer('duration_min');
            $table->timestamps();

            $table->unique(['visit_id', 'line_no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('visit_lines');
        Schema::dropIfExists('visits');
    }
};