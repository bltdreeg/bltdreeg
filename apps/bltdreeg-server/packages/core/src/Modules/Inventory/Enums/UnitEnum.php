<?php

namespace Bltdreeg\Core\Modules\Inventory\Enums;

enum UnitEnum: string
{
    case PIECE = 'piece';
    case BOTTLE = 'bottle';
    case BOX = 'box';
    case PACK = 'pack';
    case GRAM = 'gram';
    case KILOGRAM = 'kilogram';
    case MILLILITRE = 'millilitre';
    case LITRE = 'litre';
    case SACHET = 'sachet';
    case TUBE = 'tube';

    /**
     * Backed by the stored string rather than an integer so the column keeps
     * reading as a unit token in the database and existing rows stay valid.
     */
    public function label(): string
    {
        return match ($this) {
            self::PIECE => __('core::inventory.unit_piece'),
            self::BOTTLE => __('core::inventory.unit_bottle'),
            self::BOX => __('core::inventory.unit_box'),
            self::PACK => __('core::inventory.unit_pack'),
            self::GRAM => __('core::inventory.unit_gram'),
            self::KILOGRAM => __('core::inventory.unit_kilogram'),
            self::MILLILITRE => __('core::inventory.unit_millilitre'),
            self::LITRE => __('core::inventory.unit_litre'),
            self::SACHET => __('core::inventory.unit_sachet'),
            self::TUBE => __('core::inventory.unit_tube'),
        };
    }

    /**
     * Options for a Filament select, keyed by the stored value.
     *
     * @return array<string, string>
     */
    public static function options(): array
    {
        return array_combine(
            array_column(self::cases(), 'value'),
            array_map(fn (self $unit): string => $unit->label(), self::cases()),
        );
    }
}
