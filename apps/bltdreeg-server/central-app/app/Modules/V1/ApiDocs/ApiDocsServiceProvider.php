<?php

declare(strict_types=1);

namespace App\Modules\V1\ApiDocs;

use Bltdreeg\Core\Modules\Auth\Models\User;
use Dedoc\Scramble\Scramble;
use Dedoc\Scramble\Support\Generator\OpenApi;
use Dedoc\Scramble\Support\Generator\SecurityScheme;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;

/**
 * Owns Scramble OpenAPI docs (/docs/api) for the whole central JSON API surface.
 */
class ApiDocsServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        Gate::define('viewApiDocs', function (?User $user = null): bool {
            if ($this->app->environment('local')) {
                return true;
            }

            return $user instanceof User && $user->is_super_admin;
        });

        Scramble::configure()
            ->withDocumentTransformers(function (OpenApi $openApi): void {
                $openApi->secure(
                    SecurityScheme::http('bearer')
                );
            });
    }
}
