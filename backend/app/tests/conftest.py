import os

os.environ.setdefault("DATABASE_URL", "sqlite+pysqlite:///./test_wasdal.db")
os.environ.setdefault("JWT_SECRET", "test-secret")
os.environ.setdefault("AUTO_CREATE_TABLES", "true")
os.environ.setdefault("SEED_DATABASE", "true")
