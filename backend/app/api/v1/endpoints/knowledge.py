from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
import tempfile
import os
import json
from openai import OpenAI
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import KnowledgeDocument
from app.schemas import KnowledgeCreate, KnowledgeRead
from app.core.config import get_settings

router = APIRouter()


@router.get("", response_model=list[KnowledgeRead])
def list_knowledge(q: str | None = Query(default=None), db: Session = Depends(get_db)) -> list[KnowledgeDocument]:
    stmt = select(KnowledgeDocument).where(KnowledgeDocument.deleted_at.is_(None))
    if q:
        stmt = stmt.where(
            (KnowledgeDocument.title.ilike(f"%{q}%")) |
            (KnowledgeDocument.document_type.ilike(f"%{q}%")) |
            (KnowledgeDocument.summary.ilike(f"%{q}%"))
        )
    return list(db.scalars(stmt).all())


@router.post("", response_model=KnowledgeRead, status_code=status.HTTP_201_CREATED)
def create_knowledge(payload: KnowledgeCreate, db: Session = Depends(get_db)) -> KnowledgeDocument:
    doc = KnowledgeDocument(**payload.model_dump())
    if doc.chunk_count is None or doc.chunk_count == 0:
        # fallback simple chunking logic if not provided
        doc.chunk_count = len(doc.summary or "") // 500 if doc.summary else 1
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

@router.post("/upload", response_model=KnowledgeRead, status_code=status.HTTP_201_CREATED)
async def upload_knowledge(file: UploadFile = File(...), db: Session = Depends(get_db)) -> KnowledgeDocument:
    settings = get_settings()
    if not settings.openai_api_key:
        raise HTTPException(status_code=500, detail="OpenAI API Key is not configured")
    
    client = OpenAI(api_key=settings.openai_api_key)
    
    suffix = os.path.splitext(file.filename)[1].lower() if file.filename else ".pdf"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        content = await file.read()
        tmp.write(content)
        tmp_path = tmp.name

    text = ""
    try:
        if suffix == ".pdf":
            import pypdf
            with open(tmp_path, "rb") as f:
                reader = pypdf.PdfReader(f)
                for page in reader.pages:
                    text += page.extract_text() + "\n"
        elif suffix in [".txt", ".md", ".csv"]:
            with open(tmp_path, "r", encoding="utf-8") as f:
                text = f.read()
        else:
            raise HTTPException(status_code=400, detail="Format dokumen tidak didukung")
        
        # Analyze with AI
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a smart assistant for Wasdal (Pengawasan dan Pengendalian). Analyze the provided document text and extract: title, document_type (e.g. SOP, RPJMD, Perda, Laporan), a brief summary, and a list of 2-4 tags. Return ONLY a valid JSON object with keys: title, document_type, summary, tags."},
                {"role": "user", "content": f"Text: {text[:10000]}"}
            ],
            response_format={"type": "json_object"}
        )
        
        ai_data = json.loads(completion.choices[0].message.content)
        
        doc = KnowledgeDocument(
            title=ai_data.get("title", file.filename),
            document_type=ai_data.get("document_type", "Dokumen"),
            summary=ai_data.get("summary", ""),
            tags=ai_data.get("tags", []),
            chunk_count=len(text) // 500 or 1
        )
        db.add(doc)
        db.commit()
        db.refresh(doc)
        return doc
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


@router.get("/{document_id}", response_model=KnowledgeRead)
def get_knowledge(document_id: str, db: Session = Depends(get_db)) -> KnowledgeDocument:
    doc = db.get(KnowledgeDocument, document_id)
    if not doc or doc.deleted_at:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dokumen tidak ditemukan")
    return doc
