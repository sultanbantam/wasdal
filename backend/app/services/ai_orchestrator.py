from __future__ import annotations

from agents.wasdal_agents import WasdalAgentGraph
from agents.wasdal_agents.openai_graph import OpenAIWasdalAgentGraph
from app.core.config import get_settings
from .ai_shield import AITackShield

class AIOrchestrator:
    """Application service boundary for all Wasdal AI recommendations."""

    def __init__(self, use_mock: bool = False):
        self.use_mock = use_mock
        settings = get_settings()
        self.api_key = settings.openai_api_key
        if settings.openai_api_key:
            self.graph = OpenAIWasdalAgentGraph()
        else:
            self.graph = WasdalAgentGraph()

    def intake(self, text: str, source: str, attachments: list = None) -> dict:
        # AITTACK SHIELD INTEGRATION: Sanitasi & Deteksi Ancaman
        safe_text, is_injection = AITackShield.sanitize(text)
        
        if is_injection:
            print("🚨 AITTACK SHIELD: Prompt Injection terdeteksi dan diblokir!")
            return {
                "summary": "PERINGATAN KEAMANAN: Input mengandung instruksi manipulasi AI (Prompt Injection) yang telah diblokir oleh sistem Aittack Shield.",
                "category": "Keamanan Siber",
                "subcategory": "Ancaman AI",
                "priority": "Critical",
                "severity": "Major",
                "priority_score": 1.0,
                "location_name": "Sistem Internal",
                "latitude": 0.0,
                "longitude": 0.0,
                "suggested_agency": "Diskominfo / Tim Keamanan",
                "suggested_deadline": None,
                "recommendations": [{"action": "Blokir pelapor", "reason": "Mencoba membobol prompt sistem"}],
                "confidence": 1.0
            }

        # Lanjutkan jika aman
        return self.graph.run_intake(raw_text=safe_text, source=source, attachments=attachments or [])

    def meeting(self, title: str, transcript: str) -> dict:
        return self.graph.run_meeting(title=title, transcript=transcript)
