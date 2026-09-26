<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Feature 6 + user decision: identical divergence pattern as branch_services,
 * applied to packages. A branch overrides package price/duration; NULL = inherit
 * the salon-level package value (coalesce(branch_packages.*, packages.*)).
 * Keeps wait arithmetic and discount base consistent with the branch's actual
 * component service durations.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('branch_packages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->foreignId('package_id')->constrained('packages')->cascadeOnDelete();
            $table->decimal('price', 10, 2)->nullable();
            $table->integer('duration')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->unique(['branch_id', 'package_id']);
            $table->index('tenant_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('branch_packages');
    }
};