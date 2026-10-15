from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class NetworkRegion(Base):
    """Master Wilayah Pemerintahan Daerah (Provinsi / Kabupaten / Kota)"""
    __tablename__ = "network_regions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code: Mapped[str] = mapped_column(String(20), unique=True, index=True, nullable=False)  # Kode Kemendagri misal '36.74'
    name: Mapped[str] = mapped_column(String(120), nullable=False)  # misal 'Kota Tangerang Selatan'
    region_type: Mapped[str] = mapped_column(String(30), nullable=False, default="Kota")  # Provinsi, Kabupaten, Kota
    province_name: Mapped[str] = mapped_column(String(100), nullable=False, default="Banten")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_demo: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))

    profile: Mapped["RegionProfile | None"] = relationship("RegionProfile", back_populates="region", uselist=False, cascade="all, delete-orphan")
    memberships: Mapped[list["RegionMembership"]] = relationship("RegionMembership", back_populates="region", cascade="all, delete-orphan")
    indicators: Mapped[list["NetworkIndicatorValue"]] = relationship("NetworkIndicatorValue", back_populates="region", cascade="all, delete-orphan")
    issues: Mapped[list["NetworkStrategicIssue"]] = relationship("NetworkStrategicIssue", back_populates="region", cascade="all, delete-orphan")
    diagnoses: Mapped[list["NetworkDiagnosis"]] = relationship("NetworkDiagnosis", back_populates="region", cascade="all, delete-orphan")
    fiscal_snapshots: Mapped[list["NetworkFiscalSnapshot"]] = relationship("NetworkFiscalSnapshot", back_populates="region", cascade="all, delete-orphan")
    ideas: Mapped[list["NetworkIdea"]] = relationship("NetworkIdea", back_populates="region", cascade="all, delete-orphan")


class RegionProfile(Base):
    """Profil Lengkap Daerah: Identitas Pemerintahan, Demografi, Sosio-Ekonomi"""
    __tablename__ = "network_region_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    region_id: Mapped[str] = mapped_column(ForeignKey("network_regions.id"), unique=True, nullable=False)
    
    # Identitas Pemerintahan
    capital_city: Mapped[str] = mapped_column(String(100), nullable=True, default="")
    office_address: Mapped[str] = mapped_column(Text, nullable=True, default="")
    website: Mapped[str] = mapped_column(String(200), nullable=True, default="")
    leader_name: Mapped[str] = mapped_column(String(120), nullable=True, default="")  # Kepala Daerah
    vice_leader_name: Mapped[str] = mapped_column(String(120), nullable=True, default="")
    sekda_name: Mapped[str] = mapped_column(String(120), nullable=True, default="")
    term_period: Mapped[str] = mapped_column(String(50), nullable=True, default="2021-2026")
    expert_staff_count: Mapped[int] = mapped_column(Integer, default=3)
    expert_staff_fields: Mapped[str] = mapped_column(Text, nullable=True, default="Ekonomi, Pembangunan, Pemerintahan & Hukum")
    
    # Gambaran Wilayah
    total_area_km2: Mapped[float] = mapped_column(Float, default=147.19)
    districts_count: Mapped[int] = mapped_column(Integer, default=7)  # Kecamatan
    villages_count: Mapped[int] = mapped_column(Integer, default=54)  # Kelurahan / Desa
    population: Mapped[int] = mapped_column(Integer, default=1380000)
    density_per_km2: Mapped[float] = mapped_column(Float, default=9375.0)
    region_characters: Mapped[str] = mapped_column(String(255), default="Perkotaan, Jasa, Perdagangan, Pendidikan")
    growth_center_zones: Mapped[Text] = mapped_column(Text, nullable=True, default="Kawasan BSD, Bintaro, Alam Sutera, Ciputat")
    dominant_disaster_risks: Mapped[str] = mapped_column(String(255), default="Banjir genangan drainase, kemacetan transportasi")
    
    # Sosial & Ekonomi Makro
    economic_growth_rate: Mapped[float] = mapped_column(Float, default=5.48)  # %
    pdrb_trillion: Mapped[float] = mapped_column(Float, default=98.4)  # Rp Triliun
    poverty_rate: Mapped[float] = mapped_column(Float, default=2.50)  # %
    unemployment_rate: Mapped[float] = mapped_column(Float, default=5.80)  # %
    gini_ratio: Mapped[float] = mapped_column(Float, default=0.34)
    ipm: Mapped[float] = mapped_column(Float, default=82.15)  # Indeks Pembangunan Manusia
    total_umkm: Mapped[int] = mapped_column(Integer, default=45000)
    
    # Status Kelengkapan & Validasi
    completion_score: Mapped[int] = mapped_column(Integer, default=85)  # 0-100%
    validation_status: Mapped[str] = mapped_column(String(40), default="Terverifikasi Daerah")  # Draft, Diajukan, Perlu Perbaikan, Terverifikasi Daerah, Terverifikasi Substansi, Dipublikasikan
    last_verified_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_verified_by: Mapped[str | None] = mapped_column(String(120), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), onupdate=lambda: datetime.now(UTC))

    region: Mapped["NetworkRegion"] = relationship("NetworkRegion", back_populates="profile")


class RegionMembership(Base):
    """Keanggotaan Tim Daerah & Hak Akses Per Wilayah"""
    __tablename__ = "network_region_memberships"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    region_id: Mapped[str] = mapped_column(ForeignKey("network_regions.id"), nullable=False, index=True)
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    user_name: Mapped[str] = mapped_column(String(120), nullable=False)
    user_email: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[str] = mapped_column(String(60), nullable=False)  # Admin Daerah, Staf Ahli, Kontributor OPD, Pimpinan Daerah
    agency: Mapped[str | None] = mapped_column(String(120), nullable=True)  # Instansi OPD
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    region: Mapped["NetworkRegion"] = relationship("NetworkRegion", back_populates="memberships")


class NetworkIndicatorDefinition(Base):
    """Kamus Master Indikator Pembangunan & Fiskal Daerah"""
    __tablename__ = "network_indicator_definitions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)  # misal 'IND_MAKRO_01'
    name: Mapped[str] = mapped_column(String(150), nullable=False)
    category: Mapped[str] = mapped_column(String(60), nullable=False)  # Makro Ekonomi, Fiskal & APBD, Layanan Publik, SPM, Infrastruktur
    unit: Mapped[str] = mapped_column(String(30), nullable=False)  # %, Rp Miliar, Jiwa, Skor
    formula_description: Mapped[Text | None] = mapped_column(Text, nullable=True)
    default_source: Mapped[str] = mapped_column(String(100), default="BPS / BPKAD")
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))


class NetworkIndicatorValue(Base):
    """Nilai Capaian Indikator Per Daerah dan Periode Tahun"""
    __tablename__ = "network_indicator_values"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    region_id: Mapped[str] = mapped_column(ForeignKey("network_regions.id"), nullable=False, index=True)
    indicator_code: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    indicator_name: Mapped[str] = mapped_column(String(150), nullable=False)
    category: Mapped[str] = mapped_column(String(60), nullable=False)
    year: Mapped[int] = mapped_column(Integer, nullable=False)  # Periode tahun
    value: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(30), nullable=False)
    source: Mapped[str] = mapped_column(String(120), default="BPS Daerah")
    status_data: Mapped[str] = mapped_column(String(40), default="Terverifikasi Daerah")  # Sementara, Terverifikasi Daerah, Terverifikasi Substansi
    notes: Mapped[Text | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    region: Mapped["NetworkRegion"] = relationship("NetworkRegion", back_populates="indicators")


class NetworkStrategicIssue(Base):
    """Isu Strategis Daerah dengan Formula 5W1H dan Kebutuhan Intervensi"""
    __tablename__ = "network_strategic_issues"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    region_id: Mapped[str] = mapped_column(ForeignKey("network_regions.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    summary: Mapped[Text] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(60), nullable=False)  # Fiskal, Pangan, Infrastruktur, Tata Ruang, Layanan Publik
    location_name: Mapped[str] = mapped_column(String(150), default="Seluruh Wilayah Kota")
    authority_level: Mapped[str] = mapped_column(String(40), default="Kabupaten/Kota")  # Pusat, Provinsi, Kabupaten/Kota, Lintas Daerah
    target_opd: Mapped[str] = mapped_column(String(150), nullable=False)  # Bapenda, Dishub, Dinas PUPR
    affected_groups: Mapped[str] = mapped_column(String(200), default="Masyarakat umum dan pelaku UMKM")
    urgency_level: Mapped[str] = mapped_column(String(20), default="Tinggi")  # Kritis, Tinggi, Sedang, Rendah
    impact_level: Mapped[str] = mapped_column(String(20), default="Tinggi")
    priority_score: Mapped[float] = mapped_column(Float, default=85.0)  # Skoring komposit
    status: Mapped[str] = mapped_column(String(30), default="Aktif")  # Draft, Diajukan, Diverifikasi, Aktif, Ditangani, Selesai
    pic_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    deadline_target: Mapped[str | None] = mapped_column(String(50), nullable=True)
    linked_rpjmd_indicator: Mapped[str | None] = mapped_column(String(150), nullable=True)
    decision_required: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    region: Mapped["NetworkRegion"] = relationship("NetworkRegion", back_populates="issues")


class NetworkDiagnosis(Base):
    """Lembar Diagnosis Staf Ahli: Masalah, Kondisi Awal, Akar Masalah, Solusi"""
    __tablename__ = "network_diagnoses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    region_id: Mapped[str] = mapped_column(ForeignKey("network_regions.id"), nullable=False, index=True)
    issue_id: Mapped[str | None] = mapped_column(ForeignKey("network_strategic_issues.id"), nullable=True)
    problem_statement: Mapped[Text] = mapped_column(Text, nullable=False)
    baseline_condition: Mapped[Text] = mapped_column(Text, nullable=False)
    root_cause: Mapped[Text] = mapped_column(Text, nullable=False)
    program_gaps: Mapped[Text] = mapped_column(Text, nullable=False)
    inaction_risks: Mapped[Text] = mapped_column(Text, nullable=False)
    solution_options: Mapped[JSON] = mapped_column(JSON, default=list)  # Pilihan solusi A, B, C
    expert_recommendation: Mapped[Text] = mapped_column(Text, nullable=False)
    decision_prompt: Mapped[Text | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(40), default="Terverifikasi Daerah")
    author_name: Mapped[str] = mapped_column(String(100), default="Staf Ahli Bidang Perekonomian")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    region: Mapped["NetworkRegion"] = relationship("NetworkRegion", back_populates="diagnoses")


class NetworkFiscalSnapshot(Base):
    """Snapshot Diagnosis Fiskal & APBD Daerah"""
    __tablename__ = "network_fiscal_snapshots"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    region_id: Mapped[str] = mapped_column(ForeignKey("network_regions.id"), nullable=False, index=True)
    year: Mapped[int] = mapped_column(Integer, nullable=False)
    
    total_revenue_billion: Mapped[float] = mapped_column(Float, default=4200.0)  # Rp Miliar
    pad_billion: Mapped[float] = mapped_column(Float, default=2100.0)
    transfer_revenue_billion: Mapped[float] = mapped_column(Float, default=1950.0)
    other_legal_revenue_billion: Mapped[float] = mapped_column(Float, default=150.0)
    
    total_expenditure_billion: Mapped[float] = mapped_column(Float, default=4350.0)
    personnel_expenditure_billion: Mapped[float] = mapped_column(Float, default=1350.0)  # Belanja Pegawai
    goods_services_expenditure_billion: Mapped[float] = mapped_column(Float, default=1500.0)
    capital_expenditure_billion: Mapped[float] = mapped_column(Float, default=950.0)  # Belanja Modal
    infrastructure_expenditure_billion: Mapped[float] = mapped_column(Float, default=780.0)
    silpa_billion: Mapped[float] = mapped_column(Float, default=280.0)
    
    # Rasio & Analisis Otomatis
    pad_ratio_pct: Mapped[float] = mapped_column(Float, default=50.0)  # PAD / Pendapatan (%)
    transfer_dependency_pct: Mapped[float] = mapped_column(Float, default=46.4)
    personnel_ratio_pct: Mapped[float] = mapped_column(Float, default=31.0)
    capital_ratio_pct: Mapped[float] = mapped_column(Float, default=21.8)
    fiscal_space_level: Mapped[str] = mapped_column(String(30), default="Sedang")  # Tinggi, Sedang, Rendah, Sangat Terbatas
    
    notes: Mapped[Text | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    region: Mapped["NetworkRegion"] = relationship("NetworkRegion", back_populates="fiscal_snapshots")


class NetworkFiscalRoadmap(Base):
    """Peta Jalan Transformasi Fiskal Pusat & Daerah"""
    __tablename__ = "network_fiscal_roadmaps"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    region_id: Mapped[str] = mapped_column(ForeignKey("network_regions.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    target_year: Mapped[int] = mapped_column(Integer, default=2026)
    efficiency_programs: Mapped[Text] = mapped_column(Text, nullable=False)
    pad_optimization_strategy: Mapped[Text] = mapped_column(Text, nullable=False)
    asset_optimization_strategy: Mapped[Text] = mapped_column(Text, nullable=False)
    central_support_needs: Mapped[Text] = mapped_column(Text, nullable=False)  # Kebutuhan dukungan Pusat (Kemenkeu / Kemendagri)
    lead_agency: Mapped[str] = mapped_column(String(100), default="Bapenda & BPKAD")
    status: Mapped[str] = mapped_column(String(40), default="Dalam Penyusunan")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))


class NetworkIdea(Base):
    """Bank Gagasan Inovasi Daerah & Potensi Replikasi"""
    __tablename__ = "network_ideas"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    region_id: Mapped[str] = mapped_column(ForeignKey("network_regions.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    summary_plain: Mapped[Text] = mapped_column(Text, nullable=False)
    novelty_element: Mapped[Text] = mapped_column(Text, nullable=False)
    target_beneficiaries: Mapped[str] = mapped_column(String(200), default="Pelaku Usaha Mikro & Warga")
    category: Mapped[str] = mapped_column(String(60), nullable=False)
    primary_opd: Mapped[str] = mapped_column(String(120), nullable=False)
    estimated_budget_million: Mapped[float] = mapped_column(Float, default=250.0)
    funding_source_options: Mapped[str] = mapped_column(String(150), default="APBD / CSR BUMD / Kemitraan")
    readiness_status: Mapped[str] = mapped_column(String(40), default="Layak Uji")  # Ide, Dikaji, Layak Uji, Pilot, Dievaluasi, Siap Direplikasi, Diadopsi
    impact_vs_effort: Mapped[str] = mapped_column(String(30), default="High Impact / Low Effort")  # Matriks
    is_replicable: Mapped[bool] = mapped_column(Boolean, default=True)
    interested_regions_count: Mapped[int] = mapped_column(Integer, default=3)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    region: Mapped["NetworkRegion"] = relationship("NetworkRegion", back_populates="ideas")


class NetworkPilotProject(Base):
    """Proyek Percontohan (Pilot Project) Inovatif Daerah"""
    __tablename__ = "network_pilot_projects"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    region_id: Mapped[str] = mapped_column(ForeignKey("network_regions.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    template_type: Mapped[str] = mapped_column(String(80), default="Satu Aset Banyak Manfaat")  # Dividen Efisiensi, Satu Aset, Pajak Mudah, dll.
    location: Mapped[str] = mapped_column(String(150), default="Kecamatan Pamulang & Serpong")
    pic_team: Mapped[str] = mapped_column(String(120), default="Pokja Inovasi Ekbang & Bapenda")
    duration_months: Mapped[int] = mapped_column(Integer, default=6)
    progress_pct: Mapped[int] = mapped_column(Integer, default=45)
    success_indicators: Mapped[Text] = mapped_column(Text, nullable=False)
    evaluation_gate: Mapped[str] = mapped_column(String(40), default="Evaluasi Gerbang 1 (Lanjut)")  # Lanjut, Revisi, Perluas, Hentikan
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))


class NetworkStrategicAsset(Base):
    """Inventaris Aset Strategis Tingkat Kebijakan & Pemanfaatan Bersama"""
    __tablename__ = "network_strategic_assets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    region_id: Mapped[str] = mapped_column(ForeignKey("network_regions.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(180), nullable=False)
    asset_type: Mapped[str] = mapped_column(String(60), default="Gedung / Ruang Publik")  # Fasilitas Olahraga, Gedung Serbaguna, Lahan Idle
    location: Mapped[str] = mapped_column(String(180), nullable=False)
    managing_agency: Mapped[str] = mapped_column(String(120), default="Dispora / BPKAD")
    condition: Mapped[str] = mapped_column(String(40), default="Baik")  # Baik, Perlu Rehabilitasi, Rusak Ringan
    utilization_level_pct: Mapped[int] = mapped_column(Integer, default=60)
    idle_time_pattern: Mapped[str] = mapped_column(String(150), default="Hari kerja jam 08:00 - 15:00 kosong")
    shared_use_potential: Mapped[Text] = mapped_column(Text, nullable=False)
    required_followup: Mapped[Text | None] = mapped_column(Text, nullable=True)
    is_restricted: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))


class NetworkFGDEvent(Base):
    """Agenda Forum Group Discussion (FGD) Nasional & Regional"""
    __tablename__ = "network_fgd_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    theme: Mapped[str] = mapped_column(String(150), default="Transformasi Fiskal Pusat dan Daerah")
    organizer: Mapped[str] = mapped_column(String(120), default="Sekretariat Bersama Staf Ahli Nasional")
    event_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    location: Mapped[str] = mapped_column(String(150), default="Tangerang Selatan / Hybrid Zoom")
    status: Mapped[str] = mapped_column(String(40), default="Selesai (Dalam Perumusan)")  # Persiapan, Sedang Berlangsung, Selesai (Dalam Perumusan), Final
    invited_regions_count: Mapped[int] = mapped_column(Integer, default=38)
    submissions_count: Mapped[int] = mapped_column(Integer, default=29)
    summary_consensus: Mapped[Text | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))


class NetworkFGDRecommendation(Base):
    """Rekomendasi Kebijakan Hasil Konsensus FGD untuk Pemerintah Pusat"""
    __tablename__ = "network_fgd_recommendations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    fgd_event_id: Mapped[str] = mapped_column(ForeignKey("network_fgd_events.id"), nullable=False, index=True)
    pillar: Mapped[str] = mapped_column(String(100), default="Harmonisasi DAU & Kemandirian PAD")
    proposal_text: Mapped[Text] = mapped_column(Text, nullable=False)
    addressed_ministry: Mapped[str] = mapped_column(String(120), default="Kementerian Keuangan & Kemendagri")
    consensus_score_pct: Mapped[int] = mapped_column(Integer, default=92)
    status: Mapped[str] = mapped_column(String(40), default="Siap Diserahkan")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))


class NetworkDecisionRequest(Base):
    """Kebutuhan Keputusan Pimpinan Daerah (Decision Required)"""
    __tablename__ = "network_decision_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    region_id: Mapped[str] = mapped_column(ForeignKey("network_regions.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    issue_brief: Mapped[Text] = mapped_column(Text, nullable=False)
    urgency_reason: Mapped[Text] = mapped_column(Text, nullable=False)
    options: Mapped[JSON] = mapped_column(JSON, default=list)  # Pilihan A, B, C dengan manfaat, risiko, biaya
    expert_recommendation: Mapped[Text] = mapped_column(Text, nullable=False)
    decision_owner: Mapped[str] = mapped_column(String(80), default="Wali Kota / Bupati")  # Wali Kota, Bupati, Sekda
    deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    inaction_impact: Mapped[Text] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(40), default="Menunggu Disposisi")  # Menunggu Disposisi, Disetujui, Ditolak, Diberi Catatan
    selected_option: Mapped[str | None] = mapped_column(String(50), nullable=True)
    disposition_notes: Mapped[Text | None] = mapped_column(Text, nullable=True)
    disposition_by: Mapped[str | None] = mapped_column(String(100), nullable=True)
    disposition_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))


class NetworkDataValidation(Base):
    """Riwayat Kontrol Kualitas & Validasi Data Daerah"""
    __tablename__ = "network_data_validations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    region_id: Mapped[str] = mapped_column(ForeignKey("network_regions.id"), nullable=False, index=True)
    target_entity: Mapped[str] = mapped_column(String(80), nullable=False)  # Profil, Indikator, Isu, Fiskal
    entity_id: Mapped[str] = mapped_column(String(36), nullable=False)
    validation_stage: Mapped[str] = mapped_column(String(50), default="Verifikasi Daerah")  # Format, Daerah, Substansi, Publikasi
    status: Mapped[str] = mapped_column(String(40), default="Lolos")  # Lolos, Perlu Perbaikan, Ditolak
    reviewer_name: Mapped[str] = mapped_column(String(100), default="Verifikator Admin Daerah")
    notes: Mapped[Text | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))


class NetworkAuditLog(Base):
    """Audit Trail Jejak Perubahan Data Sensitif / Kritis"""
    __tablename__ = "network_audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    region_id: Mapped[str | None] = mapped_column(ForeignKey("network_regions.id"), nullable=True, index=True)
    user_name: Mapped[str] = mapped_column(String(120), default="System")
    user_role: Mapped[str] = mapped_column(String(60), default="Admin")
    action: Mapped[str] = mapped_column(String(80), nullable=False)  # UPDATE_PROFILE, IMPORT_INDICATORS, SUBMIT_DECISION, VERIFY_DATA
    details: Mapped[Text] = mapped_column(Text, nullable=False)
    ip_address: Mapped[str | None] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
