COMPOSE := docker compose -f infra/local/docker-compose.yml
TENANT := tenant-app
CENTRAL := central-app

.DEFAULT_GOAL := up

.PHONY: up start down migrate migrate-fresh seed fresh-seed assets tenant-assets dev

dev:
	node dev.mjs

up start: assets
	$(COMPOSE) up -d --build --wait
	$(MAKE) migrate
	@echo
	@echo Central:       http://localhost:8011/login
	@echo Tenant Bloom:  http://localhost:8010/bloom
	@echo Tenant Petal:  http://localhost:8010/petal
	@echo Super admin:   super@admin.dev / password
	@echo Bloom owner:   owner@bloom.dev / password
	@echo Petal owner:   owner@petal.dev / password
	@echo Next:          make seed

down:
	$(COMPOSE) down

assets:
	npm --prefix $(CENTRAL) install
	npm --prefix $(CENTRAL) run build
	npm --prefix $(TENANT) install
	npm --prefix $(TENANT) run build

# Rebuild tenant Filament/Vite CSS and reload Octane so the new hashed assets load.
tenant-assets:
	npm --prefix $(TENANT) run build
	$(COMPOSE) exec -T $(TENANT) php artisan optimize:clear
	$(COMPOSE) exec -T $(TENANT) php artisan octane:reload

migrate:
	$(COMPOSE) exec -T $(TENANT) php artisan migrate --force --no-interaction

migrate-fresh:
	$(COMPOSE) exec -T $(TENANT) php artisan migrate:fresh --force --no-interaction

seed:
	$(COMPOSE) exec -T $(TENANT) php artisan db:seed --force --no-interaction

fresh-seed:
	$(COMPOSE) exec -T $(TENANT) php artisan migrate:fresh --seed --force --no-interaction
