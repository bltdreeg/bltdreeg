<?php

declare(strict_types=1);

namespace App\Modules\V1\CustomerAuth\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;

/**
 * Skeleton for the customer auth guard. Full schema and behaviours land in task 02.
 */
class Customer extends Authenticatable
{
    use HasApiTokens;

    protected $table = 'customers';
}
