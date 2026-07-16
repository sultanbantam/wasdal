from __future__ import annotations

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = "Wasdal"
    environment: str = "local"
    api_v1_prefix: str = "/api/v1"
    database_url: str = Field(
        default="postgresql+psycopg://wasdal:wasdal@postgres:5432/wasdal",
        validation_alias="DATABASE_URL",
    )
    redis_url: str = Field(default="redis://redis:6379/0", validation_alias="REDIS_URL")
    minio_endpoint: str = Field(default="minio:9000", validation_alias="MINIO_ENDPOINT")
    minio_access_key: str = Field(default="wasdal", validation_alias="MINIO_ACCESS_KEY")
    minio_secret_key: str = Field(default="wasdal-secret", validation_alias="MINIO_SECRET_KEY")
    openai_base_url: str = Field(default="https://api.openai.com/v1", validation_alias="OPENAI_BASE_URL")
    openai_api_key: str = Field(default="", validation_alias="OPENAI_API_KEY")
    embedding_model: str = Field(default="text-embedding-3-small", validation_alias="EMBEDDING_MODEL")
    jwt_secret: str = Field(default="change-me-in-production", validation_alias="JWT_SECRET")
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 8
    auto_create_tables: bool = Field(default=True, validation_alias="AUTO_CREATE_TABLES")
    seed_database: bool = Field(default=True, validation_alias="SEED_DATABASE")
    cors_origins: list[str] = ["http://localhost:3000", "http://frontend:3000"]


@lru_cache
def get_settings() -> Settings:
    return Settings()
