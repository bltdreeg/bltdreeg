<?php

namespace App\Modules\V1\Settings\Filament\Resources\Roles\Schemas;

use App\Modules\V1\Settings\Support\TenantRoles;
use Filament\Facades\Filament;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;
use Illuminate\Validation\Rules\Unique;
use Spatie\Permission\Models\Role;

class RoleForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required()
                    ->maxLength(255)
                    ->disabled(fn (?Role $record): bool => $record !== null && TenantRoles::isBuiltIn($record))
                    ->dehydrated(fn (?Role $record): bool => $record === null || ! TenantRoles::isBuiltIn($record))
                    ->unique(
                        table: 'roles',
                        ignorable: fn (?Role $record) => $record,
                        modifyRuleUsing: function (Unique $rule) {
                            return $rule
                                ->where('guard_name', 'web')
                                ->where('team_id', Filament::getTenant()?->getKey());
                        },
                    ),
                TextInput::make('description')
                    ->maxLength(255)
                    ->disabled(fn (?Role $record): bool => $record !== null && TenantRoles::isBuiltIn($record)),
                CheckboxList::make('permissions')
                    ->label('Permissions')
                    ->relationship(
                        name: 'permissions',
                        titleAttribute: 'name',
                        modifyQueryUsing: fn ($query) => $query
                            ->where('crm_permission', true)
                            ->orderBy('name'),
                    )
                    ->columns(2)
                    ->searchable()
                    ->bulkToggleable()
                    ->disabled(fn (?Role $record): bool => $record !== null && TenantRoles::isBuiltIn($record))
                    ->helperText(fn (?Role $record): ?string => $record !== null && TenantRoles::isBuiltIn($record)
                        ? 'Built-in CRM roles keep their permission set. Create a custom role to customise access.'
                        : null),
            ]);
    }
}
