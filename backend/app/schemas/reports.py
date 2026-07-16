from __future__ import annotations

from pydantic import BaseModel


class ExecutiveSummaryResponse(BaseModel):
    title: str
    period: str
    summary: str
    key_risks: list[str]
    recommended_decisions: list[str]
    open_cases: int
    high_priority_cases: int
