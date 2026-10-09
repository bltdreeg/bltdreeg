<?php

declare(strict_types=1);

namespace App\Modules\V1\Catalog\Filament\Resources\RoleTemplates;

use App\Modules\V1\Catalog\Filament\Resources\RoleTemplates\Pages\CreateRoleTemplate;
use App\Modules\V1\Catalog\Filament\Resources\RoleTemplates\Pages\EditRoleTemplate;
use App\Modules\V1\Catalog\Filament\Resources\RoleTemplates\Pages\ListRoleTemplates;
use BackedEnum;
use Bltdreeg\Core\Modules\Auth\Models\Permission;
use Bltdreeg\Core\Modules\Auth\Models\RoleTemplate;
use Bltdreeg\Core\Modules\Auth\Support\ShieldPermissions;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\CheckboxList;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class RoleTemplateResource extends Resource
{
    protected static ?string $model = RoleTemplate::class;

    protected static ?string $navigationLabel = 'Role templates';

    protected static ?string $modelLabel = 'role template';

    protected static ?string $slug = 'role-templates';

    protected static ?int $navigationSort = 10;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedShieldCheck;

    public static function getNavigationGroup(): string
    {
        return __('core::services.catalog');
    }

    public static function form(Schema $schema): Schema
    {
        $tenantPermissions = ShieldPermissions::tenant();

        $options = Permission::query()
            ->whereIn('name', $tenantPermissions)
            ->orderBy('name')
            ->pluck('name', 'id')
            ->all();

        // Ensure all canonical tenant permissions appear even before seed.
        foreach ($tenantPermissions as $name) {
            $permission = Permission::query()->firstOrCreate(
                ['name' => $name, 'guard_name' => 'web'],
            );
            $options[$permission->id] = $name;
        }

        ksort($options);

        return $schema
            ->schema([
                TextInput::make('name')
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->maxLength(255),
                Textarea::make('description'),
                Toggle::make('is_active')
                    ->default(true),
                CheckboxList::make('permissions')
                    ->relationship('permissions', 'name')
                    ->options($options)
                    ->columns(2)
                    ->bulkToggleable()
                    ->searchable(),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('description')
                    ->limit(40),
                TextColumn::make('permissions_count')
                    ->counts('permissions')
                    ->label('Permissions'),
                IconColumn::make('is_active')
                    ->boolean(),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListRoleTemplates::route('/'),
            'create' => CreateRoleTemplate::route('/create'),
            'edit' => EditRoleTemplate::route('/{record}/edit'),
        ];
    }
}
