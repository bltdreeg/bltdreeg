<?php

namespace App\Modules\V1\Roles\Filament\Resources\Roles;

use App\Modules\V1\Roles\Filament\Resources\Roles\Pages\CreateRole;
use App\Modules\V1\Roles\Filament\Resources\Roles\Pages\EditRole;
use App\Modules\V1\Roles\Filament\Resources\Roles\Pages\ListRoles;
use App\Modules\V1\Roles\Models\Role;
use App\Modules\V1\Roles\Services\RoleService;
use BackedEnum;
use Bltdreeg\Core\Support\TenantPermissions;
use Filament\Actions\Action;
use Filament\Actions\BulkAction;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\TextInput;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Validation\Rules\Unique;
use UnitEnum;

class RoleResource extends Resource
{
    protected static ?string $model = Role::class;

    protected static ?string $navigationLabel = 'Roles';

    protected static UnitEnum|string|null $navigationGroup = 'HR';

    protected static ?int $navigationSort = 2;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedShieldCheck;

    protected static bool $isScopedToTenant = false;

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->where('tenant_id', Filament::getTenant()?->getKey())
            ->where('name', '!=', config('filament-shield.super_admin.name', 'super_admin'));
    }

    public static function form(Schema $schema): Schema
    {
        $permissionSections = [];

        foreach (TenantPermissions::groupedByResource() as $resource => $group) {
            $permissionSections[] = Section::make($group['label'])
                ->schema([
                    CheckboxList::make("permission_groups.{$resource}")
                        ->hiddenLabel()
                        ->options($group['options'])
                        ->bulkToggleable()
                        ->columns(2),
                ])
                ->compact();
        }

        return $schema
            ->schema([
                TextInput::make('name')
                    ->required()
                    ->maxLength(255)
                    ->unique(
                        ignoreRecord: true,
                        modifyRuleUsing: fn (Unique $rule): Unique => $rule
                            ->where('tenant_id', Filament::getTenant()?->getKey())
                            ->where('guard_name', 'web')
                    )
                    ->disabled(fn (?Role $record): bool => (bool) $record?->is_system),
                Section::make('Permissions')
                    ->description('Names follow resource.action, e.g. employees.index, roles.create, services.import.')
                    ->schema($permissionSections)
                    ->disabled(fn (?Role $record): bool => (bool) $record?->is_system),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                IconColumn::make('is_system')
                    ->label('Predefined')
                    ->boolean(),
                TextColumn::make('permissions_count')
                    ->counts('permissions')
                    ->label('Permissions'),
                TextColumn::make('creator.name')
                    ->label('Created by')
                    ->placeholder('Catalog')
                    ->toggleable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->recordActions([
                EditAction::make(),
                Action::make('duplicate')
                    ->label('Duplicate')
                    ->icon(Heroicon::OutlinedSquare2Stack)
                    ->requiresConfirmation()
                    ->visible(fn (): bool => auth()->user()?->can('roles.bulk-duplicate') ?? false)
                    ->action(function (Role $record, RoleService $roles): void {
                        $tenantId = Filament::getTenant()?->getKey();
                        $copy = $roles->duplicate($record, $tenantId);

                        Notification::make()
                            ->title("Duplicated as {$copy->name}")
                            ->success()
                            ->send();
                    }),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    BulkAction::make('duplicate')
                        ->label('Duplicate selected')
                        ->icon(Heroicon::OutlinedSquare2Stack)
                        ->requiresConfirmation()
                        ->visible(fn (): bool => auth()->user()?->can('roles.bulk-duplicate') ?? false)
                        ->action(function (Collection $records, RoleService $roles): void {
                            $count = count($roles->bulkDuplicate(
                                $records->modelKeys(),
                                Filament::getTenant()?->getKey(),
                            ));

                            Notification::make()
                                ->title("Duplicated {$count} role(s)")
                                ->success()
                                ->send();
                        }),
                    DeleteBulkAction::make()
                        ->visible(fn (): bool => auth()->user()?->can('roles.bulk-delete') ?? false)
                        ->action(function (Collection $records, RoleService $roles): void {
                            $count = $roles->bulkDelete(
                                $records->modelKeys(),
                                Filament::getTenant()?->getKey(),
                            );

                            Notification::make()
                                ->title("Deleted {$count} role(s)")
                                ->success()
                                ->send();
                        }),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListRoles::route('/'),
            'create' => CreateRole::route('/create'),
            'edit' => EditRole::route('/{record}/edit'),
        ];
    }
}
