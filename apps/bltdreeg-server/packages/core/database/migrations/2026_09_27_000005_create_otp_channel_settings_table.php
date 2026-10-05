<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('otp_channel_settings', function (Blueprint $table) {
            $table->id();
            $table->string('channel', 20)->unique();
            $table->boolean('is_enabled')->default(false);
            $table->json('providers');
            $table->unsignedSmallInteger('sort')->default(0);
            $table->timestamps();
        });

        $now = now();
        DB::table('otp_channel_settings')->insert([
            [
                'channel' => 'whatsapp',
                'is_enabled' => true,
                'providers' => json_encode(['log']),
                'sort' => 1,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'channel' => 'sms',
                'is_enabled' => true,
                'providers' => json_encode(['log']),
                'sort' => 2,
                'created_at' => $now,
                'updated_at' => $now,
            ],
            [
                'channel' => 'email',
                'is_enabled' => true,
                'providers' => json_encode(['mail']),
                'sort' => 3,
                'created_at' => $now,
                'updated_at' => $now,
            ],
        ]);
    }

    public function down(): void
    {
        Schema::dropIfExists('otp_channel_settings');
    }
};
