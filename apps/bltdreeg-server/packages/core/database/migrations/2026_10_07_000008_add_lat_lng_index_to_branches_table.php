<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * فهرس عادي، مش SPATIAL INDEX حقيقي — ده محتاج عمود POINT/geometry مش decimal lat/lng، وهتغيير أكبر.
     * ده بيساعد الـ query planner في أي bounding-box prefilter قدام ST_Distance_Sphere لو احتجناه بعدين،
     * وبيفيد كمان أي فلترة بسيطة بالمحافظة/المدينة على lat/lng.
     */
    public function up(): void
    {
        Schema::table('branches', function (Blueprint $table): void {
            $table->index(['latitude', 'longitude']);
        });
    }

    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table): void {
            $table->dropIndex(['latitude', 'longitude']);
        });
    }
};
