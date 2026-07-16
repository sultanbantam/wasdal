from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class KnowledgeCreate(BaseModel):
    title: str
    document_type: str
    regulation_number: str | None = None
    source_url: str | None = None
    storage_key: str | None = None
    summary: str | None = None
    tags: list[str] = []


class KnowledgeRead(KnowledgeCreate):
    model_config = ConfigDict(from_attributes=True)

    id: str
    chunk_count: int
    created_at: datetime
    updated_at: datetime
