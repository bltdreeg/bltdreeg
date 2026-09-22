<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('employee_attendances')) {
            return;
        }

        if ($this->hasIndex('employee_attendances_user_id_date_unique')) {
            Schema::table('employee_attendances', function (Blueprint $table): void {
                $table->dropUnique('employee_attendances_user_id_date_unique');
            });
        }

        if (! $this->hasIndex('employee_attendances_tenant_id_user_id_date_unique')) {
            Schema::table('employee_attendances', function (Blueprint $table): void {
                $table->unique(['tenant_id', 'user_id', 'date']);
            });
        }
    }

    public function down(): void
    {
        if (! Schema::hasTable('employee_attendances')) {
            return;
        }

        if ($this->hasIndex('employee_attendances_tenant_id_user_id_date_unique')) {
            Schema::table('employee_attendances', function (Blueprint $table): void {
                $table->dropUnique('employee_attendances_tenant_id_user_id_date_unique');
            });
        }

        if (! $this->hasIndex('employee_attendances_user_id_date_unique')) {
            Schema::table('employee_attendances', function (Blueprint $table): void {
                $table->unique(['user_id', 'date']);
            });
        }
    }

    private function hasIndex(string $indexName): bool
    {
        $driver = Schema::getConnection()->getDriverName();

        if ($driver === 'sqlite') {
            $indexes = DB::select("PRAGMA index_list('employee_attendances')");

            return collect($indexes)->contains(fn ($index): bool => ($index->name ?? null) === $indexName);
        }

        if ($driver === 'pgsql') {
            return DB::table('pg_indexes')
                ->where('tablename', 'employee_attendances')
                ->where('indexname', $indexName)
                ->exists();
        }

        $database = Schema::getConnection()->getDatabaseName();

        return DB::table('information_schema.statistics')
            ->where('table_schema', $database)
            ->where('table_name', 'employee_attendances')
            ->where('index_name', $indexName)
            ->exists();
    }
};
