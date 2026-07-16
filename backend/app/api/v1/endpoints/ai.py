from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models import MeetingRecord, User
from app.schemas import CaseCreate, IntakeRequest, IntakeResult, MeetingRequest, MeetingResult
from app.services.ai_orchestrator import AIOrchestrator
from app.services.case_service import CaseService

router = APIRouter()


@router.post("/intake", response_model=IntakeResult)
def intake(
    payload: IntakeRequest,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user),
) -> IntakeResult:
    result = AIOrchestrator().intake(payload.raw_text, payload.source, payload.attachments)
    case_id: str | None = None
    if payload.create_case:
        deadline = None
        if result.get("suggested_deadline"):
            deadline = datetime.fromisoformat(result["suggested_deadline"])
        case = CaseService(db).create_case(
            CaseCreate(
                title=result["summary"][:180] or "Laporan Wasdal",
                description=payload.raw_text,
                category=result["category"],
                subcategory=result["subcategory"],
                location_name=result["location_name"],
                latitude=result["latitude"],
                longitude=result["longitude"],
                reporter_name=payload.reporter_name,
                source=payload.source,
                status="Triage",
                priority=result["priority"],
                severity=result["severity"],
                priority_score=result["priority_score"],
                agency=result["suggested_agency"],
                due_date=deadline,
                attachments=[{"name": item, "type": "external"} for item in payload.attachments],
                ai_summary=result["summary"],
                ai_confidence=result["confidence"],
                suggested_solution=result["recommendations"],
            ),
            actor_id=user.id if user else None,
        )
        case_id = case.id
    return IntakeResult(**result, case_id=case_id)


@router.post("/meeting", response_model=MeetingResult)
def meeting(payload: MeetingRequest, db: Session = Depends(get_db)) -> MeetingResult:
    result = AIOrchestrator().meeting(payload.title, payload.transcript)
    record_id: str | None = None
    if payload.save_record:
        record = MeetingRecord(**result)
        db.add(record)
        db.commit()
        db.refresh(record)
        record_id = record.id
    return MeetingResult(**result, record_id=record_id)
