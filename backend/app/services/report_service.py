from __future__ import annotations

from sqlalchemy.orm import Session

from app.models import Case


class ReportService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def executive_summary(self, period: str = "Bulan berjalan") -> dict:
        cases = list(self.db.query(Case).filter(Case.deleted_at.is_(None)).all())
        open_cases = [case for case in cases if case.status not in {"Resolved", "Closed"}]
        high_priority = [case for case in cases if case.priority in {"Critical", "High"}]
        key_risks = [
            f"{case.number}: {case.title} ({case.priority})"
            for case in sorted(high_priority, key=lambda item: item.priority_score, reverse=True)[:5]
        ]
        recommended_decisions = [
            "Tetapkan PIC dan SLA untuk kasus yang masih New lebih dari 24 jam.",
            "Prioritaskan verifikasi lapangan untuk kasus Critical/High sebelum rapat Wasdal.",
            "Gunakan rekomendasi AI sebagai bahan analisis, keputusan tetap oleh pimpinan rapat.",
        ]
        return {
            "title": "Executive Summary Wasdal",
            "period": period,
            "summary": (
                f"{len(open_cases)} kasus masih terbuka dari {len(cases)} total kasus. "
                f"{len(high_priority)} kasus masuk prioritas tinggi dan perlu monitoring harian."
            ),
            "key_risks": key_risks,
            "recommended_decisions": recommended_decisions,
            "open_cases": len(open_cases),
            "high_priority_cases": len(high_priority),
        }
