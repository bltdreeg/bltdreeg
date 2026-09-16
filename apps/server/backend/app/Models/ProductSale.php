<?php

namespace App\Models;

use Database\Factories\ProductSaleFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'shop_id',
    'branch_id',
    'customer_id',
    'user_id',
    'total',
])]
class ProductSale extends Model
{
    /** @use HasFactory<ProductSaleFactory> */
    use HasFactory;

    protected $table = 'product_sales';

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function productSaleItems(): HasMany
    {
        return $this->hasMany(ProductSaleItem::class, 'product_sale_id', 'id');
    }
}
