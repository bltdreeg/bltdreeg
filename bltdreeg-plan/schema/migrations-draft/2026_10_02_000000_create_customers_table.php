<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * SUPERSEDED (2026-09-27) by the customer auth spec §4:
 * apps/bltdreeg-server/docs/superpowers/specs/2026-09-27-customer-auth-api-design.md
 *
 * Feature 1: the customer's app account, kept separate from the staff `users`
 * table. Registration by phone+OTP OR email+password (both accepted) — so both
 * identifier columns are nullable and at least one is set app-side.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('phone_eg')->nullable()->unique();
            $table->string('email')->nullable()->unique();
            $table->string('password')->nullable();
            $table->string('name')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};