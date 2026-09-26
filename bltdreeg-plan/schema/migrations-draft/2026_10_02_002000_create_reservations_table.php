<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Feature 1: the queue IS the reservations table — position is a live projection
 * over join_time, never stored. type: join_now | slot. status: booked | queued |
 * in_service | served | cancelled | removed. absence_state: ok | skipped |
 * absent_once | postponed (two-strike skip, one postpone).
 *
 * Invariant "one active live-queue reservation per customer" is enforced as a
 * PostgreSQL partial unique index; MySQL/MariaDB/SQLite do not support partial
 * indexes, so there it is enforced in the queue engine (documented in
 * schema-notes.md).
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('reservations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained('customers')->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->foreignId('chair_id')->constrained('chairs')->cascadeOnDelete();
            $table->foreignId('slot_id')->nullable()->constrained('slots')->nullOnDelete();
            $table->string('type')->default('join_now');
            $table->timestamp('join_time')->nullable();
            $table->string('status')->default('booked');
            $table->string('source')->default('app');
            $table->decimal('snapshot_discount_pct', 5, 2)->nullable();
            $table->smallInteger('snapshot_customer_split')->nullable();
            $table->smallInteger('snapshot_platform_split')->nullable();
            $table->string('absence_state')->default('ok');
            $table->boolean('postpone_used')->default(false);
            $table->timestamp('cancel_at')->nullable();
            $table->timestamps();

            $table->unique(['customer_id', 'slot_id']);
            $table->index(['branch_id', 'status']);
            $table->index(['chair_id', 'status']);
            $table->index(['customer_id', 'status']);
            $table->index(['slot_id', 'status']);
        });

        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'pgsql') {
            DB::statement(
                "CREATE UNIQUE INDEX reservations_one_live_queue_per_customer
                 ON reservations (customer_id)
                 WHERE type = 'join_now' AND status IN ('booked', 'queued', 'in_service')"
            );
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('reservations');
    }
};