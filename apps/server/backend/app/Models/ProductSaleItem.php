<?php

namespace App\Models;

use Database\Factories\ProductSaleItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'product_sale_id',
    'product_id',
    'quantity',
    'price',
    'total',
])]
class ProductSaleItem extends Model
{
    /** @use HasFactory<ProductSaleItemFactory> */
    use HasFactory;

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function productSale(): BelongsTo
    {
        return $this->belongsTo(ProductSale::class);
    }
}
