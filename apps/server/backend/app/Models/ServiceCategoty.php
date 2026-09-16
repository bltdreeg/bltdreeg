<?php

namespace App\Models;

use Database\Factories\ServiceCategotyFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

#[Fillable(['shop_id', 'name', 'description', 'is_active'])]
class ServiceCategoty extends Model
{
    /** @use HasFactory<ServiceCategotyFactory> */
    use HasFactory;

    protected function casts()
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function shop()
    {
        return $this->belongsTo(Shop::class);
    }
}
