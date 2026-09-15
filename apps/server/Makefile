COMPOSE = docker compose -f infra/local/docker-compose.yml
TOOLS   = $(COMPOSE) --profile tools

.PHONY: start env up down ps logs install assets wait migrate seed fresh test-setup test c-artisan t-artisan ide-sync

# Vendor lives in Docker volumes (not on the host bind mount). Install must
# finish before apps are recreated, or they boot against an empty vendor tree.
# After install, run `make ide-sync` so the host IDE can see CRM/Spatie types.
start: env up wait install
	$(COMPOSE) up -d --force-recreate central tenant
	@echo "Waiting for app containers..."
	@until $(COMPOSE) exec -T central php -v >/dev/null 2>&1; do sleep 1; done
	@until $(COMPOSE) exec -T tenant php -v >/dev/null 2>&1; do sleep 1; done
	@$(MAKE) assets migrate seed
	@$(MAKE) ide-sync
	@echo ""
	@echo "Ready."
	@echo "  Landlord  http://admin.localhost:8085   admin@bltdreeg.test / password"
	@echo "  Tenant    http://app.localhost:8085/acme  owner@acme.test / password"

env:
	@bash scripts/ensure-env.sh

up:
	$(COMPOSE) up -d --build

down:
	$(COMPOSE) down

ps:
	$(COMPOSE) ps -a

logs:
	$(COMPOSE) logs -f --tail=200

install: env
	$(TOOLS) run --rm composer-central composer install --no-interaction
	$(TOOLS) run --rm composer-tenant composer install --no-interaction

assets:
	$(COMPOSE) exec central php artisan filament:assets --no-interaction
	$(COMPOSE) exec tenant php artisan filament:assets --no-interaction

wait:
	@echo "Waiting for MySQL..."
	@$(COMPOSE) exec -T mysql sh -c 'until mysqladmin ping -h localhost -psecret --silent; do sleep 1; done'
	@echo "Waiting for Redis..."
	@$(COMPOSE) exec -T redis sh -c 'until redis-cli ping | grep -q PONG; do sleep 1; done'
	@echo "MySQL and Redis are up."

c-artisan:
	$(COMPOSE) exec central php artisan $(CMD)

t-artisan:
	$(COMPOSE) exec tenant php artisan $(CMD)

migrate:
	$(COMPOSE) exec central php artisan migrate --force
	$(COMPOSE) exec tenant php artisan migrate --force
	$(COMPOSE) exec tenant php artisan laravelcrm:filament-update --no-interaction

seed:
	$(COMPOSE) exec central php artisan db:seed --force
	$(COMPOSE) exec tenant php artisan db:seed --force

fresh:
	$(COMPOSE) exec central php artisan migrate:fresh --force
	$(COMPOSE) exec tenant php artisan migrate --force
	$(COMPOSE) exec tenant php artisan laravelcrm:filament-update --no-interaction
	$(MAKE) seed

test-setup:
	$(COMPOSE) exec -e DB_DATABASE=bltdreeg_central_test central php artisan migrate --force
	$(COMPOSE) exec -e DB_DATABASE=bltdreeg_test tenant php artisan migrate --force

test:
	$(COMPOSE) exec central php artisan test
	$(COMPOSE) exec tenant php artisan test

# Copy CRM/Spatie packages from the Docker vendor volume onto the host vendor
# tree so the IDE can resolve types (volume is invisible to host tools).
ide-sync:
	@bash scripts/ide-sync-vendor.sh
