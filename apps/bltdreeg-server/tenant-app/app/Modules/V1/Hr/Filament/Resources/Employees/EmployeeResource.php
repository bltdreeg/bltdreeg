<?php

namespace App\Modules\V1\Hr\Filament\Resources\Employees;

use App\Modules\V1\Hr\Filament\Resources\Employees\Pages\CreateEmployee;
use App\Modules\V1\Hr\Filament\Resources\Employees\Pages\EditEmployee;
use App\Modules\V1\Hr\Filament\Resources\Employees\Pages\ListEmployees;
use App\Modules\V1\Services\Models\Service;
use BackedEnum;
use Bltdreeg\Core\Modules\Hr\Enums\SalaryTypeEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Bltdreeg\Core\Modules\Hr\Models\JobType;
use Bltdreeg\Core\Modules\Auth\Models\Role;
use Bltdreeg\Core\Modules\Hr\Models\Shift;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class EmployeeResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $slug = 'employees';

    protected static ?int $navigationSort = 1;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUsers;

    protected static bool $isScopedToTenant = false;

    public static function getNavigationGroup(): string
    {
        return __('core::users.hr');
    }

    public static function getNavigationLabel(): string
    {
        return __('core::users.employees');
    }

    public static function getLabel(): string
    {
        return __('core::users.employee');
    }

    public static function getPluralLabel(): string
    {
        return __('core::users.employees');
    }

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
                Section::make(__('core::users.personal_data'))
                    ->columnSpanFull()
                    ->columns(2)
                    ->schema([
                        TextInput::make('name')
                            ->label(__('core::global.name'))
                            ->required()
                            ->maxLength(255),
                        TextInput::make('phone')
                            ->label(__('core::global.phone'))
                            ->tel()
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        TextInput::make('email')
                            ->label(__('core::global.email'))
                            ->email()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true),
                        TextInput::make('password')
                            ->label(__('core::users.password'))
                            ->password()
                            ->revealable()
                            ->required(fn (string $operation): bool => $operation === 'create')
                            ->dehydrated(fn (?string $state): bool => filled($state)),
                        FileUpload::make('avatar')
                            ->label(__('core::users.avatar'))
                            ->columnSpanFull()
                            ->image()
                            ->directory('users/avatars'),
                    ]),
                Section::make(__('core::users.salary_data'))
                    ->schema([
                        DatePicker::make('start_date')
                            ->label(__('core::users.start_date'))
                            ->required(),
                        Select::make('salary_type')
                            ->label(__('core::users.salary_type'))
                            ->options(function (): array {
                                return collect(SalaryTypeEnum::cases())
                                    ->mapWithKeys(fn (SalaryTypeEnum $case): array => [$case->value => $case->label()])
                                    ->all();
                            })
                            ->default(SalaryTypeEnum::DAILY->value)
                            ->required(),
                        TextInput::make('salary')
                            ->label(__('core::users.salary'))
                            ->numeric()
                            ->default(0)
                            ->required(),
                    ]),
                Section::make(__('core::users.access'))
                    ->schema([
                        Select::make('branch_id')
                            ->label(__('core::branches.branch'))
                            ->options(function (): array {
                                return Branch::query()
                                    ->where('is_active', true)
                                    ->where('tenant_id', Filament::getTenant()?->getKey())
                                    ->get()
                                    ->mapWithKeys(fn (Branch $branch): array => [$branch->getKey() => $branch->name])
                                    ->all();
                            })
                            ->searchable()
                            ->required(),
                        Select::make('job_type_id')
                            ->label(__('core::users.job_type'))
                            ->options(function (): array {
                                return JobType::query()
                                    ->where('is_active', true)
                                    ->pluck('name', 'id')
                                    ->all();
                            })
                            ->searchable(),
                        Select::make('shift_id')
                            ->label(__('core::attendance.assign_shift'))
                            ->options(function (): array {
                                return Shift::query()
                                    ->where('is_active', true)
                                    ->where('tenant_id', Filament::getTenant()?->getKey())
                                    ->pluck('name', 'id')
                                    ->all();
                            })
                            ->searchable()
                            ->placeholder(__('core::attendance.no_shift'))
                            ->helperText(fn (): ?string => Shift::query()
                                ->where('tenant_id', Filament::getTenant()?->getKey())
                                ->exists()
                                ? null
                                : __('core::attendance.no_shifts_yet')),
                        Select::make('roles')
                            ->label(__('core::users.roles'))
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
                            ->label(__('core::services.services'))
                            ->multiple()
                            ->options(fn (): array => Service::query()->pluck('name', 'id')->all()),
                        Toggle::make('is_active')
                            ->label(__('core::global.is_active'))
                            ->default(true),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label(__('core::global.name'))
                    ->searchable()
                    ->sortable(),
                TextColumn::make('email')
                    ->label(__('core::global.email'))
                    ->searchable(),
                TextColumn::make('phone')
                    ->label(__('core::global.phone'))
                    ->searchable(),
                TextColumn::make('tenants.pivot.job_type_id')
                    ->label(__('core::users.job_type'))
                    ->formatStateUsing(function (User $record): ?string {
                        $tenantId = Filament::getTenant()?->getKey();
                        $jobTypeId = $record->tenants->firstWhere('id', $tenantId)?->pivot?->job_type_id;

                        return $jobTypeId ? JobType::query()->find($jobTypeId)?->name : null;
                    }),
                TextColumn::make('start_date')
                    ->label(__('core::users.start_date'))
                    ->date()
                    ->sortable(),
                TextColumn::make('salary_type')
                    ->label(__('core::users.salary_type'))
                    ->formatStateUsing(fn (int $state): string => SalaryTypeEnum::from($state)->label())
                    ->toggleable(),
                TextColumn::make('salary')
                    ->label(__('core::users.salary'))
                    ->formatStateUsing(fn ($state): string => number_format((float) $state, 2))
                    ->toggleable(),
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
