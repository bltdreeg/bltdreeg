<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // An email that was only pending becomes the (unverified) email, unless it would collide with an existing one.
        DB::table('customers')
            ->whereNull('email')
            ->whereNotNull('pending_email')
            ->orderBy('id')
            ->each(function ($customer) {
                if (! DB::table('customers')->where('email', $customer->pending_email)->exists()) {
                    DB::table('customers')->where('id', $customer->id)->update(['email' => $customer->pending_email]);
                }
            });

        Schema::table('customers', function (Blueprint $table) {
            $table->dropColumn('pending_email');
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table) {
            $table->string('pending_email')->nullable()->after('email_verified_at');
        });
    }
};
