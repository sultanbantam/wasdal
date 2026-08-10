from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.performance import PerformanceSummary
from app.services.performance_service import get_executive_summary

router = APIRouter()

@router.get("/summary", response_model=PerformanceSummary)
def read_performance_summary(db: Session = Depends(get_db)):
    """
    Get the overall executive performance summary (RPJMD/RKPD).
    """
    return get_executive_summary(db)
