# ============================================================================
# Makefile - Dependency Management
# ============================================================================

# parking-management-system/services/vehicle-service/Makefile

.PHONY: help install install-dev install-prod update clean test lint format docs run

help:
	@echo "Available commands:"
	@echo "  install      Install all dependencies"
	@echo "  install-dev  Install development dependencies"
	@echo "  install-prod Install production dependencies"
	@echo "  update       Update dependencies"
	@echo "  clean        Clean build artifacts"
	@echo "  test         Run tests"
	@echo "  lint         Run linters"
	@echo "  format       Format code"
	@echo "  docs         Generate documentation"
	@echo "  run          Run the service"

install:
	pip install -r requirements.txt

install-dev:
	pip install -r requirements.dev.txt
	pip install -e .

install-prod:
	pip install -r requirements.prod.txt

update:
	pip install --upgrade pip
	pip install --upgrade -r requirements.txt
	pip install --upgrade -r requirements.dev.txt

clean:
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type d -name "*.pyc" -exec rm -rf {} +
	rm -rf .pytest_cache/
	rm -rf .coverage
	rm -rf htmlcov/
	rm -rf dist/
	rm -rf build/
	rm -rf *.egg-info/
	find . -type d -name ".mypy_cache" -exec rm -rf {} +

test:
	pytest tests/ -v --cov=src --cov-report=html --cov-report=term

test-watch:
	pytest-watch tests/

test-coverage:
	pytest tests/ --cov=src --cov-report=html --cov-report=term
	open htmlcov/index.html

test-parallel:
	pytest tests/ -n auto

lint:
	flake8 src/ tests/
	mypy src/
	pylint src/
	bandit -r src/

format:
	black src/ tests/
	isort src/ tests/
	yapf --in-place --recursive src/ tests/

docs:
	cd docs && make html

run:
	uvicorn src.main:app --host 0.0.0.0 --port 8004 --reload

run-prod:
	gunicorn src.main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8004

docker-build:
	docker build -t vehicle-service:latest .

docker-run:
	docker run -d --name vehicle-service -p 8004:8004 vehicle-service:latest

docker-stop:
	docker stop vehicle-service
	docker rm vehicle-service

security-check:
	safety check -r requirements.txt

pre-commit:
	pre-commit run --all-files

all: clean install test lint