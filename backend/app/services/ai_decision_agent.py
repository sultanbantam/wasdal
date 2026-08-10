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
        For MVP, returns mock data.
        """
        return [
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
            },
             {
                "title": "Pergeseran Anggaran Pembebasan Lahan Sekolah",
                "priority": "HIGH",
                "impact": "Target pendidikan terhambat",
                "responsible_opd": "Dinas Pendidikan",
                "status": "Waiting Decision",
                "decision_owner": "Mayor",
                "options": [
                    {
                        "id": "A",
                        "description": "Gunakan dana BTT",
                        "estimated_time": "7 days"
                    },
                    {
                        "id": "B",
                        "description": "Tunda ke APBD Perubahan",
                        "estimated_time": "90 days"
                    }
                ],
                "recommended_option": "A"
            }
        ]

    def approve_decision(self, decision_id: str, option_id: str) -> bool:
        """
        Marks a decision as approved with the selected option.
        """
        # MVP placeholder
        return True
