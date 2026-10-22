<?php

namespace App\Modules\V1\Inventory\Filament\Resources\Purchases;

use App\Modules\V1\Inventory\Exceptions\InventoryException;
use App\Modules\V1\Inventory\Filament\Resources\Purchases\Pages\CreatePurchase;
use App\Modules\V1\Inventory\Filament\Resources\Purchases\Pages\EditPurchase;
use App\Modules\V1\Inventory\Filament\Resources\Purchases\Pages\ListPurchases;
use App\Modules\V1\Inventory\Filament\Resources\Purchases\Pages\ViewPurchase;
use App\Modules\V1\Inventory\Filament\Resources\Purchases\RelationManagers\PurchaseItemsRelationManager;
use App\Modules\V1\Inventory\Filament\Resources\Purchases\RelationManagers\PurchaseTransactionsRelationManager;
use App\Modules\V1\Inventory\Services\PurchaseService;
use App\Modules\V1\Inventory\Support\InventoryDirectory;
use App\Modules\V1\Inventory\Support\InventoryPresenter;
use BackedEnum;
use Bltdreeg\Core\Modules\Inventory\Models\Purchase;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Repeater;
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
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

/**
 * Purchases from suppliers.
 *
 * Saving is delegated to PurchaseService rather than writing the models directly,
 * because the header totals and the item rows have to agree with each other. Once
 * a purchase is received its items are locked: editing them would desynchronise
 * the stock that was already credited.
 */
class PurchaseResource extends Resource
{
    protected static ?string $model = Purchase::class;

    protected static ?string $slug = 'purchases';

    protected static ?int $navigationSort = 4;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedShoppingCart;

    protected static bool $isScopedToTenant = false;

    public static function getNavigationGroup(): string
    {
        return __('core::inventory.inventory');
    }

    public static function getNavigationLabel(): string
    {
        return __('core::inventory.purchases');
    }

    public static function getModelLabel(): string
    {
        return __('core::inventory.purchase');
    }

    public static function getPluralModelLabel(): string
    {
        return __('core::inventory.purchases');
    }

    public static function getEloquentQuery(): Builder
    {
        return InventoryDirectory::scopeToTenant(parent::getEloquentQuery())
            ->with(['branch'])
            ->withSum('items', 'total');
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make(__('core::inventory.details'))
                    ->columnSpanFull()
                    ->columns(2)
                    ->schema([
                        Select::make('branch_id')
                            ->label(__('core::inventory.branch'))
                            ->options(fn (): array => InventoryDirectory::branchOptions())
                            ->searchable()
                            ->preload()
                            ->required()
                            ->disabled(fn (?Purchase $record): bool => $record?->isReceived() ?? false),
                        DatePicker::make('purchase_date')
                            ->label(__('core::inventory.purchase_date'))
                            ->default(now())
                            ->required()
                            ->disabled(fn (?Purchase $record): bool => $record?->isReceived() ?? false),
                        TextInput::make('supplier_name')
                            ->label(__('core::inventory.supplier_name'))
                            ->maxLength(255)
                            ->disabled(fn (?Purchase $record): bool => $record?->isReceived() ?? false),
                        TextInput::make('supplier_phone')
                            ->label(__('core::inventory.supplier_phone'))
                            ->tel()
                            ->maxLength(30)
                            ->disabled(fn (?Purchase $record): bool => $record?->isReceived() ?? false),
                        Textarea::make('notes')
                            ->label(__('core::inventory.notes'))
                            ->rows(2)
                            ->columnSpanFull()
                            ->disabled(fn (?Purchase $record): bool => $record?->isReceived() ?? false),
                    ]),
                Section::make(__('core::inventory.items'))
                    ->columnSpanFull()
                    ->schema([
                        Repeater::make('items')
                            ->label(__('core::inventory.items'))
                            // Hidden, not removed: the service always expects the
                            // key, and a received purchase must still show what it
                            // was received for.
                            ->hiddenLabel()
                            ->schema([
                                Select::make('product_id')
                                    ->label(__('core::inventory.product'))
                                    ->options(fn (): array => InventoryDirectory::productOptions(activeOnly: true))
                                    ->searchable()
                                    ->required()
                                    ->distinct()
                                    ->columnSpan(4),
                                TextInput::make('quantity')
                                    ->label(__('core::inventory.quantity'))
                                    ->numeric()
                                    ->minValue(0.001)
                                    ->required()
                                    ->default(1)
                                    ->columnSpan(2),
                                TextInput::make('unit_cost')
                                    ->label(__('core::inventory.unit_cost'))
                                    ->numeric()
                                    ->minValue(0)
                                    ->required()
                                    ->default(0)
                                    ->columnSpan(2),
                                TextInput::make('discount')
                                    ->label(__('core::inventory.discount'))
                                    ->numeric()
                                    ->minValue(0)
                                    ->default(0)
                                    ->columnSpan(2),
                                TextInput::make('tax')
                                    ->label(__('core::inventory.tax'))
                                    ->numeric()
                                    ->minValue(0)
                                    ->default(0)
                                    ->columnSpan(2),
                                Textarea::make('notes')
                                    ->label(__('core::inventory.notes'))
                                    ->rows(1)
                                    ->columnSpanFull(),
                            ])
                            ->columns(12)
                            ->defaultItems(1)
                            ->addActionLabel(__('core::inventory.add_item'))
                            ->reorderable(false)
                            // A received purchase's items are the audit trail for
                            // stock that has already been credited.
                            ->disabled(fn (?Purchase $record): bool => $record?->isReceived() ?? false)
                            ->itemLabel(fn (array $state): string => InventoryDirectory::productName($state['product_id'] ?? null)
                                ?? __('core::inventory.item')),
                    ]),
                Section::make(__('core::inventory.grand_total'))
                    ->columnSpanFull()
                    ->columns(3)
                    ->schema([
                        TextInput::make('discount')
                            ->label(__('core::inventory.discount'))
                            ->numeric()
                            ->minValue(0)
                            ->default(0),
                        TextInput::make('tax')
                            ->label(__('core::inventory.tax'))
                            ->numeric()
                            ->minValue(0)
                            ->default(0),
                        // Placeholder rather than a bound input: the real total is
                        // always recomputed from the items by the service, so
                        // letting it be typed would only let it drift.
                        TextInput::make('total')
                            ->label(__('core::inventory.grand_total'))
                            ->disabled()
                            ->dehydrated(false),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('purchase_number')
                    ->label(__('core::inventory.purchase_number'))
                    ->searchable()
                    ->sortable(),
                TextColumn::make('purchase_date')
                    ->label(__('core::inventory.purchase_date'))
                    ->date()
                    ->sortable(),
                TextColumn::make('supplier_name')
                    ->label(__('core::inventory.supplier_name'))
                    ->searchable()
                    ->placeholder('—')
                    ->sortable(),
                TextColumn::make('branch.name')
                    ->label(__('core::inventory.branch'))
                    ->formatStateUsing(fn (Purchase $record): string => InventoryDirectory::branchLabel($record->branch))
                    ->placeholder('—')
                    ->sortable(),
                TextColumn::make('status')
                    ->label(__('core::inventory.status'))
                    ->formatStateUsing(fn (Purchase $record): string => InventoryPresenter::purchaseStatusLabel($record->status))
                    ->badge()
                    ->icon(fn (Purchase $record): Heroicon => InventoryPresenter::purchaseStatusIcon($record->status))
                    ->color(fn (Purchase $record): string => InventoryPresenter::purchaseStatusColor($record->status))
                    ->sortable(),
                TextColumn::make('items_count')
                    ->label(__('core::inventory.items'))
                    ->counts('items')
                    ->sortable(),
                TextColumn::make('total')
                    ->label(__('core::inventory.grand_total'))
                    ->formatStateUsing(fn ($state): string => InventoryPresenter::money($state))
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('status')
                    ->label(__('core::inventory.status'))
                    ->options(InventoryPresenter::purchaseStatusOptions()),
                SelectFilter::make('branch_id')
                    ->label(__('core::inventory.branch'))
                    ->options(fn (): array => InventoryDirectory::branchOptions())
                    ->searchable(),
            ])
            ->defaultSort('purchase_date', 'desc')
            ->recordActions([
                ViewAction::make(),
                EditAction::make()
                    // Disabled rather than hidden, so a received purchase still
                    // explains itself instead of looking read-only for no reason.
                    ->disabled(fn (Purchase $record): bool => $record->isReceived()),
                Action::make('receive')
                    ->label(__('core::inventory.receive_purchase'))
                    ->color('success')
                    ->requiresConfirmation()
                    ->authorize('Receive:Purchase')
                    ->visible(fn (Purchase $record): bool => $record->isDraft())
                    ->action(fn (Purchase $record) => self::receive($record)),
                DeleteAction::make()
                    ->visible(fn (Purchase $record): bool => $record->isDraft()),
            ]);
    }

    public static function infolist(Schema $schema): Schema
    {
        return $schema
            ->schema([
                Section::make(__('core::inventory.details'))
                    ->columnSpanFull()
                    ->columns(2)
                    ->schema([
                        TextEntry::make('purchase_number')
                            ->label(__('core::inventory.purchase_number')),
                        TextEntry::make('status')
                            ->label(__('core::inventory.status'))
                            ->formatStateUsing(fn (Purchase $record): string => InventoryPresenter::purchaseStatusLabel($record->status))
                            ->badge()
                            ->color(fn (Purchase $record): string => InventoryPresenter::purchaseStatusColor($record->status)),
                        TextEntry::make('purchase_date')
                            ->label(__('core::inventory.purchase_date'))
                            ->date(),
                        TextEntry::make('branch.name')
                            ->label(__('core::inventory.branch'))
                            ->formatStateUsing(fn (Purchase $record): string => InventoryDirectory::branchLabel($record->branch))
                            ->placeholder('—'),
                        TextEntry::make('supplier_name')
                            ->label(__('core::inventory.supplier_name'))
                            ->placeholder('—'),
                        TextEntry::make('supplier_phone')
                            ->label(__('core::inventory.supplier_phone'))
                            ->placeholder('—'),
                        TextEntry::make('notes')
                            ->label(__('core::inventory.notes'))
                            ->placeholder('—')
                            ->columnSpanFull(),
                    ]),
                Section::make(__('core::inventory.grand_total'))
                    ->columnSpanFull()
                    ->columns(4)
                    ->schema([
                        TextEntry::make('subtotal')
                            ->label(__('core::inventory.subtotal'))
                            ->formatStateUsing(fn ($state): string => InventoryPresenter::money($state)),
                        TextEntry::make('discount')
                            ->label(__('core::inventory.discount'))
                            ->formatStateUsing(fn ($state): string => InventoryPresenter::money($state)),
                        TextEntry::make('tax')
                            ->label(__('core::inventory.tax'))
                            ->formatStateUsing(fn ($state): string => InventoryPresenter::money($state)),
                        TextEntry::make('total')
                            ->label(__('core::inventory.grand_total'))
                            ->formatStateUsing(fn ($state): string => InventoryPresenter::money($state)),
                    ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            PurchaseItemsRelationManager::class,
            PurchaseTransactionsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListPurchases::route('/'),
            'create' => CreatePurchase::route('/create'),
            'view' => ViewPurchase::route('/{record}'),
            'edit' => EditPurchase::route('/{record}/edit'),
        ];
    }

    /**
     * Run the receive through the service and report what happened.
     *
     * The service refuses a second receive, so this cannot double-credit stock
     * even if the button is somehow shown again on a stale page.
     */
    private static function receive(Purchase $purchase): void
    {
        try {
            app(PurchaseService::class)->receive($purchase);
        } catch (InventoryException $exception) {
            Notification::make()
                ->title(__('core::inventory.receive_purchase'))
                ->body($exception->getMessage())
                ->danger()
                ->send();

            return;
        }

        Notification::make()
            ->title(__('core::inventory.received_successfully'))
            ->success()
            ->send();
    }
}
