<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Exactly one of service_id / package_id is set. Name, price and duration are
 * snapshotted at booking time, so a later catalog change never alters an existing
 * booking (spec §4.9).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('booking_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('booking_id')->constrained('bookings')->cascadeOnDelete();
            $table->foreignId('service_id')->nullable()->constrained('services')->nullOnDelete();
            $table->foreignId('package_id')->nullable()->constrained('packages')->nullOnDelete();
            $table->json('name_snapshot');
            $table->decimal('price_snapshot', 10, 2);
            $table->integer('duration_snapshot');
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();

            $table->index('booking_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('booking_items');
    }
};
