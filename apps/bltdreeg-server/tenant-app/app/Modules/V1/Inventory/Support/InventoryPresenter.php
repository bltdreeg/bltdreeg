<?php

declare(strict_types=1);

namespace App\Modules\V1\Inventory\Support;

use Bltdreeg\Core\Modules\Inventory\Enums\PurchaseStatusEnum;
use Bltdreeg\Core\Modules\Inventory\Enums\TransactionTypeEnum;
use Bltdreeg\Core\Modules\Inventory\Enums\UnitEnum;
use Bltdreeg\Core\Modules\Inventory\Models\Inventory;
use Bltdreeg\Core\Modules\Inventory\Models\InventoryTransaction;
use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Filament\Facades\Filament;
use Filament\Support\Icons\Heroicon;
use Illuminate\Support\Number;

/**
 * Formatting and badge colours for the inventory UI, kept out of the resources
 * so the tables stay declarative.
 */
class InventoryPresenter
{
    /**
     * ISO 4217 code for each currency a tenant can pick. Spelled out as a match
     * rather than derived from the case name, so adding a case to CurrencyEnum
     * cannot silently change how existing amounts render.
     */
    private static function codeFor(CurrencyEnum $currency): string
    {
        return match ($currency) {
            CurrencyEnum::EGP => 'EGP',
            CurrencyEnum::SAR => 'SAR',
            CurrencyEnum::USD => 'USD',
            CurrencyEnum::EUR => 'EUR',
        };
    }

    public static function currencyCode(): string
    {
        $tenant = self::tenant();

        if (! $tenant instanceof Tenant || ! $tenant->currency instanceof CurrencyEnum) {
            return self::codeFor(CurrencyEnum::EGP);
        }

        return self::codeFor($tenant->currency);
    }

    public static function money(float|int|string|null $amount): string
    {
        return Number::currency((float) ($amount ?? 0), self::currencyCode());
    }

    /**
     * Quantities are decimal(12,3): keep up to three decimals but drop the
     * trailing zeros, so 5 reads "5" and 0.25 reads "0.25".
     */
    public static function quantity(float|int|string|null $quantity): string
    {
        return rtrim(rtrim(number_format((float) ($quantity ?? 0), 3, '.', ''), '0'), '.') ?: '0';
    }

    /**
     * Quantity suffixed with its unit, e.g. "2.5 litre". The unit is optional
     * because a product may not be resolvable on a relation row.
     */
    public static function quantityWithUnit(float|int|string|null $quantity, ?UnitEnum $unit): string
    {
        $formatted = self::quantity($quantity);

        return $unit instanceof UnitEnum ? "{$formatted} {$unit->label()}" : $formatted;
    }

    public static function moneyColumn(): string
    {
        return self::money(0);
    }

    public static function stockStatusLabel(string $status): string
    {
        return match ($status) {
            Inventory::STATUS_OUT_OF_STOCK => __('core::inventory.out_of_stock'),
            Inventory::STATUS_LOW => __('core::inventory.low_stock'),
            default => __('core::inventory.in_stock'),
        };
    }

    public static function stockStatusColor(string $status): string
    {
        return match ($status) {
            Inventory::STATUS_OUT_OF_STOCK => 'danger',
            Inventory::STATUS_LOW => 'warning',
            default => 'success',
        };
    }

    public static function purchaseStatusLabel(PurchaseStatusEnum $status): string
    {
        return $status->label();
    }

    public static function purchaseStatusColor(PurchaseStatusEnum $status): string
    {
        return match ($status) {
            PurchaseStatusEnum::DRAFT => 'gray',
            PurchaseStatusEnum::RECEIVED => 'success',
            PurchaseStatusEnum::CANCELLED => 'danger',
        };
    }

    public static function purchaseStatusIcon(PurchaseStatusEnum $status): Heroicon
    {
        return match ($status) {
            PurchaseStatusEnum::DRAFT => Heroicon::OutlinedPencilSquare,
            PurchaseStatusEnum::RECEIVED => Heroicon::OutlinedCheckBadge,
            PurchaseStatusEnum::CANCELLED => Heroicon::OutlinedNoSymbol,
        };
    }

    public static function transactionTypeColor(TransactionTypeEnum $type): string
    {
        return match ($type) {
            TransactionTypeEnum::PURCHASE, TransactionTypeEnum::RETURN, TransactionTypeEnum::TRANSFER_IN => 'success',
            TransactionTypeEnum::SALE, TransactionTypeEnum::TRANSFER_OUT, TransactionTypeEnum::EXPIRED => 'danger',
            TransactionTypeEnum::DAMAGED => 'warning',
            TransactionTypeEnum::ADJUSTMENT => 'info',
        };
    }

    public static function transactionTypeIcon(TransactionTypeEnum $type): Heroicon
    {
        return match ($type) {
            TransactionTypeEnum::PURCHASE => Heroicon::OutlinedShoppingCart,
            TransactionTypeEnum::SALE => Heroicon::OutlinedBanknotes,
            TransactionTypeEnum::RETURN => Heroicon::OutlinedArrowUturnLeft,
            TransactionTypeEnum::ADJUSTMENT => Heroicon::OutlinedAdjustmentsHorizontal,
            TransactionTypeEnum::TRANSFER_IN => Heroicon::OutlinedArrowDownOnSquare,
            TransactionTypeEnum::TRANSFER_OUT => Heroicon::OutlinedArrowUpOnSquare,
            TransactionTypeEnum::DAMAGED => Heroicon::OutlinedExclamationTriangle,
            TransactionTypeEnum::EXPIRED => Heroicon::OutlinedClock,
        };
    }

    /**
     * @return array<string, string>
     */
    public static function purchaseStatusOptions(): array
    {
        return collect(PurchaseStatusEnum::cases())
            ->mapWithKeys(fn (PurchaseStatusEnum $status): array => [$status->value => $status->label()])
            ->all();
    }

    /**
     * @return array<string, string>
     */
    public static function transactionTypeOptions(): array
    {
        return collect(TransactionTypeEnum::cases())
            ->mapWithKeys(fn (TransactionTypeEnum $type): array => [$type->value => $type->label()])
            ->all();
    }

    /**
     * Signed movement, always shown with an explicit + or - so the ledger reads
     * as a running balance rather than a list of magnitudes.
     */
    public static function movement(InventoryTransaction $transaction): string
    {
        $value = self::quantity($transaction->quantity);

        return match (true) {
            (float) $transaction->quantity > 0 => '+'.$value,
            (float) $transaction->quantity < 0 => $value,
            default => '0',
        };
    }

    private static function tenant(): ?Tenant
    {
        $tenant = Filament::getTenant();

        return $tenant instanceof Tenant ? $tenant : null;
    }
}
