from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.models import AuditLog, Case
from app.schemas.cases import CaseCreate, CaseUpdate


class CaseRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def next_number(self) -> str:
        year = datetime.now(UTC).year
        count = self.db.scalar(select(func.count(Case.id)).where(Case.created_at >= datetime(year, 1, 1, tzinfo=UTC))) or 0
        return f"WAS-{year}-{count + 1:05d}"

    def list(self, page: int, size: int, status: str | None = None, priority: str | None = None, query: str | None = None) -> tuple[list[Case], int]:
        stmt: Select[tuple[Case]] = select(Case).where(Case.deleted_at.is_(None))
        if status:
            stmt = stmt.where(Case.status == status)
        if priority:
            stmt = stmt.where(Case.priority == priority)
        if query:
            like = f"%{query}%"
            stmt = stmt.where(Case.title.ilike(like) | Case.description.ilike(like) | Case.number.ilike(like))

        total = self.db.scalar(select(func.count()).select_from(stmt.subquery())) or 0
        items = self.db.scalars(stmt.order_by(Case.created_at.desc()).offset((page - 1) * size).limit(size)).all()
        return list(items), total

    def get(self, case_id: str) -> Case | None:
        return self.db.scalar(select(Case).where(Case.id == case_id, Case.deleted_at.is_(None)))

    def create(self, payload: CaseCreate, actor_id: str | None = None) -> Case:
        data = payload.model_dump()
        if not data.get("number"):
            data["number"] = self.next_number()
        case = Case(**data, created_by_id=actor_id)
        self.db.add(case)
        self.db.flush()
        self.add_audit(case.id, actor_id, "case.created", {"number": case.number, "source": case.source})
        self.db.commit()
        self.db.refresh(case)
        return case

    def update(self, case: Case, payload: CaseUpdate, actor_id: str | None = None) -> Case:
        changed: dict[str, Any] = {}
        for key, value in payload.model_dump(exclude_unset=True).items():
            old_value = getattr(case, key)
            if old_value != value:
                setattr(case, key, value)
                changed[key] = {"from": old_value, "to": value}
        if changed:
            case.version += 1
            self.add_audit(case.id, actor_id, "case.updated", changed)
        self.db.commit()
        self.db.refresh(case)
        return case

    def add_audit(self, case_id: str | None, actor_id: str | None, action: str, details: dict[str, Any]) -> None:
        self.db.add(AuditLog(case_id=case_id, actor_id=actor_id, action=action, details=details))
