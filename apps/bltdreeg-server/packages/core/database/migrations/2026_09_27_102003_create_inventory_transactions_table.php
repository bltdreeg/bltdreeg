<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->foreignId('inventory_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('type')->default(0);
            $table->decimal('quantity', 12, 3);
            $table->decimal('unit_cost', 12, 2)->nullable();
            $table->decimal('balance_after', 12, 3);
            $table->nullableMorphs('reference');
            $table->text('notes')->nullable();
            $table->timestamps();

            // Named explicitly: the auto-generated name is 70 chars and MySQL caps identifiers at 64.
            $table->index(
                ['tenant_id', 'branch_id', 'product_id', 'created_at'],
                'inventory_transactions_tenant_branch_product_created_index',
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory_transactions');
    }
};
