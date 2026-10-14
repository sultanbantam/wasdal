from __future__ import annotations

import uuid
from datetime import UTC, datetime
from enum import StrEnum

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Index, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class UtilityType(StrEnum):
    FIBER_OPTIC = "Fiber Optik / Telekomunikasi"
    ELECTRICITY = "Kelistrikan (PLN)"
    WATER = "PDAM / Perpipaan Air"
    GAS = "Gas Bumi"
    OTHER = "Lainnya"


class CableCondition(StrEnum):
    NEAT = "Rapi / Tertata"
    CLUTTERED = "Semrawut / Kusut"
    HANGING_LOW = "Menggantung Rendah (< 4.5m)"
    BROKEN = "Putus / Terjuntai"
    CROSSING_DANGEROUS = "Menyilang Tidak Sesuai Standar"


class SidewalkZoneType(StrEnum):
    PROTECTED_PEDESTRIAN = "Protected Pedestrian Zone"
    MANAGED_PUBLIC_SPACE = "Managed Public-Space Zone"
    NEEDS_VERIFICATION = "Needs Field Verification"


class ObstructionType(StrEnum):
    VEHICLE_PARKED = "Kendaraan Parkir di Trotoar"
    VENDOR_BLOCKING = "PKL / Barang Dagangan Menghalangi Jalur"
    UTILITY_HAZARD = "Tiang / Kabel Menghalangi / Membahayakan"
    CONSTRUCTION_MATERIAL = "Material Konstruksi / Puing"
    TRASH_ACCUMULATION = "Tumpukan Sampah"
    FALLEN_TREE = "Pohon / Ranting Tumbang"
    FACILITY_DAMAGE = "Kerusakan Fisik Trotoar / Bolong"
    OTHER = "Lainnya"


class UtilityOperator(Base):
    __tablename__ = "urban_utility_operators"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(120), nullable=False, unique=True, index=True)
    utility_type: Mapped[str] = mapped_column(String(80), default=UtilityType.FIBER_OPTIC.value)
    contact_person: Mapped[str | None] = mapped_column(String(100), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(40), nullable=True)
    email: Mapped[str | None] = mapped_column(String(120), nullable=True)
    mou_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    assets: Mapped[list["UtilityAsset"]] = relationship("UtilityAsset", back_populates="operator")


class UrbanSegment(Base):
    __tablename__ = "urban_segments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    segment_code: Mapped[str] = mapped_column(String(50), nullable=False, unique=True, index=True)
    street_name: Mapped[str] = mapped_column(String(180), nullable=False, index=True)
    district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)  # Kecamatan
    subdistrict: Mapped[str] = mapped_column(String(100), nullable=False, index=True)  # Kelurahan
    start_latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    start_longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    end_latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    end_longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    length_meters: Mapped[float] = mapped_column(Float, default=0.0)
    priority_level: Mapped[str] = mapped_column(String(30), default="Medium")
    health_index_score: Mapped[float] = mapped_column(Float, default=70.0)  # Public Space Health Index
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    utility_assets: Mapped[list["UtilityAsset"]] = relationship("UtilityAsset", back_populates="segment")
    sidewalk: Mapped["SidewalkSegment | None"] = relationship("SidewalkSegment", back_populates="segment", uselist=False)
    obstructions: Mapped[list["UrbanObstruction"]] = relationship("UrbanObstruction", back_populates="segment")


class UtilityAsset(Base):
    """Digital Utility Passport / Koridor Kabel"""
    __tablename__ = "urban_utility_assets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    asset_code: Mapped[str] = mapped_column(String(64), nullable=False, unique=True, index=True)
    segment_id: Mapped[str] = mapped_column(ForeignKey("urban_segments.id"), index=True)
    operator_id: Mapped[str | None] = mapped_column(ForeignKey("urban_utility_operators.id"), nullable=True, index=True)
    utility_type: Mapped[str] = mapped_column(String(80), default=UtilityType.FIBER_OPTIC.value)
    ownership_status: Mapped[str] = mapped_column(String(50), default="Ownership verified")  # Ownership verified, Ownership unverified
    active_status: Mapped[str] = mapped_column(String(50), default="Active confirmed")  # Active confirmed, Suspected inactive, Confirmed inactive
    visual_condition: Mapped[str] = mapped_column(String(80), default=CableCondition.NEAT.value)
    clutter_index: Mapped[float] = mapped_column(Float, default=15.0)  # Utility Clutter Index 0-100
    pole_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    height_meters: Mapped[float | None] = mapped_column(Float, nullable=True)
    risk_level: Mapped[str] = mapped_column(String(30), default="Low")  # Low, Medium, High, Critical
    permit_reference: Mapped[str | None] = mapped_column(String(120), nullable=True)
    inspection_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    photo_before_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    photo_after_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    last_action: Mapped[str | None] = mapped_column(String(120), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    segment: Mapped["UrbanSegment"] = relationship("UrbanSegment", back_populates="utility_assets")
    operator: Mapped["UtilityOperator | None"] = relationship("UtilityOperator", back_populates="assets")


class SidewalkSegment(Base):
    __tablename__ = "urban_sidewalk_segments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    segment_id: Mapped[str] = mapped_column(ForeignKey("urban_segments.id"), unique=True, index=True)
    width_meters: Mapped[float] = mapped_column(Float, default=2.0)
    surface_condition: Mapped[str] = mapped_column(String(50), default="Baik")  # Baik, Rusak Ringan, Rusak Berat
    has_tactile_paving: Mapped[bool] = mapped_column(Boolean, default=True)
    has_wheelchair_ramp: Mapped[bool] = mapped_column(Boolean, default=True)
    lighting_condition: Mapped[str] = mapped_column(String(50), default="Cukup")  # Terang, Cukup, Gelap/Kurang
    zone_category: Mapped[str] = mapped_column(String(80), default=SidewalkZoneType.PROTECTED_PEDESTRIAN.value)
    clear_pedestrian_width_meters: Mapped[float] = mapped_column(Float, default=1.8)
    repair_status: Mapped[str] = mapped_column(String(50), default="No Action Needed")
    photo_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    segment: Mapped["UrbanSegment"] = relationship("UrbanSegment", back_populates="sidewalk")


class UrbanObstruction(Base):
    __tablename__ = "urban_obstructions"
    __table_args__ = (
        Index("ix_obstructions_status", "status"),
        Index("ix_obstructions_type", "obstruction_type"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    segment_id: Mapped[str | None] = mapped_column(ForeignKey("urban_segments.id"), nullable=True, index=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    obstruction_type: Mapped[str] = mapped_column(String(80), default=ObstructionType.VEHICLE_PARKED.value)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    location_name: Mapped[str] = mapped_column(String(200), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    source: Mapped[str] = mapped_column(String(80), default="Laporan Warga")
    reporter_contact: Mapped[str | None] = mapped_column(String(100), nullable=True)  # Privasi dijaga
    accessibility_impact: Mapped[str] = mapped_column(String(100), default="Jalur difabel & pedestrian terhalang")
    ai_confidence: Mapped[float] = mapped_column(Float, default=0.88)
    ai_candidate_flag: Mapped[bool] = mapped_column(Boolean, default=True)
    status: Mapped[str] = mapped_column(String(40), default="Pending Verification")  # Pending Verification, Verified, In Action, Resolved, Rejected
    responsible_agency: Mapped[str] = mapped_column(String(120), default="Satpol PP")
    action_plan_id: Mapped[str | None] = mapped_column(ForeignKey("action_plans.id"), nullable=True)
    case_id: Mapped[str | None] = mapped_column(ForeignKey("cases.id"), nullable=True)
    photo_evidence_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    resolved_evidence_url: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_recurring: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), index=True)

    segment: Mapped["UrbanSegment | None"] = relationship("UrbanSegment", back_populates="obstructions")
    case: Mapped["Case | None"] = relationship("Case")
    action_plan: Mapped["ActionPlan | None"] = relationship("ActionPlan")


class StreetVendorZone(Base):
    __tablename__ = "urban_street_vendor_zones"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    zone_name: Mapped[str] = mapped_column(String(150), nullable=False, unique=True)
    district: Mapped[str] = mapped_column(String(100), nullable=False)
    location_description: Mapped[str] = mapped_column(Text, nullable=False)
    legal_basis: Mapped[str] = mapped_column(String(200), nullable=False)  # SK Walikota / Perda
    authorized_by: Mapped[str] = mapped_column(String(120), nullable=False)  # Disperindag / Pemkot
    active_hours: Mapped[str] = mapped_column(String(80), default="17:00 - 23:00 WIB")
    max_capacity_stalls: Mapped[int] = mapped_column(Integer, default=20)
    current_registered_stalls: Mapped[int] = mapped_column(Integer, default=0)
    mandatory_free_pedestrian_width_meters: Mapped[float] = mapped_column(Float, default=2.5)
    is_legal: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    vendors: Mapped[list["StreetVendorRecord"]] = relationship("StreetVendorRecord", back_populates="zone")


class StreetVendorRecord(Base):
    __tablename__ = "urban_street_vendor_records"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    zone_id: Mapped[str | None] = mapped_column(ForeignKey("urban_street_vendor_zones.id"), nullable=True)
    vendor_code: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    business_type: Mapped[str] = mapped_column(String(100), nullable=False)  # Kuliner, Kriya, Buah, dll.
    stall_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    stall_size_sqm: Mapped[float] = mapped_column(Float, default=4.0)
    verification_status: Mapped[str] = mapped_column(String(50), default="Terdaftar Resmi")
    cleanliness_score: Mapped[float] = mapped_column(Float, default=85.0)
    coaching_history: Mapped[list[dict]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    zone: Mapped["StreetVendorZone | None"] = relationship("StreetVendorZone", back_populates="vendors")


class UrbanHotspot(Base):
    __tablename__ = "urban_hotspots"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    issue_type: Mapped[str] = mapped_column(String(80), nullable=False)  # Kabel Semrawut, Parkir Liar, PKL Tak Tertata
    location_name: Mapped[str] = mapped_column(String(200), nullable=False)
    district: Mapped[str] = mapped_column(String(100), nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    incident_count_30d: Mapped[int] = mapped_column(Integer, default=5)
    peak_hours: Mapped[str] = mapped_column(String(100), default="07:00-09:00 & 16:30-19:00")
    severity: Mapped[str] = mapped_column(String(30), default="High")
    lead_agency: Mapped[str] = mapped_column(String(120), default="Dishub & Satpol PP")
    status: Mapped[str] = mapped_column(String(40), default="Monitoring Ketat")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))


class FieldVerificationReport(Base):
    __tablename__ = "urban_field_verifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_or_obstruction_id: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    inspector_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    inspector_name: Mapped[str] = mapped_column(String(120), nullable=False)
    inspector_agency: Mapped[str] = mapped_column(String(120), nullable=False)
    verified_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    checklist_results: Mapped[dict] = mapped_column(JSON, default=dict)
    findings_summary: Mapped[str] = mapped_column(Text, nullable=False)
    action_recommended: Mapped[str] = mapped_column(Text, nullable=False)
    latitude_recorded: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude_recorded: Mapped[float | None] = mapped_column(Float, nullable=True)
    photo_urls: Mapped[list[str]] = mapped_column(JSON, default=list)
    verification_status: Mapped[str] = mapped_column(String(50), default="Verified by Field Officer")

    inspector: Mapped["User | None"] = relationship("User")


class WalkpointProgram(Base):
    __tablename__ = "urban_walkpoint_programs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(180), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    funding_source: Mapped[str] = mapped_column(String(180), nullable=False)  # Program APBD Mobilitas Ramah Lingkungan / CSR
    points_per_km: Mapped[int] = mapped_column(Integer, default=50)
    daily_cap_points: Mapped[int] = mapped_column(Integer, default=300)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    legal_disclaimer: Mapped[str] = mapped_column(Text, default="WalkPoints adalah program insentif mobilitas non-tunai dan bukan uang elektronik/crypto.")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))


class WalkpointAccount(Base):
    __tablename__ = "urban_walkpoint_accounts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str | None] = mapped_column(ForeignKey("users.id"), nullable=True, unique=True)
    participant_name: Mapped[str] = mapped_column(String(120), nullable=False)
    balance_points: Mapped[int] = mapped_column(Integer, default=0)
    lifetime_points_earned: Mapped[int] = mapped_column(Integer, default=0)
    total_km_walked: Mapped[float] = mapped_column(Float, default=0.0)
    tier: Mapped[str] = mapped_column(String(30), default="Pejalan Aktif")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    transactions: Mapped[list["WalkpointTransaction"]] = relationship("WalkpointTransaction", back_populates="account")
    redemptions: Mapped[list["WalkpointRedemption"]] = relationship("WalkpointRedemption", back_populates="account")


class WalkpointTransaction(Base):
    __tablename__ = "urban_walkpoint_transactions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id: Mapped[str] = mapped_column(ForeignKey("urban_walkpoint_accounts.id"), index=True)
    tx_type: Mapped[str] = mapped_column(String(30), nullable=False)  # CHECKIN_QR, PEDOMETER, REWARD_BONUS, REDEEM
    points_delta: Mapped[int] = mapped_column(Integer, nullable=False)
    location_corridor: Mapped[str | None] = mapped_column(String(180), nullable=True)
    note: Mapped[str] = mapped_column(String(255), nullable=False)
    anti_fraud_status: Mapped[str] = mapped_column(String(40), default="Verified Valid")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC), index=True)

    account: Mapped["WalkpointAccount"] = relationship("WalkpointAccount", back_populates="transactions")


class WalkpointReward(Base):
    __tablename__ = "urban_walkpoint_rewards"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    partner_merchant_name: Mapped[str] = mapped_column(String(150), nullable=False)
    reward_title: Mapped[str] = mapped_column(String(180), nullable=False)
    category: Mapped[str] = mapped_column(String(60), default="Voucher UMKM")
    points_required: Mapped[int] = mapped_column(Integer, nullable=False)
    stock_available: Mapped[int] = mapped_column(Integer, default=50)
    terms: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    redemptions: Mapped[list["WalkpointRedemption"]] = relationship("WalkpointRedemption", back_populates="reward")


class WalkpointRedemption(Base):
    __tablename__ = "urban_walkpoint_redemptions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id: Mapped[str] = mapped_column(ForeignKey("urban_walkpoint_accounts.id"), index=True)
    reward_id: Mapped[str] = mapped_column(ForeignKey("urban_walkpoint_rewards.id"), index=True)
    redemption_code: Mapped[str] = mapped_column(String(32), unique=True, nullable=False)
    points_spent: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[str] = mapped_column(String(40), default="Issued")  # Issued, Claimed, Expired
    claimed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))

    account: Mapped["WalkpointAccount"] = relationship("WalkpointAccount", back_populates="redemptions")
    reward: Mapped["WalkpointReward"] = relationship("WalkpointReward", back_populates="redemptions")


class OfficialPaymentAudit(Base):
    """
    Catatan pengawasan kepatuhan pembayaran/retribusi resmi per Update.md Bagian 11.
    Status default: 'SIMULATION / NOT ENABLED FOR COLLECTION'
    """
    __tablename__ = "urban_payment_audits"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    case_or_obstruction_id: Mapped[str] = mapped_column(String(64), nullable=False)
    reference_number: Mapped[str] = mapped_column(String(64), nullable=False, unique=True)
    subject_title: Mapped[str] = mapped_column(String(200), nullable=False)
    legal_basis_check: Mapped[str] = mapped_column(String(120), default="Perda Tibum / Penyelenggaraan Utilitas")
    determination_status: Mapped[str] = mapped_column(String(60), default="Awaiting Authorized Determination")
    collection_readiness: Mapped[str] = mapped_column(String(60), default="SIMULATION / NOT ENABLED FOR COLLECTION")
    official_channel: Mapped[str] = mapped_column(String(80), default="Kas Daerah / Bapenda Official Gateway")
    reconciliation_status: Mapped[str] = mapped_column(String(60), default="Not Applicable")
    authorized_officer: Mapped[str | None] = mapped_column(String(120), nullable=True)
    audit_notes: Mapped[str] = mapped_column(Text, default="Pengumpulan dana belum diaktifkan sebelum verifikasi dasar hukum dan kanal kas daerah resmi.")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
