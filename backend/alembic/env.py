"""
Alembic environment configuration for database migrations.
"""

import os
import sys
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool
from alembic import context

# Add the project root to the path so that we can import models
sys.path.append(os.path.dirname(os.path.dirname(__file__)))

# Import the metadata object from your application
from src.infrastructure.database import Base

# ============================================================================
# Alembic Config object
# ============================================================================

config = context.config

# Interpret the config file for Python logging
fileConfig(config.config_file_name)

# ============================================================================
# Target Metadata
# ============================================================================

target_metadata = Base.metadata

# ============================================================================
# Environment Functions
# ============================================================================

def get_url():
    """Get the database URL from environment variable or config."""
    # Use environment variable if available
    db_url = os.getenv("DATABASE_URL")
    if db_url:
        return db_url
    
    # Fallback to config file
    return config.get_main_option("sqlalchemy.url")


def run_migrations_offline():
    """
    Run migrations in 'offline' mode.
    
    This configures the context with just a URL and not an Engine,
    though an Engine is acceptable here as well. By skipping the Engine
    creation we don't even need a DBAPI to be available.
    """
    url = get_url()
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    """
    Run migrations in 'online' mode.
    
    In this scenario we need to create an Engine and associate a
    connection with the context.
    """
    # Get the database URL
    url = get_url()
    
    # Configure the engine
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
        url=url,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )

        with context.begin_transaction():
            context.run_migrations()


# ============================================================================
# Determine which mode to run
# ============================================================================

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()