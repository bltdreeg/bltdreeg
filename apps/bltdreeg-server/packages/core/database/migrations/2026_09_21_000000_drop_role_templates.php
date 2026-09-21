<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('roles', 'role_template_id')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->dropForeign(['role_template_id']);
                $table->dropColumn('role_template_id');
            });
        }

        Schema::dropIfExists('role_templates');
    }

    public function down(): void
    {
        if (! Schema::hasTable('role_templates')) {
            Schema::create('role_templates', function (Blueprint $table) {
                $table->id();
                $table->string('name')->unique();
                $table->text('description')->nullable();
                $table->json('permissions')->nullable();
                $table->boolean('is_active')->default(true);
                $table->timestamps();
            });
        }

        if (! Schema::hasColumn('roles', 'role_template_id')) {
            Schema::table('roles', function (Blueprint $table) {
                $table->foreignId('role_template_id')->nullable()->constrained('role_templates')->nullOnDelete();
            });
        }
    }
};
