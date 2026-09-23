<?php

namespace App\Modules\V1\Users\Filament\Resources\Users;

use App\Modules\V1\Users\Filament\Resources\Users\Pages\CreateUser;
use App\Modules\V1\Users\Filament\Resources\Users\Pages\EditUser;
use App\Modules\V1\Users\Filament\Resources\Users\Pages\ListUsers;
use App\Modules\V1\Users\Filament\Resources\Users\Schemas\UserForm;
use App\Modules\V1\Users\Filament\Resources\Users\Tables\UsersTable;
use BackedEnum;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

class UserResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $slug = 'users';

    protected static ?int $navigationSort = 2;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUsers;

    public static function getNavigationGroup(): string
    {
        return __('core::global.administration');
    }

    public static function getNavigationLabel(): string
    {
        return __('core::users.users');
    }

    public static function getLabel(): string
    {
        return __('core::users.user');
    }

    public static function getPluralLabel(): string
    {
        return __('core::users.users');
    }

    public static function canCreate(): bool
    {
        return static::canViewAny();
    }

    public static function canEdit(Model $record): bool
    {
        return static::canViewAny();
    }

    public static function canDelete(Model $record): bool
    {
        if (! static::canViewAny()) {
            return false;
        }

        return (int) Auth::id() !== (int) $record->getKey();
    }

    public static function canDeleteAny(): bool
    {
        return static::canViewAny();
    }

    public static function form(Schema $schema): Schema
    {
        return UserForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return UsersTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListUsers::route('/'),
            'create' => CreateUser::route('/create'),
            'edit' => EditUser::route('/{record}/edit'),
        ];
    }
}
