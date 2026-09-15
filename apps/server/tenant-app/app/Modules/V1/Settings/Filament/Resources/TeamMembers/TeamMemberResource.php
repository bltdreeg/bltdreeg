<?php

namespace App\Modules\V1\Settings\Filament\Resources\TeamMembers;

use App\Models\User;
use App\Modules\V1\Settings\Filament\Resources\TeamMembers\Schemas\TeamMemberForm;
use App\Modules\V1\Settings\Filament\Resources\TeamMembers\Tables\TeamMembersTable;
use App\Modules\V1\Settings\Support\TenantRoles;
use BackedEnum;
use Filament\Facades\Filament;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Contracts\Auth\Access\Authorizable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use UnitEnum;

class TeamMemberResource extends Resource
{
    protected static ?string $model = User::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedUsers;

    protected static string|UnitEnum|null $navigationGroup = 'Settings';

    protected static ?string $navigationLabel = 'Team members';

    protected static ?string $modelLabel = 'team member';

    protected static ?string $pluralModelLabel = 'team members';

    protected static ?int $navigationSort = 10;

    protected static bool $isScopedToTenant = false;

    public static function getEloquentQuery(): Builder
    {
        TenantRoles::bindTeamContext();

        return parent::getEloquentQuery()
            ->whereHas('teams', fn (Builder $query) => $query->whereKey(Filament::getTenant()?->getKey()));
    }

    public static function form(Schema $schema): Schema
    {
        return TeamMemberForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return TeamMembersTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTeamMembers::route('/'),
            'create' => Pages\CreateTeamMember::route('/create'),
            'edit' => Pages\EditTeamMember::route('/{record}/edit'),
        ];
    }

    public static function canViewAny(): bool
    {
        return static::userCan('view crm users');
    }

    public static function canCreate(): bool
    {
        return static::userCan('create crm users');
    }

    public static function canEdit(Model $record): bool
    {
        return static::userCan('edit crm users');
    }

    public static function canDelete(Model $record): bool
    {
        return static::userCan('delete crm users');
    }

    protected static function userCan(string $permission): bool
    {
        $user = Filament::auth()->user();

        if (! $user instanceof Authorizable) {
            return false;
        }

        TenantRoles::bindTeamContext();

        try {
            return $user->can($permission);
        } catch (\Throwable) {
            return false;
        }
    }
}
