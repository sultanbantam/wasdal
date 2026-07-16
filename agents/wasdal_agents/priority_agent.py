from __future__ import annotations

from shared.wasdal_domain import compute_priority_score, priority_from_score

from .state import IntakeState


class PriorityAgent:
    name = "PriorityAgent"

    def run(self, state: IntakeState) -> IntakeState:
        text = state.extracted.get("normalized_text", state.raw_text).lower()
        signals = {
            "citizen_count": state.extracted.get("citizen_count", 1),
            "risk": self._signal(text, ["bahaya", "amblas", "longsor", "kebakaran", "kecelakaan", "rusak berat", "rusak", "terganggu"]),
            "urgency": self._signal(text, ["mendesak", "segera", "hari ini", "darurat", "terputus"]),
            "media_exposure": self._signal(text, ["viral", "media", "wartawan", "instagram", "facebook"]),
            "recurrence": self._signal(text, ["berulang", "setiap tahun", "sering", "langganan"]),
            "economic_impact": self._signal(text, ["pasar", "usaha", "distribusi", "ekonomi", "logistik"]),
            "legal_status": self._signal(text, ["sengketa", "hukum", "gugatan", "izin", "aset"]),
        }
        score = compute_priority_score(signals)
        state.priority_score = score
        state.priority = priority_from_score(score)
        state.severity = "Major" if score >= 60 else "Moderate" if score >= 35 else "Minor"
        state.audit_notes.append(f"PriorityAgent calculated score {score} and priority {state.priority}.")
        return state

    def _signal(self, text: str, keywords: list[str]) -> int:
        hits = sum(1 for keyword in keywords if keyword in text)
        return min((hits * 2) + (1 if hits else 0), 5)
