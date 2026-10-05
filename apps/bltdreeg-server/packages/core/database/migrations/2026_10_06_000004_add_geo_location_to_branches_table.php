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
        Schema::table('branches', function (Blueprint $table): void {
            $table->char('governorate_id', 4)->nullable()->after('longitude');
            $table->char('city_id', 6)->nullable()->after('governorate_id');
            $table->char('area_id', 8)->nullable()->after('city_id');
            $table->unsignedTinyInteger('location_source')->nullable()->after('area_id');
        });

        $resolver = app(LocationResolver::class);

        DB::table('branches')->orderBy('id')->chunkById(200, function ($branches) use ($resolver): void {
            foreach ($branches as $branch) {
                // القيم القديمة نصوص ممكن تكون '' أو كلام مش أرقام
                $hasPoint = is_numeric($branch->latitude) && is_numeric($branch->longitude)
                    && EgyptBounds::contains((float) $branch->latitude, (float) $branch->longitude);

                $location = $hasPoint
                    ? $resolver->nearest((float) $branch->latitude, (float) $branch->longitude, LocationSourceEnum::Manual)
                    : $resolver->fallback();

                DB::table('branches')->where('id', $branch->id)->update($location->toBranchColumns());
            }
        });

        Schema::table('branches', function (Blueprint $table): void {
            $table->decimal('latitude', 10, 7)->nullable(false)->change();
            $table->decimal('longitude', 10, 7)->nullable(false)->change();
            $table->char('governorate_id', 4)->nullable(false)->change();
            $table->char('city_id', 6)->nullable(false)->change();
            $table->char('area_id', 8)->nullable(false)->change();
            $table->unsignedTinyInteger('location_source')->nullable(false)->change();

            $table->foreign('governorate_id')->references('id')->on('geo_governorates')->restrictOnDelete();
            $table->foreign('city_id')->references('id')->on('geo_cities')->restrictOnDelete();
            $table->foreign('area_id')->references('id')->on('geo_areas')->restrictOnDelete();
            $table->index(['governorate_id', 'city_id']);
        });
    }

    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table): void {
            $table->dropForeign(['governorate_id']);
            $table->dropForeign(['city_id']);
            $table->dropForeign(['area_id']);
            $table->dropIndex(['governorate_id', 'city_id']);
        });

        Schema::table('branches', function (Blueprint $table): void {
            $table->dropColumn(['governorate_id', 'city_id', 'area_id', 'location_source']);
            $table->string('latitude')->nullable()->change();
            $table->string('longitude')->nullable()->change();
        });
    }
};
