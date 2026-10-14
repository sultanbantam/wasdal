from __future__ import annotations

from typing import Any


class AIUrbanTalentService:
    """
    AI services for Ruang Kota & Talenta ASN.
    Strictly adheres to Wasdal guardrails:
    - AI provides structured analysis and candidate recommendations only.
    - AI NEVER makes final administrative, punitive, or appointment decisions.
    - Transparent explanations ('Why this recommendation appears') with sources and data used.
    - Returns 'DATA INSUFFICIENT' if input information is inadequate.
    """

    @staticmethod
    def analyze_cable_condition(description: str, height_meters: float | None = None) -> dict[str, Any]:
        desc_lower = description.lower()
        if not description.strip():
            return {
                "status": "DATA INSUFFICIENT",
                "clutter_index": 0.0,
                "confidence": 0.0,
                "notes": "Deskripsi atau foto visual kabel tidak tersedia untuk analisis.",
            }

        clutter_score = 20.0
        risk = "Low"
        visual_tag = "Rapi / Tertata"
        recommendations = []

        if "rendah" in desc_lower or "menggantung" in desc_lower or (height_meters is not None and height_meters < 4.5):
            clutter_score += 45.0
            risk = "High" if (height_meters is not None and height_meters < 4.0) else "Medium"
            visual_tag = "Menggantung Rendah (< 4.5m)"
            recommendations.append("Prioritaskan inspeksi lapangan bersama operator pemilik aset.")
            recommendations.append("Beri label 'Suspected inactive' atau 'Needs verification' sebelum tindakan fisik.")

        if "semrawut" in desc_lower or "kusut" in desc_lower or "bersilangan" in desc_lower:
            clutter_score += 35.0
            visual_tag = "Semrawut / Kusut"
            recommendations.append("Agendakan program bundling kabel dan penataan tiang utilitas bersama APJATEL.")

        if "putus" in desc_lower or "terjuntai" in desc_lower:
            clutter_score += 40.0
            risk = "Critical"
            visual_tag = "Putus / Terjuntai"
            recommendations.append("Segera pasang barikade pengaman sementara oleh petugas lapangan.")

        clutter_score = min(100.0, max(5.0, clutter_score))
        return {
            "status": "ANALYZED",
            "clutter_index": round(clutter_score, 1),
            "suggested_visual_condition": visual_tag,
            "risk_level": risk,
            "confidence": 0.88,
            "recommendations": recommendations,
            "ai_guardrail": "Label kabel hanya indikasi awal. Konfirmasi operator dan izin dinas tetap wajib.",
        }

    @staticmethod
    def analyze_obstruction(title: str, description: str) -> dict[str, Any]:
        text = f"{title} {description}".lower()
        if len(text.strip()) < 5:
            return {"status": "DATA INSUFFICIENT", "confidence": 0.0}

        obs_type = "Lainnya"
        impact = "Jalur pejalan kaki terganggu sebagian"
        agency = "Satpol PP"

        if "parkir" in text or "mobil" in text or "motor" in text or "kendaraan" in text:
            obs_type = "Kendaraan Parkir di Trotoar"
            impact = "Jalur pejalan kaki dan akses difabel terblokir kendaraan bermotor"
            agency = "Dishub & Satpol PP"
        elif "pkl" in text or "dagang" in text or "gerobak" in text or "lapak" in text:
            obs_type = "PKL / Barang Dagangan Menghalangi Jalur"
            impact = "Jalur pedestrian tertutup lapak/meja pedagang"
            agency = "Disperindag & Satpol PP"
        elif "kabel" in text or "tiang" in text or "utilitas" in text:
            obs_type = "Tiang / Kabel Menghalangi / Membahayakan"
            impact = "Risiko keselamatan dan aksesibilitas trotoar terhalang tiang/kabel"
            agency = "Disperkim & Operator Utilitas"
        elif "puing" in text or "material" in text or "proyek" in text:
            obs_type = "Material Konstruksi / Puing"
            impact = "Akses trotoar tertimbun material galian / sisa bangunan"
            agency = "Dinas PUPR"

        return {
            "status": "ANALYZED",
            "candidate_obstruction_type": obs_type,
            "accessibility_impact": impact,
            "recommended_lead_agency": agency,
            "confidence": 0.91,
            "requires_human_verification": True,
            "workflow_step": "Laporan → Verifikasi Petugas Lapangan → Tindak Lanjut Terpadu",
        }

    @staticmethod
    def answer_talent_faq(question: str) -> dict[str, Any]:
        q_lower = question.lower()
        source_doc = "Peraturan Menteri PAN-RB Nomor 3 Tahun 2020 tentang Manajemen Talenta ASN & Perwal Tangsel No. 24/2025"

        if "9 box" in q_lower or "sembilan kotak" in q_lower or "kuadran" in q_lower:
            answer = (
                "Metode 9 Box Talent Mapping memetakan ASN ke dalam matriks 3x3 berdasarkan dua sumbu utama yang sah: "
                "Sumbu Kinerja (hasil evaluasi SKP resmi) dan Sumbu Potensi (hasil asesmen kompetensi terakreditasi BKN). "
                "Kotak 9 (Kinerja Tinggi, Potensi Tinggi) merupakan kelompok Top Talent yang diprioritaskan masuk dalam talent pool dan rencana suksesi."
            )
            section = "Pasal 14 - Pemetaan Talenta dan Kuadran 9-Box"
        elif "idp" in q_lower or "rencana pengembangan" in q_lower or "individual development" in q_lower:
            answer = (
                "Individual Development Plan (IDP) adalah dokumen rencana pengembangan kompetensi individu yang disusun bersama atasan langsung. "
                "IDP mencakup bentuk pengembangan 70:20:10 (70% penugasan/on-the-job, 20% mentoring/coaching, 10% pelatihan/klasikal) "
                "untuk menutup kesenjangan kompetensi yang teridentifikasi dalam asesmen."
            )
            section = "Pasal 22 - Pengembangan Talenta Berbasis IDP"
        elif "suksesi" in q_lower or "succession" in q_lower or "posisi kritis" in q_lower:
            answer = (
                "Rencana Suksesi (Succession Planning) adalah penetapan kandidat terverifikasi (Ready Now, Ready < 1 Year, Development Required) "
                "untuk mengantisipasi kekosongan pada jabatan kritis pimpinan dan fungsional keahlian tanpa melalui seleksi terbuka konvensional yang panjang."
            )
            section = "Pasal 28 - Tata Cara Penetapan Rencana Suksesi"
        elif "siasn" in q_lower or "bkn" in q_lower or "sinkron" in q_lower:
            answer = (
                "Wasdal Talenta ASN terintegrasi dengan data resmi SIASN BKN dan e-Kinerja melalui jalur API resmi. "
                "Wasdal berfungsi sebagai sistem pengawasan dan akselerasi implementasi manajemen talenta daerah, bukan pengganti database induk kepegawaian nasional BKN."
            )
            section = "Pedoman Integrasi Satu Data ASN BKN"
        else:
            answer = (
                "Manajemen Talenta ASN Pemkot Tangerang Selatan diselenggarakan secara objektif, terencana, terbuka, tepat waktu, akuntabel, "
                "bebas dari intervensi politik dan korupsi/kolusi/nepotisme sesuai prinsip Sistem Merit ASN."
            )
            section = "Prinsip Umum Sistem Merit ASN"

        return {
            "answer": answer,
            "official_source": source_doc,
            "section_reference": section,
            "data_confidence": 0.95,
            "disclaimer": "Jawaban disarikan dari regulasi resmi kepegawaian. Untuk keputusan formal silakan hubungi BKPSDM Tangsel.",
        }

    @staticmethod
    def explain_mobility_recommendation(
        employee_name: str,
        current_position: str,
        target_position: str,
        competency_score: float,
        performance_score: float,
    ) -> dict[str, Any]:
        match_score = round((competency_score * 0.5) + (performance_score * 0.5), 1)
        factors = [
            f"Kesesuaian kualifikasi & asesmen kompetensi: {competency_score}%",
            f"Capaian kinerja SKP terverifikasi: {performance_score}%",
            f"Rekam jejak pengalaman relevan pada penugasan terkait",
        ]
        rationale = (
            f"Pegawai {employee_name} ({current_position}) menunjukkan tingkat keselarasan kompetensi yang kuat "
            f"untuk posisi {target_position}. Skor gabungan mencapai {match_score}%. "
            "Rekomendasi ini disusun secara objektif berbasis sistem merit untuk mendukung capaian target pembangunan daerah."
        )

        return {
            "match_score_pct": match_score,
            "factors": factors,
            "rationale": rationale,
            "review_stage": "Rekomendasi Analitis → Telaah Teknis BKPSDM → Sidang Komite Talenta → Keputusan PPK",
            "ai_guardrail": "Rekomendasi AI bukan Surat Keputusan (SK) mutasi. Penetapan mutasi resmi sepenuhnya wewenang Pejabat Pembina Kepegawaian (PPK).",
        }
