<?php

namespace App\Modules\V1\Catalog\Filament\Resources\JobTypes\Pages;

use App\Modules\V1\Catalog\Filament\Resources\JobTypes\JobTypeResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditJobType extends EditRecord
{
    protected static string $resource = JobTypeResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
