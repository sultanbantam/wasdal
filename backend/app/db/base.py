from __future__ import annotations

from sqlalchemy.orm import DeclarativeBase

class Base(DeclarativeBase):
    pass

# Import all models here for Alembic/Base.metadata to discover them
from app.models import *
