<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Filament\Resources\ProductCategories\Pages;

use App\Modules\V1\Inventory\Filament\Resources\ProductCategories\ProductCategoryResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditProductCategory extends EditRecord
{
    protected static string $resource = ProductCategoryResource::class;

    public function getTitle(): string
    {
        return __('core::inventory.product_category');
    }

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
