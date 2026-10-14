from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.urban import (
    FieldVerificationReport,
    OfficialPaymentAudit,
    SidewalkSegment,
    StreetVendorRecord,
    StreetVendorZone,
    UrbanHotspot,
    UrbanObstruction,
    UrbanSegment,
    UtilityAsset,
    UtilityOperator,
    WalkpointAccount,
    WalkpointProgram,
    WalkpointRedemption,
    WalkpointReward,
    WalkpointTransaction,
)
from app.services.ai_urban_talent import AIUrbanTalentService

router = APIRouter()


# --- Pydantic Schemas ---
class UtilityAssetCreate(BaseModel):
    segment_id: str
    operator_id: str | None = None
    utility_type: str = "Fiber Optik / Telekomunikasi"
    visual_condition: str = "Rapi / Tertata"
    height_meters: float | None = None
    notes: str | None = None
    permit_reference: str | None = None


class ObstructionReportCreate(BaseModel):
    title: str
    description: str
    location_name: str
    latitude: float
    longitude: float
    source: str = "Laporan Warga"
    segment_id: str | None = None


class ObstructionVerifyRequest(BaseModel):
    status: str = "Verified"  # Verified, Rejected
    notes: str
    responsible_agency: str = "Satpol PP"


class FieldVerificationSubmit(BaseModel):
    case_or_obstruction_id: str
    inspector_name: str
    inspector_agency: str
    checklist_results: dict[str, Any] = Field(default_factory=dict)
    findings_summary: str
    action_recommended: str
    latitude_recorded: float | None = None
    longitude_recorded: float | None = None
    photo_urls: list[str] = Field(default_factory=list)


class WalkpointCheckinRequest(BaseModel):
    account_id: str
    corridor_location: str


class WalkpointRedeemRequest(BaseModel):
    account_id: str
    reward_id: str


# --- Endpoints ---

@router.get("/overview")
def get_urban_overview(db: Session = Depends(get_db)) -> dict[str, Any]:
    """
    Overview metrik Ruang Kota, Public Space Health Index, dan rekapitulasi isu perkotaan.
    """
    total_segments = db.scalar(select(func.count(UrbanSegment.id))) or 0
    avg_health_index = db.scalar(select(func.avg(UrbanSegment.health_index_score))) or 70.0

    total_cables = db.scalar(select(func.count(UtilityAsset.id))) or 0
    cluttered_cables = db.scalar(select(func.count(UtilityAsset.id)).where(UtilityAsset.clutter_index >= 50.0)) or 0
    suspected_inactive_cables = db.scalar(select(func.count(UtilityAsset.id)).where(UtilityAsset.active_status == "Suspected inactive")) or 0

    total_obstructions = db.scalar(select(func.count(UrbanObstruction.id))) or 0
    pending_obstructions = db.scalar(select(func.count(UrbanObstruction.id)).where(UrbanObstruction.status == "Pending Verification")) or 0
    verified_obstructions = db.scalar(select(func.count(UrbanObstruction.id)).where(UrbanObstruction.status == "Verified")) or 0

    total_hotspots = db.scalar(select(func.count(UrbanHotspot.id))) or 0
    total_vendor_zones = db.scalar(select(func.count(StreetVendorZone.id))) or 0
    total_vendors_registered = db.scalar(select(func.count(StreetVendorRecord.id))) or 0

    total_walkpoint_participants = db.scalar(select(func.count(WalkpointAccount.id))) or 0
    total_km_walked = db.scalar(select(func.sum(WalkpointAccount.total_km_walked))) or 0.0

    return {
        "health_index": round(float(avg_health_index), 1),
        "total_segments": total_segments,
        "cables": {
            "total": total_cables,
            "cluttered": cluttered_cables,
            "suspected_inactive": suspected_inactive_cables,
        },
        "obstructions": {
            "total": total_obstructions,
            "pending_verification": pending_obstructions,
            "verified": verified_obstructions,
        },
        "hotspots_count": total_hotspots,
        "vendors": {
            "total_zones": total_vendor_zones,
            "registered_vendors": total_vendors_registered,
        },
        "walkpoints": {
            "participants": total_walkpoint_participants,
            "total_km": round(float(total_km_walked), 1),
        },
        "payment_readiness_status": "SIMULATION / NOT ENABLED FOR COLLECTION",
        "last_updated": datetime.now(UTC).isoformat(),
    }


@router.get("/segments")
def list_urban_segments(db: Session = Depends(get_db)):
    segments = db.scalars(select(UrbanSegment).order_by(UrbanSegment.street_name)).all()
    return [
        {
            "id": s.id,
            "segment_code": s.segment_code,
            "street_name": s.street_name,
            "district": s.district,
            "subdistrict": s.subdistrict,
            "health_index_score": s.health_index_score,
            "length_meters": s.length_meters,
            "start_coords": [s.start_latitude, s.start_longitude],
            "end_coords": [s.end_latitude, s.end_longitude],
        }
        for s in segments
    ]


@router.get("/cables")
def list_cables(
    operator_id: str | None = None,
    risk: str | None = None,
    db: Session = Depends(get_db),
):
    query = select(UtilityAsset)
    if operator_id:
        query = query.where(UtilityAsset.operator_id == operator_id)
    if risk:
        query = query.where(UtilityAsset.risk_level == risk)
    cables = db.scalars(query.order_by(UtilityAsset.clutter_index.desc())).all()
    return [
        {
            "id": c.id,
            "asset_code": c.asset_code,
            "segment_id": c.segment_id,
            "street_name": c.segment.street_name if c.segment else "-",
            "district": c.segment.district if c.segment else "-",
            "operator_name": c.operator.name if c.operator else "Operator Belum Teridentifikasi",
            "utility_type": c.utility_type,
            "ownership_status": c.ownership_status,
            "active_status": c.active_status,
            "visual_condition": c.visual_condition,
            "clutter_index": c.clutter_index,
            "pole_number": c.pole_number,
            "height_meters": c.height_meters,
            "risk_level": c.risk_level,
            "permit_reference": c.permit_reference,
            "inspection_date": c.inspection_date.isoformat() if c.inspection_date else None,
            "notes": c.notes,
            "last_action": c.last_action,
        }
        for c in cables
    ]


@router.post("/cables")
def register_cable(payload: UtilityAssetCreate, db: Session = Depends(get_db)):
    segment = db.get(UrbanSegment, payload.segment_id)
    if not segment:
        raise HTTPException(status_code=404, detail="Segmen jalan tidak ditemukan")

    # Run AI clutter analysis
    ai_analysis = AIUrbanTalentService.analyze_cable_condition(
        description=f"{payload.visual_condition} {payload.notes or ''}",
        height_meters=payload.height_meters,
    )

    code = f"CBL-{uuid.uuid4().hex[:6].upper()}"
    asset = UtilityAsset(
        asset_code=code,
        segment_id=payload.segment_id,
        operator_id=payload.operator_id,
        utility_type=payload.utility_type,
        visual_condition=ai_analysis.get("suggested_visual_condition", payload.visual_condition),
        clutter_index=ai_analysis.get("clutter_index", 25.0),
        risk_level=ai_analysis.get("risk_level", "Low"),
        height_meters=payload.height_meters,
        notes=payload.notes,
        permit_reference=payload.permit_reference,
        inspection_date=datetime.now(UTC),
        last_action="Pendaftaran Aset Digital / Paspor Kabel",
    )
    db.add(asset)
    db.commit()
    db.refresh(asset)
    return {"message": "Paspor utilitas berhasil didaftarkan", "asset_id": asset.id, "ai_analysis": ai_analysis}


@router.get("/sidewalks")
def list_sidewalks(db: Session = Depends(get_db)):
    sidewalks = db.scalars(select(SidewalkSegment)).all()
    return [
        {
            "id": sw.id,
            "segment_id": sw.segment_id,
            "street_name": sw.segment.street_name if sw.segment else "-",
            "district": sw.segment.district if sw.segment else "-",
            "width_meters": sw.width_meters,
            "clear_pedestrian_width_meters": sw.clear_pedestrian_width_meters,
            "surface_condition": sw.surface_condition,
            "has_tactile_paving": sw.has_tactile_paving,
            "has_wheelchair_ramp": sw.has_wheelchair_ramp,
            "lighting_condition": sw.lighting_condition,
            "zone_category": sw.zone_category,
            "repair_status": sw.repair_status,
        }
        for sw in sidewalks
    ]


@router.get("/obstructions")
def list_obstructions(status_filter: str | None = None, db: Session = Depends(get_db)):
    query = select(UrbanObstruction)
    if status_filter:
        query = query.where(UrbanObstruction.status == status_filter)
    obs_list = db.scalars(query.order_by(UrbanObstruction.created_at.desc())).all()
    return [
        {
            "id": o.id,
            "title": o.title,
            "obstruction_type": o.obstruction_type,
            "description": o.description,
            "location_name": o.location_name,
            "latitude": o.latitude,
            "longitude": o.longitude,
            "source": o.source,
            "accessibility_impact": o.accessibility_impact,
            "ai_confidence": o.ai_confidence,
            "ai_candidate_flag": o.ai_candidate_flag,
            "status": o.status,
            "responsible_agency": o.responsible_agency,
            "is_recurring": o.is_recurring,
            "created_at": o.created_at.isoformat(),
        }
        for o in obs_list
    ]


@router.post("/obstructions")
def report_obstruction(payload: ObstructionReportCreate, db: Session = Depends(get_db)):
    # AI Analysis for candidate classification
    ai_analysis = AIUrbanTalentService.analyze_obstruction(payload.title, payload.description)

    obstruction = UrbanObstruction(
        title=payload.title,
        description=payload.description,
        location_name=payload.location_name,
        latitude=payload.latitude,
        longitude=payload.longitude,
        source=payload.source,
        segment_id=payload.segment_id,
        obstruction_type=ai_analysis.get("candidate_obstruction_type", "Lainnya"),
        accessibility_impact=ai_analysis.get("accessibility_impact", "Akses pejalan kaki terganggu"),
        responsible_agency=ai_analysis.get("recommended_lead_agency", "Satpol PP"),
        ai_confidence=ai_analysis.get("confidence", 0.85),
        ai_candidate_flag=True,
        status="Pending Verification",
    )
    db.add(obstruction)
    db.commit()
    db.refresh(obstruction)
    return {
        "message": "Laporan hambatan trotoar dicatat sebagai candidate event untuk diverifikasi petugas",
        "id": obstruction.id,
        "ai_analysis": ai_analysis,
    }


@router.post("/obstructions/{obstruction_id}/verify")
def verify_obstruction(obstruction_id: str, payload: ObstructionVerifyRequest, db: Session = Depends(get_db)):
    obs = db.get(UrbanObstruction, obstruction_id)
    if not obs:
        raise HTTPException(status_code=404, detail="Data hambatan tidak ditemukan")

    obs.status = payload.status
    obs.responsible_agency = payload.responsible_agency
    obs.ai_candidate_flag = False
    db.commit()
    return {"message": f"Status laporan diperbarui menjadi {payload.status}", "id": obs.id}


@router.get("/vendors")
def list_vendor_zones(db: Session = Depends(get_db)):
    zones = db.scalars(select(StreetVendorZone)).all()
    result = []
    for z in zones:
        result.append({
            "id": z.id,
            "zone_name": z.zone_name,
            "district": z.district,
            "location_description": z.location_description,
            "legal_basis": z.legal_basis,
            "authorized_by": z.authorized_by,
            "active_hours": z.active_hours,
            "max_capacity_stalls": z.max_capacity_stalls,
            "current_registered_stalls": z.current_registered_stalls,
            "mandatory_free_pedestrian_width_meters": z.mandatory_free_pedestrian_width_meters,
            "is_legal": z.is_legal,
            "vendors": [
                {
                    "vendor_code": v.vendor_code,
                    "business_type": v.business_type,
                    "stall_number": v.stall_number,
                    "verification_status": v.verification_status,
                    "cleanliness_score": v.cleanliness_score,
                }
                for v in z.vendors
            ],
        })
    return result


@router.get("/hotspots")
def list_hotspots(db: Session = Depends(get_db)):
    hotspots = db.scalars(select(UrbanHotspot).order_by(UrbanHotspot.incident_count_30d.desc())).all()
    return [
        {
            "id": h.id,
            "title": h.title,
            "issue_type": h.issue_type,
            "location_name": h.location_name,
            "district": h.district,
            "latitude": h.latitude,
            "longitude": h.longitude,
            "incident_count_30d": h.incident_count_30d,
            "peak_hours": h.peak_hours,
            "severity": h.severity,
            "lead_agency": h.lead_agency,
            "status": h.status,
        }
        for h in hotspots
    ]


@router.post("/field-verifications")
def submit_field_verification(payload: FieldVerificationSubmit, db: Session = Depends(get_db)):
    report = FieldVerificationReport(
        case_or_obstruction_id=payload.case_or_obstruction_id,
        inspector_name=payload.inspector_name,
        inspector_agency=payload.inspector_agency,
        checklist_results=payload.checklist_results,
        findings_summary=payload.findings_summary,
        action_recommended=payload.action_recommended,
        latitude_recorded=payload.latitude_recorded,
        longitude_recorded=payload.longitude_recorded,
        photo_urls=payload.photo_urls,
        verification_status="Verified by Field Officer",
    )
    db.add(report)

    # Check if obstruction exists and update status
    obs = db.get(UrbanObstruction, payload.case_or_obstruction_id)
    if obs:
        obs.status = "Verified"
        obs.ai_candidate_flag = False

    db.commit()
    db.refresh(report)
    return {"message": "Hasil verifikasi petugas lapangan berhasil disimpan", "report_id": report.id}


@router.get("/walkpoints/overview")
def get_walkpoints_overview(db: Session = Depends(get_db)):
    program = db.scalar(select(WalkpointProgram).where(WalkpointProgram.is_active == True).limit(1))
    rewards = db.scalars(select(WalkpointReward).where(WalkpointReward.is_active == True)).all()
    account = db.scalar(select(WalkpointAccount).limit(1))  # Demo participant

    return {
        "program": {
            "title": program.title if program else "Tangsel Melangkah",
            "description": program.description if program else "",
            "funding_source": program.funding_source if program else "CSR & APBD Ramah Lingkungan",
            "points_per_km": program.points_per_km if program else 50,
            "daily_cap": program.daily_cap_points if program else 250,
            "legal_disclaimer": "WalkPoints adalah insentif mobilitas non-tunai dan bukan uang elektronik/crypto.",
        },
        "account_demo": {
            "id": account.id if account else None,
            "participant_name": account.participant_name if account else "Pejalan Kaki Tamu",
            "balance_points": account.balance_points if account else 0,
            "total_km": account.total_km_walked if account else 0.0,
            "tier": account.tier if account else "Pejalan Aktif",
        },
        "rewards": [
            {
                "id": r.id,
                "partner_merchant_name": r.partner_merchant_name,
                "reward_title": r.reward_title,
                "category": r.category,
                "points_required": r.points_required,
                "stock_available": r.stock_available,
                "terms": r.terms,
            }
            for r in rewards
        ],
    }


@router.post("/walkpoints/checkin")
def walkpoint_checkin(payload: WalkpointCheckinRequest, db: Session = Depends(get_db)):
    account = db.get(WalkpointAccount, payload.account_id)
    if not account:
        raise HTTPException(status_code=404, detail="Akun WalkPoints tidak ditemukan")

    points_earned = 50
    account.balance_points += points_earned
    account.lifetime_points_earned += points_earned
    account.total_km_walked += 1.0

    tx = WalkpointTransaction(
        account_id=account.id,
        tx_type="CHECKIN_QR",
        points_delta=points_earned,
        location_corridor=payload.corridor_location,
        note=f"Check-in terverifikasi di {payload.corridor_location}",
        anti_fraud_status="Verified Valid",
    )
    db.add(tx)
    db.commit()
    return {
        "message": f"Check-in berhasil! Anda memperoleh +{points_earned} WalkPoints.",
        "new_balance": account.balance_points,
    }


@router.post("/walkpoints/redeem")
def walkpoint_redeem(payload: WalkpointRedeemRequest, db: Session = Depends(get_db)):
    account = db.get(WalkpointAccount, payload.account_id)
    reward = db.get(WalkpointReward, payload.reward_id)

    if not account or not reward:
        raise HTTPException(status_code=404, detail="Akun atau Reward tidak ditemukan")

    if account.balance_points < reward.points_required:
        raise HTTPException(status_code=400, detail="Saldo WalkPoints tidak mencukupi")

    if reward.stock_available <= 0:
        raise HTTPException(status_code=400, detail="Stok voucher merchant telah habis")

    account.balance_points -= reward.points_required
    reward.stock_available -= 1

    code = f"WP-{uuid.uuid4().hex[:8].upper()}"
    redemption = WalkpointRedemption(
        account_id=account.id,
        reward_id=reward.id,
        redemption_code=code,
        points_spent=reward.points_required,
        status="Issued",
    )
    db.add(redemption)
    db.commit()

    return {
        "message": f"Penukaran voucher '{reward.reward_title}' berhasil!",
        "redemption_code": code,
        "remaining_points": account.balance_points,
    }


@router.get("/payments/readiness")
def get_payment_readiness(db: Session = Depends(get_db)):
    audits = db.scalars(select(OfficialPaymentAudit)).all()
    return {
        "status": "SIMULATION / NOT ENABLED FOR COLLECTION",
        "legal_notice": (
            "Sesuai ketentuan tata kelola pemerintahan, Wasdal tidak menampung pungutan di aplikasi "
            "dan tidak mengalirkan dana denda langsung ke pihak manapun. Seluruh pungutan retribusi dan denda "
            "wajib didasarkan pada penetapan resmi pejabat berwenang dan disetor melalui Kas Daerah resmi."
        ),
        "records": [
            {
                "id": a.id,
                "reference_number": a.reference_number,
                "subject_title": a.subject_title,
                "legal_basis_check": a.legal_basis_check,
                "determination_status": a.determination_status,
                "collection_readiness": a.collection_readiness,
                "official_channel": a.official_channel,
                "audit_notes": a.audit_notes,
            }
            for a in audits
        ],
    }
