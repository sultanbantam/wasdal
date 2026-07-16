from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas import ExecutiveSummaryResponse
from app.services.report_service import ReportService

router = APIRouter()


@router.get("/executive-summary", response_model=ExecutiveSummaryResponse)
def executive_summary(
    period: str = Query(default="Bulan berjalan"),
    db: Session = Depends(get_db),
) -> ExecutiveSummaryResponse:
    return ReportService(db).executive_summary(period=period)
