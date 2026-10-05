<?php

namespace App\Modules\V1\Customer\Auth\Filament\Resources\Customers;

use App\Modules\V1\Customer\Auth\Filament\Resources\Customers\Pages\ListCustomers;
use App\Modules\V1\Customer\Auth\Filament\Resources\Customers\Pages\ViewCustomer;
use App\Modules\V1\Customer\Auth\Filament\Resources\Customers\Schemas\CustomerForm;
use App\Modules\V1\Customer\Auth\Filament\Resources\Customers\Tables\CustomersTable;
use BackedEnum;
use Bltdreeg\Core\Modules\Customers\Models\Customer;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class CustomerResource extends Resource
{
    protected static ?string $model = Customer::class;

    protected static ?int $navigationSort = 20;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUsers;

    public static function getNavigationGroup(): string
    {
        return 'Customers';
    }

    public static function getNavigationLabel(): string
    {
        return 'Customers';
    }

    public static function getLabel(): string
    {
        return 'Customer';
    }

    public static function getPluralLabel(): string
    {
        return 'Customers';
    }

    public static function form(Schema $schema): Schema
    {
        return CustomerForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CustomersTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListCustomers::route('/'),
            'view' => ViewCustomer::route('/{record}'),
        ];
    }
}
