from __future__ import annotations

import re

from .state import IntakeState


class IntakeAgent:
    name = "IntakeAgent"

    def run(self, state: IntakeState) -> IntakeState:
        text = " ".join(state.raw_text.split())
        state.extracted["normalized_text"] = text
        state.extracted["citizen_count"] = self._extract_citizen_count(text)
        state.audit_notes.append("IntakeAgent normalized text and extracted citizen count.")
        return state

    def _extract_citizen_count(self, text: str) -> int:
        patterns = [
            r"(\d+)\s*(warga|kk|orang|kepala keluarga)",
            r"(puluhan)\s*(warga|kk|orang)",
            r"(ratusan)\s*(warga|kk|orang)",
        ]
        lowered = text.lower()
        for pattern in patterns:
            match = re.search(pattern, lowered)
            if not match:
                continue
            value = match.group(1)
            if value == "puluhan":
                return 40
            if value == "ratusan":
                return 200
            return int(value)
        return 1
