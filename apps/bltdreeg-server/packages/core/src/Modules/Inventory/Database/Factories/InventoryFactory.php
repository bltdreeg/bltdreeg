<?php

namespace Bltdreeg\Core\Modules\Inventory\Database\Factories;

use Bltdreeg\Core\Modules\Inventory\Models\Inventory;
use Bltdreeg\Core\Modules\Inventory\Models\Product;
use Bltdreeg\Core\Modules\Tenancy\Models\Branch;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Inventory>
 */
class InventoryFactory extends Factory
{
    protected $model = Inventory::class;

    public function definition(): array
    {
        return [
            'tenant_id' => fn (array $attributes): int => Branch::query()
                ->withoutGlobalScopes()
                ->findOrFail($attributes['branch_id'])
                ->tenant_id,
            'branch_id' => Branch::factory(),
            'product_id' => Product::factory(),
            'quantity' => fake()->numberBetween(0, 100),
            'reserved_quantity' => 0,
        ];
    }

    public function quantity(float|int $quantity): static
    {
        return $this->state(fn (): array => ['quantity' => $quantity]);
    }

    public function reserved(float|int $reserved): static
    {
        return $this->state(fn (): array => ['reserved_quantity' => $reserved]);
    }
}
