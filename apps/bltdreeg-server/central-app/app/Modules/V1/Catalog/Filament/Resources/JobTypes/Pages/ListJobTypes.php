<?php

namespace App\Modules\V1\Catalog\Filament\Resources\JobTypes\Pages;

use App\Modules\V1\Catalog\Filament\Resources\JobTypes\JobTypeResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListJobTypes extends ListRecords
{
    protected static string $resource = JobTypeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
