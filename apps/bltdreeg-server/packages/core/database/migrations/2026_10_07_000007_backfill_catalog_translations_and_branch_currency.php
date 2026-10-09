<?php

use Bltdreeg\Core\Modules\Catalog\Support\Catalog;
use Bltdreeg\Core\Modules\Geo\Support\CurrencyResolver;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $this->translateCatalog('catalog_service_categories', 'service_categories', 'catalog_service_category_id', array_values(Catalog::CATEGORIES));
        $this->translateCatalog('catalog_services', 'services', 'catalog_service_id', Catalog::SERVICES);
        $this->backfillBranchCurrency();
    }

    public function down(): void
    {
        // The translations and currencies are data, not structure: nothing to undo.
    }

    /**
     * Rows created before translations existed hold the same text in every locale. Only those untouched placeholders
     * are replaced, so a name an owner already translated by hand stays as it is.
     *
     * @param  list<array{name: array<string, string>, description: array<string, string>}>  $known
     */
    private function translateCatalog(string $catalogTable, string $tenantTable, string $catalogColumn, array $known): void
    {
        foreach ($known as $entry) {
            $catalogIds = DB::table($catalogTable)->where('name->en', $entry['name']['en'])->pluck('id');

            foreach ($catalogIds as $catalogId) {
                $this->replacePlaceholder($catalogTable, 'id', $catalogId, $entry);
            }

            foreach ($catalogIds as $catalogId) {
                $tenantRows = DB::table($tenantTable)->where($catalogColumn, $catalogId)->pluck('id');

                foreach ($tenantRows as $id) {
                    $this->replacePlaceholder($tenantTable, 'id', $id, $entry);
                }
            }
        }
    }

    /**
     * @param  array{name: array<string, string>, description: array<string, string>}  $entry
     */
    private function replacePlaceholder(string $table, string $key, int|string $id, array $entry): void
    {
        $row = DB::table($table)->where($key, $id)->first();
        $name = json_decode((string) $row->name, true);
        $description = json_decode((string) $row->description, true);

        $update = [];

        if ($this->isPlaceholder($name)) {
            $update['name'] = json_encode($entry['name'], JSON_UNESCAPED_UNICODE);
        }

        if ($description === null || $this->isPlaceholder($description)) {
            $update['description'] = json_encode($entry['description'], JSON_UNESCAPED_UNICODE);
        }

        if ($update !== []) {
            DB::table($table)->where($key, $id)->update($update);
        }
    }

    /**
     * @param  array<string, string>|null  $translations
     */
    private function isPlaceholder(?array $translations): bool
    {
        return is_array($translations)
            && isset($translations['en'], $translations['ar'])
            && $translations['en'] === $translations['ar'];
    }

    private function backfillBranchCurrency(): void
    {
        DB::table('branches')->orderBy('id')->chunkById(200, function ($branches): void {
            foreach ($branches as $branch) {
                if (! is_numeric($branch->latitude) || ! is_numeric($branch->longitude)) {
                    continue;
                }

                DB::table('branches')->where('id', $branch->id)->update([
                    'currency' => CurrencyResolver::forCoordinates((float) $branch->latitude, (float) $branch->longitude)->value,
                ]);
            }
        });
    }
};
