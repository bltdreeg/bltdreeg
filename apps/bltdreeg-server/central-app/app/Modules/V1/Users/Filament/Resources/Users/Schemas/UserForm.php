<?php

namespace App\Modules\V1\Users\Filament\Resources\Users\Schemas;

use Bltdreeg\Core\Enums\SalaryTypeEnum;
use Bltdreeg\Core\Models\Branch;
use Bltdreeg\Core\Models\User;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Get;
use Filament\Schemas\Schema;
use Illuminate\Support\Facades\Auth;

class UserForm
{
    public static function configure(Schema $schema): Schema
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
                            ->label(__('core::users.start_date')),
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
                        Select::make('tenants')
                            ->label(__('core::tenants.tenants'))
                            ->relationship('tenants', 'name')
                            ->multiple()
                            ->preload()
                            ->searchable()
                            ->live()
                            ->helperText(__('core::users.tenant_can_sign_into')),
                        Select::make('branch_id')
                            ->label(__('core::branches.branch'))
                            ->options(function (Get $get): array {
                                return Branch::query()
                                    ->where('is_active', true)
                                    ->whereIn('tenant_id', (array) $get('tenants'))
                                    ->get()
                                    ->mapWithKeys(fn (Branch $branch): array => [
                                        $branch->getKey() => $branch->name,
                                    ])
                                    ->all();
                            })
                            ->disabled(fn (Get $get): bool => blank($get('tenants')))
                            ->searchable()
                            ->helperText(__('core::users.leave_branch_empty')),
                        Toggle::make('is_super_admin')
                            ->label(__('core::users.central_access'))
                            ->helperText(__('core::users.landlord_panel_access'))
                            ->disabled(fn (?User $record): bool => $record !== null && (int) $record->getKey() === (int) Auth::id()),
                        Toggle::make('is_active')
                            ->label(__('core::global.is_active'))
                            ->default(true),
                    ]),
            ]);
    }
}
