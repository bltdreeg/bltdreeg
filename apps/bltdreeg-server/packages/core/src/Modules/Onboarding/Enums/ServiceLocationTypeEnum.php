<?php

namespace Bltdreeg\Core\Modules\Onboarding\Enums;

enum ServiceLocationTypeEnum: string
{
    case PHYSICAL = 'physical';
    case MOBILE = 'mobile';
    case VIRTUAL = 'virtual';

    public function label(): string
    {
        return __('core::onboarding.service_location_type.'.$this->value);
    }

    public function requiresAddress(): bool
    {
        return $this === self::PHYSICAL;
    }

    /**
     * @return array<string, string>
     */
    public static function options(): array
    {
        return collect(self::cases())
            ->mapWithKeys(fn (self $case): array => [$case->value => $case->label()])
            ->all();
    }

    /**
     * Normalize wizard / DB input into a list of valid location values.
     *
     * @return list<string>
     */
    public static function normalize(mixed $value): array
    {
        if ($value instanceof self) {
            return [$value->value];
        }

        if (is_string($value) && $value !== '') {
            $decoded = json_decode($value, true);
            $value = is_array($decoded) ? $decoded : [$value];
        }

        if (! is_array($value)) {
            return [];
        }

        return collect($value)
            ->map(fn (mixed $item): ?string => $item instanceof self ? $item->value : (is_string($item) ? $item : null))
            ->filter(fn (?string $item): bool => $item !== null && self::tryFrom($item) !== null)
            ->unique()
            ->values()
            ->all();
    }

    /**
     * @param  list<string>|mixed  $types
     */
    public static function selectionRequiresAddress(mixed $types): bool
    {
        return in_array(self::PHYSICAL->value, self::normalize($types), true);
    }

    /**
     * @param  list<string>|mixed  $types
     */
    public static function labels(mixed $types): string
    {
        return collect(self::normalize($types))
            ->map(fn (string $value): string => self::from($value)->label())
            ->implode(', ');
    }
}
