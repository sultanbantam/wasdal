from __future__ import annotations

from celery import Celery

from backend.app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "wasdal-worker",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["worker.app.tasks"],
)
celery_app.conf.task_default_queue = "wasdal"
celery_app.conf.task_routes = {
    "worker.app.tasks.process_intake": {"queue": "wasdal"},
    "worker.app.tasks.process_meeting": {"queue": "wasdal"},
    "worker.app.tasks.run_sync_jdih": {"queue": "wasdal"},
    "worker.app.tasks.run_media_monitoring": {"queue": "wasdal"},
}

from celery.schedules import crontab
celery_app.conf.beat_schedule = {
    "sync-jdih-hourly": {
        "task": "worker.app.tasks.run_sync_jdih",
        "schedule": crontab(minute=0),  # Berjalan setiap awal jam (menit ke-0), 24x sehari
    },
    "media-monitoring-3-hours": {
        "task": "worker.app.tasks.run_media_monitoring",
        "schedule": crontab(minute=0, hour='*/3'),  # Berjalan setiap 3 jam
    },
}
