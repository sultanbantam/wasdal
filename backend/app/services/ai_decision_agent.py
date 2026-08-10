from typing import Any
from sqlalchemy.orm import Session
from app.models.decision import ExecutiveDecision, Issue

class DecisionSupportAgent:
    """
    AI Agent responsible for analyzing issues and proposing executive decisions.
    """
    def __init__(self, db: Session):
        self.db = db

    def detect_decisions(self) -> list[dict[str, Any]]:
        """
        Scans for issues that require executive decisions.
        Reads from the ExecutiveDecision database table.
        """
        decisions = self.db.query(ExecutiveDecision).filter_by(status="Waiting Decision").all()
        result = []
        for d in decisions:
            # We construct options dynamically or mock them if not present
            options = []
            if d.recommendation:
                 options.append({
                     "id": "A",
                     "description": d.recommendation,
                     "estimated_time": "7 days"
                 })
                 
            result.append({
                "id": d.id,
                "title": d.title,
                "priority": d.priority,
                "impact": d.issue.impact if d.issue else "Dampak signifikan terhadap kinerja",
                "responsible_opd": d.issue.opd_id if d.issue else "OPD Terkait",
                "status": d.status,
                "decision_owner": d.decision_owner,
                "options": options,
                "recommended_option": "A" if options else None
            })
            
        # Fallback to dummy data only if DB is empty for demonstration purposes
        if not result:
            result = [
                {
                    "title": "Percepatan Penanganan Genangan Kawasan X",
                    "priority": "CRITICAL",
                    "impact": "Berpotensi mempengaruhi indikator RPJMD",
                    "responsible_opd": "Dinas Pekerjaan Umum",
                    "status": "Waiting Decision",
                    "decision_owner": "Sekda",
                    "options": [
                        {
                            "id": "A",
                            "description": "Negosiasi percepatan penyelesaian aset",
                            "estimated_time": "14 days"
                        },
                        {
                            "id": "B",
                            "description": "Relokasi sebagian pekerjaan",
                            "estimated_time": "30 days"
                        }
                    ],
                    "recommended_option": "A"
                }
            ]
        return result

    def approve_decision(self, decision_id: str, option_id: str) -> bool:
        """
        Marks a decision as approved with the selected option.
        """
        # MVP placeholder
        return True
