<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Feature 1/6: ordered items of a reservation (service changeable any time
 * before the barber starts). Price and duration are LOCKED at booking and drive
 * wait arithmetic live; item_type: service | package.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservation_lines', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->constrained('reservations')->cascadeOnDelete();
            $table->smallInteger('line_no');
            $table->string('item_type');
            $table->foreignId('service_id')->nullable()->constrained('services')->nullOnDelete();
            $table->foreignId('package_id')->nullable()->constrained('packages')->nullOnDelete();
            $table->decimal('price_at_booking', 10, 2);
            $table->integer('duration_at_booking');
            $table->timestamps();

            $table->unique(['reservation_id', 'line_no']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('reservation_lines');
    }
};