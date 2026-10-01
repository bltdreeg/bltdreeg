<?php

namespace App\Modules\V1\Customer\Auth\Filament\Resources\Customers\Pages;

use App\Modules\V1\Customer\Auth\Filament\Resources\Customers\CustomerResource;
use Filament\Resources\Pages\ListRecords;

class ListCustomers extends ListRecords
{
    protected static string $resource = CustomerResource::class;

    protected function getHeaderActions(): array
    {
        return [];
    }
}
