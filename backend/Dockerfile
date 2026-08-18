# ============================================================================
# Parking Management System - Backend Dockerfile
# Multi-stage production build with optimization
# ============================================================================

# ============================================================================
# Stage 1: Builder - Install dependencies and build
# ============================================================================

FROM python:3.10-slim AS builder

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Install system dependencies required for building Python packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    g++ \
    libpq-dev \
    libssl-dev \
    libffi-dev \
    libjpeg-dev \
    zlib1g-dev \
    libmagic1 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements files
COPY requirements.txt requirements.txt
COPY requirements-prod.txt requirements-prod.txt

# Create virtual environment and install dependencies
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Install production dependencies
RUN pip install --no-cache-dir -r requirements-prod.txt

# ============================================================================
# Stage 2: Development - For development environment
# ============================================================================

FROM builder AS development

# Install development dependencies
COPY requirements-dev.txt requirements-dev.txt
RUN pip install --no-cache-dir -r requirements-dev.txt

# Copy source code
COPY . .

# Expose port
EXPOSE 8000

# Run with hot reload
CMD ["uvicorn", "src.main:app", "--reload", "--host", "0.0.0.0", "--port", "8000"]

# ============================================================================
# Stage 3: Production - Final production image
# ============================================================================

FROM python:3.10-slim AS production

# Set working directory
WORKDIR /app

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONOPTIMIZE=1 \
    PATH="/opt/venv/bin:$PATH"

# Install runtime system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    libmagic1 \
    curl \
    && rm -rf /var/lib/apt/lists/* \
    && useradd -m -u 1000 appuser

# Copy virtual environment from builder
COPY --from=builder /opt/venv /opt/venv

# Copy application code
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run with uvicorn
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]

# ============================================================================
# Stage 4: Worker - For Celery workers
# ============================================================================

FROM production AS worker

# Set environment variables
ENV CELERY_WORKER=true

# Copy worker scripts
COPY --chown=appuser:appuser . .

# Run Celery worker
CMD ["celery", "-A", "src.core.celery", "worker", "--loglevel=info", "--concurrency=4"]

# ============================================================================
# Stage 5: Beat - For Celery beat scheduler
# ============================================================================

FROM production AS beat

# Set environment variables
ENV CELERY_BEAT=true

# Copy beat scripts
COPY --chown=appuser:appuser . .

# Run Celery beat
CMD ["celery", "-A", "src.core.celery", "beat", "--loglevel=info"]

# ============================================================================
# Stage 6: Flower - For Celery monitoring
# ============================================================================

FROM production AS flower

# Install Flower
RUN pip install --no-cache-dir flower

# Copy flower scripts
COPY --chown=appuser:appuser . .

# Run Flower
CMD ["celery", "-A", "src.core.celery", "flower", "--port=5555"]

# ============================================================================
# Stage 7: Testing - For running tests
# ============================================================================

FROM builder AS testing

# Install test dependencies
COPY requirements-test.txt requirements-test.txt
RUN pip install --no-cache-dir -r requirements-test.txt

# Copy source code
COPY . .

# Run tests
CMD ["pytest", "tests/", "-v", "--cov=src", "--cov-report=term", "--cov-report=html"]

# ============================================================================
# Stage 8: Security Scan - For security scanning
# ============================================================================

FROM builder AS security

# Install security tools
RUN pip install --no-cache-dir bandit safety

# Copy source code
COPY . .

# Run security scans
CMD ["sh", "-c", "bandit -r src/ -f json -o bandit-report.json && safety check -r requirements.txt"]

# ============================================================================
# Stage 9: Docs - For building documentation
# ============================================================================

FROM builder AS docs

# Install docs dependencies
RUN pip install --no-cache-dir mkdocs mkdocs-material mkdocstrings

# Copy documentation
COPY docs/ docs/
COPY mkdocs.yml mkdocs.yml

# Build documentation
RUN mkdocs build --clean

# ============================================================================
# Stage 10: Lint - For linting
# ============================================================================

FROM builder AS lint

# Install lint dependencies
RUN pip install --no-cache-dir black isort flake8 mypy pylint

# Copy source code
COPY . .

# Run linters
CMD ["sh", "-c", "black --check src/ tests/ && isort --check-only src/ tests/ && flake8 src/ tests/ && mypy src/"]

# ============================================================================
# Default target: production
# ============================================================================

FROM production

# Default target is production