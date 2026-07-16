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
}
