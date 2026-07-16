from __future__ import annotations

from datetime import UTC, datetime, timedelta

from .state import IntakeState


class AssignmentAgent:
    name = "AssignmentAgent"

    def run(self, state: IntakeState) -> IntakeState:
        days = 3 if state.priority in {"Critical", "High"} else 7 if state.priority == "Medium" else 14
        state.extracted["suggested_deadline"] = (datetime.now(UTC) + timedelta(days=days)).date().isoformat()
        state.extracted["assignment_reason"] = (
            "Deadline dipercepat karena prioritas tinggi."
            if days <= 3
            else "Deadline mengikuti SLA standar Wasdal."
        )
        state.audit_notes.append("AssignmentAgent suggested SLA deadline.")
        return state
