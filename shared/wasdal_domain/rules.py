from __future__ import annotations

from .constants import CATEGORY_KEYWORDS, PRIORITY_WEIGHTS


def _normalize_score(value: float, maximum: float = 5.0) -> float:
    if value < 0:
        return 0.0
    if value > maximum:
        return 1.0
    return value / maximum


def compute_priority_score(signals: dict[str, float | int | bool]) -> float:
    """Return a 0-100 priority score using auditable government-friendly signals."""
    citizen_count = min(float(signals.get("citizen_count", 0)) / 500.0, 1.0)
    weighted_inputs = {
        "citizen_count": citizen_count,
        "risk": _normalize_score(float(signals.get("risk", 0))),
        "urgency": _normalize_score(float(signals.get("urgency", 0))),
        "media_exposure": _normalize_score(float(signals.get("media_exposure", 0))),
        "recurrence": _normalize_score(float(signals.get("recurrence", 0))),
        "economic_impact": _normalize_score(float(signals.get("economic_impact", 0))),
        "legal_status": _normalize_score(float(signals.get("legal_status", 0))),
    }
    score = sum(weighted_inputs[key] * PRIORITY_WEIGHTS[key] for key in PRIORITY_WEIGHTS)
    return round(score * 100, 2)


def priority_from_score(score: float) -> str:
    if score >= 80:
        return "Critical"
    if score >= 55:
        return "High"
    if score >= 35:
        return "Medium"
    return "Low"


def classify_category(text: str) -> tuple[str, float]:
    lowered = text.lower()
    matches: list[tuple[str, int]] = []
    for category, keywords in CATEGORY_KEYWORDS.items():
        hit_count = sum(1 for keyword in keywords if keyword in lowered)
        if hit_count:
            matches.append((category, hit_count))

    if not matches:
        return "Lainnya", 0.42

    matches.sort(key=lambda item: item[1], reverse=True)
    category, hit_count = matches[0]
    confidence = min(0.55 + (hit_count * 0.12), 0.92)
    return category, round(confidence, 2)
