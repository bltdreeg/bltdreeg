<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('role_templates', function (Blueprint $table): void {
            $table->id();
            $table->string('name')->unique();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::create('role_template_permissions', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('role_template_id')->constrained('role_templates')->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained('permissions')->cascadeOnDelete();
            $table->unique(['role_template_id', 'permission_id']);
        });

        Schema::table('roles', function (Blueprint $table): void {
            $table->foreignId('source_template_id')
                ->nullable()
                ->after('created_by')
                ->constrained('role_templates')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('roles', function (Blueprint $table): void {
            $table->dropConstrainedForeignId('source_template_id');
        });

        Schema::dropIfExists('role_template_permissions');
        Schema::dropIfExists('role_templates');
    }
};
