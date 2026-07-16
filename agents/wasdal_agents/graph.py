from __future__ import annotations

from typing import Any

from .assignment_agent import AssignmentAgent
from .classification_agent import ClassificationAgent
from .geo_agent import GeoAgent
from .intake_agent import IntakeAgent
from .meeting_agent import MeetingAgent
from .priority_agent import PriorityAgent
from .recommendation_agent import RecommendationAgent
from .state import IntakeState, MeetingState
from .summary_agent import SummaryAgent


class WasdalAgentGraph:
    """LangGraph-ready orchestrator with deterministic fallback for local development."""

    def __init__(self) -> None:
        self.intake_agents = [
            IntakeAgent(),
            SummaryAgent(),
            ClassificationAgent(),
            PriorityAgent(),
            GeoAgent(),
            RecommendationAgent(),
            AssignmentAgent(),
        ]
        self.meeting_agents = [SummaryAgent(), MeetingAgent()]

    def run_intake(self, raw_text: str, source: str = "Manual", attachments: list[str] | None = None) -> dict[str, Any]:
        state = IntakeState(raw_text=raw_text, source=source, attachments=attachments or [])
        for agent in self.intake_agents:
            state = agent.run(state)
        return {
            "summary": state.summary,
            "category": state.category,
            "subcategory": state.subcategory,
            "priority": state.priority,
            "priority_score": state.priority_score,
            "severity": state.severity,
            "location_name": state.location_name,
            "latitude": state.latitude,
            "longitude": state.longitude,
            "suggested_agency": state.suggested_agency,
            "suggested_deadline": state.extracted.get("suggested_deadline"),
            "recommendations": state.recommendations,
            "confidence": max(state.confidence, 0.66),
            "entities": state.extracted,
            "audit_notes": state.audit_notes,
        }

    def run_meeting(self, title: str, transcript: str) -> dict[str, Any]:
        state = MeetingState(title=title, transcript=transcript)
        for agent in self.meeting_agents:
            state = agent.run(state)
        return {
            "title": state.title,
            "transcript": state.transcript,
            "summary": state.summary,
            "decisions": state.decisions,
            "action_items": state.action_items,
            "minutes": state.minutes,
            "confidence": state.confidence,
        }
