from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Issue(Base):
    __tablename__ = "issues"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    indicator_id: Mapped[str | None] = mapped_column(ForeignKey("performance_indicators.id"), nullable=True)
    program_id: Mapped[str | None] = mapped_column(ForeignKey("programs.id"), nullable=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False) # e.g., Budget Issue, Land Issue
    impact: Mapped[str] = mapped_column(Text, nullable=True)
    severity: Mapped[str] = mapped_column(String(20), default="Medium")
    opd_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="Open")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    indicator: Mapped["PerformanceIndicator | None"] = relationship("PerformanceIndicator")
    program: Mapped["Program | None"] = relationship("Program")


class ActionPlan(Base):
    __tablename__ = "action_plans"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    issue_id: Mapped[str | None] = mapped_column(ForeignKey("issues.id"), nullable=True)
    action: Mapped[str] = mapped_column(Text, nullable=False)
    opd_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    pic: Mapped[str | None] = mapped_column(String(100), nullable=True)
    deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="Not Started") # Not Started, In Progress, Completed
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    issue: Mapped["Issue | None"] = relationship("Issue")


class ExecutiveDecision(Base):
    __tablename__ = "executive_decisions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    issue_id: Mapped[str | None] = mapped_column(ForeignKey("issues.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    decision_type: Mapped[str] = mapped_column(String(50), nullable=False) # Policy, Budget, Cross OPD
    priority: Mapped[str] = mapped_column(String(20), default="High")
    status: Mapped[str] = mapped_column(String(20), default="Waiting Decision") # Waiting, Approved, Rejected
    decision_owner: Mapped[str] = mapped_column(String(100), nullable=False) # e.g. "Mayor", "Sekda"
    deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    recommendation: Mapped[Text] = mapped_column(Text, nullable=True)
    selected_option: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    issue: Mapped["Issue | None"] = relationship("Issue")
