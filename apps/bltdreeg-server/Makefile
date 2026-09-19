COMPOSE := docker compose -f infra/local/docker-compose.yml
TENANT := tenant-app

.DEFAULT_GOAL := up

.PHONY: up start down migrate seed

up start:
	$(COMPOSE) up -d --build
	@echo
	@echo Central:       http://localhost:8011/login
	@echo Tenant Bloom:  http://localhost:8000/bloom
	@echo Tenant Petal:  http://localhost:8000/petal
	@echo Super admin:   super@admin.dev / password
	@echo Bloom owner:   owner@bloom.dev / password
	@echo Petal owner:   owner@petal.dev / password
	@echo Next:          make migrate   then   make seed

down:
	$(COMPOSE) down

migrate:
	$(COMPOSE) exec -T $(TENANT) php artisan migrate --force --no-interaction

fresh-seed:
	$(COMPOSE) exec -T $(TENANT) php artisan migrate:fresh --seed

seed:
	$(COMPOSE) exec -T $(TENANT) php artisan db:seed --force --no-interaction
