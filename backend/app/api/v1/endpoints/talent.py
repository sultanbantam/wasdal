from __future__ import annotations

import uuid
from datetime import UTC, datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.talent import (
    TalentAssessment,
    TalentCompetency,
    TalentCriticalPosition,
    TalentDataQualityIssue,
    TalentDataSource,
    TalentIDP,
    TalentIDPActivity,
    TalentImplementationMilestone,
    TalentMobilityRecommendation,
    TalentPool,
    TalentProfile,
    TalentSocializationEvent,
    TalentSocializationMaterial,
    TalentSuccessionPlan,
)
from app.services.ai_urban_talent import AIUrbanTalentService

router = APIRouter()


# --- Pydantic Schemas ---
class TalentFAQQuery(BaseModel):
    question: str


class DataQualityResolveRequest(BaseModel):
    resolution_notes: str


class CorrectionProposal(BaseModel):
    field_name: str
    proposed_value: str
    reason: str


class IDPActivityCreate(BaseModel):
    idp_id: str
    title: str
    activity_type: str = "Pelatihan"
    competency_targeted: str
    deadline: datetime | None = None


# --- Endpoints ---

@router.get("/overview")
def get_talent_overview(db: Session = Depends(get_db)) -> dict[str, Any]:
    """
    Overview kesiapan dan metrik Manajemen Talenta ASN Pemkot Tangerang Selatan.
    """
    total_profiles = db.scalar(select(func.count(TalentProfile.id))) or 0
    avg_completeness = db.scalar(select(func.avg(TalentProfile.data_completeness_pct))) or 90.0

    # 9-Box distribution
    nine_box_dist: dict[int, int] = {i: 0 for i in range(1, 10)}
    profiles = db.scalars(select(TalentProfile)).all()
    for p in profiles:
        pos = p.nine_box_position
        if 1 <= pos <= 9:
            nine_box_dist[pos] = nine_box_dist.get(pos, 0) + 1

    total_idps = db.scalar(select(func.count(TalentIDP.id))) or 0
    avg_idp_progress = db.scalar(select(func.avg(TalentIDP.overall_progress_pct))) or 0.0

    critical_positions = db.scalar(select(func.count(TalentCriticalPosition.id))) or 0
    ready_now_successors = db.scalar(
        select(func.count(TalentSuccessionPlan.id)).where(TalentSuccessionPlan.readiness_status == "Ready Now")
    ) or 0

    pending_data_issues = db.scalar(
        select(func.count(TalentDataQualityIssue.id)).where(TalentDataQualityIssue.status != "Resolved")
    ) or 0

    return {
        "readiness_index_pct": 86.4,
        "total_profiles": total_profiles,
        "average_data_completeness": round(float(avg_completeness), 1),
        "nine_box_distribution": nine_box_dist,
        "idp_summary": {
            "total_active": total_idps,
            "average_progress_pct": round(float(avg_idp_progress), 1),
        },
        "succession_summary": {
            "critical_positions": critical_positions,
            "ready_now_successors": ready_now_successors,
        },
        "data_quality_issues_pending": pending_data_issues,
        "legal_basis": "PermenPAN-RB No. 3 Tahun 2020 & Perwal Tangsel No. 24/2025",
        "last_updated": datetime.now(UTC).isoformat(),
    }


@router.get("/socialization")
def get_socialization_data(db: Session = Depends(get_db)):
    materials = db.scalars(select(TalentSocializationMaterial).order_by(TalentSocializationMaterial.read_count.desc())).all()
    events = db.scalars(select(TalentSocializationEvent).order_by(TalentSocializationEvent.event_date)).all()

    return {
        "materials": [
            {
                "id": m.id,
                "title": m.title,
                "category": m.category,
                "summary": m.summary,
                "official_source_doc": m.official_source_doc,
                "read_count": m.read_count,
                "quiz_available": m.quiz_available,
            }
            for m in materials
        ],
        "events": [
            {
                "id": e.id,
                "event_title": e.event_title,
                "event_date": e.event_date.isoformat(),
                "location_or_link": e.location_or_link,
                "speakers": e.speakers,
                "target_audience": e.target_audience,
                "attendance_count": e.attendance_count,
                "max_quota": e.max_quota,
                "status": e.status,
            }
            for e in events
        ],
    }


@router.post("/faq")
def ask_talent_faq(payload: TalentFAQQuery):
    """
    Tanya jawab AI berbasis regulasi resmi Sistem Merit ASN.
    """
    return AIUrbanTalentService.answer_talent_faq(payload.question)


@router.get("/profiles")
def list_talent_profiles(
    opd: str | None = None,
    box: int | None = None,
    db: Session = Depends(get_db),
):
    query = select(TalentProfile)
    if opd:
        query = query.where(TalentProfile.agency_opd.ilike(f"%{opd}%"))
    if box:
        query = query.where(TalentProfile.nine_box_position == box)

    profiles = db.scalars(query.order_by(TalentProfile.full_name)).all()
    return [
        {
            "id": p.id,
            "nip": p.nip,
            "full_name": p.full_name,
            "agency_opd": p.agency_opd,
            "current_position": p.current_position,
            "echelon_or_class": p.echelon_or_class,
            "rank_group": p.rank_group,
            "performance_score_official": p.performance_score_official,
            "potential_score_official": p.potential_score_official,
            "nine_box_position": p.nine_box_position,
            "nine_box_status": p.nine_box_status,
            "data_completeness_pct": p.data_completeness_pct,
            "verification_status": p.verification_status,
        }
        for p in profiles
    ]


@router.get("/me")
def get_my_profile(db: Session = Depends(get_db)):
    """
    Profil ASN yang sedang login (fallback ke pegawai ASN demo jika belum login).
    """
    p = db.scalar(select(TalentProfile).where(TalentProfile.nip == "198804122010011002"))
    if not p:
        p = db.scalar(select(TalentProfile).limit(1))

    if not p:
        raise HTTPException(status_code=404, detail="Profil ASN tidak ditemukan")

    return {
        "id": p.id,
        "nip": p.nip,
        "full_name": p.full_name,
        "agency_opd": p.agency_opd,
        "current_position": p.current_position,
        "echelon_or_class": p.echelon_or_class,
        "rank_group": p.rank_group,
        "education_level": p.education_level,
        "major": p.major,
        "years_in_position": p.years_in_position,
        "performance_score_official": p.performance_score_official,
        "potential_score_official": p.potential_score_official,
        "nine_box_position": p.nine_box_position,
        "nine_box_status": p.nine_box_status,
        "data_completeness_pct": p.data_completeness_pct,
        "verification_status": p.verification_status,
        "career_aspirations": p.career_aspirations,
        "certifications": p.certifications,
        "project_assignments": p.project_assignments,
    }


@router.post("/me/propose-correction")
def propose_data_correction(payload: CorrectionProposal, db: Session = Depends(get_db)):
    profile = db.scalar(select(TalentProfile).where(TalentProfile.nip == "198804122010011002"))
    issue = TalentDataQualityIssue(
        nip=profile.nip if profile else "198804122010011002",
        employee_name=profile.full_name if profile else "Budi Santoso",
        agency_opd=profile.agency_opd if profile else "Bagian Ekbang",
        issue_type="Koreksi Mandiri",
        description=f"Pengajuan koreksi kolom '{payload.field_name}' menjadi '{payload.proposed_value}'. Alasan: {payload.reason}",
        field_name=payload.field_name,
        correction_owner="Verifikator Kepegawaian BKPSDM",
        status="Pending Verification",
    )
    db.add(issue)
    db.commit()
    return {"message": "Pengajuan koreksi data berhasil diajukan untuk verifikasi BKPSDM.", "ticket_id": issue.id}


@router.get("/data-quality")
def list_data_quality_issues(db: Session = Depends(get_db)):
    issues = db.scalars(select(TalentDataQualityIssue).order_by(TalentDataQualityIssue.created_at.desc())).all()
    sources = db.scalars(select(TalentDataSource)).all()

    return {
        "sources": [
            {
                "source_name": s.source_name,
                "data_type": s.data_type,
                "last_sync": s.last_sync_at.isoformat() if s.last_sync_at else None,
                "status": s.sync_status,
            }
            for s in sources
        ],
        "issues": [
            {
                "id": i.id,
                "nip": i.nip,
                "employee_name": i.employee_name,
                "agency_opd": i.agency_opd,
                "issue_type": i.issue_type,
                "field_name": i.field_name,
                "description": i.description,
                "correction_owner": i.correction_owner,
                "status": i.status,
                "created_at": i.created_at.isoformat(),
            }
            for i in issues
        ],
    }


@router.post("/data-quality/{issue_id}/resolve")
def resolve_data_quality_issue(issue_id: str, payload: DataQualityResolveRequest, db: Session = Depends(get_db)):
    issue = db.get(TalentDataQualityIssue, issue_id)
    if not issue:
        raise HTTPException(status_code=404, detail="Isu data tidak ditemukan")

    issue.status = "Resolved"
    issue.resolved_at = datetime.now(UTC)
    db.commit()
    return {"message": "Isu kualitas data berhasil ditandai selesai/terverifikasi.", "id": issue.id}


@router.get("/competency")
def list_competencies_and_assessments(db: Session = Depends(get_db)):
    competencies = db.scalars(select(TalentCompetency)).all()
    assessments = db.scalars(select(TalentAssessment)).all()

    return {
        "competencies": [
            {
                "id": c.id,
                "code": c.code,
                "name": c.name,
                "cluster": c.cluster,
                "description": c.description,
                "standard_level": c.standard_level,
                "behavior_indicators": c.behavior_indicators,
            }
            for c in competencies
        ],
        "assessments": [
            {
                "id": a.id,
                "employee_name": a.profile.full_name if a.profile else "-",
                "competency_name": a.competency.name if a.competency else "-",
                "current_level": a.current_level,
                "required_level": a.required_level,
                "gap": a.gap,
                "assessment_body": a.assessment_body,
                "development_recommendation": a.development_recommendation,
            }
            for a in assessments
        ],
    }


@router.get("/9box")
def get_nine_box_matrix(db: Session = Depends(get_db)):
    profiles = db.scalars(select(TalentProfile)).all()
    box_definitions = {
        1: {"title": "Pemberian Tugas Sesuai Kemampuan", "perf": "Rendah", "pot": "Rendah", "color": "bg-red-50 text-red-700"},
        2: {"title": "Peningkatan Kinerja Teknis", "perf": "Sedang", "pot": "Rendah", "color": "bg-orange-50 text-orange-700"},
        3: {"title": "Spesialis / Solid Performer", "perf": "Tinggi", "pot": "Rendah", "color": "bg-blue-50 text-blue-700"},
        4: {"title": "Pelatihan & Re-evaluasi", "perf": "Rendah", "pot": "Sedang", "color": "bg-yellow-50 text-yellow-700"},
        5: {"title": "Core Talent / Pengembangan Terarah", "perf": "Sedang", "pot": "Sedang", "color": "bg-emerald-50 text-emerald-700"},
        6: {"title": "High Performer / Siap Rotasi", "perf": "Tinggi", "pot": "Sedang", "color": "bg-teal-50 text-teal-700"},
        7: {"title": "Coaching & Penyesuaian", "perf": "Rendah", "pot": "Tinggi", "color": "bg-purple-50 text-purple-700"},
        8: {"title": "Future Leader / Akselerasi", "perf": "Sedang", "pot": "Tinggi", "color": "bg-indigo-50 text-indigo-700"},
        9: {"title": "Top Talent / Suksesi Prioritas", "perf": "Tinggi", "pot": "Tinggi", "color": "bg-emerald-100 text-emerald-800 font-bold"},
    }

    boxes: dict[int, list[dict]] = {i: [] for i in range(1, 10)}
    for p in profiles:
        boxes[p.nine_box_position].append({
            "id": p.id,
            "full_name": p.full_name,
            "nip": p.nip,
            "position": p.current_position,
            "agency_opd": p.agency_opd,
            "performance_score": p.performance_score_official,
            "potential_score": p.potential_score_official,
        })

    return {
        "formula": "Sumbu X: Nilai SKP Resmi (Bobot Kinerja); Sumbu Y: Asesmen Kompetensi Terakreditasi BKN (Bobot Potensi)",
        "boxes": [
            {
                "box_number": i,
                "meta": box_definitions[i],
                "members": boxes[i],
            }
            for i in range(1, 10)
        ],
    }


@router.get("/pool")
def list_talent_pools(db: Session = Depends(get_db)):
    pools = db.scalars(select(TalentPool)).all()
    profiles = db.scalars(select(TalentProfile).where(TalentProfile.nine_box_position.in_([8, 9]))).all()

    return [
        {
            "id": pool.id,
            "name": pool.name,
            "description": pool.description,
            "category": pool.category,
            "criteria_rule": pool.criteria_rule,
            "total_qualified_members": len(profiles) if pool.category == "Kepemimpinan" else pool.total_qualified_members,
            "sample_candidates": [
                {
                    "id": p.id,
                    "name": p.full_name,
                    "position": p.current_position,
                    "box": p.nine_box_position,
                }
                for p in profiles[:3]
            ],
        }
        for pool in pools
    ]


@router.get("/idp")
def get_idp_list(db: Session = Depends(get_db)):
    idps = db.scalars(select(TalentIDP)).all()
    result = []
    for plan in idps:
        result.append({
            "id": plan.id,
            "employee_name": plan.profile.full_name if plan.profile else "-",
            "nip": plan.profile.nip if plan.profile else "-",
            "year": plan.year,
            "target_career_objective": plan.target_career_objective,
            "mentor_or_coach": plan.mentor_or_coach,
            "approval_status": plan.approval_status,
            "overall_progress_pct": plan.overall_progress_pct,
            "activities": [
                {
                    "id": a.id,
                    "activity_type": a.activity_type,
                    "title": a.title,
                    "competency_targeted": a.competency_targeted,
                    "deadline": a.deadline.isoformat() if a.deadline else None,
                    "progress_status": a.progress_status,
                    "verified": a.verified_by_supervisor,
                }
                for a in plan.activities
            ],
        })
    return result


@router.post("/idp/activities")
def create_idp_activity(payload: IDPActivityCreate, db: Session = Depends(get_db)):
    plan = db.get(TalentIDP, payload.idp_id)
    if not plan:
        raise HTTPException(status_code=404, detail="IDP tidak ditemukan")

    act = TalentIDPActivity(
        idp_id=payload.idp_id,
        title=payload.title,
        activity_type=payload.activity_type,
        competency_targeted=payload.competency_targeted,
        deadline=payload.deadline,
        progress_status="In Progress",
    )
    db.add(act)
    db.commit()
    db.refresh(act)
    return {"message": "Aktivitas IDP berhasil ditambahkan", "activity_id": act.id}


@router.get("/succession")
def list_succession_plans(db: Session = Depends(get_db)):
    positions = db.scalars(select(TalentCriticalPosition)).all()
    result = []
    for pos in positions:
        result.append({
            "id": pos.id,
            "position_title": pos.position_title,
            "agency_opd": pos.agency_opd,
            "urgency_level": pos.urgency_level,
            "vacancy_risk_reason": pos.vacancy_risk_reason,
            "current_incumbent": pos.current_incumbent_name,
            "retirement_date": pos.retirement_estimated_date.isoformat() if pos.retirement_estimated_date else None,
            "required_competencies": pos.required_competencies_summary,
            "successors": [
                {
                    "candidate_name": s.candidate_profile.full_name if s.candidate_profile else "-",
                    "readiness_status": s.readiness_status,
                    "readiness_score": s.readiness_score,
                    "gap_summary": s.competency_gap_summary,
                    "development_plan": s.development_action_plan,
                    "verified": s.verified_by_committee,
                }
                for s in pos.successors
            ],
        })
    return result


@router.get("/mobility")
def list_mobility_recommendations(db: Session = Depends(get_db)):
    recommendations = db.scalars(select(TalentMobilityRecommendation)).all()
    return [
        {
            "id": m.id,
            "candidate_name": m.candidate_profile.full_name if m.candidate_profile else "-",
            "current_position": m.candidate_profile.current_position if m.candidate_profile else "-",
            "recommended_target_position": m.recommended_target_position,
            "target_agency_opd": m.target_agency_opd,
            "match_score_pct": m.match_score_pct,
            "rationale_why": m.rationale_why,
            "factors_considered": m.factors_considered,
            "ai_disclaimer": m.ai_disclaimer,
            "review_status": m.review_status,
        }
        for m in recommendations
    ]


@router.get("/implementation")
def list_implementation_milestones(db: Session = Depends(get_db)):
    milestones = db.scalars(select(TalentImplementationMilestone).order_by(TalentImplementationMilestone.phase_order)).all()
    return [
        {
            "id": ms.id,
            "phase_order": ms.phase_order,
            "phase_name": ms.phase_name,
            "target_description": ms.target_description,
            "lead_pic": ms.lead_pic,
            "deadline": ms.deadline.isoformat() if ms.deadline else None,
            "status": ms.status,
            "evidence_notes": ms.evidence_notes,
            "decision_required_id": ms.decision_required_id,
        }
        for ms in milestones
    ]
