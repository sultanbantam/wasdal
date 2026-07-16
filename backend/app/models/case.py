from __future__ import annotations

import uuid
from datetime import UTC, datetime
from enum import StrEnum

from sqlalchemy import DateTime, Float, ForeignKey, Index, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class CaseStatus(StrEnum):
    NEW = "New"
    TRIAGE = "Triage"
    ASSIGNED = "Assigned"
    IN_PROGRESS = "In Progress"
    WAITING_DECISION = "Waiting Decision"
    RESOLVED = "Resolved"
    CLOSED = "Closed"


class Priority(StrEnum):
    CRITICAL = "Critical"
    HIGH = "High"
    MEDIUM = "Medium"
    LOW = "Low"


class Severity(StrEnum):
    CRITICAL = "Critical"
    MAJOR = "Major"
    MODERATE = "Moderate"
    MINOR = "Minor"


class Case(Base):
    __tablename__ = "cases"
    __table_args__ = (
        Index("ix_cases_status_priority", "status", "priority"),
        Index("ix_cases_location", "latitude", "longitude"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    number: Mapped[str] = mapped_column(String(32), nullable=False, unique=True, index=True)
    title: Mapped[str] = mapped_column(String(220), nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(80), default="Lainnya", index=True)
    subcategory: Mapped[str | None] = mapped_column(String(120), nullable=True)
    location_name: Mapped[str | None] = mapped_column(String(220), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    reporter_name: Mapped[str | None] = mapped_column(String(160), nullable=True)
    source: Mapped[str] = mapped_column(String(80), default="Manual", index=True)
    status: Mapped[str] = mapped_column(String(40), default=CaseStatus.NEW.value, index=True)
    priority: Mapped[str] = mapped_column(String(20), default=Priority.LOW.value, index=True)
    severity: Mapped[str] = mapped_column(String(20), default=Severity.MINOR.value)
    priority_score: Mapped[float] = mapped_column(Float, default=0.0)
    pic: Mapped[str | None] = mapped_column(String(160), nullable=True)
    agency: Mapped[str | None] = mapped_column(String(180), nullable=True, index=True)
    due_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)
    occurred_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    timeline: Mapped[list[dict]] = mapped_column(JSON, default=list)
    comments: Mapped[list[dict]] = mapped_column(JSON, default=list)
    attachments: Mapped[list[dict]] = mapped_column(JSON, default=list)
    media: Mapped[dict] = mapped_column(JSON, default=dict)
    ai_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_confidence: Mapped[float] = mapped_column(Float, default=0.0)
    suggested_solution: Mapped[list[dict]] = mapped_column(JSON, default=list)
    version: Mapped[int] = mapped_column(Integer, default=1)
    created_by_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), index=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )
    closed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, index=True)

    created_by: Mapped["User | None"] = relationship("User")
    audit_logs: Mapped[list["AuditLog"]] = relationship("AuditLog", back_populates="case", cascade="all, delete-orphan")
