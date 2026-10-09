<?php

namespace App\Modules\V1\Services\Filament\Resources\ServiceCategories\Pages;

use App\Modules\V1\Services\Filament\Resources\ServiceCategories\ServiceCategoryResource;
use Filament\Resources\Pages\CreateRecord;
use LaraZeus\SpatieTranslatable\Actions\LocaleSwitcher;
use LaraZeus\SpatieTranslatable\Resources\Pages\CreateRecord\Concerns\Translatable;

class CreateServiceCategory extends CreateRecord
{
    use Translatable;

    protected static string $resource = ServiceCategoryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            LocaleSwitcher::make(),
        ];
    }
}
