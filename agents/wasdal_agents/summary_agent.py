from __future__ import annotations

from .state import IntakeState, MeetingState


class SummaryAgent:
    name = "SummaryAgent"

    def run(self, state: IntakeState | MeetingState) -> IntakeState | MeetingState:
        text = getattr(state, "raw_text", None) or getattr(state, "transcript", "")
        sentences = [segment.strip() for segment in text.replace("\n", " ").split(".") if segment.strip()]
        summary = ". ".join(sentences[:3])
        if summary and not summary.endswith("."):
            summary = f"{summary}."
        state.summary = summary or "Belum ada ringkasan karena masukan kosong."
        if hasattr(state, "audit_notes"):
            state.audit_notes.append("SummaryAgent generated concise summary.")
        return state
