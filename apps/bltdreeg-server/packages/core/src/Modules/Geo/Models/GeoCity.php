<?php

namespace Bltdreeg\Core\Modules\Geo\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\Attributes\Translatable;
use Spatie\Translatable\HasTranslations;

#[Translatable('name')]
class GeoCity extends Model
{
    use HasTranslations;

    public $incrementing = false;

    public $timestamps = false;

    protected $keyType = 'string';

    protected $guarded = [];

    public function governorate(): BelongsTo
    {
        return $this->belongsTo(GeoGovernorate::class, 'governorate_id');
    }

    public function areas(): HasMany
    {
        return $this->hasMany(GeoArea::class, 'city_id');
    }

    /**
     * @return array<string, string>
     */
    public static function optionsFor(?string $governorateId): array
    {
        if (blank($governorateId)) {
            return [];
        }

        return static::query()->where('governorate_id', $governorateId)->get()
            ->mapWithKeys(fn (self $city): array => [$city->id => $city->getTranslation('name', app()->getLocale())])
            ->sort()
            ->all();
    }

    protected function casts(): array
    {
        return ['name' => 'array', 'lat' => 'float', 'lng' => 'float'];
    }
}
