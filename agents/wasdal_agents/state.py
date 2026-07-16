from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any


@dataclass
class IntakeState:
    raw_text: str
    source: str = "Manual"
    attachments: list[str] = field(default_factory=list)
    extracted: dict[str, Any] = field(default_factory=dict)
    summary: str = ""
    category: str = "Lainnya"
    subcategory: str = ""
    priority: str = "Low"
    priority_score: float = 0.0
    severity: str = "Minor"
    location_name: str = ""
    latitude: float | None = None
    longitude: float | None = None
    suggested_agency: str = ""
    recommendations: list[dict[str, Any]] = field(default_factory=list)
    confidence: float = 0.0
    audit_notes: list[str] = field(default_factory=list)


@dataclass
class MeetingState:
    title: str
    transcript: str
    summary: str = ""
    decisions: list[str] = field(default_factory=list)
    action_items: list[dict[str, Any]] = field(default_factory=list)
    minutes: str = ""
    confidence: float = 0.0
