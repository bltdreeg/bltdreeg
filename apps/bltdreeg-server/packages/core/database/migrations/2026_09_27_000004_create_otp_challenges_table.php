<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('otp_challenges', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->string('identifier');
            $table->string('purpose', 32); // register, login, reset_password, verify_phone, verify_email
            $table->string('channel', 20); // whatsapp, sms, email
            $table->foreignId('customer_id')->nullable()->constrained('customers')->cascadeOnDelete();
            $table->string('code_hash');
            $table->unsignedInteger('attempts')->default(0);
            $table->unsignedInteger('send_count')->default(1);
            $table->timestamp('next_resend_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamp('locked_until')->nullable();
            $table->timestamp('consumed_at')->nullable();
            $table->longText('payload')->nullable(); // encrypted:array
            $table->string('reset_token_hash')->nullable();
            $table->timestamp('reset_token_expires_at')->nullable();
            $table->timestamps();

            $table->index(['identifier', 'purpose']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('otp_challenges');
    }
};
