from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.services.ai_decision_agent import DecisionSupportAgent
from pydantic import BaseModel
from typing import Any

router = APIRouter()

class DecisionOption(BaseModel):
    id: str
    description: str
    estimated_time: str

class DecisionRequired(BaseModel):
    title: str
    priority: str
    impact: str
    responsible_opd: str
    status: str
    decision_owner: str
    options: list[DecisionOption]
    recommended_option: str

class DecisionApprovalRequest(BaseModel):
    option_id: str

@router.get("/required", response_model=list[DecisionRequired])
def get_decisions_required(db: Session = Depends(get_db)):
    """
    Get list of issues requiring executive decision.
    """
    agent = DecisionSupportAgent(db)
    return agent.detect_decisions()

@router.post("/{decision_id}/approve")
def approve_decision(decision_id: str, req: DecisionApprovalRequest, db: Session = Depends(get_db)):
    """
    Approve a decision with a selected option.
    """
    agent = DecisionSupportAgent(db)
    success = agent.approve_decision(decision_id, req.option_id)
    return {"success": success}
