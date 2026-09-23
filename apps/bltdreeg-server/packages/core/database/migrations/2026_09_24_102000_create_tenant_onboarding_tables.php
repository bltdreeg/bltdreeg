<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('tenant_onboarding_submissions')) {
            Schema::create('tenant_onboarding_submissions', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
                $table->foreignId('submitted_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->json('payload');
                $table->string('status')->default('pending');
                $table->foreignId('reviewed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
                $table->timestamp('reviewed_at')->nullable();
                $table->text('decline_reason')->nullable();
                $table->unsignedInteger('revision');
                $table->timestamps();

                $table->unique(['tenant_id', 'revision']);
                $table->index('status');
            });
        }

        if (! Schema::hasTable('tenant_legal_documents')) {
            Schema::create('tenant_legal_documents', function (Blueprint $table): void {
                $table->id();
                $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
                $table->foreignId('submission_id')->nullable()->constrained('tenant_onboarding_submissions')->nullOnDelete();
                $table->string('type');
                $table->string('file_path');
                $table->string('original_filename')->nullable();
                $table->string('status')->default('pending');
                $table->text('rejection_reason')->nullable();
                $table->timestamps();

                $table->index('tenant_id');
            });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('tenant_legal_documents');
        Schema::dropIfExists('tenant_onboarding_submissions');
    }
};
