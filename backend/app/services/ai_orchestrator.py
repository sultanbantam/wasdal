from __future__ import annotations

from agents.wasdal_agents import WasdalAgentGraph
from agents.wasdal_agents.openai_graph import OpenAIWasdalAgentGraph
from app.core.config import get_settings


class AIOrchestrator:
    """Application service boundary for all Wasdal AI recommendations."""

    def __init__(self) -> None:
        settings = get_settings()
        if settings.openai_api_key:
            self.graph = OpenAIWasdalAgentGraph()
        else:
            self.graph = WasdalAgentGraph()

    def intake(self, raw_text: str, source: str, attachments: list[str]) -> dict:
        return self.graph.run_intake(raw_text=raw_text, source=source, attachments=attachments)

    def meeting(self, title: str, transcript: str) -> dict:
        return self.graph.run_meeting(title=title, transcript=transcript)
