---
name: bltdreeg-central-api-v1-routes
description: >-
  Register central-app JSON API routes under /api/v1 via ApiV1::routes().
  Use when adding or editing central-app module routes, API endpoints, route
  service providers, Scramble-documented paths, or Pest tests that hit /api/v1.
---

# bltdreeg central-app `/api/v1` routes

## When to use

- Adding endpoints under `/api/v1` in `central-app`
- Creating a module `routes/api.php` (CustomerAuth or any future API module)
- Writing Pest/feature tests that register temporary API routes
- Reviewing PRs that touch central JSON routing

## Required helper

`App\Modules\V1\Shared\Support\ApiV1` (in the Shared module next to `PrivateFileRegistry`).

It applies `prefix('api/v1')` + middleware group `api` once for every caller.

## Checklist

1. Put route definitions in the owning module’s `routes/api.php` (or a file it includes).
2. Wrap them with `ApiV1::routes(function (): void { ... })` **or**
   `ApiV1::routes(__DIR__.'/some-routes.php')`.
3. In `{Name}ServiceProvider::boot()`, only `$this->loadRoutesFrom(__DIR__.'/routes/api.php')` —
   do not set prefix/middleware on the provider.
4. Inside the group, use paths **relative to** `/api/v1` (`auth/login`, not `/api/v1/auth/login`).
5. In tests, register probes the same way (`ApiV1::routes(...)`), never hand-roll the prefix.

## Example (module)

```php
// app/Modules/V1/CustomerAuth/routes/api.php
use App\Modules\V1\Shared\Support\ApiV1;
use Illuminate\Support\Facades\Route;

ApiV1::routes(function (): void {
    Route::post('auth/login', LoginController::class);
});
```

```php
// CustomerAuthServiceProvider::boot()
$this->loadRoutesFrom(__DIR__.'/routes/api.php');
```

## Example (test probe)

```php
use App\Modules\V1\Shared\Support\ApiV1;
use Illuminate\Support\Facades\Route;

ApiV1::routes(function (): void {
    Route::post('__validation_probe', function (\Illuminate\Http\Request $request) {
        $request->validate(['field' => ['required']]);
        return response()->noContent();
    });
});
```

## Anti-patterns

- `Route::prefix('api/v1')->middleware('api')->group(...)`
- Hard-coding `/api/v1/...` on a route outside `ApiV1`
- Putting the prefix on `withRouting(api: ...)` in `bootstrap/app.php` (modules own their routes)
- Growing `AppServiceProvider` with API route registration

## Related

- Rule: `.cursor/rules/central-api-v1-routes.mdc`
- Module providers: `.cursor/rules/module-service-providers.mdc` / skill `bltdreeg-module-service-providers`
