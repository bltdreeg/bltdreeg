<?php

namespace App\Modules\V1\Hr\Filament\Resources\Shifts;

use App\Modules\V1\Hr\Filament\Resources\Shifts\Pages\CreateShift;
use App\Modules\V1\Hr\Filament\Resources\Shifts\Pages\EditShift;
use App\Modules\V1\Hr\Filament\Resources\Shifts\Pages\ListShifts;
use BackedEnum;
use Bltdreeg\Core\Models\Shift;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\TimePicker;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use UnitEnum;

class ShiftResource extends Resource
{
    protected static ?string $model = Shift::class;

    protected static ?string $slug = 'shifts';

    protected static UnitEnum|string|null $navigationGroup = 'HR';

    protected static ?int $navigationSort = 4;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedClock;

    protected static bool $isScopedToTenant = false;

    public static function getNavigationGroup(): string
    {
        return __('core::users.hr');
    }

    public static function getNavigationLabel(): string
    {
        return __('core::attendance.shifts');
    }

    public static function getLabel(): string
    {
        return __('core::attendance.shift');
    }

    public static function getPluralLabel(): string
    {
        return __('core::attendance.shifts');
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                TextInput::make('name')
                    ->label(__('core::attendance.shift_name'))
                    ->required()
                    ->maxLength(255),
                TimePicker::make('start_time')
                    ->label(__('core::attendance.start_time'))
                    ->seconds(false)
                    ->required(),
                TimePicker::make('end_time')
                    ->label(__('core::attendance.end_time'))
                    ->seconds(false)
                    ->required(),
                TextInput::make('break_minutes')
                    ->label(__('core::attendance.break_minutes'))
                    ->numeric()
                    ->minValue(0)
                    ->maxValue(480)
                    ->default(30),
                Toggle::make('is_active')
                    ->label(__('core::global.is_active'))
                    ->default(true),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label(__('core::attendance.shift_name'))
                    ->searchable()
                    ->sortable(),
                TextColumn::make('start_time')
                    ->label(__('core::attendance.start_time'))
                    ->formatStateUsing(fn (?string $state): string => self::clock($state)),
                TextColumn::make('end_time')
                    ->label(__('core::attendance.end_time'))
                    ->formatStateUsing(fn (?string $state): string => self::clock($state)),
                TextColumn::make('break_minutes')
                    ->label(__('core::attendance.break_minutes')),
                IconColumn::make('is_active')
                    ->label(__('core::global.is_active'))
                    ->boolean(),
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ])
            ->defaultSort('start_time');
    }

    public static function getPages(): array
    {
        return [
            'index' => ListShifts::route('/'),
            'create' => CreateShift::route('/create'),
            'edit' => EditShift::route('/{record}/edit'),
        ];
    }

    private static function clock(?string $state): string
    {
        return $state === null ? '—' : substr($state, 0, 5);
    }
}
