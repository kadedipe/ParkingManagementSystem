# ============================================================================
# Alembic Environment Configuration
# ============================================================================

"""
Alembic environment configuration for database migrations.

This module configures the Alembic migration environment, including
database connection, migration context, and target metadata.
"""

import os
import sys
from logging.config import fileConfig
from pathlib import Path

from sqlalchemy import engine_from_config, pool, create_engine
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from alembic import context

# Add the project root to the Python path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

# Import project settings and models
from src.shared.config import settings
from src.infrastructure.database import Base
from src.infrastructure.models import *  # Import all models for metadata


# ============================================================================
# Alembic Configuration
# ============================================================================

# This is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Set the database URL in Alembic config
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL)

# Add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

# Other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


# ============================================================================
# Migration Context Functions
# ============================================================================

def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.
    
    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well. By skipping the Engine creation
    we don't even need a DBAPI to be available.
    
    Calls to context.execute() here emit the given string to the
    script output.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
        include_schemas=True,
        version_table="alembic_version",
        version_table_schema=None,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.
    
    In this scenario we need to create an Engine
    and associate a connection with the context.
    """
    # For async support, create async engine
    if settings.DATABASE_URL.startswith("postgresql+asyncpg"):
        connectable = create_async_engine(
            settings.DATABASE_URL,
            poolclass=pool.NullPool,
            echo=settings.DATABASE_ECHO,
            future=True,
        )
    else:
        # Synchronous engine for standard connections
        connectable = engine_from_config(
            config.get_section(config.config_ini_section, {}),
            prefix="sqlalchemy.",
            poolclass=pool.NullPool,
        )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
            include_schemas=True,
            version_table="alembic_version",
            version_table_schema=None,
            transaction_per_migration=True,
            include_object=include_object,
            include_name=include_name,
            process_revision_directives=process_revision_directives,
        )

        with context.begin_transaction():
            context.run_migrations()


# ============================================================================
# Migration Filter Functions
# ============================================================================

def include_object(object, name, type_, reflected, compare_to):
    """
    Filter which objects to include in migration generation.
    
    Args:
        object: SQLAlchemy object
        name: Object name
        type_: Object type (table, column, index, etc.)
        reflected: Whether object is reflected from database
        compare_to: Object to compare against
        
    Returns:
        bool: True if object should be included
    """
    # Skip alembic internal tables
    if type_ == "table" and name in ["alembic_version"]:
        return False
    
    # Skip specific tables if needed
    # if type_ == "table" and name.startswith("_") or name.endswith("_temp"):
    #     return False
    
    return True


def include_name(name, type_, parent_names):
    """
    Filter which names to include in migration generation.
    
    Args:
        name: Object name
        type_: Object type
        parent_names: Parent object names
        
    Returns:
        bool: True if name should be included
    """
    # Skip alembic internal tables
    if type_ == "table" and name == "alembic_version":
        return False
    
    # Skip hidden objects
    if name.startswith("_"):
        return False
    
    return True


def process_revision_directives(context, revision, directives):
    """
    Process revision directives before writing migrations.
    
    Args:
        context: Migration context
        revision: Revision
        directives: Directives to process
    """
    # Set the merge flag if needed
    # if getattr(config.cmd_opts, "autogenerate", False):
    #     script = directives[0]
    #     if script.upgrade_ops.is_empty():
    #         directives[:] = []
    #         logger.info("No changes detected, skipping revision")
    pass


# ============================================================================
# Migration Generation Utilities
# ============================================================================

def get_migration_metadata():
    """
    Get metadata for current migrations.
    
    Returns:
        dict: Migration metadata
    """
    return {
        "target_metadata": target_metadata,
        "tables": list(target_metadata.tables.keys()),
        "schemas": list(target_metadata.schemas),
        "version": context.get_current_version() if context.is_offline_mode() else None,
    }


def validate_migration_environment():
    """
    Validate the migration environment.
    
    Raises:
        Exception: If environment is invalid
    """
    # Check database connection
    try:
        if settings.DATABASE_URL.startswith("postgresql+asyncpg"):
            engine = create_async_engine(settings.DATABASE_URL)
            # For async, we need to use a sync connection for validation
            # Use the sync URL if available
            sync_url = settings.DATABASE_SYNC_URL
            sync_engine = create_engine(sync_url)
            with sync_engine.connect() as conn:
                conn.execute("SELECT 1")
        else:
            engine = create_engine(settings.DATABASE_URL)
            with engine.connect() as conn:
                conn.execute("SELECT 1")
    except Exception as e:
        raise Exception(f"Database connection validation failed: {e}")
    
    # Check model metadata
    if not target_metadata.tables:
        raise Exception("No tables found in metadata")
    
    # Log validation results
    print(f"Validation passed: {len(target_metadata.tables)} tables found")
    print(f"Tables: {', '.join(target_metadata.tables.keys())}")


# ============================================================================
# Custom Revision Generation
# ============================================================================

def generate_revision(message=None, autogenerate=True):
    """
    Generate a new migration revision.
    
    Args:
        message: Revision message
        autogenerate: Whether to autogenerate from model changes
        
    Returns:
        str: Revision ID
    """
    from alembic.command import revision
    
    if message is None:
        message = "Autogenerated migration"
    
    # Run revision generation
    revision(
        context.config,
        message=message,
        autogenerate=autogenerate,
        rev_id=None,
        head=None,
        splice=False,
        branch_label=None,
        version_path=None,
        depends_on=None,
        process_revision_directives=process_revision_directives,
    )


def upgrade_revision(revision="head"):
    """
    Upgrade to a specific revision.
    
    Args:
        revision: Target revision
    """
    from alembic.command import upgrade
    
    upgrade(context.config, revision)


def downgrade_revision(revision="-1"):
    """
    Downgrade to a specific revision.
    
    Args:
        revision: Target revision (default: -1 for one step back)
    """
    from alembic.command import downgrade
    
    downgrade(context.config, revision)


def stamp_revision(revision="head"):
    """
    Stamp the database with a revision.
    
    Args:
        revision: Revision to stamp
    """
    from alembic.command import stamp
    
    stamp(context.config, revision)


# ============================================================================
# Database Utilities
# ============================================================================

def get_current_version():
    """
    Get current database version.
    
    Returns:
        str: Current revision ID
    """
    return context.get_current_version()


def get_head_revision():
    """
    Get head revision.
    
    Returns:
        str: Head revision ID
    """
    from alembic.script import ScriptDirectory
    
    script = ScriptDirectory.from_config(context.config)
    return script.get_current_head()


def get_revision_history():
    """
    Get revision history.
    
    Returns:
        list: List of revisions
    """
    from alembic.script import ScriptDirectory
    
    script = ScriptDirectory.from_config(context.config)
    return script.get_revisions()


# ============================================================================
# Main Execution
# ============================================================================

# Determine migration mode
if context.is_offline_mode():
    run_migrations_offline()
else:
    # Validate environment before running migrations
    try:
        validate_migration_environment()
    except Exception as e:
        print(f"Warning: Environment validation failed: {e}")
        print("Continuing with migrations...")
    
    run_migrations_online()


# ============================================================================
# Additional Configuration
# ============================================================================

# Configure SQLAlchemy to use the correct naming convention for constraints
NAMING_CONVENTION = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}

# Apply naming convention to metadata if not already set
if not hasattr(target_metadata, "naming_convention"):
    target_metadata.naming_convention = NAMING_CONVENTION

# Export these for use in migrations
__all__ = [
    "config",
    "target_metadata",
    "run_migrations_offline",
    "run_migrations_online",
    "include_object",
    "include_name",
    "process_revision_directives",
    "get_migration_metadata",
    "validate_migration_environment",
    "generate_revision",
    "upgrade_revision",
    "downgrade_revision",
    "stamp_revision",
    "get_current_version",
    "get_head_revision",
    "get_revision_history",
]


# ============================================================================
# Package Documentation
# ============================================================================

"""
Alembic Environment Configuration
================================

This module provides the environment configuration for Alembic migrations.

Features:
---------
- Automatic model metadata detection
- Async database support
- Migration filtering
- Environment validation
- Revision generation utilities
- Database version management

Usage:
------
1. Generate a new migration:
   ```bash
   alembic revision --autogenerate -m "Add new table"