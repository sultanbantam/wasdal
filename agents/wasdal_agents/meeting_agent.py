from __future__ import annotations

import re

from .state import MeetingState


class MeetingAgent:
    name = "MeetingAgent"

    def run(self, state: MeetingState) -> MeetingState:
        lines = [line.strip("- ") for line in state.transcript.splitlines() if line.strip()]
        state.decisions = self._extract_decisions(lines)
        state.action_items = self._extract_action_items(lines)
        state.minutes = self._build_minutes(state)
        state.confidence = 0.78 if state.transcript else 0.35
        return state

    def _extract_decisions(self, lines: list[str]) -> list[str]:
        decisions = [
            line for line in lines if any(token in line.lower() for token in ["diputuskan", "keputusan", "disepakati"])
        ]
        return decisions[:8] or ["Belum ada keputusan eksplisit, perlu konfirmasi pimpinan rapat."]

    def _extract_action_items(self, lines: list[str]) -> list[dict[str, str]]:
        actions: list[dict[str, str]] = []
        for line in lines:
            lowered = line.lower()
            if not any(token in lowered for token in ["tindak lanjut", "pic", "deadline", "menugaskan"]):
                continue
            pic_match = re.search(r"pic\s*[:\-]\s*([^,;.]+)", line, flags=re.IGNORECASE)
            deadline_match = re.search(r"deadline\s*[:\-]\s*([^,;.]+)", line, flags=re.IGNORECASE)
            actions.append(
                {
                    "task": line,
                    "pic": pic_match.group(1).strip() if pic_match else "Perlu ditetapkan",
                    "deadline": deadline_match.group(1).strip() if deadline_match else "Perlu ditetapkan",
                    "status": "Open",
                }
            )
        return actions or [
            {
                "task": "Sekretariat Wasdal memvalidasi daftar action item hasil rapat.",
                "pic": "Sekretariat Wasdal",
                "deadline": "H+1 rapat",
                "status": "Open",
            }
        ]

    def _build_minutes(self, state: MeetingState) -> str:
        decision_block = "\n".join(f"- {decision}" for decision in state.decisions)
        action_block = "\n".join(f"- {item['task']} | PIC: {item['pic']} | Deadline: {item['deadline']}" for item in state.action_items)
        return (
            f"# Notulen {state.title}\n\n"
            f"## Ringkasan\n{state.summary}\n\n"
            f"## Keputusan\n{decision_block}\n\n"
            f"## Action Item\n{action_block}\n"
        )
