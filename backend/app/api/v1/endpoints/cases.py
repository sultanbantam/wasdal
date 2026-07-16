from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models import User
from app.repositories.cases import CaseRepository
from app.schemas import CaseAssign, CaseCommentCreate, CaseCreate, CaseListResponse, CaseRead, CaseStatusUpdate, CaseUpdate
from app.services.case_service import CaseService

router = APIRouter()


@router.get("", response_model=CaseListResponse)
def list_cases(
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
    status_filter: str | None = Query(default=None, alias="status"),
    priority: str | None = None,
    q: str | None = None,
    db: Session = Depends(get_db),
) -> CaseListResponse:
    items, total = CaseRepository(db).list(page=page, size=size, status=status_filter, priority=priority, query=q)
    return CaseListResponse(items=items, total=total, page=page, size=size)


@router.post("", response_model=CaseRead, status_code=status.HTTP_201_CREATED)
def create_case(
    payload: CaseCreate,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user),
) -> CaseRead:
    return CaseService(db).create_case(payload, actor_id=user.id if user else None)


@router.get("/{case_id}", response_model=CaseRead)
def get_case(case_id: str, db: Session = Depends(get_db)) -> CaseRead:
    case = CaseRepository(db).get(case_id)
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case tidak ditemukan")
    return case


@router.patch("/{case_id}", response_model=CaseRead)
def update_case(
    case_id: str,
    payload: CaseUpdate,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user),
) -> CaseRead:
    case = CaseRepository(db).get(case_id)
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case tidak ditemukan")
    return CaseService(db).update_case(case, payload, actor_id=user.id if user else None)


@router.post("/{case_id}/assign", response_model=CaseRead)
def assign_case(
    case_id: str,
    payload: CaseAssign,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user),
) -> CaseRead:
    case = CaseRepository(db).get(case_id)
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case tidak ditemukan")
    return CaseService(db).assign_case(case, payload, actor_id=user.id if user else None)


@router.post("/{case_id}/comments", response_model=CaseRead)
def add_comment(
    case_id: str,
    payload: CaseCommentCreate,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user),
) -> CaseRead:
    case = CaseRepository(db).get(case_id)
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case tidak ditemukan")
    return CaseService(db).add_comment(case, payload, actor_id=user.id if user else None)


@router.post("/{case_id}/status", response_model=CaseRead)
def update_status(
    case_id: str,
    payload: CaseStatusUpdate,
    db: Session = Depends(get_db),
    user: User | None = Depends(get_current_user),
) -> CaseRead:
    case = CaseRepository(db).get(case_id)
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case tidak ditemukan")
    return CaseService(db).update_status(case, payload, actor_id=user.id if user else None)
