from __future__ import annotations

from datetime import datetime

from backend.app.db.session import SessionLocal
from backend.app.schemas import CaseCreate
from backend.app.services.ai_orchestrator import AIOrchestrator
from backend.app.services.case_service import CaseService
from worker.app.celery_app import celery_app


@celery_app.task(name="worker.app.tasks.process_intake")
def process_intake(raw_text: str, source: str = "Worker", create_case: bool = True) -> dict:
    result = AIOrchestrator().intake(raw_text, source, [])
    if not create_case:
        return result

    with SessionLocal() as db:
        deadline = datetime.fromisoformat(result["suggested_deadline"]) if result.get("suggested_deadline") else None
        case = CaseService(db).create_case(
            CaseCreate(
                title=result["summary"][:180] or "Laporan Wasdal",
                description=raw_text,
                category=result["category"],
                subcategory=result["subcategory"],
                location_name=result["location_name"],
                latitude=result["latitude"],
                longitude=result["longitude"],
                source=source,
                status="Triage",
                priority=result["priority"],
                severity=result["severity"],
                priority_score=result["priority_score"],
                agency=result["suggested_agency"],
                due_date=deadline,
                ai_summary=result["summary"],
                ai_confidence=result["confidence"],
                suggested_solution=result["recommendations"],
            )
        )
        result["case_id"] = case.id
        return result


@celery_app.task(name="worker.app.tasks.process_meeting")
def process_meeting(title: str, transcript: str) -> dict:
    return AIOrchestrator().meeting(title, transcript)

@celery_app.task(name="worker.app.tasks.send_notification")
def send_notification(case_id: str, agency: str, title: str) -> dict:
    # Simulasi pengiriman notifikasi via WhatsApp / Email
    print(f"Mengirim notifikasi ke OPD {agency} untuk kasus {case_id}: {title}")
    # Jika API WA / Email tersedia, lakukan HTTP request ke provider di sini
    return {"status": "sent", "agency": agency, "case_id": case_id}

@celery_app.task(name="worker.app.tasks.run_sync_jdih")
def run_sync_jdih() -> dict:
    import asyncio
    from backend.app.services.jdih_scraper import sync_jdih_documents
    
    print("Memulai sinkronisasi otomatis JDIH harian...")
    with SessionLocal() as db:
        synced = asyncio.run(sync_jdih_documents(db))
    print(f"Sinkronisasi selesai! {synced} dokumen baru ditambahkan.")
    return {"status": "success", "synced_count": synced}
