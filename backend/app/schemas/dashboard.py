from __future__ import annotations

from typing import Any

from pydantic import BaseModel


class MetricCard(BaseModel):
    label: str
    value: int | float | str
    delta: str | None = None
    tone: str = "neutral"


class DashboardResponse(BaseModel):
    metrics: list[MetricCard]
    cases_by_status: dict[str, int]
    cases_by_category: dict[str, int]
    cases_by_priority: dict[str, int]
    map_points: list[dict[str, Any]]
    recent_activity: list[dict[str, Any]]
    executive_brief: str
    ai_watchlist: list[dict[str, Any]]
