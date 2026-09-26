<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Feature 6 + user decision: per-branch catalog divergence. The salon-level
 * `services` row stays the copy-on-take template (from platform catalog_services);
 * each branch diverges via its own row. NULL price/duration = inherit the
 * salon-level value (resolved as coalesce(branch_services.*, services.*)).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branch_services', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->foreignId('service_id')->constrained('services')->cascadeOnDelete();
            $table->decimal('price', 10, 2)->nullable();
            $table->integer('duration')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['branch_id', 'service_id']);
            $table->index('tenant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branch_services');
    }
};