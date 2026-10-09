<?php

use Bltdreeg\Core\Modules\Booking\Enums\BookingSourceEnum;
use Bltdreeg\Core\Modules\Booking\Enums\BookingStatusEnum;
use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * An appointment: a reserved range on a barber (spec §4.8). The queue number is
 * never stored — it is derived from start order (ADR 0004).
 *
 * customer_id is nullable because dashboard bookings carry only a free-text name
 * and phone; app bookings always have a customer.
 *
 * gap_minutes is a snapshot: raising a barber's gap later must not retroactively
 * invalidate bookings taken under the old gap.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->foreignId('barber_user_id')->constrained('users')->restrictOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('customers')->nullOnDelete();
            $table->string('guest_name')->nullable();
            $table->string('guest_phone')->nullable();
            $table->string('source')->default(BookingSourceEnum::App->value);
            $table->string('status')->default(BookingStatusEnum::Confirmed->value);
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->unsignedSmallInteger('duration_minutes');
            $table->unsignedSmallInteger('gap_minutes')->default(0);
            $table->decimal('total_price', 10, 2)->default(0);
            $table->unsignedTinyInteger('currency')->default(CurrencyEnum::EGP->value);
            $table->string('booking_code')->unique();
            $table->text('notes')->nullable();
            $table->boolean('is_forced')->default(false);
            $table->foreignId('created_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('cancelled_at')->nullable();
            $table->boolean('cancelled_by_customer')->nullable();
            $table->foreignId('rescheduled_from_id')->nullable()->constrained('bookings')->nullOnDelete();
            $table->timestamps();

            $table->index(['branch_id', 'starts_at']);
            $table->index(['barber_user_id', 'starts_at']);
            $table->index(['customer_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
