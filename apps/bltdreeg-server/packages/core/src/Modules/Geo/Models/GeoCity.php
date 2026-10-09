<?php

namespace Bltdreeg\Core\Modules\Geo\Models;

use Bltdreeg\Core\Concerns\CachableModel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Spatie\Translatable\Attributes\Translatable;
use Spatie\Translatable\HasTranslations;

#[Translatable('name')]
class GeoCity extends Model
{
    use CachableModel, HasTranslations;

    public $incrementing = false;

    public $timestamps = false;

    protected $keyType = 'string';

    protected $guarded = [];

    public function governorate(): BelongsTo
    {
        return $this->belongsTo(GeoGovernorate::class, 'governorate_id');
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
