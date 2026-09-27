<?php

namespace Bltdreeg\Core\Modules\Inventory\Database\Factories;

use Bltdreeg\Core\Modules\Inventory\Enums\PurchaseStatusEnum;
use Bltdreeg\Core\Modules\Inventory\Models\Purchase;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Purchase>
 */
class PurchaseFactory extends Factory
{
    protected $model = Purchase::class;

    public function definition(): array
    {
        return [
            'tenant_id' => fn (array $attributes): int => Branch::query()
                ->withoutGlobalScopes()
                ->findOrFail($attributes['branch_id'])
                ->tenant_id,
            'branch_id' => Branch::factory(),
            'purchase_number' => 'PO-'.fake()->unique()->numerify('ymd-####'),
            'supplier_name' => fake()->company(),
            'supplier_phone' => fake()->phoneNumber(),
            'purchase_date' => now()->toDateString(),
            'status' => PurchaseStatusEnum::DRAFT,
            'subtotal' => 0,
            'discount' => 0,
            'tax' => 0,
            'total' => 0,
        ];
    }

    public function received(): static
    {
        return $this->state(fn (): array => ['status' => PurchaseStatusEnum::RECEIVED]);
    }

    public function cancelled(): static
    {
        return $this->state(fn (): array => ['status' => PurchaseStatusEnum::CANCELLED]);
    }
}
