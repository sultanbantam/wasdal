from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy import select
from sqlalchemy.orm import Session
import tempfile
import os
from openai import OpenAI

from app.db.session import get_db
from app.models import MeetingRecord
from app.core.config import get_settings

router = APIRouter()

@router.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)) -> dict:
    settings = get_settings()
    if not settings.openai_api_key:
        raise HTTPException(status_code=500, detail="OpenAI API Key is not configured")
    
    client = OpenAI(api_key=settings.openai_api_key)
    
    # Save the uploaded file temporarily
    suffix = os.path.splitext(file.filename)[1].lower() if file.filename else ".m4a"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    try:
        if suffix == ".pdf":
            import pypdf
            text = ""
            with open(tmp_path, "rb") as f:
                reader = pypdf.PdfReader(f)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
            return {"text": text}
        elif suffix in [".txt", ".md", ".csv"]:
            with open(tmp_path, "r", encoding="utf-8") as f:
                return {"text": f.read()}
        else:
            # Assume audio and send to Whisper
            with open(tmp_path, "rb") as audio_file:
                transcript = client.audio.transcriptions.create(
                    model="whisper-1",
                    file=audio_file
                )
            return {"text": transcript.text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

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
