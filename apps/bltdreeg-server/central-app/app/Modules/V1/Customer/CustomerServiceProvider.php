<?php

namespace App\Modules\V1\Customer;

use App\Modules\V1\Customer\Auth\Console\PruneOtpChallengesCommand;
use App\Modules\V1\Customer\Auth\Http\Middleware\EnsureCustomerOnboarded;
use App\Modules\V1\Customer\Auth\Http\Middleware\ExtendCustomerToken;
use App\Modules\V1\Customer\Auth\Http\Middleware\SetApiLocale;
use App\Modules\V1\Customer\Auth\Otp\OtpDispatcher;
use App\Modules\V1\Customer\Auth\Otp\OtpProviderManager;
use App\Modules\V1\Customer\Auth\Otp\OtpService;
use App\Modules\V1\Customer\Auth\Social\AppleTokenVerifier;
use App\Modules\V1\Customer\Auth\Social\GoogleTokenVerifier;
use App\Modules\V1\Customer\Auth\Social\SocialAuthService;
use App\Modules\V1\Customer\Auth\Support\CustomerTokenIssuer;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class CustomerServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->mergeConfigFrom(
            base_path('config/customer_auth.php'),
            'customer_auth'
        );

        $this->app->singleton(OtpProviderManager::class);
        $this->app->singleton(OtpDispatcher::class);
        $this->app->singleton(OtpService::class);

        $this->app->singleton(GoogleTokenVerifier::class);
        $this->app->singleton(AppleTokenVerifier::class);
        $this->app->singleton(SocialAuthService::class);

        $this->app->singleton(CustomerTokenIssuer::class);
    }

    public function boot(): void
    {
        JsonResource::withoutWrapping();
        $this->configureMiddleware();
        $this->configureRateLimiting();
        $this->loadRoutes();

        if ($this->app->runningInConsole()) {
            $this->commands([PruneOtpChallengesCommand::class]);
        }

        $this->callAfterResolving(Schedule::class, function (Schedule $schedule) {
            $schedule->command('customer-auth:prune-otp')->daily();
        });
    }

    protected function configureMiddleware(): void
    {
        /** @var Router $router */
        $router = $this->app['router'];
        $router->aliasMiddleware('customer.onboarded', EnsureCustomerOnboarded::class);
        $router->aliasMiddleware('customer.extend_token', ExtendCustomerToken::class);
        $router->aliasMiddleware('customer.locale', SetApiLocale::class);
    }

    protected function configureRateLimiting(): void
    {
        // 5 attempts per minute per (identifier + IP)
        RateLimiter::for('customer-login', function (Request $request) {
            $identifier = (string) $request->input('phone', $request->input('email', ''));

            return Limit::perMinute(5)->by($identifier.'|'.$request->ip());
        });

        // 20 OTP sends per hour per IP
        RateLimiter::for('customer-otp-ip', function (Request $request) {
            return Limit::perHour(20)->by($request->ip());
        });
    }

    protected function loadRoutes(): void
    {
        $routesPath = __DIR__.'/Auth/routes/api.php';
        if (file_exists($routesPath)) {
            $this->loadRoutesFrom($routesPath);
        }
    }
}
