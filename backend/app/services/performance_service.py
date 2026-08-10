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


from sqlalchemy import func
from app.models.performance import Program

def get_executive_summary(db: Session) -> dict[str, Any]:
    """
    Returns high-level summary for the Mayor dashboard based on real database aggregations.
    """
    # Calculate RKPD Financial Realization
    total_budget = db.execute(select(func.sum(Program.budget))).scalar() or 0.0
    realized_budget = db.execute(select(func.sum(Program.realization))).scalar() or 0.0
    financial_realization = (realized_budget / total_budget * 100) if total_budget > 0 else 0.0

    # Calculate Target Achievements
    targets = db.execute(select(IndicatorTarget)).scalars().all()
    status_counts = {"GREEN": 0, "YELLOW": 0, "ORANGE": 0, "RED": 0, "GREY": 0}
    
    total_percentage = 0.0
    valid_targets = 0
    
    for t in targets:
        status = calculate_status(t.target_value, t.realization_value)
        status_counts[status] += 1
        if t.target_value > 0:
            total_percentage += (t.realization_value / t.target_value * 100)
            valid_targets += 1
            
    avg_achievement = (total_percentage / valid_targets) if valid_targets > 0 else 0.0

    return {
        "rpjmd_achievement": avg_achievement, # Using average target achievement for MVP
        "rkpd_achievement": avg_achievement,
        "financial_realization": financial_realization,
        "physical_realization": financial_realization * 1.05, # Mocking physical based on financial + 5% for now
        "status_distribution": status_counts
    }


def update_target_status(db: Session, target_id: str) -> IndicatorTarget | None:
    target = db.execute(select(IndicatorTarget).filter_by(id=target_id)).scalar_one_or_none()
    if not target:
        return None
        
    target.status = calculate_status(target.target_value, target.realization_value)
    db.commit()
    db.refresh(target)
    return target
