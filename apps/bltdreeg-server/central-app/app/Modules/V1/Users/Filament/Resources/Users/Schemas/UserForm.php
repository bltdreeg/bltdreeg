<?php

namespace App\Modules\V1\Users\Filament\Resources\Users\Schemas;

use Bltdreeg\Core\Models\Branch;
use Bltdreeg\Core\Models\User;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;
use Illuminate\Support\Facades\Auth;

class UserForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->schema([
                TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                TextInput::make('email')
                    ->email()
                    ->required()
                    ->maxLength(255)
                    ->unique(ignoreRecord: true),
                TextInput::make('phone')
                    ->tel()
                    ->required()
                    ->maxLength(255)
                    ->unique(ignoreRecord: true),
                TextInput::make('password')
                    ->password()
                    ->revealable()
                    ->required(fn (string $operation): bool => $operation === 'create')
                    ->dehydrated(fn (?string $state): bool => filled($state)),
                FileUpload::make('avatar')
                    ->image()
                    ->directory('users/avatars'),
                Select::make('tenants')
                    ->label('Tenants')
                    ->relationship('tenants', 'name')
                    ->multiple()
                    ->preload()
                    ->searchable()
                    ->helperText('Which salons this person can sign into in the tenant app.'),
                Select::make('branch_id')
                    ->label(__('core::branches.branch'))
                    ->options(function (): array {
                        return Branch::query()
                            ->where('is_active', true)
                            ->with(['tenant:id,name'])
                            ->get()
                            ->mapWithKeys(fn (Branch $branch): array => [
                                $branch->getKey() => $branch->tenant->name.' — '.$branch->name,
                            ])
                            ->all();
                    })
                    ->searchable()
                    ->helperText('Optional. Leave empty so the user can access all branches in the tenant app.'),
                Toggle::make('is_active')
                    ->label('Active')
                    ->default(true),
                Toggle::make('is_super_admin')
                    ->label('Can access central app')
                    ->helperText('Landlord panel access. Also opens every tenant in the tenant app.')
                    ->disabled(fn (?User $record): bool => $record !== null && (int) $record->getKey() === (int) Auth::id()),
            ]);
    }
}
