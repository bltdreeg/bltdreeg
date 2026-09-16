<?php

namespace App\Modules\V1\Roles\Filament\Resources\Roles\Pages;

use App\Modules\V1\Roles\Filament\Resources\Roles\RoleResource;
use App\Modules\V1\Roles\Models\Role;
use App\Modules\V1\Roles\Services\RoleService;
use Bltdreeg\Core\Support\TenantPermissions;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Facades\Filament;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\EditRecord;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Model;

class EditRole extends EditRecord
{
    protected static string $resource = RoleResource::class;

    protected function mutateFormDataBeforeFill(array $data): array
    {
        $assigned = $this->record->permissions->pluck('name');

        foreach (TenantPermissions::groupedByResource() as $resource => $group) {
            $data['permission_groups'][$resource] = $assigned
                ->intersect(array_keys($group['options']))
                ->values()
                ->all();
        }

        return $data;
    }

    protected function mutateFormDataBeforeSave(array $data): array
    {
        $data['permissions'] = collect($data['permission_groups'] ?? [])
            ->flatten()
            ->filter()
            ->values()
            ->all();
        unset($data['permission_groups']);

        return $data;
    }

    protected function handleRecordUpdate(Model $record, array $data): Model
    {
        /** @var Role $record */
        return app(RoleService::class)->update($record, $data, Filament::getTenant()->getKey());
    }

    protected function getHeaderActions(): array
    {
        return [
            Action::make('duplicate')
                ->label('Duplicate')
                ->icon(Heroicon::OutlinedSquare2Stack)
                ->requiresConfirmation()
                ->visible(fn (): bool => auth()->user()?->can('roles.bulk-duplicate') ?? false)
                ->action(function (RoleService $roles): void {
                    $copy = $roles->duplicate($this->getRecord(), Filament::getTenant()->getKey());

                    Notification::make()
                        ->title("Duplicated as {$copy->name}")
                        ->success()
                        ->send();

                    $this->redirect(RoleResource::getUrl('edit', ['record' => $copy]));
                }),
            DeleteAction::make()
                ->hidden(fn (Role $record): bool => $record->is_system)
                ->using(fn (Role $record): bool => app(RoleService::class)->delete($record)),
        ];
    }
}
