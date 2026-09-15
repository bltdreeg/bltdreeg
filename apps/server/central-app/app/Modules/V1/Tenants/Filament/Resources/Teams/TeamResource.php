<?php

namespace App\Modules\V1\Tenants\Filament\Resources\Teams;

use App\Modules\V1\Tenants\Filament\Resources\Teams\Pages\CreateTeam;
use App\Modules\V1\Tenants\Filament\Resources\Teams\Pages\EditTeam;
use App\Modules\V1\Tenants\Filament\Resources\Teams\Pages\ListTeams;
use App\Modules\V1\Tenants\Filament\Resources\Teams\Schemas\TeamForm;
use App\Modules\V1\Tenants\Filament\Resources\Teams\Tables\TeamsTable;
use BackedEnum;
use Bltdreeg\Core\Models\Team;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class TeamResource extends Resource
{
    protected static ?string $model = Team::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedBuildingOffice2;

    protected static ?string $navigationLabel = 'Tenants';

    protected static ?string $modelLabel = 'tenant';

    protected static ?string $pluralModelLabel = 'tenants';

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return TeamForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return TeamsTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListTeams::route('/'),
            'create' => CreateTeam::route('/create'),
            'edit' => EditTeam::route('/{record}/edit'),
        ];
    }
}
