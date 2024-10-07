
DOCKERFILE := docker-compose.yml

build:
	@docker compose -f $(DOCKERFILE) build --no-cache

build-cache:
	@docker compose -f $(DOCKERFILE) build

up:
	@make echo-system
	@docker compose -f $(DOCKERFILE) up -d

watch:
	@make echo-system
	@docker compose -f $(DOCKERFILE) up

down:
	@docker compose -f $(DOCKERFILE) down

restart:
	@docker compose -f $(DOCKERFILE) down
	@docker compose -f $(DOCKERFILE) up -d

a :=
logs:
	@docker logs -f $(a)

logs-app:
	@make logs a=nasa-space-apps-disaster-box-app

logs-server:
	@make logs a=nasa-space-apps-disaster-box-server

a :=
c :=
exec:
	@docker compose -f $(DOCKERFILE) exec $(a) $(c)

npm-prune:
	@make exec a=nasa-space-apps-disaster-box-app c="npm prune"

npm-build:
	@make exec a=nasa-space-apps-disaster-box-app c="npm run build"

b ?=
npm-install:
	@make exec a=nasa-space-apps-disaster-box-app c="npm install $(b)"

update:
	@make npm-install
	@make npm-build
	@make npm-prune
	@make restart

up ?=
watch ?=
install:
	@make build
	@echo
	@echo "Nasa-space-apps-disaster-box Web fully installed!"
	@echo
ifdef up
	@make up
else ifdef watch
	@make watch
endif
