<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Feature 9: one rotating QR per branch, changing every N minutes (window is a
 * platform_setting). A scan must land inside the valid window. code_hash stores
 * the code's payload hash, never the code itself.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('qr_rotations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->text('code_hash');
            $table->timestamp('valid_from')->nullable();
            $table->timestamp('valid_until')->nullable();
            $table->timestamps();

            $table->index(['branch_id', 'valid_until']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('qr_rotations');
    }
};