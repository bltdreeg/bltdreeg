<?php

namespace App\Modules\V1\Hr\Filament\Resources\Employees;

use App\Modules\V1\Hr\Filament\Resources\Employees\Pages\CreateEmployee;
use App\Modules\V1\Hr\Filament\Resources\Employees\Pages\EditEmployee;
use App\Modules\V1\Hr\Filament\Resources\Employees\Pages\ListEmployees;
use App\Modules\V1\Roles\Models\Role;
use App\Modules\V1\Services\Models\Service;
use BackedEnum;
use Bltdreeg\Core\Models\JobType;
use Bltdreeg\Core\Models\User;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use UnitEnum;

class EmployeeResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $slug = 'employees';

    protected static ?string $navigationLabel = 'Employees';

    protected static ?string $modelLabel = 'employee';

    protected static ?string $pluralModelLabel = 'employees';

    protected static UnitEnum|string|null $navigationGroup = 'HR';

    protected static ?int $navigationSort = 1;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUsers;

    protected static bool $isScopedToTenant = false;

    public static function getEloquentQuery(): Builder
    {
        $tenantId = Filament::getTenant()?->getKey();

        return parent::getEloquentQuery()
            ->whereHas('tenants', fn (Builder $query) => $query->whereKey($tenantId));
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                TextInput::make('email')
                    ->email()
                    ->required()
                    ->maxLength(255),
                TextInput::make('phone')
                    ->tel()
                    ->required()
                    ->maxLength(255),
                TextInput::make('password')
                    ->password()
                    ->revealable()
                    ->required(fn (string $operation): bool => $operation === 'create')
                    ->dehydrated(fn (?string $state): bool => filled($state)),
                Select::make('job_type_id')
                    ->label('Job type')
                    ->options(function (): array {
                        return JobType::query()
                            ->where('is_active', true)
                            ->pluck('name', 'id')
                            ->all();
                    })
                    ->searchable(),
                Select::make('roles')
                    ->label('Roles')
                    ->multiple()
                    ->options(function (): array {
                        $tenantId = Filament::getTenant()?->getKey();

                        return Role::query()
                            ->where('tenant_id', $tenantId)
                            ->where('name', '!=', config('filament-shield.super_admin.name', 'super_admin'))
                            ->pluck('name', 'id')
                            ->all();
                    }),
                Select::make('services')
                    ->label('Services')
                    ->multiple()
                    ->options(fn (): array => Service::query()->pluck('name', 'id')->all()),
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
                TextColumn::make('email')
                    ->searchable(),
                TextColumn::make('phone'),
                TextColumn::make('tenants.pivot.job_type_id')
                    ->label('Job type')
                    ->formatStateUsing(function (User $record): ?string {
                        $tenantId = Filament::getTenant()?->getKey();
                        $jobTypeId = $record->tenants->firstWhere('id', $tenantId)?->pivot?->job_type_id;

                        return $jobTypeId ? JobType::query()->find($jobTypeId)?->name : null;
                    }),
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
            'index' => ListEmployees::route('/'),
            'create' => CreateEmployee::route('/create'),
            'edit' => EditEmployee::route('/{record}/edit'),
        ];
    }
}
