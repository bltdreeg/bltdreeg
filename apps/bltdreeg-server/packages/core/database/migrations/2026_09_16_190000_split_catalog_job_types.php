<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('catalog_job_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        Schema::table('job_types', function (Blueprint $table) {
            $table->foreignId('catalog_job_type_id')->nullable()->constrained('catalog_job_types')->nullOnDelete();
        });

        $idMap = [];

        foreach (DB::table('job_types')->whereNull('tenant_id')->get() as $row) {
            $catalogId = DB::table('catalog_job_types')->insertGetId([
                'name' => $row->name,
                'description' => $row->description,
                'is_active' => $row->is_active,
                'created_at' => $row->created_at,
                'updated_at' => $row->updated_at,
            ]);

            $idMap[(int) $row->id] = $catalogId;
        }

        foreach (DB::table('tenant_user')->whereNotNull('job_type_id')->get() as $pivot) {
            $jobType = DB::table('job_types')->where('id', $pivot->job_type_id)->first();

            if ($jobType === null || $jobType->tenant_id !== null) {
                continue;
            }

            $catalogId = $idMap[(int) $jobType->id] ?? null;

            if ($catalogId === null) {
                continue;
            }

            $copy = DB::table('job_types')
                ->where('tenant_id', $pivot->tenant_id)
                ->where('catalog_job_type_id', $catalogId)
                ->first();

            if ($copy === null) {
                $copyId = DB::table('job_types')->insertGetId([
                    'tenant_id' => $pivot->tenant_id,
                    'catalog_job_type_id' => $catalogId,
                    'name' => $jobType->name,
                    'description' => $jobType->description,
                    'is_active' => $jobType->is_active,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            } else {
                $copyId = $copy->id;
            }

            DB::table('tenant_user')->where('id', $pivot->id)->update(['job_type_id' => $copyId]);
        }

        if ($idMap !== []) {
            DB::table('tenant_user')
                ->whereIn('job_type_id', array_keys($idMap))
                ->update(['job_type_id' => null]);
        }

        DB::table('job_types')->whereNull('tenant_id')->delete();

        Schema::table('job_types', function (Blueprint $table) {
            $table->unique(['tenant_id', 'catalog_job_type_id']);
        });
    }

    public function down(): void
    {
        Schema::table('job_types', function (Blueprint $table) {
            $table->dropUnique(['tenant_id', 'catalog_job_type_id']);
            $table->dropConstrainedForeignId('catalog_job_type_id');
        });

        Schema::dropIfExists('catalog_job_types');
    }
};
