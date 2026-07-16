from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import AuditLog, Case


class DashboardService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def build(self) -> dict:
        active_stmt = select(Case).where(Case.deleted_at.is_(None))
        cases = list(self.db.scalars(active_stmt).all())
        total = len(cases)
        new_cases = sum(1 for case in cases if case.status == "New")
        done_cases = sum(1 for case in cases if case.status in {"Resolved", "Closed"})
        now = datetime.now(UTC)
        late_cases = sum(1 for case in cases if case.due_date and case.due_date < now and case.status not in {"Resolved", "Closed"})
        high_priority = sum(1 for case in cases if case.priority in {"Critical", "High"})

        recent = list(
            self.db.scalars(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(8)).all()
        )
        watchlist = [
            {
                "number": case.number,
                "title": case.title,
                "priority": case.priority,
                "risk": case.ai_summary or case.description[:160],
                "agency": case.agency,
            }
            for case in sorted(cases, key=lambda item: item.priority_score, reverse=True)[:5]
        ]
        return {
            "metrics": [
                {"label": "Jumlah Kasus", "value": total, "delta": "+12% bulan ini", "tone": "neutral"},
                {"label": "Kasus Baru", "value": new_cases, "delta": "perlu triage", "tone": "warning"},
                {"label": "Kasus Selesai", "value": done_cases, "delta": "akumulatif", "tone": "success"},
                {"label": "Kasus Terlambat", "value": late_cases, "delta": "melewati SLA", "tone": "danger"},
                {"label": "Prioritas Tinggi", "value": high_priority, "delta": "Critical/High", "tone": "danger"},
            ],
            "cases_by_status": self._group(cases, "status"),
            "cases_by_category": self._group(cases, "category"),
            "cases_by_priority": self._group(cases, "priority"),
            "map_points": [
                {
                    "id": case.id,
                    "number": case.number,
                    "title": case.title,
                    "priority": case.priority,
                    "status": case.status,
                    "latitude": case.latitude,
                    "longitude": case.longitude,
                    "location_name": case.location_name,
                }
                for case in cases
                if case.latitude is not None and case.longitude is not None
            ],
            "recent_activity": [
                {
                    "action": item.action,
                    "case_id": item.case_id,
                    "details": item.details,
                    "created_at": item.created_at.isoformat(),
                }
                for item in recent
            ],
            "executive_brief": self._executive_brief(total, high_priority, late_cases),
            "ai_watchlist": watchlist,
        }

    def _group(self, cases: list[Case], field: str) -> dict[str, int]:
        result: dict[str, int] = {}
        for case in cases:
            value = getattr(case, field) or "Tidak diketahui"
            result[value] = result.get(value, 0) + 1
        return result

    def _executive_brief(self, total: int, high_priority: int, late_cases: int) -> str:
        return (
            f"Terdapat {total} kasus aktif dengan {high_priority} kasus prioritas tinggi. "
            f"{late_cases} kasus melewati SLA dan perlu keputusan atau eskalasi lintas OPD."
        )
