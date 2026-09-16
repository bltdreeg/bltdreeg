<?php

namespace App\Models;

use App\Enums\TransactionCategoryEnum;
use App\Enums\TransactionTypeEnum;
use Database\Factories\TransactionFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'shop_id',
    'branch_id',
    'type',
    'category',
    'amount',
    'reference_type',
    'reference_id',
    'description',
    'transaction_date',
])]
class Transaction extends Model
{
    /** @use HasFactory<TransactionFactory> */
    use HasFactory;

    protected function casts()
    {
        return [
            'transaction_date' => 'datetime',
            'amount' => 'decimal:2',
            'type' => TransactionTypeEnum::class,
            'category' => TransactionCategoryEnum::class,
        ];
    }

    public function shop(): BelongsTo
    {
        return $this->belongsTo(Shop::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }
}
