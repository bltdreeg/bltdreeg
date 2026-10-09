<?php

namespace Bltdreeg\Core\Modules\Booking\Models;

use Bltdreeg\Core\Concerns\BelongsToBranch;
use Bltdreeg\Core\Concerns\BelongsToTenant;
use Bltdreeg\Core\Modules\Booking\Database\Factories\PackageFactory;
use Bltdreeg\Core\Modules\Services\Models\Service;
use Bltdreeg\Core\Modules\Tenancy\Enums\CurrencyEnum;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use InvalidArgumentException;
use Spatie\Translatable\Attributes\Translatable;
use Spatie\Translatable\HasTranslations;

#[Fillable(['tenant_id', 'branch_id', 'name', 'description', 'price', 'currency', 'duration', 'is_active', 'sort_order'])]
#[Translatable('name', 'description')]
class Package extends Model
{
    use BelongsToBranch;
    use BelongsToTenant;
    use HasFactory;
    use HasTranslations;

    protected static function newFactory()
    {
        return PackageFactory::new();
    }

    protected function casts(): array
    {
        return [
            'name' => 'array',
            'description' => 'array',
            'price' => 'decimal:2',
            'currency' => CurrencyEnum::class,
            'duration' => 'integer',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function services(): BelongsToMany
    {
        return $this->belongsToMany(Service::class, 'package_service')->withTimestamps();
    }

    /**
     * Attach a member service, refusing one from another branch. The pivot spans
     * two tables, so no database constraint can express this.
     */
    public function attachService(Service $service): void
    {
        if ((int) $service->branch_id !== (int) $this->branch_id) {
            throw new InvalidArgumentException(
                "Service {$service->getKey()} belongs to branch {$service->branch_id}, not {$this->branch_id}."
            );
        }

        $this->services()->syncWithoutDetaching([$service->getKey()]);
    }

    /**
     * The override when set, else the sum of the member services. A package with no
     * members has no duration — callers must treat 0 as unbookable (see BasketResolver).
     */
    public function effectiveDuration(): int
    {
        if ($this->duration !== null) {
            return (int) $this->duration;
        }

        return (int) $this->services->sum(fn (Service $service): int => (int) $service->duration);
    }

    /** What the member services would cost bought separately. */
    public function servicesTotal(): float
    {
        return (float) $this->services->sum(fn (Service $service): float => (float) $service->price);
    }

    /**
     * What the customer saves versus buying the members separately.
     *
     * Named savingAmount() rather than saving(): Eloquent already defines a static
     * Model::saving() event registrar, and PHP refuses to redeclare it as an
     * instance method.
     */
    public function savingAmount(): float
    {
        return round($this->servicesTotal() - (float) $this->price, 2);
    }
}
