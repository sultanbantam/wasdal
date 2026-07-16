from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import MeetingRecord

router = APIRouter()


@router.get("")
def list_meetings(db: Session = Depends(get_db)) -> list[dict]:
    records = db.scalars(select(MeetingRecord).order_by(MeetingRecord.created_at.desc())).all()
    return [
        {
            "id": item.id,
            "title": item.title,
            "summary": item.summary,
            "decisions": item.decisions,
            "action_items": item.action_items,
            "confidence": item.confidence,
            "created_at": item.created_at.isoformat(),
        }
        for item in records
    ]


@router.get("/{record_id}")
def get_meeting(record_id: str, db: Session = Depends(get_db)) -> dict:
    record = db.get(MeetingRecord, record_id)
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rekaman rapat tidak ditemukan")
    return {
        "id": record.id,
        "title": record.title,
        "transcript": record.transcript,
        "summary": record.summary,
        "decisions": record.decisions,
        "action_items": record.action_items,
        "minutes": record.minutes,
        "confidence": record.confidence,
        "created_at": record.created_at.isoformat(),
    }
