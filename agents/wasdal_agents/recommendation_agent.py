from __future__ import annotations

from .state import IntakeState


AGENCY_BY_CATEGORY = {
    "Ekonomi": "Bagian Perekonomian dan SDA",
    "Pembangunan": "Bagian Administrasi Pembangunan",
    "Infrastruktur": "Dinas PUPR",
    "Perizinan": "DPMPTSP",
    "Investasi": "DPMPTSP",
    "Sosial": "Dinas Sosial",
    "Lingkungan": "DLH",
    "Transportasi": "Dinas Perhubungan",
    "Kebersihan": "DLH",
    "Drainase": "Dinas PUPR",
    "Utilitas": "Dinas Teknis Terkait",
    "Lainnya": "Sekretariat Wasdal",
}


class RecommendationAgent:
    name = "RecommendationAgent"

    def run(self, state: IntakeState) -> IntakeState:
        agency = AGENCY_BY_CATEGORY.get(state.category, "Sekretariat Wasdal")
        state.suggested_agency = agency
        state.recommendations = [
            {
                "horizon": "Quick Win",
                "action": f"Validasi lapangan dan tetapkan PIC lintas OPD untuk kategori {state.category}.",
                "estimated_time": "1-3 hari",
                "agency": agency,
                "difficulty": "Rendah",
                "risk": "Data awal belum lengkap",
                "confidence": 0.82,
            },
            {
                "horizon": "Mid Term",
                "action": "Susun rencana tindak lanjut, anggaran indikatif, dan milestone mingguan.",
                "estimated_time": "2-4 minggu",
                "agency": agency,
                "difficulty": "Sedang",
                "risk": "Koordinasi lintas instansi terlambat",
                "confidence": 0.76,
            },
            {
                "horizon": "Long Term",
                "action": "Masukkan pola masalah ke knowledge base Wasdal untuk pencegahan berulang.",
                "estimated_time": "1-3 bulan",
                "agency": "Bagian Ekbang",
                "difficulty": "Sedang",
                "risk": "Perlu dukungan data historis",
                "confidence": 0.7,
            },
        ]
        state.audit_notes.append("RecommendationAgent produced non-binding recommendations.")
        return state
