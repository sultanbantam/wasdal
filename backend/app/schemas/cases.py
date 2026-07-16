from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class CaseBase(BaseModel):
    title: str = Field(min_length=3, max_length=220)
    description: str = Field(min_length=5)
    category: str = "Lainnya"
    subcategory: str | None = None
    location_name: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    reporter_name: str | None = None
    source: str = "Manual"
    status: str = "New"
    priority: str = "Low"
    severity: str = "Minor"
    priority_score: float = 0.0
    pic: str | None = None
    agency: str | None = None
    due_date: datetime | None = None
    occurred_at: datetime | None = None
    attachments: list[dict[str, Any]] = []
    media: dict[str, Any] = {}
    ai_summary: str | None = None
    ai_confidence: float = 0.0
    suggested_solution: list[dict[str, Any]] = []


class CaseCreate(CaseBase):
    number: str | None = None


class CaseUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    subcategory: str | None = None
    location_name: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    reporter_name: str | None = None
    source: str | None = None
    status: str | None = None
    priority: str | None = None
    severity: str | None = None
    priority_score: float | None = None
    pic: str | None = None
    agency: str | None = None
    due_date: datetime | None = None
    attachments: list[dict[str, Any]] | None = None
    media: dict[str, Any] | None = None
    ai_summary: str | None = None
    ai_confidence: float | None = None
    suggested_solution: list[dict[str, Any]] | None = None


class CaseAssign(BaseModel):
    pic: str
    agency: str
    due_date: datetime | None = None
    reason: str | None = None


class CaseCommentCreate(BaseModel):
    author: str
    body: str
    visibility: str = "Internal"


class CaseStatusUpdate(BaseModel):
    status: str
    note: str | None = None


class CaseRead(CaseBase):
    model_config = ConfigDict(from_attributes=True)

    id: str
    number: str
    timeline: list[dict[str, Any]] = []
    comments: list[dict[str, Any]] = []
    version: int
    created_by_id: str | None = None
    created_at: datetime
    updated_at: datetime
    closed_at: datetime | None = None


class CaseListResponse(BaseModel):
    items: list[CaseRead]
    total: int
    page: int
    size: int
