<?php

namespace App\Modules\V1\Customer\Auth\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

#[Fillable([
    'channel',
    'is_enabled',
    'providers',
    'sort',
])]
class OtpChannelSetting extends Model
{
    use HasFactory;

    public const CACHE_KEY = 'customer_auth.otp_channel_settings';

    protected function casts(): array
    {
        return [
            'is_enabled' => 'boolean',
            'providers' => 'array',
            'sort' => 'integer',
        ];
    }

    protected static function booted(): void
    {
        static::saved(function () {
            self::clearCache();
        });

        static::deleted(function () {
            self::clearCache();
        });
    }

    public static function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }

    /**
     * @return Collection<int, self>
     */
    public static function getCached(): Collection
    {
        // Cache raw attributes, not models: cache.serializable_classes is false, so a cached model
        // collection comes back as __PHP_Incomplete_Class on the next read.
        $rows = Cache::rememberForever(self::CACHE_KEY, function () {
            return self::query()->orderBy('sort')->get()
                ->map(fn (self $setting) => $setting->getAttributes())
                ->all();
        });

        return self::hydrate($rows);
    }
}
