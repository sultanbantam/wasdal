from __future__ import annotations

import re

from .state import IntakeState


CITY_FALLBACK = {
    "balai kota": (-6.1754, 106.8272),
    "pasar": (-6.1862, 106.8348),
    "kecamatan": (-6.2146, 106.8451),
    "kelurahan": (-6.2088, 106.8456),
}


class GeoAgent:
    name = "GeoAgent"

    def run(self, state: IntakeState) -> IntakeState:
        text = state.extracted.get("normalized_text", state.raw_text)
        coordinates = self._extract_coordinates(text)
        if coordinates:
            state.latitude, state.longitude = coordinates
            state.location_name = self._extract_location_name(text) or "Koordinat laporan"
        else:
            lowered = text.lower()
            for token, coordinate in CITY_FALLBACK.items():
                if token in lowered:
                    state.latitude, state.longitude = coordinate
                    state.location_name = self._extract_location_name(text) or token.title()
                    break
        if not state.location_name:
            state.location_name = self._extract_location_name(text) or "Lokasi perlu verifikasi"
        state.audit_notes.append("GeoAgent extracted location candidate.")
        return state

    def _extract_coordinates(self, text: str) -> tuple[float, float] | None:
        match = re.search(r"(-?\d+\.\d+)\s*,\s*(-?\d+\.\d+)", text)
        if not match:
            return None
        return float(match.group(1)), float(match.group(2))

    def _extract_location_name(self, text: str) -> str:
        match = re.search(r"(di|lokasi|sekitar)\s+([A-Z0-9][A-Za-z0-9\s\-/]{3,80})", text)
        if not match:
            return ""
        return match.group(2).strip()
