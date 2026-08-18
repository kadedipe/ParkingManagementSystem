# ============================================================================
# Parking Management System - Makefile
# Comprehensive build, test, and deployment automation
# ============================================================================

# ============================================================================
# Variables
# ============================================================================

# Colors for output
GREEN  := $(shell tput -Txterm setaf 2)
YELLOW := $(shell tput -Txterm setaf 3)
RED    := $(shell tput -Txterm setaf 1)
BLUE   := $(shell tput -Txterm setaf 4)
RESET  := $(shell tput -Txterm sgr0)

# Project configuration
PROJECT_NAME := parking-management-system
PYTHON_VERSION := 3.10
NODE_VERSION := 18
DOCKER_COMPOSE := docker-compose
DOCKER_COMPOSE_PROD := docker-compose -f docker-compose.prod.yml

# Directories
BACKEND_DIR := backend
FRONTEND_DIR := frontend
SERVICES_DIR := services
DOCS_DIR := docs
BUILD_DIR := build
DIST_DIR := dist
COVERAGE_DIR := coverage
LOGS_DIR := logs
BACKUP_DIR := backups

# Python paths
PYTHON := python3
PIP := pip3
POETRY := poetry
PYTEST := pytest
BLACK := black
FLAKE8 := flake8
MYPY := mypy

# Node paths
NPM := npm
PNPM := pnpm
NODE := node

# Test configuration
TEST_PATH := tests
COVERAGE_THRESHOLD := 80

# Docker images
BACKEND_IMAGE := parking-backend
FRONTEND_IMAGE := parking-frontend
PARKING_SERVICE_IMAGE := parking-service
CHARGING_SERVICE_IMAGE := charging-service
VEHICLE_SERVICE_IMAGE := vehicle-service
NOTIFICATION_SERVICE_IMAGE := notification-service

# ============================================================================
# Default target
# ============================================================================

.PHONY: help
help: ## Show this help message
	@echo '${GREEN}Parking Management System - Make Commands${RESET}'
	@echo ''
	@echo '${YELLOW}Usage:${RESET}'
	@echo '  make [target]'
	@echo ''
	@echo '${YELLOW}Available targets:${RESET}'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  ${GREEN}%-25s${RESET} %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# ============================================================================
# Development Setup
# ============================================================================

.PHONY: setup
setup: setup-backend setup-frontend setup-services ## Setup all development environments

.PHONY: setup-backend
setup-backend: ## Setup Python backend environment
	@echo '${BLUE}Setting up backend...${RESET}'
	@cd $(BACKEND_DIR) && $(PYTHON) -m venv venv
	@cd $(BACKEND_DIR) && . venv/bin/activate && $(PIP) install -r requirements-dev.txt
	@cd $(BACKEND_DIR) && . venv/bin/activate && $(PIP) install -e .
	@echo '${GREEN}✓ Backend setup complete${RESET}'

.PHONY: setup-frontend
setup-frontend: ## Setup React frontend environment
	@echo '${BLUE}Setting up frontend...${RESET}'
	@cd $(FRONTEND_DIR) && $(PNPM) install
	@echo '${GREEN}✓ Frontend setup complete${RESET}'

.PHONY: setup-services
setup-services: ## Setup microservices
	@echo '${BLUE}Setting up services...${RESET}'
	@for service in parking-service charging-service vehicle-service notification-service; do \
		echo "Setting up $$service..."; \
		cd $(SERVICES_DIR)/$$service && $(PYTHON) -m venv venv; \
		cd $(SERVICES_DIR)/$$service && . venv/bin/activate && $(PIP) install -r requirements-dev.txt; \
	done
	@echo '${GREEN}✓ Services setup complete${RESET}'

# ============================================================================
# Development Server
# ============================================================================

.PHONY: dev
dev: ## Start development servers (all services)
	@echo '${BLUE}Starting development servers...${RESET}'
	@$(DOCKER_COMPOSE) up -d
	@echo '${GREEN}✓ Development servers started${RESET}'
	@echo '${YELLOW}Access:${RESET}'
	@echo '  Frontend:      http://localhost:5173'
	@echo '  Backend API:   http://localhost:8000'
	@echo '  API Docs:      http://localhost:8000/docs'
	@echo '  Kafka UI:      http://localhost:8080'
	@echo '  pgAdmin:       http://localhost:5050'

.PHONY: dev-backend
dev-backend: ## Start backend development server only
	@echo '${BLUE}Starting backend server...${RESET}'
	@cd $(BACKEND_DIR) && . venv/bin/activate && uvicorn src.main:app --reload --host 0.0.0.0 --port 8000

.PHONY: dev-frontend
dev-frontend: ## Start frontend development server only
	@echo '${BLUE}Starting frontend server...${RESET}'
	@cd $(FRONTEND_DIR) && $(PNPM) dev

.PHONY: dev-services
dev-services: ## Start all microservices
	@echo '${BLUE}Starting microservices...${RESET}'
	@for service in parking-service charging-service vehicle-service notification-service; do \
		echo "Starting $$service..."; \
		cd $(SERVICES_DIR)/$$service && . venv/bin/activate && uvicorn src.main:app --reload --host 0.0.0.0 --port 800${service:parking-service=1:charging-service=2:vehicle-service=3:notification-service=4} & \
	done
	@echo '${GREEN}✓ Microservices started${RESET}'

# ============================================================================
# Build
# ============================================================================

.PHONY: build
build: build-backend build-frontend build-services ## Build all components

.PHONY: build-backend
build-backend: ## Build backend
	@echo '${BLUE}Building backend...${RESET}'
	@cd $(BACKEND_DIR) && . venv/bin/activate && $(PYTHON) -m build
	@echo '${GREEN}✓ Backend build complete${RESET}'

.PHONY: build-frontend
build-frontend: ## Build frontend
	@echo '${BLUE}Building frontend...${RESET}'
	@cd $(FRONTEND_DIR) && $(PNPM) build
	@echo '${GREEN}✓ Frontend build complete${RESET}'

.PHONY: build-services
build-services: ## Build microservices
	@echo '${BLUE}Building services...${RESET}'
	@for service in parking-service charging-service vehicle-service notification-service; do \
		echo "Building $$service..."; \
		cd $(SERVICES_DIR)/$$service && . venv/bin/activate && $(PYTHON) -m build; \
	done
	@echo '${GREEN}✓ Services build complete${RESET}'

.PHONY: build-docker
build-docker: ## Build Docker images
	@echo '${BLUE}Building Docker images...${RESET}'
	@$(DOCKER_COMPOSE) build
	@echo '${GREEN}✓ Docker images built${RESET}'

.PHONY: build-docker-prod
build-docker-prod: ## Build Docker images for production
	@echo '${BLUE}Building production Docker images...${RESET}'
	@$(DOCKER_COMPOSE_PROD) build
	@echo '${GREEN}✓ Production Docker images built${RESET}'

# ============================================================================
# Testing
# ============================================================================

.PHONY: test
test: test-backend test-frontend test-services ## Run all tests

.PHONY: test-backend
test-backend: ## Run backend tests
	@echo '${BLUE}Running backend tests...${RESET}'
	@cd $(BACKEND_DIR) && . venv/bin/activate && $(PYTEST) $(TEST_PATH) -v --cov=src --cov-report=html --cov-report=term
	@echo '${GREEN}✓ Backend tests complete${RESET}'

.PHONY: test-frontend
test-frontend: ## Run frontend tests
	@echo '${BLUE}Running frontend tests...${RESET}'
	@cd $(FRONTEND_DIR) && $(PNPM) test --coverage
	@echo '${GREEN}✓ Frontend tests complete${RESET}'

.PHONY: test-services
test-services: ## Run microservices tests
	@echo '${BLUE}Running services tests...${RESET}'
	@for service in parking-service charging-service vehicle-service notification-service; do \
		echo "Testing $$service..."; \
		cd $(SERVICES_DIR)/$$service && . venv/bin/activate && $(PYTEST) $(TEST_PATH) -v; \
	done
	@echo '${GREEN}✓ Services tests complete${RESET}'

.PHONY: test-integration
test-integration: ## Run integration tests
	@echo '${BLUE}Running integration tests...${RESET}'
	@cd $(BACKEND_DIR) && . venv/bin/activate && $(PYTEST) tests/integration -v
	@cd $(FRONTEND_DIR) && $(PNPM) test:integration
	@echo '${GREEN}✓ Integration tests complete${RESET}'

.PHONY: test-e2e
test-e2e: ## Run end-to-end tests
	@echo '${BLUE}Running E2E tests...${RESET}'
	@cd $(BACKEND_DIR) && . venv/bin/activate && $(PYTEST) tests/e2e -v
	@cd $(FRONTEND_DIR) && $(PNPM) test:e2e
	@echo '${GREEN}✓ E2E tests complete${RESET}'

.PHONY: test-load
test-load: ## Run load tests
	@echo '${BLUE}Running load tests...${RESET}'
	@k6 run tests/load/k6-script.js
	@echo '${GREEN}✓ Load tests complete${RESET}'

.PHONY: test-coverage
test-coverage: ## Generate test coverage report
	@echo '${BLUE}Generating coverage report...${RESET}'
	@cd $(BACKEND_DIR) && . venv/bin/activate && $(PYTEST) --cov=src --cov-report=html --cov-report=xml
	@cd $(FRONTEND_DIR) && $(PNPM) test:coverage
	@echo '${GREEN}✓ Coverage report generated in $(COVERAGE_DIR)${RESET}'

# ============================================================================
# Code Quality
# ============================================================================

.PHONY: lint
lint: lint-backend lint-frontend lint-services ## Run all linters

.PHONY: lint-backend
lint-backend: ## Lint backend code
	@echo '${BLUE}Linting backend...${RESET}'
	@cd $(BACKEND_DIR) && . venv/bin/activate && $(FLAKE8) src tests
	@cd $(BACKEND_DIR) && . venv/bin/activate && $(MYPY) src
	@echo '${GREEN}✓ Backend linting complete${RESET}'

.PHONY: lint-frontend
lint-frontend: ## Lint frontend code
	@echo '${BLUE}Linting frontend...${RESET}'
	@cd $(FRONTEND_DIR) && $(PNPM) run lint
	@echo '${GREEN}✓ Frontend linting complete${RESET}'

.PHONY: lint-services
lint-services: ## Lint microservices
	@echo '${BLUE}Linting services...${RESET}'
	@for service in parking-service charging-service vehicle-service notification-service; do \
		echo "Linting $$service..."; \
		cd $(SERVICES_DIR)/$$service && . venv/bin/activate && $(FLAKE8) src tests; \
	done
	@echo '${GREEN}✓ Services linting complete${RESET}'

.PHONY: format
format: format-backend format-frontend format-services ## Format all code

.PHONY: format-backend
format-backend: ## Format backend code
	@echo '${BLUE}Formatting backend...${RESET}'
	@cd $(BACKEND_DIR) && . venv/bin/activate && $(BLACK) src tests
	@echo '${GREEN}✓ Backend formatting complete${RESET}'

.PHONY: format-frontend
format-frontend: ## Format frontend code
	@echo '${BLUE}Formatting frontend...${RESET}'
	@cd $(FRONTEND_DIR) && $(PNPM) run format
	@echo '${GREEN}✓ Frontend formatting complete${RESET}'

.PHONY: format-services
format-services: ## Format microservices
	@echo '${BLUE}Formatting services...${RESET}'
	@for service in parking-service charging-service vehicle-service notification-service; do \
		echo "Formatting $$service..."; \
		cd $(SERVICES_DIR)/$$service && . venv/bin/activate && $(BLACK) src tests; \
	done
	@echo '${GREEN}✓ Services formatting complete${RESET}'

# ============================================================================
# Database
# ============================================================================

.PHONY: db-migrate
db-migrate: ## Run database migrations
	@echo '${BLUE}Running database migrations...${RESET}'
	@cd $(BACKEND_DIR) && . venv/bin/activate && alembic upgrade head
	@echo '${GREEN}✓ Database migrations complete${RESET}'

.PHONY: db-rollback
db-rollback: ## Rollback database migration
	@echo '${BLUE}Rolling back database migration...${RESET}'
	@cd $(BACKEND_DIR) && . venv/bin/activate && alembic downgrade -1
	@echo '${GREEN}✓ Database rollback complete${RESET}'

.PHONY: db-seed
db-seed: ## Seed database with test data
	@echo '${BLUE}Seeding database...${RESET}'
	@cd $(BACKEND_DIR) && . venv/bin/activate && $(PYTHON) scripts/seed_data.py
	@echo '${GREEN}✓ Database seeding complete${RESET}'

.PHONY: db-reset
db-reset: db-rollback db-migrate db-seed ## Reset database

.PHONY: db-shell
db-shell: ## Open database shell
	@$(DOCKER_COMPOSE) exec postgres psql -U ${POSTGRES_USER:-user} -d ${POSTGRES_DB:-parking_db}

# ============================================================================
# Docker
# ============================================================================

.PHONY: docker-up
docker-up: ## Start Docker containers
	@echo '${BLUE}Starting Docker containers...${RESET}'
	@$(DOCKER_COMPOSE) up -d
	@echo '${GREEN}✓ Docker containers started${RESET}'

.PHONY: docker-down
docker-down: ## Stop Docker containers
	@echo '${BLUE}Stopping Docker containers...${RESET}'
	@$(DOCKER_COMPOSE) down
	@echo '${GREEN}✓ Docker containers stopped${RESET}'

.PHONY: docker-restart
docker-restart: docker-down docker-up ## Restart Docker containers

.PHONY: docker-logs
docker-logs: ## View Docker logs
	@$(DOCKER_COMPOSE) logs -f

.PHONY: docker-clean
docker-clean: ## Clean Docker containers and volumes
	@echo '${BLUE}Cleaning Docker containers and volumes...${RESET}'
	@$(DOCKER_COMPOSE) down -v
	@docker system prune -f
	@echo '${GREEN}✓ Docker cleanup complete${RESET}'

.PHONY: docker-prod-up
docker-prod-up: ## Start production Docker containers
	@echo '${BLUE}Starting production Docker containers...${RESET}'
	@$(DOCKER_COMPOSE_PROD) up -d
	@echo '${GREEN}✓ Production Docker containers started${RESET}'

.PHONY: docker-prod-down
docker-prod-down: ## Stop production Docker containers
	@echo '${BLUE}Stopping production Docker containers...${RESET}'
	@$(DOCKER_COMPOSE_PROD) down
	@echo '${GREEN}✓ Production Docker containers stopped${RESET}'

# ============================================================================
# Deployment
# ============================================================================

.PHONY: deploy
deploy: ## Deploy to production
	@echo '${BLUE}Deploying to production...${RESET}'
	@./infra/scripts/deploy.sh
	@echo '${GREEN}✓ Deployment complete${RESET}'

.PHONY: deploy-staging
deploy-staging: ## Deploy to staging
	@echo '${BLUE}Deploying to staging...${RESET}'
	@./infra/scripts/deploy-staging.sh
	@echo '${GREEN}✓ Staging deployment complete${RESET}'

.PHONY: rollback
rollback: ## Rollback production deployment
	@echo '${BLUE}Rolling back production deployment...${RESET}'
	@./infra/scripts/rollback.sh
	@echo '${GREEN}✓ Rollback complete${RESET}'

.PHONY: backup
backup: ## Create database backup
	@echo '${BLUE}Creating database backup...${RESET}'
	@./infra/scripts/backup.sh
	@echo '${GREEN}✓ Backup complete${RESET}'

.PHONY: healthcheck
healthcheck: ## Run health checks
	@echo '${BLUE}Running health checks...${RESET}'
	@./infra/scripts/healthcheck.sh
	@echo '${GREEN}✓ Health checks complete${RESET}'

# ============================================================================
# Documentation
# ============================================================================

.PHONY: docs
docs: ## Generate documentation
	@echo '${BLUE}Generating documentation...${RESET}'
	@cd $(DOCS_DIR) && $(PYTHON) -m mkdocs build
	@echo '${GREEN}✓ Documentation generated${RESET}'

.PHONY: docs-serve
docs-serve: ## Serve documentation locally
	@cd $(DOCS_DIR) && $(PYTHON) -m mkdocs serve

.PHONY: api-docs
api-docs: ## Generate API documentation
	@echo '${BLUE}Generating API documentation...${RESET}'
	@cd $(BACKEND_DIR) && . venv/bin/activate && $(PYTHON) scripts/generate_api_docs.py
	@echo '${GREEN}✓ API documentation generated${RESET}'

# ============================================================================
# Cleanup
# ============================================================================

.PHONY: clean
clean: clean-backend clean-frontend clean-services clean-docker ## Clean all artifacts

.PHONY: clean-backend
clean-backend: ## Clean backend artifacts
	@echo '${BLUE}Cleaning backend artifacts...${RESET}'
	@cd $(BACKEND_DIR) && rm -rf $(BUILD_DIR) $(DIST_DIR) $(COVERAGE_DIR) .pytest_cache .mypy_cache
	@cd $(BACKEND_DIR) && find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	@cd $(BACKEND_DIR) && find . -type f -name "*.pyc" -delete
	@echo '${GREEN}✓ Backend cleanup complete${RESET}'

.PHONY: clean-frontend
clean-frontend: ## Clean frontend artifacts
	@echo '${BLUE}Cleaning frontend artifacts...${RESET}'
	@cd $(FRONTEND_DIR) && rm -rf $(DIST_DIR) $(COVERAGE_DIR) .vite .cache node_modules/.cache
	@echo '${GREEN}✓ Frontend cleanup complete${RESET}'

.PHONY: clean-services
clean-services: ## Clean microservices artifacts
	@echo '${BLUE}Cleaning services artifacts...${RESET}'
	@for service in parking-service charging-service vehicle-service notification-service; do \
		echo "Cleaning $$service..."; \
		cd $(SERVICES_DIR)/$$service && rm -rf $(BUILD_DIR) $(DIST_DIR) $(COVERAGE_DIR) .pytest_cache .mypy_cache; \
		cd $(SERVICES_DIR)/$$service && find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true; \
	done
	@echo '${GREEN}✓ Services cleanup complete${RESET}'

.PHONY: clean-docker
clean-docker: ## Clean Docker artifacts
	@echo '${BLUE}Cleaning Docker artifacts...${RESET}'
	@docker system prune -f
	@docker volume prune -f
	@echo '${GREEN}✓ Docker cleanup complete${RESET}'

.PHONY: clean-logs
clean-logs: ## Clean log files
	@echo '${BLUE}Cleaning log files...${RESET}'
	@rm -rf $(LOGS_DIR)/*.log
	@find . -type f -name "*.log" -delete 2>/dev/null || true
	@echo '${GREEN}✓ Log cleanup complete${RESET}'

.PHONY: clean-all
clean-all: clean clean-logs ## Clean everything

# ============================================================================
# Utilities
# ============================================================================

.PHONY: shell-backend
shell-backend: ## Open backend shell
	@cd $(BACKEND_DIR) && . venv/bin/activate && $(PYTHON)

.PHONY: shell-frontend
shell-frontend: ## Open frontend shell
	@cd $(FRONTEND_DIR) && $(PNPM) run shell

.PHONY: logs-backend
logs-backend: ## View backend logs
	@$(DOCKER_COMPOSE) logs -f backend

.PHONY: logs-frontend
logs-frontend: ## View frontend logs
	@$(DOCKER_COMPOSE) logs -f frontend

.PHONY: logs-services
logs-services: ## View microservices logs
	@$(DOCKER_COMPOSE) logs -f parking-service charging-service vehicle-service notification-service

.PHONY: status
status: ## Show service status
	@echo '${BLUE}Service Status:${RESET}'
	@$(DOCKER_COMPOSE) ps
	@echo ''
	@echo '${BLUE}Git Status:${RESET}'
	@git status --short
	@echo ''
	@echo '${BLUE}Disk Usage:${RESET}'
	@df -h .

.PHONY: info
info: ## Show project information
	@echo '${BLUE}Project Information:${RESET}'
	@echo '  Name: $(PROJECT_NAME)'
	@echo '  Python Version: $(PYTHON_VERSION)'
	@echo '  Node Version: $(NODE_VERSION)'
	@echo '  Backend Directory: $(BACKEND_DIR)'
	@echo '  Frontend Directory: $(FRONTEND_DIR)'
	@echo '  Services Directory: $(SERVICES_DIR)'
	@echo '  Documentation Directory: $(DOCS_DIR)'

# ============================================================================
# Git Hooks
# ============================================================================

.PHONY: install-hooks
install-hooks: ## Install git hooks
	@echo '${BLUE}Installing git hooks...${RESET}'
	@cp -r .githooks/* .git/hooks/
	@chmod +x .git/hooks/*
	@echo '${GREEN}✓ Git hooks installed${RESET}'

# ============================================================================
# CI/CD
# ============================================================================

.PHONY: ci
ci: lint test build ## Run CI pipeline

.PHONY: ci-full
ci-full: ## Run full CI pipeline (including integration and E2E tests)
	@echo '${BLUE}Running full CI pipeline...${RESET}'
	@make lint
	@make test
	@make test-integration
	@make test-e2e
	@make build
	@make build-docker
	@echo '${GREEN}✓ Full CI pipeline complete${RESET}'

# ============================================================================
# Release
# ============================================================================

.PHONY: release
release: ## Create a new release
	@echo '${BLUE}Creating a new release...${RESET}'
	@read -p "Enter version number (e.g., 1.0.0): " version; \
	git checkout main; \
	git pull origin main; \
	make test; \
	make build; \
	git tag -a v$$version -m "Release v$$version"; \
	git push origin v$$version; \
	echo '${GREEN}✓ Release v$$version created${RESET}'

# ============================================================================
# Default target
# ============================================================================

.DEFAULT_GOAL := help