<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('geo_governorates', function (Blueprint $table): void {
            $table->char('id', 4)->primary();
            $table->json('name');
            $table->decimal('lat', 10, 7);
            $table->decimal('lng', 10, 7);
        });

        Schema::create('geo_cities', function (Blueprint $table): void {
            $table->char('id', 6)->primary();
            $table->char('governorate_id', 4);
            $table->json('name');
            $table->decimal('lat', 10, 7);
            $table->decimal('lng', 10, 7);

            $table->foreign('governorate_id')->references('id')->on('geo_governorates')->restrictOnDelete();
            $table->index('governorate_id');
            $table->index(['lat', 'lng']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('geo_cities');
        Schema::dropIfExists('geo_governorates');
    }
};
