<?php

namespace App\Modules\V1\Services\Filament\Resources\Services\Pages;

use App\Modules\V1\Services\Filament\Resources\Services\ServiceResource;
use App\Modules\V1\Services\Models\Service;
use App\Support\CatalogImporter;
use Bltdreeg\Core\Models\CatalogService;
use Filament\Actions\Action;
use Filament\Actions\CreateAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\Select;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;

class ListServices extends ListRecords
{
    protected static string $resource = ServiceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('importCatalog')
                ->label('Import from catalog')
                ->visible(fn (): bool => Filament::auth()->user()?->can('Import:Service') ?? false)
                ->form([
                    Select::make('catalog_service_ids')
                        ->label('Catalog services')
                        ->multiple()
                        ->required()
                        ->options(function (): array {
                            $imported = Service::query()
                                ->whereNotNull('catalog_service_id')
                                ->pluck('catalog_service_id');

                            return CatalogService::query()
                                ->where('is_active', true)
                                ->whereNotIn('id', $imported)
                                ->pluck('name', 'id')
                                ->all();
                        }),
                ])
                ->action(function (array $data, CatalogImporter $importer): void {
                    $tenant = Filament::getTenant();

                    foreach ($data['catalog_service_ids'] as $id) {
                        $catalog = CatalogService::query()->find($id);

                        if ($catalog) {
                            $importer->importService($catalog, $tenant);
                        }
                    }

                    Notification::make()
                        ->title('Catalog services imported')
                        ->success()
                        ->send();
                }),
            CreateAction::make(),
        ];
    }
}
