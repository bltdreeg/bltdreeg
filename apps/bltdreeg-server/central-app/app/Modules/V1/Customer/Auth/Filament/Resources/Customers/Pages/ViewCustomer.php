<?php

namespace App\Modules\V1\Customer\Auth\Filament\Resources\Customers\Pages;

use App\Modules\V1\Customer\Auth\Filament\Resources\Customers\CustomerResource;
use Filament\Resources\Pages\ViewRecord;

class ViewCustomer extends ViewRecord
{
    protected static string $resource = CustomerResource::class;
}
