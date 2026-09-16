<?php

namespace App\Modules\V1\Hr\Filament\Resources\JobTypes\Pages;

use App\Modules\V1\Hr\Filament\Resources\JobTypes\JobTypeResource;
use App\Support\CatalogImporter;
use Bltdreeg\Core\Models\CatalogJobType;
use Bltdreeg\Core\Models\JobType;
use Bltdreeg\Core\Models\User;
use Filament\Actions\Action;
use Filament\Actions\CreateAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\Select;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Support\Facades\Auth;

class ListJobTypes extends ListRecords
{
    protected static string $resource = JobTypeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('importCatalog')
                ->label('Import from catalog')
                ->visible(function (): bool {
                    $user = Auth::user();

                    return $user instanceof User && $user->can('job-types.import');
                })
                ->form([
                    Select::make('catalog_job_type_ids')
                        ->label('Catalog job types')
                        ->multiple()
                        ->required()
                        ->options(function (): array {
                            $imported = JobType::query()
                                ->whereNotNull('catalog_job_type_id')
                                ->pluck('catalog_job_type_id');

                            return CatalogJobType::query()
                                ->where('is_active', true)
                                ->whereNotIn('id', $imported)
                                ->pluck('name', 'id')
                                ->all();
                        }),
                ])
                ->action(function (array $data, CatalogImporter $importer): void {
                    $tenant = Filament::getTenant();

                    foreach ($data['catalog_job_type_ids'] as $id) {
                        $catalog = CatalogJobType::query()->find($id);

                        if ($catalog) {
                            $importer->importJobType($catalog, $tenant);
                        }
                    }

                    Notification::make()
                        ->title('Catalog job types imported')
                        ->success()
                        ->send();
                }),
            CreateAction::make(),
        ];
    }
}
