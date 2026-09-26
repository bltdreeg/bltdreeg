<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Feature 9: the presence proof + checked-in trigger. Scanning happens from the
 * customer's own device; the assisted path (method='assisted') is the staff-logged
 * fallback when the customer's phone fails. A scan never reorders the queue.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qr_scans', function (Blueprint $table) {
            $table->id();
            $table->foreignId('reservation_id')->nullable()->constrained('reservations')->nullOnDelete();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('qr_rotation_id')->nullable()->constrained('qr_rotations')->nullOnDelete();
            $table->string('method')->default('scan');
            $table->foreignId('assisted_by_employee')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('scanned_at')->nullable();
            $table->timestamps();

            $table->index(['customer_id', 'scanned_at']);
            $table->index(['qr_rotation_id', 'scanned_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qr_scans');
    }
};