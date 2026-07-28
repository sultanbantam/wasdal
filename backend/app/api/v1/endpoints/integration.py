from typing import Any
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.orm import Session
from datetime import UTC, datetime, timedelta

from app.db.session import get_db
from app.core.config import get_settings
from app.schemas.integration import ExternalReportCreate
from app.schemas.cases import CaseCreate
from app.services.case_service import CaseService
from app.services.ai_orchestrator import AIOrchestrator

router = APIRouter()

def verify_api_key(x_api_key: str = Header(..., description="API Key for external integrations")):
    settings = get_settings()
    if x_api_key != settings.integration_api_key:
        raise HTTPException(status_code=403, detail="Invalid API Key")

@router.post("/reports", response_model=dict, dependencies=[Depends(verify_api_key)])
def receive_external_report(
    payload: ExternalReportCreate,
    db: Session = Depends(get_db),
) -> Any:
    """
    Webhook endpoint to receive reports from external systems like SP4N-LAPOR! or Tangsel ONE.
    """
    # 1. Initialize services
    ai_orchestrator = AIOrchestrator()
    case_service = CaseService(db)

    # 2. Run AI Intake to analyze the external report
    ai_result = ai_orchestrator.intake(
        raw_text=payload.description,
        source=payload.source,
        attachments=[]
    )

    # 3. Construct the Case object for DB based on payload and AI recommendations
    case_create = CaseCreate(
        number=payload.report_id,
        title=payload.title,
        description=payload.description,
        source=payload.source,
        category=ai_result.get("category", "Lainnya"),
        subcategory=ai_result.get("subcategory"),
        location_name=payload.location_name,
        latitude=payload.latitude,
        longitude=payload.longitude,
        reporter_name=payload.reporter_name,
        status="New",
        priority=ai_result.get("priority", "Low"),
        severity="Moderate",  # Can be inferred by AI later
        priority_score=ai_result.get("priority_score", 0.0),
        agency=ai_result.get("agency"),
        pic=ai_result.get("agency"),
        due_date=datetime.now(UTC) + timedelta(days=7), # Default SLA
        ai_summary=ai_result.get("ai_summary"),
        ai_confidence=ai_result.get("ai_confidence", 0.0),
        suggested_solution=ai_result.get("suggested_solution", []),
    )

    # 4. Save to DB
    case = case_service.create_case(case_create, actor_id=None)

    return {
        "status": "success",
        "message": "Report received, analyzed, and saved successfully.",
        "case_id": case.id,
        "case_number": case.number
    }
