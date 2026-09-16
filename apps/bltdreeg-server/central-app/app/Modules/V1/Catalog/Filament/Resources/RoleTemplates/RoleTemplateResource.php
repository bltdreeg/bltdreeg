<?php

namespace App\Modules\V1\Catalog\Filament\Resources\RoleTemplates;

use App\Modules\V1\Catalog\Filament\Resources\RoleTemplates\Pages\CreateRoleTemplate;
use App\Modules\V1\Catalog\Filament\Resources\RoleTemplates\Pages\EditRoleTemplate;
use App\Modules\V1\Catalog\Filament\Resources\RoleTemplates\Pages\ListRoleTemplates;
use BackedEnum;
use Bltdreeg\Core\Models\RoleTemplate;
use Bltdreeg\Core\Support\TenantPermissions;
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
use Illuminate\Support\Facades\Auth;
use UnitEnum;

class RoleTemplateResource extends Resource
{
    protected static ?string $model = RoleTemplate::class;

    protected static ?string $navigationLabel = 'Role templates';

    protected static ?string $slug = 'role-templates';

    protected static UnitEnum|string|null $navigationGroup = 'Catalog';

    protected static ?int $navigationSort = 4;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedShieldCheck;

    public static function canViewAny(): bool
    {
        return Auth::user()?->is_super_admin ?? false;
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                TextInput::make('name')
                    ->required()
                    ->maxLength(255)
                    ->unique(ignoreRecord: true),
                Textarea::make('description'),
                CheckboxList::make('permissions')
                    ->options(TenantPermissions::options())
                    ->columns(2),
                Toggle::make('is_active')
                    ->default(true),
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
