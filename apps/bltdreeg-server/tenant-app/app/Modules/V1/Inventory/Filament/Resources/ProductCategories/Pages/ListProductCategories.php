<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Filament\Resources\ProductCategories\Pages;

use App\Modules\V1\Inventory\Filament\Resources\ProductCategories\ProductCategoryResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListProductCategories extends ListRecords
{
    protected static string $resource = ProductCategoryResource::class;

    public function getTitle(): string
    {
        return __('core::inventory.product_categories');
    }

    /**
     * @return array<CreateAction>
     */
    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
