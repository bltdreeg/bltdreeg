<?php

namespace Bltdreeg\Core\Modules\Geo\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Translatable\Attributes\Translatable;
use Spatie\Translatable\HasTranslations;

#[Translatable('name')]
class GeoGovernorate extends Model
{
    use HasTranslations;

    public $incrementing = false;

    public $timestamps = false;

    protected $keyType = 'string';

    protected $guarded = [];

    public function cities(): HasMany
    {
        return $this->hasMany(GeoCity::class, 'governorate_id');
    }

    /**
     * @return array<string, string>
     */
    public static function options(): array
    {
        return static::query()->get()
            ->mapWithKeys(fn (self $governorate): array => [$governorate->id => $governorate->getTranslation('name', app()->getLocale())])
            ->sort()
            ->all();
    }

    protected function casts(): array
    {
        return ['name' => 'array', 'lat' => 'float', 'lng' => 'float'];
    }
}
