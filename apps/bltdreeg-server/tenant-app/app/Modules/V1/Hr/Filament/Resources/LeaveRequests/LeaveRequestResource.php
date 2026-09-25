<?php

declare(strict_types=1);

namespace App\Modules\V1\Hr\Filament\Resources\LeaveRequests;

use App\Modules\V1\Hr\Filament\Resources\LeaveRequests\Pages\CreateLeaveRequest;
use App\Modules\V1\Hr\Filament\Resources\LeaveRequests\Pages\EditLeaveRequest;
use App\Modules\V1\Hr\Filament\Resources\LeaveRequests\Pages\ListLeaveRequests;
use App\Modules\V1\Hr\Filament\Resources\LeaveRequests\Pages\ViewLeaveRequest;
use App\Modules\V1\Hr\Support\EmployeeDirectory;
use App\Modules\V1\Hr\Support\LeaveRequestPresenter;
use BackedEnum;
use Bltdreeg\Core\Modules\Auth\Models\User;
use Bltdreeg\Core\Modules\Hr\Enums\LeaveRequestStatusEnum;
use Bltdreeg\Core\Modules\Hr\Enums\LeaveRequestTypeEnum;
use Bltdreeg\Core\Modules\Hr\Models\LeaveRequest;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
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

class LeaveRequestResource extends Resource
{
    protected static ?string $model = LeaveRequest::class;

    protected static ?string $slug = 'leave-requests';

    protected static ?int $navigationSort = 6;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedCalendarDays;

    protected static bool $isScopedToTenant = false;

    public static function getNavigationGroup(): string
    {
        return __('core::users.hr');
    }

    public static function getNavigationLabel(): string
    {
        return __('core::leave_requests.leave_requests');
    }

    public static function getLabel(): string
    {
        return __('core::leave_requests.leave_request');
    }

    public static function getPluralLabel(): string
    {
        return __('core::leave_requests.leave_requests');
    }

    public static function getModalLabel(): string
    {
        return __('core::leave_requests.leave_request');
    }

    public static function getPluralModalLabel(): string
    {
        return __('core::leave_requests.leave_requests');
    }

    /**
     * Reviewers work a whole branch, which the directory narrows for them.
     * Everyone else is an employee filing for themselves, and leave reasons are
     * private, so their list is their own records only.
     */
    public static function getEloquentQuery(): Builder
    {
        $query = parent::getEloquentQuery()->with(['user', 'approver', 'creator']);

        $user = Filament::auth()->user();

        if ($user instanceof User && ! $user->can('View:LeaveRequest')) {
            return $query->where('user_id', $user->getKey());
        }

        return EmployeeDirectory::scopeToBranchOf($query);
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make(__('core::leave_requests.leave_request_details'))
                    ->columnSpanFull()
                    ->columns(2)
                    ->schema([
                        Select::make('user_id')
                            ->label(__('core::attendance.employee'))
                            ->options(fn(): array => EmployeeDirectory::options())
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabledOn('view'),
                        Select::make('type')
                            ->label(__('core::leave_requests.type'))
                            ->options(LeaveRequestPresenter::typeOptions())
                            ->default(LeaveRequestTypeEnum::VACATION->value)
                            ->required()
                            ->disabledOn('view'),
                        DatePicker::make('start_date')
                            ->label(__('core::leave_requests.start_date'))
                            ->default(fn(): string => Carbon::today()->toDateString())
                            ->required()
                            ->disabledOn('view')
                            ->native(false),
                        DatePicker::make('end_date')
                            ->label(__('core::leave_requests.end_date'))
                            ->default(fn(): string => Carbon::today()->toDateString())
                            ->afterOrEqual('start_date')
                            ->required()
                            ->disabledOn('view')
                            ->native(false),
                        Textarea::make('reason')
                            ->label(__('core::leave_requests.reason'))
                            ->rows(3)
                            ->maxLength(1000)
                            ->columnSpanFull()
                            ->disabledOn('view'),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->defaultSort('start_date', 'desc')
            ->emptyStateHeading(__('core::leave_requests.no_leave_requests_yet'))
            ->columns([
                TextColumn::make('user.name')
                    ->label(__('core::attendance.employee'))
                    ->searchable()
                    ->sortable(),
                TextColumn::make('type')
                    ->label(__('core::leave_requests.type'))
                    ->formatStateUsing(fn(LeaveRequestTypeEnum $state): string => $state->label())
                    ->badge()
                    ->color(fn(LeaveRequestTypeEnum $state): string => LeaveRequestPresenter::typeColor($state))
                    ->icon(fn(LeaveRequestTypeEnum $state): Heroicon => LeaveRequestPresenter::typeIcon($state))
                    ->sortable(),
                TextColumn::make('start_date')
                    ->label(__('core::leave_requests.start_date'))
                    ->date('Y-m-d')
                    ->sortable(),
                TextColumn::make('end_date')
                    ->label(__('core::leave_requests.end_date'))
                    ->date('Y-m-d')
                    ->sortable(),
                TextColumn::make('duration')
                    ->label(__('core::leave_requests.duration'))
                    ->state(fn(LeaveRequest $record): string => LeaveRequestPresenter::days($record->days()))
                    ->badge()
                    ->color('gray'),
                TextColumn::make('status')
                    ->label(__('core::attendance.status'))
                    ->formatStateUsing(fn(LeaveRequest $record): string => LeaveRequestPresenter::statusLabel($record))
                    ->badge()
                    ->color(fn(LeaveRequest $record): string => LeaveRequestPresenter::statusColor($record->status))
                    ->icon(fn(LeaveRequest $record): Heroicon => LeaveRequestPresenter::statusIcon($record->status))
                    ->sortable(),
                TextColumn::make('reason')
                    ->label(__('core::leave_requests.reason'))
                    ->limit(40)
                    ->placeholder('—')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('approver.name')
                    ->label(__('core::leave_requests.decided_by'))
                    ->placeholder('—')
                    ->toggleable(),
                TextColumn::make('approved_at')
                    ->label(__('core::leave_requests.decided_at'))
                    ->dateTime()
                    ->placeholder('—')
                    ->toggleable(),
            ])
            ->filters([
                SelectFilter::make('user_id')
                    ->label(__('core::attendance.employee'))
                    ->options(fn(): array => EmployeeDirectory::options())
                    ->searchable()
                    ->attribute('user_id'),
                SelectFilter::make('type')
                    ->label(__('core::leave_requests.type'))
                    ->options(LeaveRequestPresenter::typeOptions())
                    ->attribute('type'),
                SelectFilter::make('status')
                    ->label(__('core::attendance.status'))
                    ->options(LeaveRequestPresenter::statusOptions())
                    ->attribute('status'),
                Filter::make('start_date')
                    ->label(__('core::leave_requests.start_date'))
                    ->schema([
                        DatePicker::make('from')
                            ->label(__('core::attendance.date_from'))
                            ->native(false),
                        DatePicker::make('to')
                            ->label(__('core::attendance.date_to'))
                            ->native(false),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                filled($data['from'] ?? null),
                                fn(Builder $query): Builder => $query->whereDate('start_date', '>=', $data['from']),
                            )
                            ->when(
                                filled($data['to'] ?? null),
                                fn(Builder $query): Builder => $query->whereDate('start_date', '<=', $data['to']),
                            );
                    }),
            ])
            ->recordActions([
                self::approveAction(),
                self::rejectAction(),
                self::cancelAction(),
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
                Section::make(__('core::leave_requests.leave_request_details'))
                    ->columnSpanFull()
                    ->columns(2)
                    ->schema([
                        TextEntry::make('user.name')
                            ->label(__('core::attendance.employee')),
                        TextEntry::make('type')
                            ->label(__('core::leave_requests.type'))
                            ->state(fn(LeaveRequest $record): string => $record->type->label())
                            ->badge()
                            ->color(fn(LeaveRequest $record): string => LeaveRequestPresenter::typeColor($record->type))
                            ->icon(fn(LeaveRequest $record): Heroicon => LeaveRequestPresenter::typeIcon($record->type)),
                        TextEntry::make('period')
                            ->label(__('core::leave_requests.duration'))
                            ->state(fn(LeaveRequest $record): string => LeaveRequestPresenter::period($record->start_date, $record->end_date)),
                        TextEntry::make('duration')
                            ->label(__('core::leave_requests.duration'))
                            ->state(fn(LeaveRequest $record): string => LeaveRequestPresenter::days($record->days()))
                            ->badge()
                            ->color('gray'),
                        TextEntry::make('status')
                            ->label(__('core::attendance.status'))
                            ->state(fn(LeaveRequest $record): string => LeaveRequestPresenter::statusLabel($record))
                            ->badge()
                            ->color(fn(LeaveRequest $record): string => LeaveRequestPresenter::statusColor($record->status))
                            ->icon(fn(LeaveRequest $record): Heroicon => LeaveRequestPresenter::statusIcon($record->status)),
                        TextEntry::make('approver.name')
                            ->label(__('core::leave_requests.decided_by'))
                            ->placeholder('—'),
                        TextEntry::make('approved_at')
                            ->label(__('core::leave_requests.decided_at'))
                            ->dateTime()
                            ->placeholder('—'),
                        TextEntry::make('reason')
                            ->label(__('core::leave_requests.reason'))
                            ->placeholder('—')
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListLeaveRequests::route('/'),
            'create' => CreateLeaveRequest::route('/create'),
            'edit' => EditLeaveRequest::route('/{record}/edit'),
            'view' => ViewLeaveRequest::route('/{record}'),
        ];
    }

    /**
     * Guards against double-booking the same person. Rejected and cancelled
     * requests are history, so only open ones block a new range.
     */
    public static function hasOverlappingRequest(
        int|string|null $userId,
        mixed $start,
        mixed $end,
        ?LeaveRequest $ignore = null,
    ): bool {
        if (blank($userId) || blank($start) || blank($end)) {
            return false;
        }

        return LeaveRequest::query()
            ->forUser($userId)
            ->overlapping((string) $start, (string) $end)
            ->whereIn('status', [LeaveRequestStatusEnum::PENDING, LeaveRequestStatusEnum::APPROVED])
            ->when(
                $ignore instanceof LeaveRequest,
                fn(Builder $query): Builder => $query->whereKeyNot($ignore->getKey()),
            )
            ->exists();
    }

    public static function approveAction(): Action
    {
        return Action::make('approve')
            ->label(__('core::leave_requests.approve'))
            ->icon(Heroicon::OutlinedCheckBadge)
            ->color('success')
            ->authorize('Approve:LeaveRequest')
            ->requiresConfirmation()
            ->visible(fn(LeaveRequest $record): bool => $record->isPending())
            ->action(function (LeaveRequest $record): void {
                if (! $record->isPending()) {
                    Notification::make()
                        ->warning()
                        ->title(__('core::leave_requests.already_decided'))
                        ->send();

                    return;
                }

                $record->forceFill([
                    'status' => LeaveRequestStatusEnum::APPROVED,
                    'approved_by' => Filament::auth()->id(),
                    'approved_at' => now(),
                ])->save();

                Notification::make()
                    ->success()
                    ->title(__('core::leave_requests.approved_successfully'))
                    ->send();
            });
    }

    public static function rejectAction(): Action
    {
        return Action::make('reject')
            ->label(__('core::leave_requests.reject'))
            ->icon(Heroicon::OutlinedXCircle)
            ->color('danger')
            ->authorize('Reject:LeaveRequest')
            ->requiresConfirmation()
            ->visible(fn(LeaveRequest $record): bool => $record->isPending())
            ->action(function (LeaveRequest $record): void {
                if (! $record->isPending()) {
                    Notification::make()
                        ->warning()
                        ->title(__('core::leave_requests.already_decided'))
                        ->send();

                    return;
                }

                $record->forceFill([
                    'status' => LeaveRequestStatusEnum::REJECTED,
                    'approved_by' => Filament::auth()->id(),
                    'approved_at' => now(),
                ])->save();

                Notification::make()
                    ->success()
                    ->title(__('core::leave_requests.rejected_successfully'))
                    ->send();
            });
    }

    public static function cancelAction(): Action
    {
        return Action::make('cancel')
            ->label(__('core::leave_requests.cancel'))
            ->icon(Heroicon::OutlinedNoSymbol)
            ->color('gray')
            ->authorize('cancel')
            ->requiresConfirmation()
            ->visible(fn(LeaveRequest $record): bool => $record->isPending())
            ->action(function (LeaveRequest $record): void {
                if (! $record->isPending()) {
                    Notification::make()
                        ->warning()
                        ->title(__('core::leave_requests.already_decided'))
                        ->send();

                    return;
                }

                $record->forceFill([
                    'status' => LeaveRequestStatusEnum::CANCELLED,
                ])->save();

                Notification::make()
                    ->success()
                    ->title(__('core::leave_requests.cancelled_successfully'))
                    ->send();
            });
    }
}
