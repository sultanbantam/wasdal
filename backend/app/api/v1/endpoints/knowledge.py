from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models import KnowledgeDocument
from app.schemas import KnowledgeCreate, KnowledgeRead

router = APIRouter()


@router.get("", response_model=list[KnowledgeRead])
def list_knowledge(db: Session = Depends(get_db)) -> list[KnowledgeDocument]:
    return list(db.scalars(select(KnowledgeDocument).where(KnowledgeDocument.deleted_at.is_(None))).all())


@router.post("", response_model=KnowledgeRead, status_code=status.HTTP_201_CREATED)
def create_knowledge(payload: KnowledgeCreate, db: Session = Depends(get_db)) -> KnowledgeDocument:
    doc = KnowledgeDocument(**payload.model_dump())
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("/{document_id}", response_model=KnowledgeRead)
def get_knowledge(document_id: str, db: Session = Depends(get_db)) -> KnowledgeDocument:
    doc = db.get(KnowledgeDocument, document_id)
    if not doc or doc.deleted_at:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dokumen tidak ditemukan")
    return doc
