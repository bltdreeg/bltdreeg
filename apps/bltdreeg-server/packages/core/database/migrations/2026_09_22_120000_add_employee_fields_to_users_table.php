<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            if (! Schema::hasColumn('users', 'start_date')) {
                $table->date('start_date')->nullable()->after('avatar');
            }

            if (! Schema::hasColumn('users', 'salary_type')) {
                $table->tinyInteger('salary_type')->default(1)->after('start_date');
            }

            if (! Schema::hasColumn('users', 'salary')) {
                $table->decimal('salary', 10, 2)->default(0)->after('salary_type');
            }
        });

        $this->makeEmailNullable();
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $columns = array_values(array_filter([
                Schema::hasColumn('users', 'start_date') ? 'start_date' : null,
                Schema::hasColumn('users', 'salary_type') ? 'salary_type' : null,
                Schema::hasColumn('users', 'salary') ? 'salary' : null,
            ]));

            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }

    private function makeEmailNullable(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'sqlite') {
            // SQLite rebuilds columns via Laravel schema operations; skip when already nullable.
            return;
        }

        if ($driver === 'pgsql') {
            DB::statement('ALTER TABLE users ALTER COLUMN email DROP NOT NULL');

            return;
        }

        // MySQL / MariaDB
        DB::statement('ALTER TABLE users MODIFY email VARCHAR(255) NULL');
    }
};
