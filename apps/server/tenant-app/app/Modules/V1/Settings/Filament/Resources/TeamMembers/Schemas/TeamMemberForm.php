<?php

namespace App\Modules\V1\Settings\Filament\Resources\TeamMembers\Schemas;

use App\Modules\V1\Settings\Support\TenantRoles;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class TeamMemberForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                FileUpload::make('avatar_path')
                    ->label('Avatar')
                    ->image()
                    ->avatar()
                    ->directory('avatars')
                    ->disk('public')
                    ->visibility('public')
                    ->imageEditor()
                    ->circleCropper(),
                TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                TextInput::make('email')
                    ->email()
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->maxLength(255),
                TextInput::make('phone')
                    ->tel()
                    ->maxLength(50),
                TextInput::make('job_title')
                    ->label('Job title')
                    ->maxLength(100),
                TextInput::make('job')
                    ->maxLength(100),
                Select::make('role')
                    ->label('Role')
                    ->options(fn (): array => TenantRoles::assignableOptions())
                    ->required()
                    ->searchable()
                    ->helperText('Built-in CRM roles and any custom roles for this tenant.'),
                TextInput::make('password')
                    ->password()
                    ->required(fn (string $operation): bool => $operation === 'create')
                    ->dehydrated(fn (?string $state): bool => filled($state))
                    ->helperText('Leave blank when editing to keep the current password.'),
            ]);
    }
}
