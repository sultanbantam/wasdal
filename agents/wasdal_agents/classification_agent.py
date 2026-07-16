from __future__ import annotations

from shared.wasdal_domain import classify_category

from .state import IntakeState


class ClassificationAgent:
    name = "ClassificationAgent"

    def run(self, state: IntakeState) -> IntakeState:
        text = state.extracted.get("normalized_text", state.raw_text)
        category, confidence = classify_category(text)
        lowered = text.lower()
        if "jalan" in lowered and "rusak" in lowered:
            category = "Infrastruktur"
            confidence = max(confidence, 0.86)
        state.category = category
        state.confidence = max(state.confidence, confidence)
        state.subcategory = self._subcategory(category, text)
        state.audit_notes.append(f"ClassificationAgent assigned {category} with confidence {confidence}.")
        return state

    def _subcategory(self, category: str, text: str) -> str:
        lowered = text.lower()
        if category == "Infrastruktur" and "jalan" in lowered:
            return "Jalan"
        if category == "Drainase" or "banjir" in lowered:
            return "Banjir dan Genangan"
        if category == "Perizinan":
            return "OSS/NIB"
        if category == "Ekonomi":
            return "Stabilitas Harga dan UMKM"
        return "Umum"