from __future__ import annotations

from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.models import Case
from app.repositories.cases import CaseRepository
from app.schemas import CaseAssign, CaseCommentCreate, CaseCreate, CaseStatusUpdate, CaseUpdate


class CaseService:
    def __init__(self, db: Session) -> None:
        self.db = db
        self.repo = CaseRepository(db)

    def create_case(self, payload: CaseCreate, actor_id: str | None = None) -> Case:
        return self.repo.create(payload, actor_id=actor_id)

    def update_case(self, case: Case, payload: CaseUpdate, actor_id: str | None = None) -> Case:
        return self.repo.update(case, payload, actor_id=actor_id)

    def assign_case(self, case: Case, payload: CaseAssign, actor_id: str | None = None) -> Case:
        timeline = list(case.timeline or [])
        timeline.append(
            {
                "type": "assignment",
                "at": datetime.now(UTC).isoformat(),
                "pic": payload.pic,
                "agency": payload.agency,
                "reason": payload.reason,
            }
        )
        update = CaseUpdate(
            pic=payload.pic,
            agency=payload.agency,
            due_date=payload.due_date,
            status="Assigned",
        )
        updated = self.repo.update(case, update, actor_id=actor_id)
        updated.timeline = timeline
        self.repo.add_audit(case.id, actor_id, "case.assigned", payload.model_dump())
        self.db.commit()
        self.db.refresh(updated)
        return updated

    def add_comment(self, case: Case, payload: CaseCommentCreate, actor_id: str | None = None) -> Case:
        comments = list(case.comments or [])
        comments.append(
            {
                "author": payload.author,
                "body": payload.body,
                "visibility": payload.visibility,
                "at": datetime.now(UTC).isoformat(),
            }
        )
        case.comments = comments
        case.version += 1
        self.repo.add_audit(case.id, actor_id, "case.comment_added", payload.model_dump())
        self.db.commit()
        self.db.refresh(case)
        return case

    def update_status(self, case: Case, payload: CaseStatusUpdate, actor_id: str | None = None) -> Case:
        timeline = list(case.timeline or [])
        timeline.append(
            {
                "type": "status",
                "from": case.status,
                "to": payload.status,
                "note": payload.note,
                "at": datetime.now(UTC).isoformat(),
            }
        )
        closed_at = datetime.now(UTC) if payload.status in {"Resolved", "Closed"} else None
        case.status = payload.status
        case.closed_at = closed_at
        case.timeline = timeline
        case.version += 1
        self.repo.add_audit(case.id, actor_id, "case.status_changed", payload.model_dump())
        self.db.commit()
        self.db.refresh(case)
        return case
