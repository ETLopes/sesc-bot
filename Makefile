# Variables
IMAGE ?= sesc-bot:latest
SERVICE ?= sesc-bot

.PHONY: build up down logs ps restart shell post-last health

build:
	docker build -t $(IMAGE) .

up:
	docker compose up -d --build

down:
	docker compose down

logs:
	docker compose logs -f $(SERVICE)

ps:
	docker compose ps

restart:
	docker compose restart $(SERVICE)

shell:
	docker compose exec $(SERVICE) sh

post-last:
	docker compose run --rm --entrypoint "node" $(SERVICE) src/scripts/postLastEvent.js

health:
	docker compose run --rm --entrypoint "node" $(SERVICE) src/scripts/healthcheck.js


