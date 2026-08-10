from pydantic import BaseModel

class PerformanceSummary(BaseModel):
    rpjmd_achievement: float
    rkpd_achievement: float
    financial_realization: float
    physical_realization: float
    status_distribution: dict[str, int]
