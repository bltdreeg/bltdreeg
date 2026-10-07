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
            // مش بعد location_source: العمود ده (وده اللي بيحتاجه) بييجي بعد ميجريشن الـ geo، مش قبلها
            $table->unsignedTinyInteger('currency')->default(CurrencyEnum::EGP->value)->after('is_active');
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
