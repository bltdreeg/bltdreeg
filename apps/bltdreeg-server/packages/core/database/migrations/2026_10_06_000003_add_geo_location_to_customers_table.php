<?php

use Bltdreeg\Core\Modules\Geo\Enums\LocationSourceEnum;
use Bltdreeg\Core\Modules\Geo\Support\EgyptBounds;
use Bltdreeg\Core\Modules\Geo\Support\LocationResolver;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('customers', function (Blueprint $table): void {
            $table->char('governorate_id', 4)->nullable()->after('last_lng');
            $table->char('city_id', 6)->nullable()->after('governorate_id');
            $table->char('area_id', 8)->nullable()->after('city_id');
            $table->timestamp('location_confirmed_at')->nullable()->after('location_updated_at');
        });

        $resolver = app(LocationResolver::class);

        DB::table('customers')->orderBy('id')->chunkById(200, function ($customers) use ($resolver): void {
            foreach ($customers as $customer) {
                $source = LocationSourceEnum::tryFrom((int) $customer->location_source);
                $hasPoint = is_numeric($customer->last_lat) && is_numeric($customer->last_lng)
                    && EgyptBounds::contains((float) $customer->last_lat, (float) $customer->last_lng);

                $location = $hasPoint
                    ? $resolver->nearest((float) $customer->last_lat, (float) $customer->last_lng, $source ?? LocationSourceEnum::Gps)
                    : $resolver->fallback();

                // اللي ادّى موقع GPS أو حطّه بإيده قبل كده ميتسألش تاني
                $alreadyChosen = $hasPoint && in_array($source, [LocationSourceEnum::Gps, LocationSourceEnum::Manual], true);

                DB::table('customers')->where('id', $customer->id)->update([
                    ...$location->toCustomerColumns(),
                    'location_confirmed_at' => $alreadyChosen ? now() : null,
                ]);
            }
        });

        Schema::table('customers', function (Blueprint $table): void {
            $table->char('governorate_id', 4)->nullable(false)->change();
            $table->char('city_id', 6)->nullable(false)->change();
            $table->char('area_id', 8)->nullable(false)->change();
            $table->decimal('last_lat', 10, 7)->nullable(false)->change();
            $table->decimal('last_lng', 10, 7)->nullable(false)->change();
            $table->unsignedTinyInteger('location_source')->nullable(false)->change();

            $table->foreign('governorate_id')->references('id')->on('geo_governorates')->restrictOnDelete();
            $table->foreign('city_id')->references('id')->on('geo_cities')->restrictOnDelete();
            $table->foreign('area_id')->references('id')->on('geo_areas')->restrictOnDelete();
            $table->index(['governorate_id', 'city_id']);
        });
    }

    public function down(): void
    {
        Schema::table('customers', function (Blueprint $table): void {
            $table->dropForeign(['governorate_id']);
            $table->dropForeign(['city_id']);
            $table->dropForeign(['area_id']);
            $table->dropIndex(['governorate_id', 'city_id']);
        });

        Schema::table('customers', function (Blueprint $table): void {
            $table->dropColumn(['governorate_id', 'city_id', 'area_id', 'location_confirmed_at']);
            $table->decimal('last_lat', 10, 7)->nullable()->change();
            $table->decimal('last_lng', 10, 7)->nullable()->change();
            $table->unsignedTinyInteger('location_source')->nullable()->change();
        });
    }
};
