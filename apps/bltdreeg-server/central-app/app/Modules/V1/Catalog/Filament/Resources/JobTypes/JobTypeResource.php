<?php

namespace App\Modules\V1\Catalog\Filament\Resources\JobTypes;

use App\Modules\V1\Catalog\Filament\Resources\JobTypes\Pages\CreateJobType;
use App\Modules\V1\Catalog\Filament\Resources\JobTypes\Pages\EditJobType;
use App\Modules\V1\Catalog\Filament\Resources\JobTypes\Pages\ListJobTypes;
use BackedEnum;
use Bltdreeg\Core\Modules\Catalog\Models\CatalogJobType;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class JobTypeResource extends Resource
{
    protected static ?string $model = CatalogJobType::class;

    protected static ?string $navigationLabel = 'Job types';

    protected static ?string $modelLabel = 'catalog job type';

    protected static ?string $slug = 'catalog-job-types';

    protected static ?int $navigationSort = 3;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBriefcase;

    public static function getNavigationGroup(): string
    {
        return __('core::services.catalog');
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                Textarea::make('description'),
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
            'index' => ListJobTypes::route('/'),
            'create' => CreateJobType::route('/create'),
            'edit' => EditJobType::route('/{record}/edit'),
        ];
    }
}
