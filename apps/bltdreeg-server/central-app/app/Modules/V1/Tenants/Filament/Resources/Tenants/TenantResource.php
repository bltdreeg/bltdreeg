<?php

namespace App\Modules\V1\Tenants\Filament\Resources\Tenants;

use App\Modules\V1\Tenants\Filament\Resources\Tenants\Pages\CreateTenant;
use App\Modules\V1\Tenants\Filament\Resources\Tenants\Pages\EditTenant;
use App\Modules\V1\Tenants\Filament\Resources\Tenants\Pages\ListTenants;
use App\Modules\V1\Tenants\Filament\Resources\Tenants\RelationManagers\JobTypesRelationManager;
use App\Modules\V1\Tenants\Filament\Resources\Tenants\RelationManagers\RolesRelationManager;
use App\Modules\V1\Tenants\Filament\Resources\Tenants\RelationManagers\ServiceCategoriesRelationManager;
use App\Modules\V1\Tenants\Filament\Resources\Tenants\RelationManagers\ServicesRelationManager;
use App\Modules\V1\Tenants\Filament\Resources\Tenants\RelationManagers\UsersRelationManager;
use App\Modules\V1\Tenants\Filament\Resources\Tenants\Schemas\TenantForm;
use App\Modules\V1\Tenants\Filament\Resources\Tenants\Tables\TenantsTable;
use BackedEnum;
use Bltdreeg\Core\Models\Tenant;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Support\Facades\Auth;
use UnitEnum;

class TenantResource extends Resource
{
    protected static ?string $model = Tenant::class;

    protected static ?string $navigationLabel = 'Tenants';

    protected static UnitEnum|string|null $navigationGroup = 'Administration';

    protected static ?int $navigationSort = 1;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    public static function canViewAny(): bool
    {
        return Auth::user()?->is_super_admin ?? false;
    }

    public static function form(Schema $schema): Schema
    {
        return TenantForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return TenantsTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            UsersRelationManager::class,
            ServiceCategoriesRelationManager::class,
            ServicesRelationManager::class,
            JobTypesRelationManager::class,
            RolesRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListTenants::route('/'),
            'create' => CreateTenant::route('/create'),
            'edit' => EditTenant::route('/{record}/edit'),
        ];
    }
}
