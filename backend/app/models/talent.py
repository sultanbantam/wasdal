from __future__ import annotations

import uuid
from datetime import UTC, datetime
from enum import StrEnum

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Index, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class BoxNineQuadrant(StrEnum):
    BOX_1 = "Box 1: Kinerja Rendah, Potensi Rendah (Pemberian Tugas Sesuai Kemampuan)"
    BOX_2 = "Box 2: Kinerja Sedang, Potensi Rendah (Peningkatan Kinerja Teknis)"
    BOX_3 = "Box 3: Kinerja Tinggi, Potensi Rendah (Spesialis / Solid Performer)"
    BOX_4 = "Box 4: Kinerja Rendah, Potensi Sedang (Pelatihan & Re-evaluasi)"
    BOX_5 = "Box 5: Kinerja Sedang, Potensi Sedang (Core Talent / Pengembangan Terarah)"
    BOX_6 = "Box 6: Kinerja Tinggi, Potensi Sedang (High Performer / Siap Rotasi)"
    BOX_7 = "Box 7: Kinerja Rendah, Potensi Tinggi (Coaching & Penyesuaian Penempatan)"
    BOX_8 = "Box 8: Kinerja Sedang, Potensi Tinggi (Future Leader / Akselerasi)"
    BOX_9 = "Box 9: Kinerja Tinggi, Potensi Tinggi (Top Talent / Suksesi Prioritas)"


class SuccessionReadiness(StrEnum):
    READY_NOW = "Ready Now"
    READY_UNDER_1_YEAR = "Ready < 1 Year"
    DEV_REQUIRED = "Development Required"
    NO_VERIFIED_SUCCESSOR = "No Verified Successor"


class TalentProfile(Base):
    __tablename__ = "talent_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nip: Mapped[str] = mapped_column(String(32), unique=True, nullable=False, index=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False, index=True)
    agency_opd: Mapped[str] = mapped_column(String(180), nullable=False, index=True)  # Unit Kerja / OPD
    current_position: Mapped[str] = mapped_column(String(180), nullable=False)  # Jabatan Saat Ini
    echelon_or_class: Mapped[str] = mapped_column(String(50), default="Jabatan Fungsional / Pelaksana")
    rank_group: Mapped[str] = mapped_column(String(50), default="Penata Muda (III/a)")  # Pangkat/Golongan
    education_level: Mapped[str] = mapped_column(String(50), default="S1")
    major: Mapped[str | None] = mapped_column(String(100), nullable=True)
    years_in_position: Mapped[float] = mapped_column(Float, default=2.0)
    performance_score_official: Mapped[float] = mapped_column(Float, default=85.0)  # SKP Resmi
    potential_score_official: Mapped[float] = mapped_column(Float, default=80.0)  # Asesmen Resmi
    nine_box_position: Mapped[int] = mapped_column(Integer, default=5)  # 1 sampai 9
    nine_box_status: Mapped[str] = mapped_column(String(40), default="Terverifikasi Tim Penilai Kinerja")
    data_completeness_pct: Mapped[float] = mapped_column(Float, default=92.0)
    verification_status: Mapped[str] = mapped_column(String(50), default="Terverifikasi BKPSDM")
    career_aspirations: Mapped[str | None] = mapped_column(Text, nullable=True)
    certifications: Mapped[list[dict]] = mapped_column(JSON, default=list)
    project_assignments: Mapped[list[dict]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))

    assessments: Mapped[list["TalentAssessment"]] = relationship("TalentAssessment", back_populates="profile")
    idps: Mapped[list["TalentIDP"]] = relationship("TalentIDP", back_populates="profile")
    succession_entries: Mapped[list["TalentSuccessionPlan"]] = relationship("TalentSuccessionPlan", back_populates="candidate_profile")


class TalentDataSource(Base):
    __tablename__ = "talent_data_sources"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    source_name: Mapped[str] = mapped_column(String(100), nullable=False)  # SIASN BKN, e-Kinerja, SIMPEG Tangsel
    data_type: Mapped[str] = mapped_column(String(100), nullable=False)  # Profil, Asesmen, Riwayat Pendidikan
    last_sync_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    sync_status: Mapped[str] = mapped_column(String(50), default="Active - Verified")
    records_synced: Mapped[int] = mapped_column(Integer, default=0)
    api_endpoint_official: Mapped[str | None] = mapped_column(String(200), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))


class TalentDataQualityIssue(Base):
    __tablename__ = "talent_data_quality_issues"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    nip: Mapped[str] = mapped_column(String(32), nullable=False, index=True)
    employee_name: Mapped[str] = mapped_column(String(150), nullable=False)
    agency_opd: Mapped[str] = mapped_column(String(180), nullable=False)
    issue_type: Mapped[str] = mapped_column(String(60), nullable=False)  # Incomplete, Unverified, Conflicting, Outdated
    description: Mapped[str] = mapped_column(Text, nullable=False)
    field_name: Mapped[str] = mapped_column(String(80), nullable=False)
    correction_owner: Mapped[str] = mapped_column(String(120), default="Admin Kepegawaian OPD / ASN Mandiri")
    status: Mapped[str] = mapped_column(String(40), default="Pending Verification")  # Pending Verification, In Correction, Resolved
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), index=True)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class TalentSocializationMaterial(Base):
    __tablename__ = "talent_socialization_materials"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(80), default="Regulasi & Pedoman")  # Regulasi, Infografis, Video, Panduan Praktis
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    official_source_doc: Mapped[str] = mapped_column(String(200), nullable=False)  # e.g. PermenPAN-RB No 3 Tahun 2020 / Perwal
    file_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    read_count: Mapped[int] = mapped_column(Integer, default=0)
    quiz_available: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))


class TalentSocializationEvent(Base):
    __tablename__ = "talent_socialization_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    event_title: Mapped[str] = mapped_column(String(200), nullable=False)
    event_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    location_or_link: Mapped[str] = mapped_column(String(200), default="Zoom Webinar / Aula Gedung Pemkot")
    speakers: Mapped[str] = mapped_column(String(200), default="BKPSDM Tangsel & Asesor BKN")
    target_audience: Mapped[str] = mapped_column(String(180), default="Seluruh Kepala OPD dan Admin Kepegawaian")
    attendance_count: Mapped[int] = mapped_column(Integer, default=0)
    max_quota: Mapped[int] = mapped_column(Integer, default=250)
    status: Mapped[str] = mapped_column(String(40), default="Upcoming")  # Upcoming, Ongoing, Completed
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))


class TalentCompetency(Base):
    __tablename__ = "talent_competencies"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    cluster: Mapped[str] = mapped_column(String(60), default="Manajerial")  # Manajerial, Sosio Kultural, Teknis
    description: Mapped[str] = mapped_column(Text, nullable=False)
    standard_level: Mapped[int] = mapped_column(Integer, default=3)  # Level 1-5
    behavior_indicators: Mapped[list[str]] = mapped_column(JSON, default=list)


class TalentAssessment(Base):
    __tablename__ = "talent_assessments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id: Mapped[str] = mapped_column(ForeignKey("talent_profiles.id"), index=True)
    competency_id: Mapped[str] = mapped_column(ForeignKey("talent_competencies.id"), index=True)
    current_level: Mapped[int] = mapped_column(Integer, nullable=False)
    required_level: Mapped[int] = mapped_column(Integer, nullable=False)
    gap: Mapped[int] = mapped_column(Integer, default=0)
    assessment_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    assessment_body: Mapped[str] = mapped_column(String(120), default="Pusat Asesmen Kompetensi Terakreditasi BKN")
    development_recommendation: Mapped[str | None] = mapped_column(Text, nullable=True)

    profile: Mapped["TalentProfile"] = relationship("TalentProfile", back_populates="assessments")
    competency: Mapped["TalentCompetency"] = relationship("TalentCompetency")


class TalentPool(Base):
    __tablename__ = "talent_pools"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(120), nullable=False, unique=True)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(80), default="Kepemimpinan")  # Kepemimpinan, Teknis Ekbang, Digital & Inovasi
    criteria_rule: Mapped[str] = mapped_column(Text, nullable=False)
    total_qualified_members: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))


class TalentIDP(Base):
    """Individual Development Plan"""
    __tablename__ = "talent_idps"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id: Mapped[str] = mapped_column(ForeignKey("talent_profiles.id"), index=True)
    year: Mapped[int] = mapped_column(Integer, default=2026)
    target_career_objective: Mapped[str] = mapped_column(String(200), nullable=False)
    mentor_or_coach: Mapped[str | None] = mapped_column(String(120), nullable=True)
    approval_status: Mapped[str] = mapped_column(String(50), default="Disetujui Atasan Langsung")
    overall_progress_pct: Mapped[float] = mapped_column(Float, default=60.0)
    evaluation_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    profile: Mapped["TalentProfile"] = relationship("TalentProfile", back_populates="idps")
    activities: Mapped[list["TalentIDPActivity"]] = relationship("TalentIDPActivity", back_populates="idp")


class TalentIDPActivity(Base):
    __tablename__ = "talent_idp_activities"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    idp_id: Mapped[str] = mapped_column(ForeignKey("talent_idps.id"), index=True)
    activity_type: Mapped[str] = mapped_column(String(80), default="Pelatihan Klasikal / E-learning")  # Pelatihan, Coaching, Mentoring, Magang/Benchmarking, Penugasan
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    competency_targeted: Mapped[str] = mapped_column(String(120), nullable=False)
    deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    progress_status: Mapped[str] = mapped_column(String(40), default="In Progress")  # Not Started, In Progress, Completed
    evidence_document_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    verified_by_supervisor: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    idp: Mapped["TalentIDP"] = relationship("TalentIDP", back_populates="activities")


class TalentCriticalPosition(Base):
    __tablename__ = "talent_critical_positions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    position_title: Mapped[str] = mapped_column(String(180), nullable=False)
    agency_opd: Mapped[str] = mapped_column(String(180), nullable=False)
    urgency_level: Mapped[str] = mapped_column(String(40), default="High")  # Critical, High, Moderate
    vacancy_risk_reason: Mapped[str] = mapped_column(Text, nullable=False)  # e.g. Pemangku jabatan pensiun dalam 6 bulan
    current_incumbent_name: Mapped[str] = mapped_column(String(150), nullable=False)
    retirement_estimated_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    required_competencies_summary: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    successors: Mapped[list["TalentSuccessionPlan"]] = relationship("TalentSuccessionPlan", back_populates="position")


class TalentSuccessionPlan(Base):
    __tablename__ = "talent_succession_plans"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    position_id: Mapped[str] = mapped_column(ForeignKey("talent_critical_positions.id"), index=True)
    candidate_profile_id: Mapped[str] = mapped_column(ForeignKey("talent_profiles.id"), index=True)
    readiness_status: Mapped[str] = mapped_column(String(60), default=SuccessionReadiness.READY_UNDER_1_YEAR.value)
    readiness_score: Mapped[float] = mapped_column(Float, default=85.0)
    competency_gap_summary: Mapped[str] = mapped_column(Text, default="Membutuhkan sertifikasi manajemen risiko SPBE.")
    development_action_plan: Mapped[str] = mapped_column(Text, default="Penugasan sebagai ketua ad-hoc digitalisasi layanan.")
    verified_by_committee: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    position: Mapped["TalentCriticalPosition"] = relationship("TalentCriticalPosition", back_populates="successors")
    candidate_profile: Mapped["TalentProfile"] = relationship("TalentProfile", back_populates="succession_entries")


class TalentMobilityRecommendation(Base):
    __tablename__ = "talent_mobility_recommendations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    candidate_profile_id: Mapped[str] = mapped_column(ForeignKey("talent_profiles.id"), index=True)
    recommended_target_position: Mapped[str] = mapped_column(String(180), nullable=False)
    target_agency_opd: Mapped[str] = mapped_column(String(180), nullable=False)
    match_score_pct: Mapped[float] = mapped_column(Float, default=90.0)
    rationale_why: Mapped[str] = mapped_column(Text, nullable=False)
    factors_considered: Mapped[list[str]] = mapped_column(JSON, default=list)
    ai_disclaimer: Mapped[str] = mapped_column(Text, default="Output ini adalah rekomendasi analisis objektif; keputusan rotasi/mutasi sepenuhnya wewenang Pejabat Pembina Kepegawaian (PPK).")
    review_status: Mapped[str] = mapped_column(String(50), default="Menunggu Telaah BKPSDM")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    candidate_profile: Mapped["TalentProfile"] = relationship("TalentProfile")


class TalentImplementationMilestone(Base):
    __tablename__ = "talent_implementation_milestones"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    phase_order: Mapped[int] = mapped_column(Integer, nullable=False)
    phase_name: Mapped[str] = mapped_column(String(120), nullable=False)  # Persiapan Regulasi, Sosialisasi, Integrasi Data, Asesmen, Pemetaan 9-Box, Suksesi
    target_description: Mapped[str] = mapped_column(Text, nullable=False)
    lead_pic: Mapped[str] = mapped_column(String(120), default="Bidang Pengembangan Karir BKPSDM")
    deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    status: Mapped[str] = mapped_column(String(40), default="In Progress")  # Completed, In Progress, Pending Decision
    evidence_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    decision_required_id: Mapped[str | None] = mapped_column(ForeignKey("executive_decisions.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
