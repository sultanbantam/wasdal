from __future__ import annotations

import uuid
from datetime import UTC, datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, Text, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class RPJMD(Base):
    __tablename__ = "rpjmd"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    period: Mapped[str] = mapped_column(String(20), nullable=False)  # e.g., "2021-2026"
    vision: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    missions: Mapped[list["Mission"]] = relationship("Mission", back_populates="rpjmd", cascade="all, delete-orphan")


class Mission(Base):
    __tablename__ = "missions"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    rpjmd_id: Mapped[str] = mapped_column(ForeignKey("rpjmd.id"))
    number: Mapped[int] = mapped_column(Integer, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    rpjmd: Mapped["RPJMD"] = relationship("RPJMD", back_populates="missions")
    goals: Mapped[list["Goal"]] = relationship("Goal", back_populates="mission", cascade="all, delete-orphan")


class Goal(Base):
    __tablename__ = "goals"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    mission_id: Mapped[str] = mapped_column(ForeignKey("missions.id"))
    description: Mapped[str] = mapped_column(Text, nullable=False)

    mission: Mapped["Mission"] = relationship("Mission", back_populates="goals")
    objectives: Mapped[list["StrategicObjective"]] = relationship(
        "StrategicObjective", back_populates="goal", cascade="all, delete-orphan"
    )


class StrategicObjective(Base):
    __tablename__ = "strategic_objectives"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    goal_id: Mapped[str] = mapped_column(ForeignKey("goals.id"))
    description: Mapped[str] = mapped_column(Text, nullable=False)

    goal: Mapped["Goal"] = relationship("Goal", back_populates="objectives")
    indicators: Mapped[list["PerformanceIndicator"]] = relationship(
        "PerformanceIndicator", back_populates="objective", cascade="all, delete-orphan"
    )


class PerformanceIndicator(Base):
    __tablename__ = "performance_indicators"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    objective_id: Mapped[str | None] = mapped_column(ForeignKey("strategic_objectives.id"), nullable=True)
    program_id: Mapped[str | None] = mapped_column(ForeignKey("programs.id"), nullable=True)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    unit: Mapped[str] = mapped_column(String(50), nullable=False)
    baseline: Mapped[float] = mapped_column(Float, default=0.0)
    final_target: Mapped[float] = mapped_column(Float, default=0.0)
    opd_id: Mapped[str | None] = mapped_column(String(36), nullable=True) # Reference to OPD
    type: Mapped[str] = mapped_column(String(20), default="outcome") # outcome, output

    objective: Mapped["StrategicObjective | None"] = relationship("StrategicObjective", back_populates="indicators")
    program: Mapped["Program | None"] = relationship("Program", back_populates="indicators")
    targets: Mapped[list["IndicatorTarget"]] = relationship("IndicatorTarget", back_populates="indicator", cascade="all, delete-orphan")


class IndicatorTarget(Base):
    __tablename__ = "indicator_targets"
    __table_args__ = (Index("ix_ind_targets_year", "indicator_id", "year"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    indicator_id: Mapped[str] = mapped_column(ForeignKey("performance_indicators.id"))
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    target_value: Mapped[float] = mapped_column(Float, nullable=False)
    realization_value: Mapped[float] = mapped_column(Float, default=0.0)
    status: Mapped[str] = mapped_column(String(20), default="GREY") # GREEN, YELLOW, ORANGE, RED, GREY

    indicator: Mapped["PerformanceIndicator"] = relationship("PerformanceIndicator", back_populates="targets")


class RKPD(Base):
    __tablename__ = "rkpd"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    year: Mapped[int] = mapped_column(Integer, nullable=False, unique=True)
    theme: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    programs: Mapped[list["Program"]] = relationship("Program", back_populates="rkpd", cascade="all, delete-orphan")


class Program(Base):
    __tablename__ = "programs"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    rkpd_id: Mapped[str] = mapped_column(ForeignKey("rkpd.id"))
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    name: Mapped[str] = mapped_column(Text, nullable=False)
    opd_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    budget: Mapped[float] = mapped_column(Float, default=0.0)
    realization: Mapped[float] = mapped_column(Float, default=0.0)
    physical_progress: Mapped[float] = mapped_column(Float, default=0.0)

    rkpd: Mapped["RKPD"] = relationship("RKPD", back_populates="programs")
    indicators: Mapped[list["PerformanceIndicator"]] = relationship("PerformanceIndicator", back_populates="program")
