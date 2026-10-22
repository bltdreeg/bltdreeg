<?php

namespace Bltdreeg\Core\Modules\Inventory\Database\Factories;

use Bltdreeg\Core\Modules\Inventory\Enums\TransactionTypeEnum;
use Bltdreeg\Core\Modules\Inventory\Models\Inventory;
use Bltdreeg\Core\Modules\Inventory\Models\InventoryTransaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryTransaction>
 */
class InventoryTransactionFactory extends Factory
{
    protected $model = InventoryTransaction::class;

    public function definition(): array
    {
        return [
            'tenant_id' => fn (array $attributes): int => Inventory::query()
                ->withoutGlobalScopes()
                ->findOrFail($attributes['inventory_id'])
                ->tenant_id,
            'inventory_id' => Inventory::factory(),
            'branch_id' => fn (array $attributes): int => Inventory::query()
                ->withoutGlobalScopes()
                ->findOrFail($attributes['inventory_id'])
                ->branch_id,
            'product_id' => fn (array $attributes): int => Inventory::query()
                ->withoutGlobalScopes()
                ->findOrFail($attributes['inventory_id'])
                ->product_id,
            'type' => TransactionTypeEnum::PURCHASE,
            'quantity' => 1,
            'unit_cost' => fake()->randomFloat(2, 10, 100),
            'balance_after' => 1,
        ];
    }

    public function ofType(TransactionTypeEnum $type, float $quantity): static
    {
        return $this->state(fn (): array => [
            'type' => $type,
            'quantity' => $quantity,
        ]);
    }
}
