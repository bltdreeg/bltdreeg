<?php

namespace Bltdreeg\Core\Modules\Geo\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Translatable\Attributes\Translatable;
use Spatie\Translatable\HasTranslations;

#[Translatable('name')]
class GeoArea extends Model
{
    use HasTranslations;

    public $incrementing = false;

    public $timestamps = false;

    protected $keyType = 'string';

    protected $guarded = [];

    public function city(): BelongsTo
    {
        return $this->belongsTo(GeoCity::class, 'city_id');
    }

    public function governorate(): BelongsTo
    {
        return $this->belongsTo(GeoGovernorate::class, 'governorate_id');
    }

    /**
     * @return array<string, string>
     */
    public static function optionsFor(?string $cityId): array
    {
        if (blank($cityId)) {
            return [];
        }

        return static::query()->where('city_id', $cityId)->get()
            ->mapWithKeys(fn (self $area): array => [$area->id => $area->getTranslation('name', app()->getLocale())])
            ->sort()
            ->all();
    }

    protected function casts(): array
    {
        return ['name' => 'array', 'lat' => 'float', 'lng' => 'float', 'is_placeholder' => 'boolean'];
    }
}
