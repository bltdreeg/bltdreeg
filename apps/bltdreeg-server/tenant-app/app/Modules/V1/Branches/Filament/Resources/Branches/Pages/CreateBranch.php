<?php

namespace App\Modules\V1\Branches\Filament\Resources\Branches\Pages;

use App\Modules\V1\Branches\Filament\Resources\Branches\BranchResource;
use Filament\Facades\Filament;
use Filament\Resources\Pages\CreateRecord;
use LaraZeus\SpatieTranslatable\Actions\LocaleSwitcher;
use LaraZeus\SpatieTranslatable\Resources\Pages\CreateRecord\Concerns\Translatable;

class CreateBranch extends CreateRecord
{
    use Translatable;

    protected static string $resource = BranchResource::class;

    protected function getHeaderActions(): array
    {
        return [
            LocaleSwitcher::make(),
        ];
    }

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['tenant_id'] = Filament::getTenant()?->getKey();

        return BranchResource::withResolvedLocation($data);
    }
}
