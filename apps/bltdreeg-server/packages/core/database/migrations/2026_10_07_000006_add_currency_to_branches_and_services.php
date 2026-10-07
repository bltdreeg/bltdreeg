<?php

use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('branches', function (Blueprint $table): void {
            $table->unsignedTinyInteger('currency')->default(CurrencyEnum::EGP->value)->after('location_source');
        });

        Schema::table('services', function (Blueprint $table): void {
            $table->unsignedTinyInteger('currency')->default(CurrencyEnum::EGP->value)->after('price');
        });
    }

    public function down(): void
    {
        Schema::table('services', function (Blueprint $table): void {
            $table->dropColumn('currency');
        });

        Schema::table('branches', function (Blueprint $table): void {
            $table->dropColumn('currency');
        });
    }
};
