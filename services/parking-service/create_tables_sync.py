from sqlalchemy import create_engine
from src.core.database import Base
import src.domain.models.parking_lot
import src.domain.models.parking_spot

# Use sync driver
engine = create_engine(
    "postgresql://user:password@localhost:5432/parking_db",
    echo=True
)

# Create all tables
Base.metadata.create_all(engine)
print("✅ Tables created successfully!")
