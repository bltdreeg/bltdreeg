<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Feature 3 (opening the shop): the live open/closed switch + who flipped it.
 * `suspended` / `discoverable` are DERIVED (overdue invoice) and are NOT stored.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('branches', function (Blueprint $table): void {
            if (! Schema::hasColumn('branches', 'is_open')) {
                $table->boolean('is_open')->default(false)->after('is_active');
            }

            if (! Schema::hasColumn('branches', 'opened_at')) {
                $table->timestamp('opened_at')->nullable()->after('is_open');
            }

            if (! Schema::hasColumn('branches', 'closed_at')) {
                $table->timestamp('closed_at')->nullable()->after('opened_at');
            }

            if (! Schema::hasColumn('branches', 'created_by_emp')) {
                $table->foreignId('created_by_emp')->nullable()->after('closed_at')->constrained('users')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table): void {
            if (Schema::hasColumn('branches', 'created_by_emp')) {
                $table->dropConstrainedForeignId('created_by_emp');
            }

            $columns = array_values(array_filter([
                Schema::hasColumn('branches', 'is_open') ? 'is_open' : null,
                Schema::hasColumn('branches', 'opened_at') ? 'opened_at' : null,
                Schema::hasColumn('branches', 'closed_at') ? 'closed_at' : null,
            ]));

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};