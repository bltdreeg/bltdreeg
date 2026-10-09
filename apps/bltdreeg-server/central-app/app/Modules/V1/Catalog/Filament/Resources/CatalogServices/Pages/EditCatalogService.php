<?php

namespace App\Modules\V1\Catalog\Filament\Resources\CatalogServices\Pages;

use App\Modules\V1\Catalog\Filament\Resources\CatalogServices\CatalogServiceResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;
use LaraZeus\SpatieTranslatable\Actions\LocaleSwitcher;
use LaraZeus\SpatieTranslatable\Resources\Pages\EditRecord\Concerns\Translatable;

class EditCatalogService extends EditRecord
{
    use Translatable;

    protected static string $resource = CatalogServiceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            LocaleSwitcher::make(),
            DeleteAction::make(),
        ];
    }
}
