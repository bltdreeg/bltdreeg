<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Features 2/10: independent rating for a barber (per salon profile) or a salon,
 * submitted by an app customer with a completed QR-verified visit. Once per visit
 * per target. Walk-ins cannot rate. The unique covers (visit, target_type, target
 * ids); because target ids are nullable, a second same-visit rating for the same
 * target is also blocked app-side (single post-visit form).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ratings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('visit_id')->constrained('visits')->cascadeOnDelete();
            $table->string('target_type');
            $table->foreignId('barber_profile_id')->nullable()->constrained('barber_profiles')->nullOnDelete();
            $table->foreignId('tenant_id')->nullable()->constrained('tenants')->cascadeOnDelete();
            $table->smallInteger('stars');
            $table->text('comment')->nullable();
            $table->timestamps();

            $table->unique(
                ['visit_id', 'target_type', 'barber_profile_id', 'tenant_id'],
                'ratings_visit_target_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ratings');
    }
};