<?php

namespace App\Modules\V1\Hr\Filament\Resources\Attendance\Pages;

use App\Modules\V1\Hr\Exceptions\AttendanceException;
use App\Modules\V1\Hr\Filament\Resources\Attendance\EmployeeAttendanceResource;
use App\Modules\V1\Hr\Filament\Resources\Attendance\Widgets\AttendanceOverview;
use App\Modules\V1\Hr\Filament\Resources\Attendance\Widgets\PendingCheckInTable;
use App\Modules\V1\Hr\Services\AttendanceService;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Filament\Actions\Action;
use Filament\Actions\CreateAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\Select;
use Filament\Notifications\Notification;
use Filament\Resources\Pages\ListRecords;
use Filament\Support\Icons\Heroicon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Throwable;

class ListAttendance extends ListRecords
{
    protected static string $resource = EmployeeAttendanceResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('quick-check-in')
                ->label(__('core::attendance.quick_check_in'))
                ->icon(Heroicon::OutlinedArrowDownTray)
                ->color('success')
                ->authorize('CheckIn:EmployeeAttendance')
                ->schema([
                    Select::make('employee')
                        ->label(__('core::attendance.employee'))
                        ->options(fn (): array => $this->eligibleCheckInEmployees())
                        ->searchable()
                        ->required(),
                ])
                ->action(function (array $data, AttendanceService $service): void {
                    $this->performCheckIn((int) $data['employee'], $service);
                }),
            CreateAction::make(),
        ];
    }

    protected function getHeaderWidgets(): array
    {
        $date = Carbon::today()->toDateString();

        return [
            AttendanceOverview::make(['date' => $date]),
            PendingCheckInTable::make(['date' => $date]),
        ];
    }

    public function getHeaderWidgetsColumns(): int|array
    {
        return 1;
    }

    /**
     * @return array<string, string>
     */
    private function eligibleCheckInEmployees(): array
    {
        $tenant = Filament::getTenant();

        if ($tenant === null) {
            return [];
        }

        $checkedIn = EmployeeAttendanceResource::getEloquentQuery()
            ->whereDate('date', Carbon::today())
            ->whereNotNull('check_in')
            ->pluck('user_id');

        return User::query()
            ->where('is_active', true)
            ->whereHas('tenants', fn (Builder $query): Builder => $query->whereKey($tenant->getKey()))
            ->when($checkedIn->isNotEmpty(), fn (Builder $query): Builder => $query->whereNotIn('id', $checkedIn))
            ->orderBy('name')
            ->pluck('name', 'id')
            ->all();
    }

    private function performCheckIn(int|string $userId, AttendanceService $service): void
    {
        $user = User::query()->find($userId);

        if (! $user instanceof User) {
            Notification::make()
                ->danger()
                ->title(__('core::attendance.user_not_found'))
                ->send();

            return;
        }

        try {
            $record = $service->checkIn($user);

            Notification::make()
                ->success()
                ->title(__('core::attendance.checked_in_at').' '.$record->check_in->format('H:i'))
                ->send();
        } catch (AttendanceException $e) {
            Notification::make()->danger()->title($e->getMessage())->send();
        } catch (Throwable $e) {
            report($e);

            Notification::make()->danger()->title(__('core::attendance.failed'))->send();
        }
    }
}
