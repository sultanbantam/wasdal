from __future__ import annotations

from datetime import UTC, datetime, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models import Case, KnowledgeDocument, MeetingRecord, User
from app.repositories.cases import CaseRepository
from app.schemas import CaseCreate


def init_db(db: Session) -> None:
    seed_users(db)
    seed_cases(db)
    seed_knowledge(db)
    seed_meetings(db)


def seed_users(db: Session) -> None:
    if db.scalar(select(User).where(User.email == "admin@wasdal.local")):
        return
    users = [
        User(
            name="Administrator Wasdal",
            email="admin@wasdal.local",
            role="Administrator",
            agency="Bagian Ekbang",
            hashed_password=get_password_hash("wasdal123"),
        ),
        User(
            name="Kepala Bagian Ekbang",
            email="ekbang@wasdal.local",
            role="Bagian Ekbang",
            agency="Bagian Ekbang",
            hashed_password=get_password_hash("wasdal123"),
        ),
        User(
            name="Pimpinan Daerah",
            email="pimpinan@wasdal.local",
            role="Pimpinan",
            agency="Setda",
            hashed_password=get_password_hash("wasdal123"),
        ),
    ]
    db.add_all(users)
    db.commit()


def seed_cases(db: Session) -> None:
    if db.scalar(select(Case).limit(1)):
        return

    repo = CaseRepository(db)
    now = datetime.now(UTC)
    samples = [
        CaseCreate(
            number="WAS-2026-00001",
            title="Jalan akses pasar induk rusak dan menghambat distribusi pangan",
            description=(
                "Ratusan warga dan pedagang melaporkan jalan akses pasar induk rusak berat. "
                "Distribusi pangan terganggu, beberapa kendaraan logistik terperosok, dan laporan sudah viral di media lokal."
            ),
            category="Infrastruktur",
            subcategory="Jalan",
            location_name="Pasar Induk",
            latitude=-6.1862,
            longitude=106.8348,
            reporter_name="Forum Pedagang Pasar",
            source="WhatsApp",
            status="In Progress",
            priority="Critical",
            severity="Major",
            priority_score=88.4,
            pic="Dinas PUPR",
            agency="Dinas PUPR",
            due_date=now + timedelta(days=2),
            ai_summary="Jalan akses pasar induk rusak berat dan berdampak langsung pada distribusi pangan.",
            ai_confidence=0.86,
            suggested_solution=[
                {
                    "horizon": "Quick Win",
                    "action": "Tambal darurat titik kritis dan atur rekayasa akses logistik.",
                    "agency": "Dinas PUPR",
                    "estimated_time": "1-3 hari",
                    "confidence": 0.84,
                }
            ],
            timeline=[
                {"type": "created", "at": (now - timedelta(days=3)).isoformat(), "note": "Laporan masuk dari WhatsApp."},
                {"type": "assignment", "at": (now - timedelta(days=2)).isoformat(), "pic": "Dinas PUPR"},
            ],
        ),
        CaseCreate(
            number="WAS-2026-00002",
            title="Genangan berulang di sekitar kantor kecamatan saat hujan deras",
            description=(
                "Kelurahan melaporkan genangan berulang pada saluran drainase dekat kantor kecamatan. "
                "Aktivitas pelayanan publik terganggu setiap hujan deras."
            ),
            category="Drainase",
            subcategory="Banjir dan Genangan",
            location_name="Kantor Kecamatan",
            latitude=-6.2146,
            longitude=106.8451,
            reporter_name="Kecamatan",
            source="Survey Lapangan",
            status="Assigned",
            priority="High",
            severity="Moderate",
            priority_score=67.2,
            pic="UPT Drainase",
            agency="Dinas PUPR",
            due_date=now - timedelta(days=1),
            ai_summary="Genangan berulang mengganggu layanan kecamatan dan perlu normalisasi drainase.",
            ai_confidence=0.79,
        ),
        CaseCreate(
            number="WAS-2026-00003",
            title="Keterlambatan rekomendasi perizinan investasi gudang logistik",
            description=(
                "Investor meminta kejelasan rekomendasi teknis untuk gudang logistik. "
                "Proses berulang antara kelurahan, kecamatan, dan dinas teknis."
            ),
            category="Perizinan",
            subcategory="OSS/NIB",
            location_name="Kawasan Pergudangan Barat",
            latitude=-6.2088,
            longitude=106.8456,
            reporter_name="DPMPTSP",
            source="Email",
            status="Waiting Decision",
            priority="Medium",
            severity="Moderate",
            priority_score=54.5,
            pic="DPMPTSP",
            agency="DPMPTSP",
            due_date=now + timedelta(days=6),
            ai_summary="Perizinan investasi membutuhkan keputusan lintas instansi agar tidak menghambat realisasi investasi.",
            ai_confidence=0.74,
        ),
        CaseCreate(
            number="WAS-2026-00004",
            title="PJU padam di koridor sekolah dan halte",
            description="Warga melaporkan lampu PJU padam di koridor sekolah dan halte. Risiko keselamatan meningkat pada malam hari.",
            category="Utilitas",
            subcategory="Penerangan Jalan Umum",
            location_name="Koridor Sekolah Negeri 5",
            latitude=-6.196,
            longitude=106.821,
            reporter_name="RW 03",
            source="Surat Warga",
            status="New",
            priority="Medium",
            severity="Moderate",
            priority_score=45.0,
            agency="Dinas Perhubungan",
            due_date=now + timedelta(days=7),
            ai_summary="PJU padam di koridor sekolah perlu pengecekan teknis dan pengamanan sementara.",
            ai_confidence=0.71,
        ),
    ]
    for payload in samples:
        repo.create(payload)


def seed_knowledge(db: Session) -> None:
    if db.scalar(select(KnowledgeDocument).limit(1)):
        return
    docs = [
        KnowledgeDocument(
            title="SOP Rapat Wasdal dan Eskalasi Lintas OPD",
            document_type="SOP",
            summary="Alur intake, verifikasi, rapat keputusan, penugasan, monitoring, dan eskalasi.",
            tags=["sop", "rapat", "eskalasi"],
            chunk_count=12,
        ),
        KnowledgeDocument(
            title="RPJMD - Prioritas Pembangunan Daerah",
            document_type="RPJMD",
            summary="Referensi prioritas pembangunan dan indikator outcome daerah.",
            tags=["rpjmd", "pembangunan"],
            chunk_count=24,
        ),
    ]
    db.add_all(docs)
    db.commit()


def seed_meetings(db: Session) -> None:
    if db.scalar(select(MeetingRecord).limit(1)):
        return
    meeting = MeetingRecord(
        title="Rapat Wasdal Mingguan",
        transcript="Diputuskan Dinas PUPR melakukan perbaikan darurat pasar induk. PIC: Dinas PUPR, Deadline: H+3.",
        summary="Rapat menetapkan perbaikan darurat akses pasar induk sebagai prioritas minggu ini.",
        decisions=["Diputuskan Dinas PUPR melakukan perbaikan darurat pasar induk."],
        action_items=[
            {
                "task": "Perbaikan darurat akses pasar induk",
                "pic": "Dinas PUPR",
                "deadline": "H+3",
                "status": "Open",
            }
        ],
        minutes="# Notulen Rapat Wasdal Mingguan\n\nPrioritas: akses pasar induk.",
        confidence=0.8,
    )
    db.add(meeting)
    db.commit()
