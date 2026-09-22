<?php

namespace App\Modules\V1\Services\Filament\Resources\ServiceCategories\Pages;

use App\Modules\V1\Services\Filament\Resources\ServiceCategories\ServiceCategoryResource;
use App\Modules\V1\Services\Models\ServiceCategory;
use App\Support\CatalogImporter;
use Bltdreeg\Core\Models\CatalogServiceCategory;
use Filament\Actions\Action;
use Filament\Actions\CreateAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\Select;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;

class ListServiceCategories extends ListRecords
{
    protected static string $resource = ServiceCategoryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('importCatalog')
                ->label('Import from catalog')
                ->visible(fn (): bool => auth()->user()?->can('Import:ServiceCategory') ?? false)
                ->form([
                    Select::make('catalog_category_ids')
                        ->label('Catalog categories')
                        ->multiple()
                        ->required()
                        ->options(function (): array {
                            $imported = ServiceCategory::query()
                                ->whereNotNull('catalog_service_category_id')
                                ->pluck('catalog_service_category_id');

                            return CatalogServiceCategory::query()
                                ->where('is_active', true)
                                ->whereNotIn('id', $imported)
                                ->pluck('name', 'id')
                                ->all();
                        }),
                ])
                ->action(function (array $data, CatalogImporter $importer): void {
                    $tenant = Filament::getTenant();

                    foreach ($data['catalog_category_ids'] as $id) {
                        $catalog = CatalogServiceCategory::query()->find($id);

                        if ($catalog) {
                            $importer->importCategory($catalog, $tenant);
                        }
                    }

                    Notification::make()
                        ->title('Catalog categories imported')
                        ->success()
                        ->send();
                }),
            CreateAction::make(),
        ];
    }
}
