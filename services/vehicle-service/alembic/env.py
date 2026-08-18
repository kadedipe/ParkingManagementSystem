from logging.config import fileConfig
from pathlib import Path
import sys
from alembic import context
from sqlalchemy import create_engine, pool
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from src.core.config import settings
from src.core.database import Base
from src.core.models import Vehicle

config = context.config
if config.config_file_name:
    fileConfig(config.config_file_name)
target_metadata = Base.metadata

def run_migrations_offline():
    url = settings.DATABASE_URL.replace("+asyncpg", "")
    context.configure(url=url, target_metadata=target_metadata, literal_binds=True, dialect_opts={"paramstyle":"named"})
    with context.begin_transaction(): context.run_migrations()

def run_migrations_online():
    url = settings.DATABASE_URL.replace("+asyncpg", "")
    connectable = create_engine(url, poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata, compare_type=True)
        with context.begin_transaction(): context.run_migrations()

if context.is_offline_mode(): run_migrations_offline()
else: run_migrations_online()
