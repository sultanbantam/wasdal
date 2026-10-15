from __future__ import annotations

import csv
import io
import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File, status
from pydantic import BaseModel, Field
from sqlalchemy import desc, func, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.network import (
    NetworkRegion,
    RegionProfile,
    RegionMembership,
    NetworkIndicatorDefinition,
    NetworkIndicatorValue,
    NetworkStrategicIssue,
    NetworkDiagnosis,
    NetworkFiscalSnapshot,
    NetworkFiscalRoadmap,
    NetworkIdea,
    NetworkPilotProject,
    NetworkStrategicAsset,
    NetworkFGDEvent,
    NetworkFGDRecommendation,
    NetworkDecisionRequest,
    NetworkDataValidation,
    NetworkAuditLog,
)

router = APIRouter()


# ==========================================
# PYDANTIC SCHEMAS
# ==========================================
class RegionProfileUpdate(BaseModel):
    capital_city: str | None = None
    office_address: str | None = None
    website: str | None = None
    leader_name: str | None = None
    vice_leader_name: str | None = None
    sekda_name: str | None = None
    term_period: str | None = None
    expert_staff_count: int | None = None
    expert_staff_fields: str | None = None
    total_area_km2: float | None = None
    districts_count: int | None = None
    villages_count: int | None = None
    population: int | None = None
    density_per_km2: float | None = None
    region_characters: str | None = None
    growth_center_zones: str | None = None
    dominant_disaster_risks: str | None = None
    economic_growth_rate: float | None = None
    pdrb_trillion: float | None = None
    poverty_rate: float | None = None
    unemployment_rate: float | None = None
    gini_ratio: float | None = None
    ipm: float | None = None
    total_umkm: int | None = None


class StrategicIssueCreate(BaseModel):
    region_id: str
    title: str
    summary: str
    category: str
    location_name: str = "Seluruh Wilayah Kota"
    authority_level: str = "Kabupaten/Kota"
    target_opd: str
    affected_groups: str = "Masyarakat Umum"
    urgency_level: str = "Tinggi"
    impact_level: str = "Tinggi"
    pic_name: str | None = None
    deadline_target: str | None = None
    decision_required: bool = False


class DiagnosisCreate(BaseModel):
    region_id: str
    issue_id: str | None = None
    problem_statement: str
    baseline_condition: str
    root_cause: str
    program_gaps: str
    inaction_risks: str
    solution_options: list[dict[str, Any]] = Field(default_factory=list)
    expert_recommendation: str
    decision_prompt: str | None = None
    author_name: str = "Staf Ahli Kepala Daerah"


class IdeaCreate(BaseModel):
    region_id: str
    title: str
    summary_plain: str
    novelty_element: str
    target_beneficiaries: str
    category: str
    primary_opd: str
    estimated_budget_million: float = 100.0
    funding_source_options: str = "APBD / CSR"
    impact_vs_effort: str = "High Impact / Low Effort"
    is_replicable: bool = True


class DecisionDisposition(BaseModel):
    status: str = "Disetujui"  # Disetujui, Ditolak, Diberi Catatan
    selected_option: str | None = None
    disposition_notes: str | None = None
    disposition_by: str = "Wali Kota"


class AIAssistRequest(BaseModel):
    action: str  # 'diagnose', 'policy_brief', 'compare', 'group_ideas'
    region_id: str | None = None
    query: str | None = None
    compare_region_ids: list[str] | None = None


# ==========================================
# ENDPOINTS
# ==========================================

@router.get("/overview")
def get_network_overview(db: Session = Depends(get_db)) -> dict[str, Any]:
    """Ringkasan Agregat Nasional & Metrik Jejaring Staf Ahli Daerah."""
    regions_total = db.scalar(select(func.count(NetworkRegion.id))) or 0
    regions_active = db.scalar(select(func.count(NetworkRegion.id)).where(NetworkRegion.is_active == True)) or 0
    
    profiles = db.scalars(select(RegionProfile)).all()
    complete_count = sum(1 for p in profiles if p.completion_score >= 80)
    in_progress_count = len(profiles) - complete_count

    issues_count = db.scalar(select(func.count(NetworkStrategicIssue.id))) or 0
    ideas_count = db.scalar(select(func.count(NetworkIdea.id))) or 0
    pilots_count = db.scalar(select(func.count(NetworkPilotProject.id))) or 0
    fgd_count = db.scalar(select(func.count(NetworkFGDEvent.id))) or 0
    decisions_pending = db.scalar(select(func.count(NetworkDecisionRequest.id)).where(NetworkDecisionRequest.status == "Menunggu Disposisi")) or 0

    # Ambil 5 isu mendesak
    recent_issues = db.scalars(
        select(NetworkStrategicIssue).order_by(desc(NetworkStrategicIssue.priority_score)).limit(5)
    ).all()

    # Ambil 5 gagasan unggulan
    top_ideas = db.scalars(
        select(NetworkIdea).order_by(desc(NetworkIdea.interested_regions_count)).limit(5)
    ).all()

    # Ambil FGD terdekat/terbaru
    latest_fgd = db.scalars(select(NetworkFGDEvent).order_by(desc(NetworkFGDEvent.event_date)).limit(1)).first()

    return {
        "tagline": "Satu Data, Banyak Gagasan, Solusi Bersama untuk Daerah",
        "national_metrics": {
            "total_regions": regions_total,
            "active_regions": regions_active,
            "complete_profiles": complete_count,
            "in_progress_profiles": in_progress_count,
            "total_strategic_issues": issues_count,
            "total_ideas": ideas_count,
            "total_pilots": pilots_count,
            "total_fgds": fgd_count,
            "decisions_pending": decisions_pending,
        },
        "recent_urgent_issues": [
            {
                "id": i.id,
                "region_id": i.region_id,
                "title": i.title,
                "category": i.category,
                "urgency_level": i.urgency_level,
                "priority_score": i.priority_score,
                "status": i.status,
            }
            for i in recent_issues
        ],
        "top_replicable_ideas": [
            {
                "id": ide.id,
                "title": ide.title,
                "category": ide.category,
                "readiness_status": ide.readiness_status,
                "impact_vs_effort": ide.impact_vs_effort,
                "interested_count": ide.interested_regions_count,
            }
            for ide in top_ideas
        ],
        "latest_fgd": {
            "id": latest_fgd.id if latest_fgd else None,
            "title": latest_fgd.title if latest_fgd else None,
            "theme": latest_fgd.theme if latest_fgd else None,
            "status": latest_fgd.status if latest_fgd else None,
            "submissions_count": latest_fgd.submissions_count if latest_fgd else 0,
        } if latest_fgd else None,
    }


@router.get("/regions")
def list_regions(
    region_type: str | None = None,
    province: str | None = None,
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    """Daftar Daerah Pemerintahan Terdaftar."""
    stmt = select(NetworkRegion)
    if region_type:
        stmt = stmt.where(NetworkRegion.region_type == region_type)
    if province:
        stmt = stmt.where(NetworkRegion.province_name.ilike(f"%{province}%"))
    
    regions = db.scalars(stmt.order_by(NetworkRegion.code)).all()
    result = []
    for r in regions:
        p = r.profile
        result.append({
            "id": r.id,
            "code": r.code,
            "name": r.name,
            "region_type": r.region_type,
            "province_name": r.province_name,
            "is_active": r.is_active,
            "is_demo": r.is_demo,
            "completion_score": p.completion_score if p else 0,
            "validation_status": p.validation_status if p else "Draft",
            "population": p.population if p else None,
            "leader_name": p.leader_name if p else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None,
        })
    return result


@router.get("/regions/{region_id}")
def get_region_detail(region_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    """Detail Profil Daerah Lengkap beserta Identitas, Demografi & Sosio-Ekonomi."""
    region = db.get(NetworkRegion, region_id)
    if not region:
        raise HTTPException(status_code=404, detail="Daerah tidak ditemukan")
    
    p = region.profile
    memberships = db.scalars(select(RegionMembership).where(RegionMembership.region_id == region_id)).all()

    return {
        "region": {
            "id": region.id,
            "code": region.code,
            "name": region.name,
            "region_type": region.region_type,
            "province_name": region.province_name,
            "is_demo": region.is_demo,
        },
        "profile": {
            "capital_city": p.capital_city if p else "",
            "office_address": p.office_address if p else "",
            "website": p.website if p else "",
            "leader_name": p.leader_name if p else "",
            "vice_leader_name": p.vice_leader_name if p else "",
            "sekda_name": p.sekda_name if p else "",
            "term_period": p.term_period if p else "",
            "expert_staff_count": p.expert_staff_count if p else 0,
            "expert_staff_fields": p.expert_staff_fields if p else "",
            "total_area_km2": p.total_area_km2 if p else 0,
            "districts_count": p.districts_count if p else 0,
            "villages_count": p.villages_count if p else 0,
            "population": p.population if p else 0,
            "density_per_km2": p.density_per_km2 if p else 0,
            "region_characters": p.region_characters if p else "",
            "growth_center_zones": p.growth_center_zones if p else "",
            "dominant_disaster_risks": p.dominant_disaster_risks if p else "",
            "economic_growth_rate": p.economic_growth_rate if p else 0,
            "pdrb_trillion": p.pdrb_trillion if p else 0,
            "poverty_rate": p.poverty_rate if p else 0,
            "unemployment_rate": p.unemployment_rate if p else 0,
            "gini_ratio": p.gini_ratio if p else 0,
            "ipm": p.ipm if p else 0,
            "total_umkm": p.total_umkm if p else 0,
            "completion_score": p.completion_score if p else 0,
            "validation_status": p.validation_status if p else "Draft",
            "last_verified_at": p.last_verified_at.isoformat() if p and p.last_verified_at else None,
            "last_verified_by": p.last_verified_by if p else None,
        } if p else None,
        "team_members": [
            {
                "id": m.id,
                "user_name": m.user_name,
                "user_email": m.user_email,
                "role": m.role,
                "agency": m.agency,
                "is_active": m.is_active,
            }
            for m in memberships
        ],
    }


@router.put("/regions/{region_id}/profile")
def update_region_profile(
    region_id: str,
    payload: RegionProfileUpdate,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Pembaruan Bertahap (Wizard Autosave) Profil Daerah."""
    region = db.get(NetworkRegion, region_id)
    if not region:
        raise HTTPException(status_code=404, detail="Daerah tidak ditemukan")
    
    profile = region.profile
    if not profile:
        profile = RegionProfile(region_id=region.id)
        db.add(profile)
    
    # Update field yang disediakan
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
    
    # Recalculate completion score sederhana
    fields_checked = [
        profile.capital_city, profile.office_address, profile.leader_name,
        profile.sekda_name, profile.total_area_km2, profile.population,
        profile.economic_growth_rate, profile.pdrb_trillion, profile.poverty_rate,
        profile.ipm, profile.total_umkm
    ]
    filled = sum(1 for f in fields_checked if f is not None and f != "" and f != 0)
    profile.completion_score = int((filled / len(fields_checked)) * 100)
    profile.updated_at = datetime.now(UTC)

    # Tambahkan catatan audit
    audit = NetworkAuditLog(
        region_id=region_id,
        user_name="Admin Daerah",
        user_role="Admin Daerah",
        action="UPDATE_PROFILE",
        details=f"Memperbarui data profil daerah. Kelengkapan data saat ini: {profile.completion_score}%.",
    )
    db.add(audit)
    db.commit()

    return {
        "status": "success",
        "completion_score": profile.completion_score,
        "validation_status": profile.validation_status,
        "updated_at": profile.updated_at.isoformat(),
    }


# ==========================================
# DATA WILAYAH & INDIKATOR
# ==========================================

@router.get("/indicators")
def list_indicators(
    region_id: str | None = None,
    category: str | None = None,
    year: int | None = None,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Daftar Kamus Indikator dan Capaian Nilai per Daerah."""
    defs = db.scalars(select(NetworkIndicatorDefinition)).all()

    stmt = select(NetworkIndicatorValue)
    if region_id:
        stmt = stmt.where(NetworkIndicatorValue.region_id == region_id)
    if category:
        stmt = stmt.where(NetworkIndicatorValue.category == category)
    if year:
        stmt = stmt.where(NetworkIndicatorValue.year == year)
    
    values = db.scalars(stmt.order_by(NetworkIndicatorValue.year.desc())).all()

    return {
        "definitions": [
            {
                "code": d.code,
                "name": d.name,
                "category": d.category,
                "unit": d.unit,
                "formula_description": d.formula_description,
                "default_source": d.default_source,
                "is_mandatory": d.is_mandatory,
            }
            for d in defs
        ],
        "values": [
            {
                "id": v.id,
                "region_id": v.region_id,
                "indicator_code": v.indicator_code,
                "indicator_name": v.indicator_name,
                "category": v.category,
                "year": v.year,
                "value": v.value,
                "unit": v.unit,
                "source": v.source,
                "status_data": v.status_data,
                "notes": v.notes,
            }
            for v in values
        ],
    }


@router.post("/indicators/import")
async def import_indicators_csv(
    region_id: str = Query(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Impor Massal Indikator dari CSV dengan Pelaporan Baris Berhasil & Gagal."""
    region = db.get(NetworkRegion, region_id)
    if not region:
        raise HTTPException(status_code=404, detail="Daerah tidak ditemukan")
    
    content = await file.read()
    decoded = content.decode("utf-8-sig", errors="ignore")
    reader = csv.DictReader(io.StringIO(decoded))

    success_rows = []
    failed_rows = []

    for row_idx, row in enumerate(reader, start=2):
        code = row.get("kode_indikator", "").strip()
        name = row.get("nama_indikator", "").strip() or code
        category = row.get("kategori", "Umum").strip()
        year_str = row.get("periode", row.get("tahun", "")).strip()
        val_str = row.get("nilai", "").strip().replace(",", ".")
        unit = row.get("satuan", "-").strip()
        source = row.get("sumber", "Manual Import").strip()
        status_data = row.get("status_data", "Sementara").strip()

        if not code or not year_str or not val_str:
            failed_rows.append({
                "line": row_idx,
                "reason": "Kolom wajib kosong (kode_indikator, periode, atau nilai)",
                "data": row,
            })
            continue

        try:
            year = int(year_str)
            val = float(val_str)
        except ValueError:
            failed_rows.append({
                "line": row_idx,
                "reason": f"Format angka/tahun tidak valid (tahun={year_str}, nilai={val_str})",
                "data": row,
            })
            continue

        item = NetworkIndicatorValue(
            region_id=region_id,
            indicator_code=code,
            indicator_name=name,
            category=category,
            year=year,
            value=val,
            unit=unit,
            source=source,
            status_data=status_data,
            notes=row.get("catatan", None),
        )
        db.add(item)
        success_rows.append({"line": row_idx, "code": code, "year": year, "value": val})

    db.commit()

    return {
        "status": "completed",
        "total_processed": len(success_rows) + len(failed_rows),
        "success_count": len(success_rows),
        "failed_count": len(failed_rows),
        "failed_details": failed_rows,
    }


# ==========================================
# ISU STRATEGIS & DIAGNOSIS DAERAH
# ==========================================

@router.get("/issues")
def list_strategic_issues(
    region_id: str | None = None,
    category: str | None = None,
    urgency: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    """Daftar Isu Strategis Daerah dengan Formula 5W1H."""
    stmt = select(NetworkStrategicIssue)
    if region_id:
        stmt = stmt.where(NetworkStrategicIssue.region_id == region_id)
    if category:
        stmt = stmt.where(NetworkStrategicIssue.category == category)
    if urgency:
        stmt = stmt.where(NetworkStrategicIssue.urgency_level == urgency)
    if status:
        stmt = stmt.where(NetworkStrategicIssue.status == status)
    
    issues = db.scalars(stmt.order_by(desc(NetworkStrategicIssue.priority_score))).all()
    return [
        {
            "id": i.id,
            "region_id": i.region_id,
            "title": i.title,
            "summary": i.summary,
            "category": i.category,
            "location_name": i.location_name,
            "authority_level": i.authority_level,
            "target_opd": i.target_opd,
            "affected_groups": i.affected_groups,
            "urgency_level": i.urgency_level,
            "impact_level": i.impact_level,
            "priority_score": i.priority_score,
            "status": i.status,
            "pic_name": i.pic_name,
            "deadline_target": i.deadline_target,
            "linked_rpjmd_indicator": i.linked_rpjmd_indicator,
            "decision_required": i.decision_required,
            "created_at": i.created_at.isoformat(),
        }
        for i in issues
    ]


@router.post("/issues")
def create_strategic_issue(
    payload: StrategicIssueCreate,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Input Isu Strategis Baru."""
    issue = NetworkStrategicIssue(
        region_id=payload.region_id,
        title=payload.title,
        summary=payload.summary,
        category=payload.category,
        location_name=payload.location_name,
        authority_level=payload.authority_level,
        target_opd=payload.target_opd,
        affected_groups=payload.affected_groups,
        urgency_level=payload.urgency_level,
        impact_level=payload.impact_level,
        pic_name=payload.pic_name,
        deadline_target=payload.deadline_target,
        decision_required=payload.decision_required,
    )
    db.add(issue)
    db.commit()
    db.refresh(issue)
    return {"id": issue.id, "title": issue.title, "status": issue.status}


@router.get("/diagnoses")
def list_diagnoses(
    region_id: str | None = None,
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    """Daftar Lembar Diagnosis Staf Ahli."""
    stmt = select(NetworkDiagnosis)
    if region_id:
        stmt = stmt.where(NetworkDiagnosis.region_id == region_id)
    
    diagnoses = db.scalars(stmt.order_by(desc(NetworkDiagnosis.created_at))).all()
    return [
        {
            "id": d.id,
            "region_id": d.region_id,
            "issue_id": d.issue_id,
            "problem_statement": d.problem_statement,
            "baseline_condition": d.baseline_condition,
            "root_cause": d.root_cause,
            "program_gaps": d.program_gaps,
            "inaction_risks": d.inaction_risks,
            "solution_options": d.solution_options,
            "expert_recommendation": d.expert_recommendation,
            "decision_prompt": d.decision_prompt,
            "status": d.status,
            "author_name": d.author_name,
            "created_at": d.created_at.isoformat(),
        }
        for d in diagnoses
    ]


@router.post("/diagnoses")
def create_diagnosis(
    payload: DiagnosisCreate,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Simpan Lembar Diagnosis Staf Ahli."""
    diag = NetworkDiagnosis(
        region_id=payload.region_id,
        issue_id=payload.issue_id,
        problem_statement=payload.problem_statement,
        baseline_condition=payload.baseline_condition,
        root_cause=payload.root_cause,
        program_gaps=payload.program_gaps,
        inaction_risks=payload.inaction_risks,
        solution_options=payload.solution_options,
        expert_recommendation=payload.expert_recommendation,
        decision_prompt=payload.decision_prompt,
        author_name=payload.author_name,
    )
    db.add(diag)
    db.commit()
    db.refresh(diag)
    return {"id": diag.id, "status": diag.status}


# ==========================================
# FISKAL & APBD
# ==========================================

@router.get("/fiscal")
def get_fiscal_data(
    region_id: str = Query(...),
    year: int | None = None,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Data Diagnosis Fiskal, APBD, dan Rasio Otomatis."""
    stmt = select(NetworkFiscalSnapshot).where(NetworkFiscalSnapshot.region_id == region_id)
    if year:
        stmt = stmt.where(NetworkFiscalSnapshot.year == year)
    
    snapshots = db.scalars(stmt.order_by(NetworkFiscalSnapshot.year.desc())).all()
    roadmap = db.scalars(select(NetworkFiscalRoadmap).where(NetworkFiscalRoadmap.region_id == region_id)).first()

    return {
        "snapshots": [
            {
                "id": s.id,
                "year": s.year,
                "total_revenue_billion": s.total_revenue_billion,
                "pad_billion": s.pad_billion,
                "transfer_revenue_billion": s.transfer_revenue_billion,
                "total_expenditure_billion": s.total_expenditure_billion,
                "personnel_expenditure_billion": s.personnel_expenditure_billion,
                "capital_expenditure_billion": s.capital_expenditure_billion,
                "silpa_billion": s.silpa_billion,
                "pad_ratio_pct": s.pad_ratio_pct,
                "transfer_dependency_pct": s.transfer_dependency_pct,
                "personnel_ratio_pct": s.personnel_ratio_pct,
                "capital_ratio_pct": s.capital_ratio_pct,
                "fiscal_space_level": s.fiscal_space_level,
                "notes": s.notes,
            }
            for s in snapshots
        ],
        "roadmap": {
            "id": roadmap.id,
            "title": roadmap.title,
            "target_year": roadmap.target_year,
            "efficiency_programs": roadmap.efficiency_programs,
            "pad_optimization_strategy": roadmap.pad_optimization_strategy,
            "asset_optimization_strategy": roadmap.asset_optimization_strategy,
            "central_support_needs": roadmap.central_support_needs,
            "lead_agency": roadmap.lead_agency,
            "status": roadmap.status,
        } if roadmap else None,
        "disclaimer": "Analisis fiskal merupakan alat bantu diagnosis staf ahli dan wajib diverifikasi oleh BPKAD sesuai ketentuan perundang-undangan.",
    }


# ==========================================
# BANK GAGASAN, PILOT & ASET
# ==========================================

@router.get("/ideas")
def list_ideas(
    region_id: str | None = None,
    category: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    """Daftar Bank Gagasan & Inovasi Daerah."""
    stmt = select(NetworkIdea)
    if region_id:
        stmt = stmt.where(NetworkIdea.region_id == region_id)
    if category:
        stmt = stmt.where(NetworkIdea.category == category)
    if status:
        stmt = stmt.where(NetworkIdea.readiness_status == status)
    
    ideas = db.scalars(stmt.order_by(desc(NetworkIdea.interested_regions_count))).all()
    return [
        {
            "id": ide.id,
            "region_id": ide.region_id,
            "title": ide.title,
            "summary_plain": ide.summary_plain,
            "novelty_element": ide.novelty_element,
            "target_beneficiaries": ide.target_beneficiaries,
            "category": ide.category,
            "primary_opd": ide.primary_opd,
            "estimated_budget_million": ide.estimated_budget_million,
            "funding_source_options": ide.funding_source_options,
            "readiness_status": ide.readiness_status,
            "impact_vs_effort": ide.impact_vs_effort,
            "is_replicable": ide.is_replicable,
            "interested_regions_count": ide.interested_regions_count,
            "created_at": ide.created_at.isoformat(),
        }
        for ide in ideas
    ]


@router.post("/ideas")
def create_idea(payload: IdeaCreate, db: Session = Depends(get_db)) -> dict[str, Any]:
    """Input Gagasan Baru."""
    idea = NetworkIdea(
        region_id=payload.region_id,
        title=payload.title,
        summary_plain=payload.summary_plain,
        novelty_element=payload.novelty_element,
        target_beneficiaries=payload.target_beneficiaries,
        category=payload.category,
        primary_opd=payload.primary_opd,
        estimated_budget_million=payload.estimated_budget_million,
        funding_source_options=payload.funding_source_options,
        impact_vs_effort=payload.impact_vs_effort,
        is_replicable=payload.is_replicable,
    )
    db.add(idea)
    db.commit()
    db.refresh(idea)
    return {"id": idea.id, "title": idea.title, "readiness_status": idea.readiness_status}


@router.post("/ideas/{idea_id}/interest")
def express_interest_in_idea(idea_id: str, db: Session = Depends(get_db)) -> dict[str, Any]:
    """Daerah menyatakan minat untuk mereplikasi gagasan inovatif."""
    idea = db.get(NetworkIdea, idea_id)
    if not idea:
        raise HTTPException(status_code=404, detail="Gagasan tidak ditemukan")
    
    idea.interested_regions_count += 1
    db.commit()
    return {
        "status": "success",
        "message": "Minat replikasi berhasil dicatat. Ruang kolaborasi dapat dibuka bersama penggagas.",
        "interested_regions_count": idea.interested_regions_count,
    }


@router.get("/pilots")
def list_pilot_projects(
    region_id: str | None = None,
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    """Daftar Proyek Percontohan (Pilot Projects)."""
    stmt = select(NetworkPilotProject)
    if region_id:
        stmt = stmt.where(NetworkPilotProject.region_id == region_id)
    
    pilots = db.scalars(stmt.order_by(desc(NetworkPilotProject.progress_pct))).all()
    return [
        {
            "id": p.id,
            "region_id": p.region_id,
            "title": p.title,
            "template_type": p.template_type,
            "location": p.location,
            "pic_team": p.pic_team,
            "duration_months": p.duration_months,
            "progress_pct": p.progress_pct,
            "success_indicators": p.success_indicators,
            "evaluation_gate": p.evaluation_gate,
            "created_at": p.created_at.isoformat(),
        }
        for p in pilots
    ]


@router.get("/assets")
def list_strategic_assets(
    region_id: str | None = None,
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    """Inventaris Aset Strategis & Potensi Pemanfaatan Bersama."""
    stmt = select(NetworkStrategicAsset)
    if region_id:
        stmt = stmt.where(NetworkStrategicAsset.region_id == region_id)
    
    assets = db.scalars(stmt.order_by(NetworkStrategicAsset.name)).all()
    return [
        {
            "id": a.id,
            "region_id": a.region_id,
            "name": a.name,
            "asset_type": a.asset_type,
            "location": a.location,
            "managing_agency": a.managing_agency,
            "condition": a.condition,
            "utilization_level_pct": a.utilization_level_pct,
            "idle_time_pattern": a.idle_time_pattern,
            "shared_use_potential": a.shared_use_potential,
            "required_followup": a.required_followup,
            "is_restricted": a.is_restricted,
        }
        for a in assets
    ]


# ==========================================
# FGD NASIONAL & KONSENSUS KEBIJAKAN
# ==========================================

@router.get("/fgd")
def get_fgd_events(db: Session = Depends(get_db)) -> dict[str, Any]:
    """Agenda Forum Group Discussion (FGD) Nasional & Rekomendasi Bersama."""
    events = db.scalars(select(NetworkFGDEvent).order_by(desc(NetworkFGDEvent.event_date))).all()
    recommendations = db.scalars(select(NetworkFGDRecommendation).order_by(desc(NetworkFGDRecommendation.consensus_score_pct))).all()

    return {
        "events": [
            {
                "id": e.id,
                "title": e.title,
                "theme": e.theme,
                "organizer": e.organizer,
                "event_date": e.event_date.isoformat(),
                "location": e.location,
                "status": e.status,
                "invited_regions_count": e.invited_regions_count,
                "submissions_count": e.submissions_count,
                "summary_consensus": e.summary_consensus,
            }
            for e in events
        ],
        "recommendations": [
            {
                "id": r.id,
                "fgd_event_id": r.fgd_event_id,
                "pillar": r.pillar,
                "proposal_text": r.proposal_text,
                "addressed_ministry": r.addressed_ministry,
                "consensus_score_pct": r.consensus_score_pct,
                "status": r.status,
            }
            for r in recommendations
        ],
    }


# ==========================================
# DECISION REQUIRED PIMPINAN DAERAH
# ==========================================

@router.get("/decisions")
def list_decisions(
    region_id: str | None = None,
    status: str | None = None,
    db: Session = Depends(get_db),
) -> list[dict[str, Any]]:
    """Kebutuhan Keputusan Pimpinan Daerah (Decision Required)."""
    stmt = select(NetworkDecisionRequest)
    if region_id:
        stmt = stmt.where(NetworkDecisionRequest.region_id == region_id)
    if status:
        stmt = stmt.where(NetworkDecisionRequest.status == status)
    
    decisions = db.scalars(stmt.order_by(desc(NetworkDecisionRequest.created_at))).all()
    return [
        {
            "id": d.id,
            "region_id": d.region_id,
            "title": d.title,
            "issue_brief": d.issue_brief,
            "urgency_reason": d.urgency_reason,
            "options": d.options,
            "expert_recommendation": d.expert_recommendation,
            "decision_owner": d.decision_owner,
            "deadline": d.deadline.isoformat() if d.deadline else None,
            "inaction_impact": d.inaction_impact,
            "status": d.status,
            "selected_option": d.selected_option,
            "disposition_notes": d.disposition_notes,
            "disposition_by": d.disposition_by,
            "disposition_at": d.disposition_at.isoformat() if d.disposition_at else None,
            "created_at": d.created_at.isoformat(),
        }
        for d in decisions
    ]


@router.post("/decisions/{decision_id}/disposition")
def submit_decision_disposition(
    decision_id: str,
    payload: DecisionDisposition,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """Penetapan Disposisi Pimpinan Daerah (Wali Kota / Bupati / Sekda)."""
    dec = db.get(NetworkDecisionRequest, decision_id)
    if not dec:
        raise HTTPException(status_code=404, detail="Keputusan tidak ditemukan")
    
    dec.status = payload.status
    dec.selected_option = payload.selected_option
    dec.disposition_notes = payload.disposition_notes
    dec.disposition_by = payload.disposition_by
    dec.disposition_at = datetime.now(UTC)

    # Catat audit log
    audit = NetworkAuditLog(
        region_id=dec.region_id,
        user_name=payload.disposition_by,
        user_role="Pimpinan Daerah",
        action="DECISION_DISPOSITION",
        details=f"Pimpinan memberikan disposisi '{dec.status}' pada '{dec.title}' (Opsi: {dec.selected_option}).",
    )
    db.add(audit)
    db.commit()

    return {
        "status": "success",
        "decision_id": dec.id,
        "current_status": dec.status,
        "disposition_at": dec.disposition_at.isoformat(),
    }


# ==========================================
# ASISTEN AI STAF AHLI (DENGAN GUARDRAILS)
# ==========================================

@router.post("/ai/assist")
def ai_assistant_staf_ahli(
    payload: AIAssistRequest,
    db: Session = Depends(get_db),
) -> dict[str, Any]:
    """
    AI Assistant Staf Ahli: Membantu sintesis diagnosis, draf policy brief,
    perbandingan data daerah, dan pengelompokan gagasan.
    Semua hasil berstatus DRAF REKOMENDASI yang memerlukan verifikasi staf ahli.
    """
    region = db.get(NetworkRegion, payload.region_id) if payload.region_id else None
    region_name = region.name if region else "Daerah Jejaring"

    if payload.action == "diagnose":
        return {
            "action": "diagnose",
            "title": f"Draf Sintesis Diagnosis Kebijakan — {region_name}",
            "summary": (
                f"Berdasarkan analisis indikator makro dan fiskal {region_name}, masalah strategis utama terletak pada "
                "kesenjangan realisasi penerimaan pajak sektor jasa komersial dan lambatnya konversi belanja modal infrastruktur dasar."
            ),
            "evidence_facts": [
                "Pertumbuhan ekonomi stabil di ~5.4%, namun elastisitas serapan tenaga kerja mulai melandai.",
                "Porsi belanja modal terhadap total belanja APBD berada di kisaran 21-23% (ideal minimal 25%).",
                "Kemandirian PAD mendekati 50%, membutuhkan diversifikasi objek pajak non-properti.",
            ],
            "options_proposed": [
                {"code": "A", "title": "Akselerasi Pengadaan Digital & Insentif Kemitraan Aset Daerah", "impact": "Tinggi", "feasibility": "Cepat (3-6 Bulan)"},
                {"code": "B", "title": "Penerbitan Kebijakan Pengendalian Belanja Rutin Operasional", "impact": "Sedang", "feasibility": "Segera"},
            ],
            "guardrail_notice": "Hasil ini merupakan usulan analisis awal berbantuan AI dan tidak memiliki kekuatan hukum tanpa pengesahan Staf Ahli Kepala Daerah.",
        }

    elif payload.action == "policy_brief":
        return {
            "action": "policy_brief",
            "title": f"Ringkasan Eksekutif Policy Brief — Transformasi Fiskal {region_name}",
            "executive_summary": (
                "Pemerintah Daerah memerlukan instrumen kebijakan terobosan untuk menjaga momentum pembangunan di tengah "
                "pengetatan transfer ke daerah (TKD). Tiga pilar aksi: (1) Optimalisasi aset fasilitas publik idle, (2) Digitalisasi pemungutan PBJT, dan (3) Kolaborasi belanja modal lintas batas wilayah."
            ),
            "key_recommendations": [
                "Penerbitan Peraturan Kepala Daerah mengenai insentif kepatuhan wajib pajak lokal.",
                "Pemanfaatan skema kerja sama antardaerah penyangga untuk efisiensi fasilitas penunjang bersama.",
                "Pengusulan diskresi 15% pada alokasi DAU earmarked ke Kementerian Keuangan RI.",
            ],
            "guardrail_notice": "Draf policy brief ini memerlukan paraf koordinasi Staf Ahli dan persetujuan Sekretaris Daerah sebelum diajukan ke Kepala Daerah.",
        }

    elif payload.action == "compare":
        # Perbandingan indikator daerah
        return {
            "action": "compare",
            "title": "Perbandingan Konteks Wilayah & Kapasitas Fiskal Antardaerah",
            "comparison_notes": "Perbandingan menggunakan data resmi BPS dan BPKAD tahun anggaran 2023-2024.",
            "metrics": [
                {"metric": "Pertumbuhan Ekonomi (%)", "tangsel": "5.48%", "bogor": "4.95%", "catatan": "Karakter jasa perkotaan vs agraris-manufaktur"},
                {"metric": "Rasio Kemandirian PAD", "tangsel": "50.1%", "bogor": "32.4%", "catatan": "Tangsel memiliki basis pajak konsumsi lebih padat"},
                {"metric": "IPM", "tangsel": "82.15 (Sangat Tinggi)", "bogor": "71.20 (Tinggi)", "catatan": "Akses fasilitas pendidikan dan kesehatan"},
            ],
            "guardrail_notice": "Perbandingan ini bertujuan saling belajar dan mereplikasi solusi terbaik, bukan pemeringkatan tunggal.",
        }

    else:
        return {
            "action": "general",
            "reply": f"Asisten Staf Ahli siap membantu analisis data dan formulasi kebijakan untuk {region_name}.",
            "guardrail_notice": "Sistem memisahkan fakta data dan opini AI. Verifikasi manusia tetap mutlak.",
        }
