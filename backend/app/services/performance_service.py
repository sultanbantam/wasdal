from typing import Any

from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.performance import RPJMD, IndicatorTarget, PerformanceIndicator


def calculate_status(target: float, realization: float) -> str:
    """
    Rule-based status calculation for MVP.
    """
    if target == 0:
        return "GREY"
    
    percentage = (realization / target) * 100
    
    if percentage >= 90:
        return "GREEN"
    elif percentage >= 70:
        return "YELLOW"
    elif percentage >= 50:
        return "ORANGE"
    else:
        return "RED"


def get_executive_summary(db: Session) -> dict[str, Any]:
    """
    Returns high-level summary for the Mayor dashboard.
    """
    # For MVP, we can return some mock/aggregated data
    # In a real scenario, this would aggregate from the DB
    return {
        "rpjmd_achievement": 68.5,
        "rkpd_achievement": 72.1,
        "financial_realization": 54.2,
        "physical_realization": 58.9,
        "status_distribution": {
            "GREEN": 120,
            "YELLOW": 45,
            "ORANGE": 15,
            "RED": 8,
            "GREY": 2
        }
    }


def update_target_status(db: Session, target_id: str) -> IndicatorTarget | None:
    target = db.execute(select(IndicatorTarget).filter_by(id=target_id)).scalar_one_or_none()
    if not target:
        return None
        
    target.status = calculate_status(target.target_value, target.realization_value)
    db.commit()
    db.refresh(target)
    return target
