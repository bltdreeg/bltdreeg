<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private const TABLES = ['catalog_service_categories', 'catalog_services', 'service_categories', 'services'];

    private const LOCALES = ['ar', 'en'];

    public function up(): void
    {
        foreach (self::TABLES as $table) {
            $this->convert($table, toJson: true);

            Schema::table($table, function (Blueprint $blueprint): void {
                $blueprint->json('name')->change();
                $blueprint->json('description')->nullable()->change();
            });
        }
    }

    public function down(): void
    {
        foreach (self::TABLES as $table) {
            Schema::table($table, function (Blueprint $blueprint): void {
                $blueprint->text('name')->change();
                $blueprint->text('description')->nullable()->change();
            });

            $this->convert($table, toJson: false);

            Schema::table($table, function (Blueprint $blueprint): void {
                $blueprint->string('name')->change();
            });
        }
    }

    /**
     * Existing values become the same text in every locale, so nothing disappears from either dashboard.
     */
    private function convert(string $table, bool $toJson): void
    {
        DB::table($table)->orderBy('id')->chunkById(200, function ($rows) use ($table, $toJson): void {
            foreach ($rows as $row) {
                DB::table($table)->where('id', $row->id)->update([
                    'name' => $this->convertValue($row->name, $toJson),
                    'description' => $this->convertValue($row->description, $toJson),
                ]);
            }
        });
    }

    private function convertValue(?string $value, bool $toJson): ?string
    {
        if ($value === null || $value === '') {
            return null;
        }

        if ($toJson) {
            return json_encode(array_fill_keys(self::LOCALES, $value), JSON_UNESCAPED_UNICODE);
        }

        $decoded = json_decode($value, true);

        if (! is_array($decoded)) {
            return $value;
        }

        return $decoded['en'] ?? $decoded['ar'] ?? (string) reset($decoded);
    }
};
