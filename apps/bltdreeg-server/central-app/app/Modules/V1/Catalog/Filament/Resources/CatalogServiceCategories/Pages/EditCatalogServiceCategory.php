<?php

namespace App\Modules\V1\Catalog\Filament\Resources\CatalogServiceCategories\Pages;

use App\Modules\V1\Catalog\Filament\Resources\CatalogServiceCategories\CatalogServiceCategoryResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;
use LaraZeus\SpatieTranslatable\Actions\LocaleSwitcher;
use LaraZeus\SpatieTranslatable\Resources\Pages\EditRecord\Concerns\Translatable;

class EditCatalogServiceCategory extends EditRecord
{
    use Translatable;

    protected static string $resource = CatalogServiceCategoryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            LocaleSwitcher::make(),
            DeleteAction::make(),
        ];
    }
}
