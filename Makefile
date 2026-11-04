# Eco Farm Tech — developer shortcuts
# The site is plain HTML, CSS and JavaScript: no build step is required.

PORT ?= 4173
IMAGE ?= ecofarm-tech/dashboard:latest
PYTHON ?= python3

.PHONY: help serve docker-build docker-run docker-stop lint check clean

help: ## Show available targets
	@grep -hE '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

serve: ## Serve the site locally on $(PORT)
	@echo "→ http://localhost:$(PORT)"
	@$(PYTHON) -m http.server $(PORT) --bind 0.0.0.0

docker-build: ## Build the nginx container image
	docker build -t $(IMAGE) .

docker-run: ## Run the container on http://localhost:8080
	docker run --rm -p 8080:8080 --name ecofarm-dashboard $(IMAGE)

docker-stop: ## Stop the running container
	docker stop ecofarm-dashboard || true

lint: ## Syntax-check the JavaScript and basic HTML structure
	node --check js/data.js
	node --check js/app.js
	node scripts/check-html.mjs

check: lint ## Run every automated check used by CI
	node scripts/check-files.mjs

clean: ## Remove local caches and logs
	rm -rf node_modules dist coverage .DS_Store *.log
