<?php

declare(strict_types=1);

namespace App\Modules\V1\Hr\Filament\Resources\Attendance;

use App\Modules\V1\Hr\Filament\Resources\Attendance\Pages\CreateAttendance;
use App\Modules\V1\Hr\Filament\Resources\Attendance\Pages\EditAttendance;
use App\Modules\V1\Hr\Filament\Resources\Attendance\Pages\ListAttendance;
use App\Modules\V1\Hr\Filament\Resources\Attendance\Pages\ViewAttendance;
use App\Modules\V1\Hr\Services\AttendanceService;
use App\Modules\V1\Hr\Support\AttendancePresenter;
use BackedEnum;
use Bltdreeg\Core\Enums\AttendenceStatusEnum;
use Bltdreeg\Core\Models\Branch;
use Bltdreeg\Core\Models\EmployeeAttendance;
use Bltdreeg\Core\Models\Shift;
use Bltdreeg\Core\Models\User;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TimePicker;
use Filament\Infolists\Components\TextEntry;
use Filament\Notifications\Notification;
use Filament\Resources\Resource;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\Filter;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;

class EmployeeAttendanceResource extends Resource
{
    protected static ?string $model = EmployeeAttendance::class;

    protected static ?string $slug = 'attendance';

    protected static ?int $navigationSort = 2;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedClock;

    protected static bool $isScopedToTenant = false;

    public static function getNavigationGroup(): string
    {
        return __('core::users.hr');
    }

    public static function getNavigationLabel(): string
    {
        return __('core::attendance.attendance');
    }

    public static function getLabel(): string
    {
        return __('core::attendance.attendance');
    }

    public static function getModalLabel(): string
    {
        return __('core::attendance.attendance_record');
    }

    public static function getPluralLabel(): string
    {
        return __('core::attendance.attendance');
    }

    public static function getPluralModalLabel(): string
    {
        return __('core::attendance.attendance records');
    }

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()->with(['user', 'branch', 'shift']);
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make(__('core::attendance.attendance_dashboard'))
                    ->columnSpanFull()
                    ->columns(4)
                    ->schema([
                        Select::make('user_id')
                            ->label(__('core::attendance.employee'))
                            ->options(fn (): array => self::tenantUsers()->pluck('name', 'id')->all())
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabledOn('view'),
                        Select::make('branch_id')
                            ->label(__('core::attendance.branch'))
                            ->options(fn (): array => self::tenantBranches()->pluck('name', 'id')->all())
                            ->searchable()
                            ->required()
                            ->disabledOn('view'),
                        Select::make('shift_id')
                            ->label(__('core::attendance.shift'))
                            ->options(fn (): array => self::tenantShifts()->pluck('name', 'id')->all())
                            ->nullable()
                            ->searchable()
                            ->placeholder(__('core::attendance.no_shift'))
                            ->disabledOn('view'),
                        DatePicker::make('date')
                            ->label(__('core::attendance.date'))
                            ->default(fn (): string => Carbon::today()->toDateString())
                            ->required()
                            ->disabledOn('view'),
                        Select::make('status')
                            ->label(__('core::attendance.status'))
                            ->options(AttendancePresenter::statusOptions())
                            ->default(AttendenceStatusEnum::PRESENT->value)
                            ->required()
                            ->disabledOn('view'),
                        TimePicker::make('check_in')
                            ->label(__('core::attendance.check_in_time'))
                            ->seconds(false)
                            ->disabledOn('view'),
                        TimePicker::make('check_out')
                            ->label(__('core::attendance.check_out_time'))
                            ->seconds(false)
                            ->disabledOn('view'),
                        Textarea::make('notes')
                            ->label(__('core::attendance.notes'))
                            ->rows(2)
                            ->columnSpanFull()
                            ->disabledOn('view'),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('date', 'desc')
            ->columns([
                TextColumn::make('user.name')
                    ->label(__('core::attendance.employee'))
                    ->searchable()
                    ->sortable(),
                TextColumn::make('branch.name')
                    ->label(__('core::attendance.branch'))
                    ->searchable()
                    ->sortable(),
                TextColumn::make('shift.name')
                    ->label(__('core::attendance.shift'))
                    ->placeholder(__('core::attendance.no_shift'))
                    ->sortable(),
                TextColumn::make('date')
                    ->label(__('core::attendance.date'))
                    ->date('Y-m-d')
                    ->sortable(),
                TextColumn::make('check_in')
                    ->label(__('core::attendance.check_in_time'))
                    ->dateTime('H:i')
                    ->placeholder('—')
                    ->sortable(),
                TextColumn::make('check_out')
                    ->label(__('core::attendance.check_out_time'))
                    ->dateTime('H:i')
                    ->placeholder('—')
                    ->sortable(),
                TextColumn::make('worked_minutes')
                    ->label(__('core::attendance.worked_hours'))
                    ->formatStateUsing(fn (?int $state): string => AttendancePresenter::minutesClock($state))
                    ->placeholder('—')
                    ->sortable(),
                TextColumn::make('late_minutes')
                    ->label(__('core::attendance.late_minutes'))
                    ->formatStateUsing(fn (int $state): string => AttendancePresenter::minutesClock($state))
                    ->placeholder('—')
                    ->sortable(),
                TextColumn::make('overtime_minutes')
                    ->label(__('core::attendance.overtime'))
                    ->formatStateUsing(fn (int $state): string => AttendancePresenter::minutesClock($state))
                    ->placeholder('—')
                    ->sortable(),
                TextColumn::make('status')
                    ->label(__('core::attendance.status'))
                    ->formatStateUsing(fn (AttendenceStatusEnum $state): string => $state->label())
                    ->badge()
                    ->color(fn (AttendenceStatusEnum $state): string => AttendancePresenter::statusColor($state))
                    ->icon(fn (AttendenceStatusEnum $state): Heroicon => AttendancePresenter::statusIcon($state)),
            ])
            ->filters([
                SelectFilter::make('user_id')
                    ->label(__('core::attendance.employee'))
                    ->options(fn (): array => self::tenantUsers()->pluck('name', 'id')->all())
                    ->searchable()
                    ->attribute('user_id'),
                SelectFilter::make('branch_id')
                    ->label(__('core::attendance.branch'))
                    ->options(fn (): array => self::tenantBranches()->pluck('name', 'id')->all())
                    ->searchable()
                    ->attribute('branch_id'),
                Filter::make('date')
                    ->label(__('core::attendance.date'))
                    ->schema([
                        DatePicker::make('from')
                            ->label(__('core::attendance.date_from'))
                            ->default(fn (): string => Carbon::today()->toDateString()),
                        DatePicker::make('to')
                            ->label(__('core::attendance.date_to'))
                            ->default(fn (): string => Carbon::today()->toDateString()),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                filled($data['from']),
                                fn (Builder $query) => $query->whereDate('date', '>=', $data['from']),
                            )
                            ->when(
                                filled($data['to']),
                                fn (Builder $query) => $query->whereDate('date', '<=', $data['to']),
                            );
                    })
                    ->indicateUsing(function (array $data): array {
                        $from = filled($data['from']) ? Carbon::parse($data['from'])->toDateString() : null;
                        $to = filled($data['to']) ? Carbon::parse($data['to'])->toDateString() : null;

                        if ($from === null && $to === null) {
                            return [];
                        }

                        $indicator = __('core::attendance.date').': ';

                        if ($from !== null && $to !== null && $from === $to) {
                            return [$indicator.$from];
                        }

                        return [$indicator.($from ?? '*').' - '.($to ?? '*')];
                    }),
                SelectFilter::make('status')
                    ->label(__('core::attendance.status'))
                    ->options(AttendancePresenter::statusOptions())
                    ->attribute('status'),
            ])
            ->recordActions([
                self::checkInAction(),
                self::checkOutAction(),
                ViewAction::make(),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make(__('core::attendance.attendance_dashboard'))
                    ->columnSpanFull()
                    ->columns(4)
                    ->schema([
                        TextEntry::make('user.name')
                            ->label(__('core::attendance.employee')),
                        TextEntry::make('branch.name')
                            ->label(__('core::attendance.branch')),
                        TextEntry::make('shift.name')
                            ->label(__('core::attendance.shift'))
                            ->placeholder(__('core::attendance.no_shift')),
                        TextEntry::make('date')
                            ->label(__('core::attendance.date'))
                            ->date('Y-m-d'),
                        TextEntry::make('status')
                            ->label(__('core::attendance.status'))
                            ->state(fn (EmployeeAttendance $record): string => $record->status->label())
                            ->icon(fn (EmployeeAttendance $record): Heroicon => AttendancePresenter::statusIcon($record->status))
                            ->color(fn (EmployeeAttendance $record): string => AttendancePresenter::statusColor($record->status))
                            ->badge(),
                        TextEntry::make('check_in')
                            ->label(__('core::attendance.check_in_time'))
                            ->dateTime('H:i')
                            ->placeholder('—'),
                        TextEntry::make('check_out')
                            ->label(__('core::attendance.check_out_time'))
                            ->dateTime('H:i')
                            ->placeholder('—'),
                        TextEntry::make('worked_minutes')
                            ->label(__('core::attendance.worked_hours'))
                            ->formatStateUsing(fn (?int $state): string => AttendancePresenter::minutesClock($state)),
                        TextEntry::make('late_minutes')
                            ->label(__('core::attendance.late_minutes'))
                            ->formatStateUsing(fn (int $state): string => AttendancePresenter::minutesClock($state)),
                        TextEntry::make('overtime_minutes')
                            ->label(__('core::attendance.overtime'))
                            ->formatStateUsing(fn (int $state): string => AttendancePresenter::minutesClock($state)),
                        TextEntry::make('notes')
                            ->label(__('core::attendance.notes'))
                            ->placeholder('—'),
                    ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListAttendance::route('/'),
            'create' => CreateAttendance::route('/create'),
            'edit' => EditAttendance::route('/{record}/edit'),
            'view' => ViewAttendance::route('/{record}'),
        ];
    }

    /**
     * Row action that stamps today's check-in time on an attendance record.
     */
    public static function checkInAction(): Action
    {
        return Action::make('check-in')
            ->label(__('core::attendance.check_in'))
            ->icon(Heroicon::OutlinedArrowDownTray)
            ->color('success')
            ->authorize('attendance.check-in')
            ->visible(fn (EmployeeAttendance $record): bool => $record->isToday() && ! $record->isCheckedIn())
            ->action(function (EmployeeAttendance $record, AttendanceService $service): void {
                $checked = $service->checkIn($record->user);

                Notification::make()
                    ->success()
                    ->title(__('core::attendance.checked_in_at').' '.$checked->check_in->format('H:i'))
                    ->send();
            });
    }

    /**
     * Row action that stamps today's check-out time and finalises worked hours.
     */
    public static function checkOutAction(): Action
    {
        return Action::make('check-out')
            ->label(__('core::attendance.check_out'))
            ->icon(Heroicon::OutlinedArrowLeftOnRectangle)
            ->color('warning')
            ->authorize('attendance.check-out')
            ->requiresConfirmation()
            ->visible(fn (EmployeeAttendance $record): bool => $record->isToday() && $record->isCheckedIn() && ! $record->isCheckedOut())
            ->action(function (EmployeeAttendance $record, AttendanceService $service): void {
                $checked = $service->checkOut($record->user);

                $message = __('core::attendance.worked_hours').': '.AttendancePresenter::minutesClock($checked->worked_minutes);

                if ($checked->overtime_minutes > 0) {
                    $message .= ' · '.__('core::attendance.overtime').' '.AttendancePresenter::minutesClock($checked->overtime_minutes);
                }

                Notification::make()
                    ->success()
                    ->title(__('core::attendance.check_out').' · '.$checked->check_out->format('H:i'))
                    ->body($message)
                    ->send();
            });
    }

    private static function tenantUsers(): Collection
    {
        $tenantId = Filament::getTenant()?->getKey();

        return User::query()
            ->where('is_active', true)
            ->whereHas('tenants', fn (Builder $query) => $query->whereKey($tenantId))
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    private static function tenantBranches(): Collection
    {
        return Branch::query()
            ->where('is_active', true)
            ->where('tenant_id', Filament::getTenant()?->getKey())
            ->orderBy('name')
            ->get(['id', 'name']);
    }

    private static function tenantShifts(): Collection
    {
        return Shift::query()
            ->where('is_active', true)
            ->where('tenant_id', Filament::getTenant()?->getKey())
            ->orderBy('name')
            ->get(['id', 'name']);
    }
}
