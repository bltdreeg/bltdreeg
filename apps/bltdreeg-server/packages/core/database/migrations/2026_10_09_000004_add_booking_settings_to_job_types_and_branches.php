<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * A bookable barber is an employee whose job type is flagged bookable (spec §4.4) —
 * no separate barber entity. The flag lives on both the tenant's job types and the
 * platform catalog, so an imported job type carries it over.
 *
 * The branch columns are the booking windows and the defaults that prefill a new
 * barber's settings.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('job_types', function (Blueprint $table): void {
            $table->boolean('is_bookable')->default(false)->after('is_active');
        });

        Schema::table('catalog_job_types', function (Blueprint $table): void {
            $table->boolean('is_bookable')->default(false)->after('is_active');
        });

        Schema::table('branches', function (Blueprint $table): void {
            $table->unsignedSmallInteger('booking_days_ahead')->default(14);
            $table->unsignedSmallInteger('booking_min_notice_minutes')->default(60);
            $table->unsignedSmallInteger('booking_cancel_cutoff_minutes')->default(120);
            $table->unsignedSmallInteger('booking_slot_step_minutes')->default(15);
            $table->unsignedSmallInteger('booking_gap_minutes')->default(0);
        });

        $this->flagHairCuttingJobTypes();
    }

    /**
     * The flag defaults to false, so an already-seeded platform catalog would leave
     * every tenant with no bookable barber at all. Mark the hair-cutting roles, in
     * the catalog and in the tenant job types already imported from it.
     */
    private function flagHairCuttingJobTypes(): void
    {
        $names = ['Barber', 'Hair stylist'];

        DB::table('catalog_job_types')->whereIn('name', $names)->update(['is_bookable' => true]);
        DB::table('job_types')->whereIn('name', $names)->update(['is_bookable' => true]);
    }

    public function down(): void
    {
        Schema::table('job_types', fn (Blueprint $table) => $table->dropColumn('is_bookable'));
        Schema::table('catalog_job_types', fn (Blueprint $table) => $table->dropColumn('is_bookable'));

        Schema::table('branches', function (Blueprint $table): void {
            $table->dropColumn([
                'booking_days_ahead',
                'booking_min_notice_minutes',
                'booking_cancel_cutoff_minutes',
                'booking_slot_step_minutes',
                'booking_gap_minutes',
            ]);
        });
    }
};
