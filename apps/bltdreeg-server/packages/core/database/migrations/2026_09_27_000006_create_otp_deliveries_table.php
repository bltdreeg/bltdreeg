<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('otp_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('otp_challenge_id')->nullable()->constrained('otp_challenges')->nullOnDelete();
            $table->string('channel', 20);
            $table->string('provider', 50);
            $table->string('recipient_masked');
            $table->string('status', 20); // sent / failed
            $table->string('provider_message_id')->nullable();
            $table->text('error')->nullable();
            $table->timestamp('created_at')->nullable();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('otp_deliveries');
    }
};
