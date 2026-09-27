<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Filament\Resources\ProductCategories\Pages;

use App\Modules\V1\Inventory\Filament\Resources\ProductCategories\ProductCategoryResource;
use Filament\Resources\Pages\CreateRecord;

class CreateProductCategory extends CreateRecord
{
    protected static string $resource = ProductCategoryResource::class;

    public function getTitle(): string
    {
        return __('core::inventory.product_category');
    }
}
