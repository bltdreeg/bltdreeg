<?php

namespace Bltdreeg\Core\Modules\Inventory\Database\Factories;

use Bltdreeg\Core\Modules\Inventory\Enums\UnitEnum;
use Bltdreeg\Core\Modules\Inventory\Models\Product;
use Bltdreeg\Core\Modules\Inventory\Models\ProductCategory;
use Bltdreeg\Core\Modules\Tenancy\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'category_id' => ProductCategory::factory(),
            'name' => fake()->unique()->words(3, true),
            'sku' => strtoupper(fake()->unique()->bothify('SKU-####??')),
            'barcode' => fake()->unique()->numerify('62#########'),
            'description' => fake()->sentence(),
            'image' => null,
            'price' => fake()->randomFloat(2, 10, 300),
            'sale_price' => null,
            'unit' => UnitEnum::PIECE,
            'low_stock_threshold' => fake()->numberBetween(0, 10),
            'track_inventory' => true,
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (): array => ['is_active' => false]);
    }

    /**
     * Puts the product on sale, defaulting to a 20% discount off the regular price.
     */
    public function onSale(?float $salePrice = null): static
    {
        return $this->state(fn (array $attributes): array => [
            'sale_price' => $salePrice ?? round((float) $attributes['price'] * 0.8, 2),
        ]);
    }

    public function untracked(): static
    {
        return $this->state(fn (): array => ['track_inventory' => false]);
    }

    public function withoutCategory(): static
    {
        return $this->state(fn (): array => ['category_id' => null]);
    }
}
