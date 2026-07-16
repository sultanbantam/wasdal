from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class IntakeRequest(BaseModel):
    raw_text: str = Field(min_length=5)
    source: str = "Manual"
    attachments: list[str] = []
    create_case: bool = False
    reporter_name: str | None = None


class IntakeResult(BaseModel):
    summary: str
    category: str
    subcategory: str
    priority: str
    priority_score: float
    severity: str
    location_name: str
    latitude: float | None = None
    longitude: float | None = None
    suggested_agency: str
    suggested_deadline: str | None = None
    recommendations: list[dict[str, Any]]
    confidence: float
    entities: dict[str, Any]
    audit_notes: list[str]
    case_id: str | None = None


class MeetingRequest(BaseModel):
    title: str = "Rapat Wasdal"
    transcript: str = Field(min_length=5)
    save_record: bool = True


class MeetingResult(BaseModel):
    title: str
    transcript: str
    summary: str
    decisions: list[str]
    action_items: list[dict[str, Any]]
    minutes: str
    confidence: float
    record_id: str | None = None
