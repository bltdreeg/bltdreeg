<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Feature 5: the customer-facing notification center (mirrors every push) plus
 * muteability preferences and global platform settings.
 * - notifications.recipient_type is 'customer' only for now (kept for symmetry).
 * - Turn-critical types (you_next, skipped, swap_ask) are NEVER muted app-side;
 *   notification_prefs may hold only informational types.
 * - platform_settings holds qr_rotation_minutes, split_customer_pct,
 *   split_platform_pct, invoice_due_days, ranking_min_ratings.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->string('recipient_type')->default('customer');
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->string('type');
            $table->string('category');
            $table->text('body');
            $table->boolean('read')->default(false);
            $table->timestamps();

            $table->index(['customer_id', 'read']);
        });

        Schema::create('notification_prefs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->string('type');
            $table->boolean('muted')->default(false);
            $table->timestamps();

            $table->unique(['customer_id', 'type']);
        });

        Schema::create('platform_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique();
            $table->json('value')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('platform_settings');
        Schema::dropIfExists('notification_prefs');
        Schema::dropIfExists('notifications');
    }
};