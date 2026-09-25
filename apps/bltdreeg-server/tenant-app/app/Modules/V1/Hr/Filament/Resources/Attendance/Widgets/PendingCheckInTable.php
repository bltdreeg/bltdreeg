<?php

namespace App\Modules\V1\Hr\Filament\Resources\Attendance\Widgets;

use App\Modules\V1\Hr\Exceptions\AttendanceException;
use App\Modules\V1\Hr\Filament\Resources\Attendance\EmployeeAttendanceResource;
use App\Modules\V1\Hr\Services\AttendanceService;
use App\Modules\V1\Hr\Support\EmployeeDirectory;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Filament\Actions\Action;
use Filament\Facades\Filament;
use Filament\Notifications\Notification;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Filament\Widgets\TableWidget;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Throwable;

class PendingCheckInTable extends TableWidget
{
    protected static bool $isDiscovered = false;

    public ?string $date = null;

    public function table(Table $table): Table
    {
        return $table
            ->heading(__('core::attendance.pending_check_in'))
            ->query(fn (): Builder => $this->pendingEmployeesQuery())
            ->columns([
                TextColumn::make('name')
                    ->label(__('core::attendance.employee'))
                    ->searchable()
                    ->sortable(),
                TextColumn::make('branch.name')
                    ->label(__('core::attendance.branch'))
                    ->sortable(),
            ])
            ->recordActions([
                Action::make('check-in')
                    ->label(__('core::attendance.check_in'))
                    ->icon(Heroicon::OutlinedArrowDownTray)
                    ->color('success')
                    ->authorize('CheckIn:EmployeeAttendance')
                    ->action(function (User $record): void {
                        $this->checkIn($record);
                    }),
            ])
            ->emptyStateHeading(__('core::attendance.all_employees_checked_in'))
            ->defaultPaginationPageOption(5);
    }

    protected function pendingEmployeesQuery(): Builder
    {
        $tenant = Filament::getTenant();

        if (! $tenant instanceof Tenant) {
            return User::query()->whereKey(0);
        }

        $date = $this->date ?? Carbon::today()->toDateString();

        $checkedIn = EmployeeAttendanceResource::getEloquentQuery()
            ->whereDate('date', $date)
            ->whereNotNull('check_in')
            ->pluck('user_id');

        return EmployeeDirectory::query($tenant)
            ->when($checkedIn->isNotEmpty(), fn (Builder $query): Builder => $query->whereNotIn('id', $checkedIn));
    }

    private function checkIn(User $user): void
    {
        try {
            $record = app(AttendanceService::class)->checkIn($user);

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
