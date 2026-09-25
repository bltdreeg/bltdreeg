<?php

declare(strict_types=1);

namespace App\Modules\V1\Hr\Filament\Resources\Adjustments;

use App\Modules\V1\Hr\Filament\Resources\Adjustments\Pages\CreateAdjustment;
use App\Modules\V1\Hr\Filament\Resources\Adjustments\Pages\EditAdjustment;
use App\Modules\V1\Hr\Filament\Resources\Adjustments\Pages\ListAdjustments;
use App\Modules\V1\Hr\Filament\Resources\Adjustments\Pages\ViewAdjustment;
use App\Modules\V1\Hr\Support\AdjustmentPresenter;
use App\Modules\V1\Hr\Support\EmployeeDirectory;
use BackedEnum;
use Bltdreeg\Core\Modules\Hr\Enums\EmployeeAdjustmentStatusEnum;
use Bltdreeg\Core\Modules\Hr\Enums\EmployeeAdjustmentTypeEnum;
use Bltdreeg\Core\Modules\Hr\Models\EmployeeAdjustment;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Facades\Filament;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
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

class EmployeeAdjustmentResource extends Resource
{
    protected static ?string $model = EmployeeAdjustment::class;

    protected static ?string $slug = 'adjustments';

    protected static ?int $navigationSort = 5;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedReceiptPercent;

    protected static bool $isScopedToTenant = false;

    public static function getNavigationGroup(): string
    {
        return __('core::users.hr');
    }

    public static function getNavigationLabel(): string
    {
        return __('core::adjustments.adjustments');
    }

    public static function getLabel(): string
    {
        return __('core::adjustments.adjustment');
    }

    public static function getPluralLabel(): string
    {
        return __('core::adjustments.adjustments');
    }

    public static function getModalLabel(): string
    {
        return __('core::adjustments.adjustment');
    }

    public static function getPluralModalLabel(): string
    {
        return __('core::adjustments.adjustments');
    }

    public static function getEloquentQuery(): Builder
    {
        return EmployeeDirectory::scopeToBranchOf(
            parent::getEloquentQuery()->with(['user', 'approver', 'creator'])
        );
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make(__('core::adjustments.adjustment_details'))
                    ->columnSpanFull()
                    ->columns(2)
                    ->schema([
                        Select::make('user_id')
                            ->label(__('core::attendance.employee'))
                            ->options(fn (): array => EmployeeDirectory::options())
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabledOn('view'),
                        Select::make('type')
                            ->label(__('core::adjustments.type'))
                            ->options(AdjustmentPresenter::typeOptions())
                            ->default(EmployeeAdjustmentTypeEnum::PENALTY->value)
                            ->required()
                            ->live()
                            ->disabledOn('view'),
                        TextInput::make('amount')
                            ->label(__('core::adjustments.amount'))
                            ->numeric()
                            ->minValue(0)
                            ->step(0.01)
                            ->required()
                            ->disabledOn('view'),
                        DatePicker::make('effective_date')
                            ->label(__('core::adjustments.effective_date'))
                            ->default(fn (): string => Carbon::today()->toDateString())
                            ->required()
                            ->disabledOn('view'),
                        Textarea::make('reason')
                            ->label(__('core::adjustments.reason'))
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
            ->defaultSort('effective_date', 'desc')
            ->columns([
                TextColumn::make('user.name')
                    ->label(__('core::attendance.employee'))
                    ->searchable()
                    ->sortable(),
                TextColumn::make('type')
                    ->label(__('core::adjustments.type'))
                    ->formatStateUsing(fn (EmployeeAdjustmentTypeEnum $state): string => $state->label())
                    ->badge()
                    ->color(fn (EmployeeAdjustmentTypeEnum $state): string => AdjustmentPresenter::typeColor($state))
                    ->icon(fn (EmployeeAdjustmentTypeEnum $state): Heroicon => AdjustmentPresenter::typeIcon($state))
                    ->sortable(),
                TextColumn::make('amount')
                    ->label(__('core::adjustments.amount'))
                    ->formatStateUsing(fn (mixed $state): string => AdjustmentPresenter::amount($state))
                    ->sortable(),
                TextColumn::make('effective_date')
                    ->label(__('core::adjustments.effective_date'))
                    ->date('Y-m-d')
                    ->sortable(),
                TextColumn::make('reason')
                    ->label(__('core::adjustments.reason'))
                    ->limit(40)
                    ->placeholder('—')
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('status')
                    ->label(__('core::attendance.status'))
                    ->formatStateUsing(fn (EmployeeAdjustment $record): string => AdjustmentPresenter::statusLabel($record))
                    ->badge()
                    ->color(fn (EmployeeAdjustment $record): string => AdjustmentPresenter::statusColorFor($record))
                    ->icon(fn (EmployeeAdjustment $record): Heroicon => AdjustmentPresenter::statusIconFor($record))
                    ->sortable(),
                TextColumn::make('approver.name')
                    ->label(__('core::adjustments.approved_by'))
                    ->placeholder(__('core::adjustments.pending_approval'))
                    ->toggleable(),
                TextColumn::make('approved_at')
                    ->label(__('core::adjustments.approved_at'))
                    ->dateTime()
                    ->placeholder('—')
                    ->toggleable(),
            ])
            ->filters([
                SelectFilter::make('user_id')
                    ->label(__('core::attendance.employee'))
                    ->options(fn (): array => EmployeeDirectory::options())
                    ->searchable()
                    ->attribute('user_id'),
                SelectFilter::make('type')
                    ->label(__('core::adjustments.type'))
                    ->options(AdjustmentPresenter::typeOptions())
                    ->attribute('type'),
                SelectFilter::make('status')
                    ->label(__('core::attendance.status'))
                    ->options(AdjustmentPresenter::statusOptions())
                    ->attribute('status'),
                Filter::make('effective_date')
                    ->label(__('core::adjustments.effective_date'))
                    ->schema([
                        DatePicker::make('from')
                            ->label(__('core::attendance.date_from')),
                        DatePicker::make('to')
                            ->label(__('core::attendance.date_to')),
                    ])
                    ->query(function (Builder $query, array $data): Builder {
                        return $query
                            ->when(
                                filled($data['from'] ?? null),
                                fn (Builder $query): Builder => $query->whereDate('effective_date', '>=', $data['from']),
                            )
                            ->when(
                                filled($data['to'] ?? null),
                                fn (Builder $query): Builder => $query->whereDate('effective_date', '<=', $data['to']),
                            );
                    }),
            ])
            ->recordActions([
                self::approveAction(),
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
                Section::make(__('core::adjustments.adjustment_details'))
                    ->columnSpanFull()
                    ->columns(2)
                    ->schema([
                        TextEntry::make('user.name')
                            ->label(__('core::attendance.employee')),
                        TextEntry::make('type')
                            ->label(__('core::adjustments.type'))
                            ->state(fn (EmployeeAdjustment $record): string => $record->type->label())
                            ->badge()
                            ->color(fn (EmployeeAdjustment $record): string => AdjustmentPresenter::typeColor($record->type))
                            ->icon(fn (EmployeeAdjustment $record): Heroicon => AdjustmentPresenter::typeIcon($record->type)),
                        TextEntry::make('amount')
                            ->label(__('core::adjustments.amount'))
                            ->state(fn (EmployeeAdjustment $record): string => AdjustmentPresenter::amount($record->amount)),
                        TextEntry::make('effective_date')
                            ->label(__('core::adjustments.effective_date'))
                            ->date('Y-m-d'),
                        TextEntry::make('status')
                            ->label(__('core::attendance.status'))
                            ->state(fn (EmployeeAdjustment $record): string => AdjustmentPresenter::statusLabel($record))
                            ->badge()
                            ->color(fn (EmployeeAdjustment $record): string => AdjustmentPresenter::statusColorFor($record))
                            ->icon(fn (EmployeeAdjustment $record): Heroicon => AdjustmentPresenter::statusIconFor($record)),
                        TextEntry::make('approver.name')
                            ->label(__('core::adjustments.approved_by'))
                            ->placeholder(__('core::adjustments.pending_approval')),
                        TextEntry::make('approved_at')
                            ->label(__('core::adjustments.approved_at'))
                            ->dateTime()
                            ->placeholder('—'),
                        TextEntry::make('reason')
                            ->label(__('core::adjustments.reason'))
                            ->placeholder('—')
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListAdjustments::route('/'),
            'create' => CreateAdjustment::route('/create'),
            'edit' => EditAdjustment::route('/{record}/edit'),
            'view' => ViewAdjustment::route('/{record}'),
        ];
    }

    /**
     * Row action that marks an adjustment as approved and stamps the approver.
     */
    public static function approveAction(): Action
    {
        return Action::make('approve')
            ->label(__('core::adjustments.approve'))
            ->icon(Heroicon::OutlinedCheckBadge)
            ->color('success')
            ->authorize('Approve:EmployeeAdjustment')
            ->requiresConfirmation()
            ->visible(fn (EmployeeAdjustment $record): bool => $record->isPending())
            ->action(function (EmployeeAdjustment $record): void {
                if (! $record->isPending()) {
                    Notification::make()
                        ->warning()
                        ->title(__('core::adjustments.already_approved'))
                        ->send();

                    return;
                }

                $record->forceFill([
                    'status' => EmployeeAdjustmentStatusEnum::APPROVED,
                    'approved_by' => Filament::auth()->id(),
                    'approved_at' => now(),
                ])->save();

                Notification::make()
                    ->success()
                    ->title(__('core::adjustments.approved_successfully'))
                    ->send();
            });
    }
}
