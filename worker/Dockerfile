FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app:/app/backend

WORKDIR /app

COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt

COPY backend /app/backend
COPY agents /app/agents
COPY shared /app/shared
COPY rag /app/rag
COPY worker /app/worker

WORKDIR /app

CMD ["celery", "-A", "worker.app.celery_app", "worker", "--beat", "--loglevel=INFO", "-Q", "wasdal"]
