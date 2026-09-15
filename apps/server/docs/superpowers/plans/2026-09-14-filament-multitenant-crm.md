# Filament Multi-Tenant CRM Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a runnable Laravel backend where a landlord app creates tenants and each tenant gets a Filament CRM panel scoped by tenant id.

**Architecture:** Two Laravel apps (`central-app`, `tenant-app`) share one MySQL database and one Composer path package (`packages/core`) holding the `User`/`Team` identity models. A tenant is a row in `teams`; its id is the `team_id` that `venturedrake/laravel-crm` stamps on every `crm_*` row. Isolation holds through three agreeing layers: the CRM's `BelongsToTeamsScope`, Filament's `canAccessTenant()`, and a panel middleware that binds `currentTeam` to the Filament tenant per request.

**Tech Stack:** PHP 8.3, Laravel 12, Filament 4, `venturedrake/laravel-crm` ^2.4, `venturedrake/laravel-crm-filament`, `spatie/laravel-permission` with teams, MySQL 8, Redis, Traefik, Docker Compose, Pest.

**Spec:** `docs/superpowers/specs/2026-09-14-filament-multitenant-crm-design.md`

## Global Constraints

- Shared database. No `stancl/tenancy`, no per-tenant connections, no database switching.
- MySQL 8 only. `laravel-crm` supports MySQL 5.7+ / MariaDB 10.2.7+ and is not validated on Postgres.
- Tenant id == `teams.id` == the `team_id` column on `crm_*` tables. Never introduce a second tenant key.
- `LARAVEL_CRM_TEAMS=true` in `tenant-app` only.
- `LARAVEL_CRM_USER_INTERFACE=false`. The Livewire `/crm` UI must not mount.
- `config('permission.teams')` must be `true` **before** the Spatie permission migrations run.
- The Filament CRM plugin is not tenant-aware. Its identity surfaces (users, roles, permissions, invitations, CRM teams) must never be registered in the tenant panel.
- Every command runs inside Docker. No host PHP or Composer.
- All paths below are relative to `bltdreeg/apps/server/`.

---

### Task 1: Docker stack and both Laravel skeletons

**Files:**
- Create: `infra/local/docker-compose.yml`
- Create: `infra/local/traefik/dynamic.yml`
- Create: `infra/local/.env.example`
- Create: `Makefile`
- Create: `central-app/` (Laravel skeleton, generated)
- Create: `tenant-app/` (Laravel skeleton, generated)

**Interfaces:**
- Produces: Compose services named `traefik`, `mysql`, `redis`, `central`, `tenant`, and tools-profile services `composer-central`, `composer-tenant`. Make targets `up`, `down`, `ps`, `logs`, `install`, `c-artisan`, `t-artisan`, `migrate`, `seed`, `test`. Database `bltdreeg`, user `bltdreeg`, password `secret`, host `mysql`.

- [ ] **Step 1: Generate both Laravel skeletons through Docker**

```bash
cd bltdreeg/apps/server
docker run --rm -v "${PWD}:/app" -w /app composer:2 \
  composer create-project laravel/laravel central-app "^12.0" --no-interaction
docker run --rm -v "${PWD}:/app" -w /app composer:2 \
  composer create-project laravel/laravel tenant-app "^12.0" --no-interaction
```

- [ ] **Step 2: Write the Compose file**

Create `infra/local/docker-compose.yml`:

```yaml
services:
  traefik:
    image: traefik:v3.1
    command:
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --entrypoints.web.address=:80
      - --api.insecure=true
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_DATABASE: bltdreeg
      MYSQL_USER: bltdreeg
      MYSQL_PASSWORD: secret
      MYSQL_ROOT_PASSWORD: secret
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-psecret"]
      interval: 5s
      timeout: 5s
      retries: 20

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

  central:
    image: php:8.3-cli
    working_dir: /var/www/html
    command: >
      sh -c "docker-php-ext-install pdo_mysql bcmath > /dev/null 2>&1;
             php artisan serve --host=0.0.0.0 --port=8000"
    volumes:
      - ../../central-app:/var/www/html
      - ../../packages:/var/www/packages
    depends_on:
      mysql:
        condition: service_healthy
    labels:
      - traefik.enable=true
      - traefik.http.routers.central.rule=Host(`admin.localhost`)
      - traefik.http.services.central.loadbalancer.server.port=8000

  tenant:
    image: php:8.3-cli
    working_dir: /var/www/html
    command: >
      sh -c "docker-php-ext-install pdo_mysql bcmath > /dev/null 2>&1;
             php artisan serve --host=0.0.0.0 --port=8000"
    volumes:
      - ../../tenant-app:/var/www/html
      - ../../packages:/var/www/packages
    depends_on:
      mysql:
        condition: service_healthy
    labels:
      - traefik.enable=true
      - traefik.http.routers.tenant.rule=Host(`app.localhost`)
      - traefik.http.services.tenant.loadbalancer.server.port=8000

  composer-central:
    image: composer:2
    profiles: ["tools"]
    working_dir: /app
    volumes:
      - ../../central-app:/app
      - ../../packages:/packages

  composer-tenant:
    image: composer:2
    profiles: ["tools"]
    working_dir: /app
    volumes:
      - ../../tenant-app:/app
      - ../../packages:/packages

volumes:
  mysql-data:
```

- [ ] **Step 3: Write the Makefile**

Create `Makefile`:

```makefile
COMPOSE = docker compose -f infra/local/docker-compose.yml
TOOLS   = $(COMPOSE) --profile tools

up:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

ps:
	$(COMPOSE) ps -a

logs:
	$(COMPOSE) logs -f --tail=200

install:
	$(TOOLS) run --rm composer-central composer install
	$(TOOLS) run --rm composer-tenant composer install

c-artisan:
	$(COMPOSE) exec central php artisan $(CMD)

t-artisan:
	$(COMPOSE) exec tenant php artisan $(CMD)

migrate:
	$(COMPOSE) exec central php artisan migrate --force
	$(COMPOSE) exec tenant php artisan migrate --force

seed:
	$(COMPOSE) exec central php artisan db:seed --force

test:
	$(COMPOSE) exec tenant php artisan test
```

- [ ] **Step 4: Point both apps at the shared database**

In `central-app/.env` and `tenant-app/.env` set:

```env
DB_CONNECTION=mysql
DB_HOST=mysql
DB_PORT=3306
DB_DATABASE=bltdreeg
DB_USERNAME=bltdreeg
DB_PASSWORD=secret

REDIS_HOST=redis
CACHE_STORE=redis
SESSION_DRIVER=redis
QUEUE_CONNECTION=redis
```

Set `APP_URL=http://admin.localhost` in `central-app/.env` and
`APP_URL=http://app.localhost` in `tenant-app/.env`.

- [ ] **Step 5: Verify the stack answers**

Run:

```bash
make up
curl -sf http://admin.localhost/up && echo "central OK"
curl -sf http://app.localhost/up && echo "tenant OK"
```

Expected: both print OK.

- [ ] **Step 6: Commit**

```bash
git add infra Makefile central-app tenant-app
git commit -m "chore: docker stack and laravel skeletons for central and tenant apps"
```

---

### Task 2: Shared core package with Team and User

**Files:**
- Create: `packages/core/composer.json`
- Create: `packages/core/src/Models/Team.php`
- Create: `packages/core/src/Models/User.php`
- Create: `packages/core/src/Concerns/HasTeams.php`
- Create: `packages/core/src/Providers/CoreServiceProvider.php`
- Create: `packages/core/database/migrations/2026_09_14_000000_create_identity_tables.php`
- Modify: `central-app/composer.json`, `tenant-app/composer.json`
- Delete: default `create_users_table` migration in both apps; `create_cache_table` and `create_jobs_table` in `tenant-app`
- Test: `tenant-app/tests/Feature/CoreIdentityTest.php`

**Interfaces:**
- Produces: `Bltdreeg\Core\Models\Team` with `id`, `name`, `slug`, `owner_id`, relation `users(): BelongsToMany`. `Bltdreeg\Core\Models\User` with `current_team_id`, relations `teams(): BelongsToMany`, `currentTeam(): BelongsTo`, `ownedTeams(): HasMany`, and method `allTeams(): Collection`. `laravel-crm` reads `currentTeam`, `allTeams()` and `ownedTeams()`; do not rename them.

- [ ] **Step 1: Write the package manifest**

Create `packages/core/composer.json`:

```json
{
    "name": "bltdreeg/core",
    "description": "Shared identity and tenancy domain for the bltdreeg server apps",
    "type": "library",
    "require": {
        "php": "^8.3",
        "illuminate/database": "^12.0",
        "illuminate/support": "^12.0"
    },
    "autoload": {
        "psr-4": {
            "Bltdreeg\\Core\\": "src/"
        }
    },
    "extra": {
        "laravel": {
            "providers": [
                "Bltdreeg\\Core\\Providers\\CoreServiceProvider"
            ]
        }
    },
    "minimum-stability": "stable"
}
```

- [ ] **Step 2: Write the identity migration**

Create `packages/core/database/migrations/2026_09_14_000000_create_identity_tables.php`:

```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password');
            $table->foreignId('current_team_id')->nullable();
            $table->boolean('is_super_admin')->default(false);
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        Schema::create('teams', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->foreignId('owner_id')->nullable()->constrained('users')->nullOnDelete();
            $table->boolean('personal_team')->default(false);
            $table->timestamps();
            $table->index('owner_id');
        });

        Schema::create('team_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('team_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('role')->default('member');
            $table->timestamps();
            $table->unique(['team_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('team_user');
        Schema::dropIfExists('teams');
        Schema::dropIfExists('sessions');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('users');
    }
};
```

- [ ] **Step 3: Write the service provider**

Create `packages/core/src/Providers/CoreServiceProvider.php`:

```php
<?php

namespace Bltdreeg\Core\Providers;

use Illuminate\Support\ServiceProvider;

class CoreServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        $this->loadMigrationsFrom(__DIR__.'/../../database/migrations');
    }
}
```

- [ ] **Step 4: Write the Team model**

Create `packages/core/src/Models/Team.php`:

```php
<?php

namespace Bltdreeg\Core\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Team extends Model
{
    protected $fillable = ['name', 'slug', 'owner_id', 'personal_team'];

    protected $casts = ['personal_team' => 'boolean'];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'team_user')
            ->withPivot('role')
            ->withTimestamps();
    }
}
```

- [ ] **Step 5: Write the HasTeams concern and User model**

Create `packages/core/src/Concerns/HasTeams.php`:

```php
<?php

namespace Bltdreeg\Core\Concerns;

use Bltdreeg\Core\Models\Team;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Collection;

trait HasTeams
{
    public function teams(): BelongsToMany
    {
        return $this->belongsToMany(Team::class, 'team_user')
            ->withPivot('role')
            ->withTimestamps();
    }

    public function ownedTeams(): HasMany
    {
        return $this->hasMany(Team::class, 'owner_id');
    }

    public function currentTeam(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'current_team_id');
    }

    public function allTeams(): Collection
    {
        return $this->teams->sortBy('name')->values();
    }

    public function belongsToTeam(Team $team): bool
    {
        return $this->teams()->whereKey($team->getKey())->exists();
    }

    public function switchTeam(Team $team): void
    {
        $this->setAttribute('current_team_id', $team->getKey());
        $this->setRelation('currentTeam', $team);
    }
}
```

Create `packages/core/src/Models/User.php`:

```php
<?php

namespace Bltdreeg\Core\Models;

use Bltdreeg\Core\Concerns\HasTeams;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasTeams;
    use Notifiable;

    protected $fillable = ['name', 'email', 'password', 'current_team_id', 'is_super_admin'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_super_admin' => 'boolean',
        ];
    }
}
```

- [ ] **Step 6: Wire the package into both apps**

Add to `central-app/composer.json` and `tenant-app/composer.json`:

```json
"repositories": [
    { "type": "path", "url": "../packages/core", "options": { "symlink": true } }
],
```

and add `"bltdreeg/core": "*"` to each `require` block.

Delete the skeleton migrations the package now owns:

```bash
rm central-app/database/migrations/0001_01_01_000000_create_users_table.php
rm tenant-app/database/migrations/0001_01_01_000000_create_users_table.php
rm tenant-app/database/migrations/0001_01_01_000001_create_cache_table.php
rm tenant-app/database/migrations/0001_01_01_000002_create_jobs_table.php
```

Delete `central-app/app/Models/User.php` and `tenant-app/app/Models/User.php`, then point both apps at the package model in `config/auth.php`:

```php
'providers' => [
    'users' => [
        'driver' => 'eloquent',
        'model' => Bltdreeg\Core\Models\User::class,
    ],
],
```

Run `make install`.

- [ ] **Step 7: Write the failing test**

Create `tenant-app/tests/Feature/CoreIdentityTest.php`:

```php
<?php

use Bltdreeg\Core\Models\Team;
use Bltdreeg\Core\Models\User;

it('lists only the teams a user belongs to', function () {
    $user = User::create([
        'name' => 'Ada',
        'email' => 'ada@example.test',
        'password' => 'secret-password',
    ]);

    $mine = Team::create(['name' => 'Acme', 'slug' => 'acme', 'owner_id' => $user->id]);
    Team::create(['name' => 'Other', 'slug' => 'other']);

    $user->teams()->attach($mine);

    expect($user->allTeams()->pluck('id')->all())->toBe([$mine->id]);
});
```

- [ ] **Step 8: Run the test to verify it fails, then migrate and re-run**

Run: `make up && make migrate && make test`
Expected first run: FAIL because the tables or model are missing. After
`make migrate` completes, the test passes.

- [ ] **Step 9: Commit**

```bash
git add packages central-app tenant-app
git commit -m "feat: shared core package with Team and User identity models"
```

---

### Task 3: Central landlord panel with tenant management

**Files:**
- Create: `central-app/app/Providers/Filament/AdminPanelProvider.php` (generated, then edited)
- Create: `central-app/app/Modules/V1/Tenants/Filament/Resources/TeamResource.php`
- Create: `central-app/app/Modules/V1/Tenants/Services/CreateTenant.php`
- Create: `central-app/database/seeders/DemoSeeder.php`
- Modify: `central-app/database/seeders/DatabaseSeeder.php`
- Test: `central-app/tests/Feature/CreateTenantTest.php`

**Interfaces:**
- Consumes: `Bltdreeg\Core\Models\{User, Team}` from Task 2.
- Produces: `App\Modules\V1\Tenants\Services\CreateTenant::handle(string $name, string $slug, User $owner): Team` — creates the team, sets `owner_id`, attaches the owner to `team_user` with role `owner`, and returns the team. Task 8's seeder calls it.

- [ ] **Step 1: Install Filament and generate the panel**

```bash
docker compose -f infra/local/docker-compose.yml --profile tools \
  run --rm composer-central composer require filament/filament:"^4.0"
make c-artisan CMD="filament:install --panels"
```

When prompted for the panel id, answer `admin`.

- [ ] **Step 2: Write the failing test**

Create `central-app/tests/Feature/CreateTenantTest.php`:

```php
<?php

use App\Modules\V1\Tenants\Services\CreateTenant;
use Bltdreeg\Core\Models\User;

it('creates a team and attaches the owner', function () {
    $owner = User::create([
        'name' => 'Owner',
        'email' => 'owner@example.test',
        'password' => 'secret-password',
    ]);

    $team = app(CreateTenant::class)->handle('Acme Inc', 'acme', $owner);

    expect($team->owner_id)->toBe($owner->id)
        ->and($team->users()->whereKey($owner->id)->exists())->toBeTrue()
        ->and($owner->fresh()->current_team_id)->toBe($team->id);
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `docker compose -f infra/local/docker-compose.yml exec central php artisan test --filter=CreateTenantTest`
Expected: FAIL with "Target class [App\Modules\V1\Tenants\Services\CreateTenant] does not exist".

- [ ] **Step 4: Write the service**

Create `central-app/app/Modules/V1/Tenants/Services/CreateTenant.php`:

```php
<?php

namespace App\Modules\V1\Tenants\Services;

use Bltdreeg\Core\Models\Team;
use Bltdreeg\Core\Models\User;
use Illuminate\Support\Facades\DB;

class CreateTenant
{
    public function handle(string $name, string $slug, User $owner): Team
    {
        return DB::transaction(function () use ($name, $slug, $owner) {
            $team = Team::create([
                'name' => $name,
                'slug' => $slug,
                'owner_id' => $owner->getKey(),
            ]);

            $team->users()->syncWithoutDetaching([$owner->getKey() => ['role' => 'owner']]);

            $owner->forceFill(['current_team_id' => $team->getKey()])->save();

            return $team;
        });
    }
}
```

Register the module namespace by adding to `central-app/composer.json` autoload
`psr-4` (it is already covered by `"App\\": "app/"`, so no change is needed —
verify and move on).

- [ ] **Step 5: Run the test to verify it passes**

Run: `docker compose -f infra/local/docker-compose.yml exec central php artisan test --filter=CreateTenantTest`
Expected: PASS.

- [ ] **Step 6: Add the Filament resource**

Create `central-app/app/Modules/V1/Tenants/Filament/Resources/TeamResource.php`:

```php
<?php

namespace App\Modules\V1\Tenants\Filament\Resources;

use Bltdreeg\Core\Models\Team;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class TeamResource extends Resource
{
    protected static ?string $model = Team::class;

    protected static ?string $navigationLabel = 'Tenants';

    public static function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('name')->required(),
            TextInput::make('slug')->required()->unique(ignoreRecord: true)->alphaDash(),
            Select::make('owner_id')
                ->relationship('owner', 'email')
                ->searchable()
                ->required(),
        ]);
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            TextColumn::make('name')->searchable(),
            TextColumn::make('slug')->searchable(),
            TextColumn::make('owner.email')->label('Owner'),
            TextColumn::make('users_count')->counts('users')->label('Members'),
            TextColumn::make('created_at')->dateTime(),
        ]);
    }
}
```

Add the module path to the panel's resource discovery in
`central-app/app/Providers/Filament/AdminPanelProvider.php`:

```php
->discoverResources(
    in: app_path('Modules/V1/Tenants/Filament/Resources'),
    for: 'App\\Modules\\V1\\Tenants\\Filament\\Resources',
)
```

- [ ] **Step 7: Verify the panel renders**

Run: `curl -sf http://admin.localhost/admin/login > /dev/null && echo "panel OK"`
Expected: prints `panel OK`.

- [ ] **Step 8: Commit**

```bash
git add central-app
git commit -m "feat: central landlord panel with tenant creation"
```

---

### Task 4: Install laravel-crm in tenant-app with teams enabled

**Files:**
- Modify: `tenant-app/composer.json`, `tenant-app/.env`
- Create: `tenant-app/config/laravel-crm.php` (published)
- Create: `tenant-app/config/permission.php` (published)
- Test: `tenant-app/tests/Feature/CrmInstallTest.php`

**Interfaces:**
- Produces: `crm_*` tables, all carrying a `team_id` column; `VentureDrake\LaravelCrm\Models\Lead` usable with the `BelongsToTeams` global scope active.

- [ ] **Step 1: Require the package**

```bash
docker compose -f infra/local/docker-compose.yml --profile tools \
  run --rm composer-tenant composer require venturedrake/laravel-crm:"^2.4"
```

- [ ] **Step 2: Enable Spatie teams support before any permission migration runs**

```bash
make t-artisan CMD="vendor:publish --provider=\"Spatie\Permission\PermissionServiceProvider\""
```

Then in `tenant-app/config/permission.php` set:

```php
'teams' => true,
'team_foreign_key' => 'team_id',
```

This must happen before Step 4. The permission migration reads
`config('permission.teams')` to decide whether to add the `team_id` column,
and turning it on afterwards leaves the tables unusable for tenancy.

- [ ] **Step 3: Turn on CRM tenancy in the environment**

Add to `tenant-app/.env`:

```env
LARAVEL_CRM_TEAMS=true
LARAVEL_CRM_USER_INTERFACE=false
LARAVEL_CRM_ROUTE_PREFIX=crm
```

- [ ] **Step 4: Run the CRM installer**

```bash
make t-artisan CMD="laravelcrm:install --modules=leads,deals,quotes,invoices"
```

The installer prompts to patch the `User` model with `HasCrmAccess` and
`HasCrmTeams`. Decline — it would edit the deleted `tenant-app/app/Models/User.php`.
Add both traits to `packages/core/src/Models/User.php` by hand instead:

```php
use VentureDrake\LaravelCrm\Traits\HasCrmAccess;
use VentureDrake\LaravelCrm\Traits\HasCrmTeams;

class User extends Authenticatable
{
    use HasCrmAccess;
    use HasCrmTeams;
    use HasTeams;
    use Notifiable;
```

Because `packages/core` is shared, add `venturedrake/laravel-crm` to
`packages/core/composer.json` `require` so `central-app` can still boot the
model. Then run `make install`.

Decline the owner-user prompt; Task 8 seeds users.

- [ ] **Step 5: Write the failing test**

Create `tenant-app/tests/Feature/CrmInstallTest.php`:

```php
<?php

use Illuminate\Support\Facades\Schema;

it('creates crm tables carrying a team_id column', function () {
    expect(Schema::hasTable('crm_leads'))->toBeTrue()
        ->and(Schema::hasColumn('crm_leads', 'team_id'))->toBeTrue()
        ->and(config('laravel-crm.teams'))->toBeTrue()
        ->and(config('permission.teams'))->toBeTrue();
});
```

- [ ] **Step 6: Run the test**

Run: `make test`
Expected: PASS. If `permission.teams` is false, drop the database
(`make down && docker volume rm server_mysql-data`), redo Step 2 before
Step 4, and re-run.

- [ ] **Step 7: Commit**

```bash
git add tenant-app packages
git commit -m "feat: install laravel-crm with host team tenancy enabled"
```

---

### Task 5: Tenant panel tenancy and isolation tests

**Files:**
- Create: `tenant-app/app/Providers/Filament/AppPanelProvider.php` (generated, then edited)
- Create: `tenant-app/app/Modules/V1/Crm/Http/Middleware/BindCrmTenant.php`
- Modify: `packages/core/src/Models/User.php`
- Test: `tenant-app/tests/Feature/TenantIsolationTest.php`

**Interfaces:**
- Consumes: `CreateTenant` semantics from Task 3 (owner attached to `team_user`), CRM models from Task 4.
- Produces: `User` implementing `Filament\Models\Contracts\FilamentUser` and `Filament\Models\Contracts\HasTenants`; middleware `App\Modules\V1\Crm\Http\Middleware\BindCrmTenant` registered as a tenant middleware on the `app` panel.

- [ ] **Step 1: Install Filament and generate the tenant panel**

```bash
docker compose -f infra/local/docker-compose.yml --profile tools \
  run --rm composer-tenant composer require filament/filament:"^4.0"
make t-artisan CMD="filament:install --panels"
```

Answer `app` when prompted for the panel id.

- [ ] **Step 2: Write the failing isolation test**

Create `tenant-app/tests/Feature/TenantIsolationTest.php`:

```php
<?php

use Bltdreeg\Core\Models\Team;
use Bltdreeg\Core\Models\User;
use VentureDrake\LaravelCrm\Models\Lead;

function makeTenant(string $slug): array
{
    $user = User::create([
        'name' => ucfirst($slug),
        'email' => "{$slug}@example.test",
        'password' => 'secret-password',
    ]);

    $team = Team::create(['name' => ucfirst($slug), 'slug' => $slug, 'owner_id' => $user->id]);
    $team->users()->attach($user, ['role' => 'owner']);
    $user->switchTeam($team);

    return [$user, $team];
}

it('refuses a panel belonging to another tenant', function () {
    [$userA] = makeTenant('alpha');
    [, $teamB] = makeTenant('bravo');

    $this->actingAs($userA)
        ->get("/app/{$teamB->slug}")
        ->assertForbidden();
});

it('hides leads created under another tenant', function () {
    [$userA, $teamA] = makeTenant('alpha');
    [$userB] = makeTenant('bravo');

    $this->actingAs($userA);
    $userA->switchTeam($teamA);
    $lead = Lead::create(['title' => 'Alpha lead']);

    expect($lead->team_id)->toBe($teamA->id);

    auth()->login($userB);
    expect(Lead::query()->whereKey($lead->getKey())->exists())->toBeFalse();
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `make test`
Expected: FAIL — the panel route 404s and the lead is visible across tenants.

- [ ] **Step 4: Implement the Filament tenancy contracts on User**

Add to `packages/core/src/Models/User.php`:

```php
use Bltdreeg\Core\Models\Team;
use Filament\Models\Contracts\FilamentUser;
use Filament\Models\Contracts\HasTenants;
use Filament\Panel;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Collection;

class User extends Authenticatable implements FilamentUser, HasTenants
{
    // ... traits and properties from Task 2 and Task 4

    public function canAccessPanel(Panel $panel): bool
    {
        return $panel->getId() === 'admin'
            ? $this->is_super_admin
            : $this->teams()->exists();
    }

    public function getTenants(Panel $panel): Collection
    {
        return $this->allTeams();
    }

    public function canAccessTenant(Model $tenant): bool
    {
        return $tenant instanceof Team && $this->belongsToTeam($tenant);
    }
}
```

Add `filament/filament` to `packages/core/composer.json` `require`, then
run `make install`.

- [ ] **Step 5: Write the tenant-binding middleware**

Create `tenant-app/app/Modules/V1/Crm/Http/Middleware/BindCrmTenant.php`:

```php
<?php

namespace App\Modules\V1\Crm\Http\Middleware;

use Bltdreeg\Core\Models\Team;
use Closure;
use Filament\Facades\Filament;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class BindCrmTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        $tenant = Filament::getTenant();
        $user = $request->user();

        abort_unless($tenant instanceof Team && $user?->canAccessTenant($tenant), 403);

        $user->switchTeam($tenant);

        return $next($request);
    }
}
```

`switchTeam()` sets the attribute and the relation without writing to the
database, which is what `BelongsToTeamsScope` reads. Persisting
`current_team_id` on every request would make concurrent sessions in two
tenants fight over the column.

- [ ] **Step 6: Wire tenancy into the panel provider**

In `tenant-app/app/Providers/Filament/AppPanelProvider.php`, inside `panel()`:

```php
->path('app')
->tenant(\Bltdreeg\Core\Models\Team::class, slugAttribute: 'slug')
->tenantMiddleware([
    \App\Modules\V1\Crm\Http\Middleware\BindCrmTenant::class,
], isPersistent: true)
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `make test`
Expected: PASS for both isolation tests.

- [ ] **Step 8: Commit**

```bash
git add tenant-app packages
git commit -m "feat: filament tenant panel bound to team scoping with isolation tests"
```

---

### Task 6: Register CRM resources without the plugin's identity surfaces

**Files:**
- Modify: `tenant-app/app/Providers/Filament/AppPanelProvider.php`
- Create: `tenant-app/app/Modules/V1/Crm/Filament/CrmPluginFactory.php`
- Test: `tenant-app/tests/Feature/CrmPanelSurfaceTest.php`

**Interfaces:**
- Consumes: the `app` panel and `BindCrmTenant` from Task 5.
- Produces: `App\Modules\V1\Crm\Filament\CrmPluginFactory::make(): \VentureDrake\LaravelCrmFilament\LaravelCrmPlugin` — the single place where the plugin is configured.

- [ ] **Step 1: Require and install the plugin**

```bash
docker compose -f infra/local/docker-compose.yml --profile tools \
  run --rm composer-tenant composer require venturedrake/laravel-crm-filament
make t-artisan CMD="laravelcrm:filament-install --mode=inject --panel=app --allow-teams --skip-crm-install"
```

`--allow-teams` is required: the installer refuses outright while
`laravel-crm.teams` is true. `--mode=inject` reuses the `app` panel from
Task 5 rather than publishing a second `crm` panel.

- [ ] **Step 2: Write the failing test**

Create `tenant-app/tests/Feature/CrmPanelSurfaceTest.php`:

```php
<?php

use Filament\Facades\Filament;

it('registers crm resources but no plugin identity resources', function () {
    $resources = collect(Filament::getPanel('app')->getResources());

    expect($resources->contains(fn (string $r) => str_contains($r, 'LeadResource')))->toBeTrue();

    $forbidden = ['UserResource', 'RoleResource', 'PermissionResource', 'CrmTeamResource'];

    foreach ($forbidden as $name) {
        expect($resources->contains(
            fn (string $r) => str_contains($r, "LaravelCrmFilament") && str_contains($r, $name)
        ))->toBeFalse("panel must not register the plugin's {$name}");
    }
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `make test`
Expected: FAIL — the plugin registers its user and role resources by default.

- [ ] **Step 4: Write the plugin factory**

Create `tenant-app/app/Modules/V1/Crm/Filament/CrmPluginFactory.php`:

```php
<?php

namespace App\Modules\V1\Crm\Filament;

use VentureDrake\LaravelCrmFilament\LaravelCrmPlugin;

class CrmPluginFactory
{
    public static function make(): LaravelCrmPlugin
    {
        return LaravelCrmPlugin::make()
            // The plugin has no Filament::getTenant() calls. CRM models are safe
            // through BelongsToTeamsScope; its identity surfaces are not, and are
            // excluded below. Re-audit this list on every plugin upgrade.
            ->allowUnsupportedTenancy()
            ->modules([
                'leads' => true,
                'deals' => true,
                'quotes' => true,
                'invoices' => true,
                'teams' => false,
                'chat' => false,
                'email-marketing' => false,
                'sms-marketing' => false,
            ]);
    }
}
```

- [ ] **Step 5: Register it and drop the unsafe resources**

In `tenant-app/app/Providers/Filament/AppPanelProvider.php`:

```php
->plugin(\App\Modules\V1\Crm\Filament\CrmPluginFactory::make())
->bootUsing(function (\Filament\Panel $panel): void {
    $panel->getResources(); // force discovery before filtering
})
```

If the plugin still registers identity resources after `->modules()`, remove
them explicitly in the provider:

```php
use VentureDrake\LaravelCrmFilament\Filament\Resources\UserResource;
use VentureDrake\LaravelCrmFilament\Filament\Resources\RoleResource;

// inside panel():
->resources(array_values(array_diff(
    $panel->getResources(),
    [UserResource::class, RoleResource::class],
)))
```

Confirm the real class names against the installed package under
`tenant-app/vendor/venturedrake/laravel-crm-filament/src/Filament/Resources/`
before writing them — do not guess.

- [ ] **Step 6: Run the test to verify it passes**

Run: `make test`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add tenant-app
git commit -m "feat: register crm resources in the tenant panel without identity surfaces"
```

---

### Task 7: Tenant-scoped user resource

**Files:**
- Create: `tenant-app/app/Modules/V1/Settings/Filament/Resources/TeamMemberResource.php`
- Test: `tenant-app/tests/Feature/TeamMemberScopeTest.php`

**Interfaces:**
- Consumes: `BindCrmTenant` from Task 5, `Team::users()` from Task 2.
- Produces: `TeamMemberResource` listing only `team_user` rows for the current Filament tenant.

- [ ] **Step 1: Write the failing test**

Create `tenant-app/tests/Feature/TeamMemberScopeTest.php`:

```php
<?php

use App\Modules\V1\Settings\Filament\Resources\TeamMemberResource;
use Bltdreeg\Core\Models\Team;
use Bltdreeg\Core\Models\User;
use Filament\Facades\Filament;

it('only queries users in the current tenant', function () {
    $userA = User::create(['name' => 'A', 'email' => 'a@example.test', 'password' => 'secret-password']);
    $userB = User::create(['name' => 'B', 'email' => 'b@example.test', 'password' => 'secret-password']);

    $teamA = Team::create(['name' => 'Alpha', 'slug' => 'alpha', 'owner_id' => $userA->id]);
    $teamB = Team::create(['name' => 'Bravo', 'slug' => 'bravo', 'owner_id' => $userB->id]);
    $teamA->users()->attach($userA);
    $teamB->users()->attach($userB);

    Filament::setTenant($teamA);

    $ids = TeamMemberResource::getEloquentQuery()->pluck('users.id')->all();

    expect($ids)->toBe([$userA->id]);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `make test`
Expected: FAIL with "Class ... TeamMemberResource not found".

- [ ] **Step 3: Write the resource**

Create `tenant-app/app/Modules/V1/Settings/Filament/Resources/TeamMemberResource.php`:

```php
<?php

namespace App\Modules\V1\Settings\Filament\Resources;

use Bltdreeg\Core\Models\User;
use Filament\Facades\Filament;
use Filament\Resources\Resource;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class TeamMemberResource extends Resource
{
    protected static ?string $model = User::class;

    protected static ?string $navigationLabel = 'Team members';

    protected static bool $isScopedToTenant = false;

    public static function getEloquentQuery(): Builder
    {
        return parent::getEloquentQuery()
            ->whereHas('teams', fn (Builder $query) => $query
                ->whereKey(Filament::getTenant()?->getKey()));
    }

    public static function table(Table $table): Table
    {
        return $table->columns([
            TextColumn::make('name')->searchable(),
            TextColumn::make('email')->searchable(),
        ]);
    }
}
```

`$isScopedToTenant = false` turns off Filament's automatic relationship
scoping, which would look for a `team_id` column on `users` that does not
exist. The `whereHas` above is the scoping, through the pivot.

- [ ] **Step 4: Run the test to verify it passes**

Run: `make test`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add tenant-app
git commit -m "feat: tenant-scoped team member resource"
```

---

### Task 8: Seeds, CRM permissions, and README

**Files:**
- Create: `central-app/database/seeders/DemoSeeder.php`
- Modify: `central-app/database/seeders/DatabaseSeeder.php`
- Modify: `Makefile`
- Create: `README.md`

**Interfaces:**
- Consumes: `CreateTenant::handle()` from Task 3.
- Produces: a super admin (`admin@bltdreeg.test`), tenants `acme` and `demo`, each with an owner (`owner@acme.test`, `owner@demo.test`). All passwords `password`.

- [ ] **Step 1: Write the seeder**

Create `central-app/database/seeders/DemoSeeder.php`:

```php
<?php

namespace Database\Seeders;

use App\Modules\V1\Tenants\Services\CreateTenant;
use Bltdreeg\Core\Models\User;
use Illuminate\Database\Seeder;

class DemoSeeder extends Seeder
{
    public function run(CreateTenant $createTenant): void
    {
        User::firstOrCreate(
            ['email' => 'admin@bltdreeg.test'],
            ['name' => 'Super Admin', 'password' => 'password', 'is_super_admin' => true],
        );

        foreach (['acme' => 'Acme Inc', 'demo' => 'Demo Co'] as $slug => $name) {
            $owner = User::firstOrCreate(
                ['email' => "owner@{$slug}.test"],
                ['name' => "{$name} Owner", 'password' => 'password'],
            );

            $createTenant->handle($name, $slug, $owner);
        }
    }
}
```

Call it from `DatabaseSeeder::run()`:

```php
public function run(): void
{
    $this->call(DemoSeeder::class);
}
```

- [ ] **Step 2: Add a CRM permissions target to the Makefile**

```makefile
crm-permissions:
	$(COMPOSE) exec tenant php artisan laravelcrm:permissions

fresh:
	$(COMPOSE) exec central php artisan migrate:fresh --force
	$(COMPOSE) exec tenant php artisan migrate --force
	$(COMPOSE) exec tenant php artisan laravelcrm:permissions
	$(COMPOSE) exec central php artisan db:seed --force
```

`migrate:fresh` runs from `central` only — both apps share the database, so
running it twice would drop the CRM tables the second app just created.

- [ ] **Step 3: Run the full bootstrap**

```bash
make up && make install && make fresh
```

Expected: no errors; `make test` still passes.

- [ ] **Step 4: Verify both panels by hand**

- `http://admin.localhost/admin` — sign in as `admin@bltdreeg.test` / `password`, see Acme and Demo under Tenants.
- `http://app.localhost/app` — sign in as `owner@acme.test` / `password`, land in the Acme tenant, open Leads, create one.
- Sign in as `owner@demo.test` and confirm the Acme lead is not listed, and that `http://app.localhost/app/acme` returns 403.

- [ ] **Step 5: Write the README**

Create `README.md` covering: the two apps and what each owns, the tenancy
model (tenant id == `teams.id` == `crm_*.team_id`), the Filament CRM plugin
tenancy caveat and which resources are deliberately excluded, the Make
targets, the seeded credentials, and the migration ordering rule.

- [ ] **Step 6: Commit**

```bash
git add central-app Makefile README.md
git commit -m "feat: demo seeds, crm permissions target, and project readme"
```

---

## Self-Review Notes

**Spec coverage:** repo layout (Task 1, 2), shared core package (Task 2),
central landlord panel (Task 3), CRM with teams (Task 4), the three isolation
layers (Task 5), the plugin-risk mitigation (Task 6), tenant-scoped identity
surface (Task 7), Docker/Makefile/seeds/tests (Tasks 1, 8). Every spec section
maps to a task.

**Open item for the executor:** Task 6 Step 5 requires reading the installed
plugin's `src/Filament/Resources/` directory to confirm the real resource class
names before excluding them. The plugin's published docs name the resources but
not their fully-qualified class names, and guessing here would silently fail to
exclude a leaking resource — which is exactly the failure the test in Step 2
catches.
