<?php

namespace App\Modules\V1\Settings\Filament\Resources\Roles;

use App\Modules\V1\Settings\Filament\Resources\Roles\Schemas\RoleForm;
use App\Modules\V1\Settings\Filament\Resources\Roles\Tables\RolesTable;
use App\Modules\V1\Settings\Support\TenantRoles;
use BackedEnum;
use Filament\Facades\Filament;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Contracts\Auth\Access\Authorizable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Spatie\Permission\Models\Role;
use UnitEnum;

class TenantRoleResource extends Resource
{
    protected static ?string $model = Role::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedShieldCheck;

    protected static string|UnitEnum|null $navigationGroup = 'Settings';

    protected static ?string $navigationLabel = 'Roles';

    protected static ?string $modelLabel = 'role';

    protected static ?string $pluralModelLabel = 'roles';

    protected static ?string $slug = 'roles';

    protected static ?int $navigationSort = 5;

    public static function getEloquentQuery(): Builder
    {
        return TenantRoles::query();
    }

    public static function form(Schema $schema): Schema
    {
        return RoleForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return RolesTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListRoles::route('/'),
            'create' => Pages\CreateRole::route('/create'),
            'edit' => Pages\EditRole::route('/{record}/edit'),
        ];
    }

    public static function canViewAny(): bool
    {
        return static::userCan('view crm users');
    }

    public static function canCreate(): bool
    {
        return static::userCan('create crm users');
    }

    public static function canEdit(Model $record): bool
    {
        return static::userCan('edit crm users');
    }

    public static function canDelete(Model $record): bool
    {
        return static::userCan('delete crm users')
            && $record instanceof Role
            && ! TenantRoles::isBuiltIn($record);
    }

    protected static function userCan(string $permission): bool
    {
        $user = Filament::auth()->user();

        if (! $user instanceof Authorizable) {
            return false;
        }

        TenantRoles::bindTeamContext();

        try {
            return $user->can($permission);
        } catch (\Throwable) {
            return false;
        }
    }
}
