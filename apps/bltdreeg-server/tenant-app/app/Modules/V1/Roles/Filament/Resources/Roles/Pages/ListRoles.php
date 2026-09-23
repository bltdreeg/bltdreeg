<?php

declare(strict_types=1);

namespace App\Modules\V1\Roles\Filament\Resources\Roles\Pages;

use App\Modules\V1\Roles\Filament\Resources\Roles\RoleResource;
use Bltdreeg\Core\Modules\Auth\Models\RoleTemplate;
use Bltdreeg\Core\Modules\Auth\Support\RoleTemplateImporter;
use Filament\Actions\Action;
use Filament\Actions\CreateAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\Select;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;

class ListRoles extends ListRecords
{
    protected static string $resource = RoleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('importFromCatalog')
                ->label('Import from catalog')
                ->icon('heroicon-o-arrow-down-tray')
                ->form([
                    Select::make('role_template_id')
                        ->label('Role template')
                        ->options(
                            RoleTemplate::query()
                                ->where('is_active', true)
                                ->orderBy('name')
                                ->pluck('name', 'id')
                        )
                        ->required()
                        ->searchable(),
                ])
                ->action(function (array $data): void {
                    $tenant = Filament::getTenant();
                    $template = RoleTemplate::query()->findOrFail($data['role_template_id']);

                    app(RoleTemplateImporter::class)->importTemplate($template, $tenant);

                    Notification::make()
                        ->title('Role imported')
                        ->body("Imported “{$template->name}” into this salon.")
                        ->success()
                        ->send();
                }),
            CreateAction::make(),
        ];
    }
}
