from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from sqlalchemy import select
from sqlalchemy.orm import Session
import tempfile
import os
from openai import OpenAI

from app.db.session import get_db
from app.models import MeetingRecord
from app.core.config import get_settings
from app.services.audio_processor import process_document_or_audio

router = APIRouter()

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)) -> dict:
    settings = get_settings()
    if not settings.openai_api_key:
        raise HTTPException(status_code=500, detail="OpenAI API Key is not configured")
    
    client = OpenAI(
        api_key=settings.openai_api_key,
        base_url=settings.openai_base_url or "https://api.openai.com/v1"
    )
    
    # Save the uploaded file temporarily
    suffix = os.path.splitext(file.filename)[1].lower() if file.filename else ".m4a"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        text = process_document_or_audio(tmp_path, suffix, client)
        return {"text": text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except Exception:
                pass


@router.get("")
def list_meetings(q: str | None = Query(default=None), db: Session = Depends(get_db)) -> list[dict]:
    stmt = select(MeetingRecord)
    if q:
        stmt = stmt.where(
            (MeetingRecord.title.ilike(f"%{q}%")) |
            (MeetingRecord.summary.ilike(f"%{q}%"))
        )
    records = db.scalars(stmt.order_by(MeetingRecord.created_at.desc())).all()
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
