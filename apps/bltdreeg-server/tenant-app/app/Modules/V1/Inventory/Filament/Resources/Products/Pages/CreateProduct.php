<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Filament\Resources\Products\Pages;

use App\Modules\V1\Inventory\Filament\Resources\Products\ProductResource;
use Filament\Resources\Pages\CreateRecord;

class CreateProduct extends CreateRecord
{
    protected static string $resource = ProductResource::class;

    public function getTitle(): string
    {
        return __('core::inventory.product');
    }
}
