<?php

declare(strict_types=1);

namespace App\Modules\V1\Shared\Support;

use Closure;
use Illuminate\Support\Facades\Route;

/**
 * Registers routes under the central customer/platform JSON API prefix.
 *
 * Use from any module's `routes/api.php` (or a service provider) so every
 * domain shares one `/api/v1` + `api` middleware group.
 */
final class ApiV1
{
    /**
     * @param  Closure|string  $routes  Closure of route definitions, or a routes file path
     */
    public static function routes(Closure|string $routes): void
    {
        Route::prefix('api/v1')
            ->middleware('api')
            ->group($routes);
    }
}
