# Wasdal

Wasdal adalah AI Case Management System untuk Pengawasan dan Pengendalian Pembangunan Daerah. Sasaran produk ini adalah menjadi Copilot untuk Bagian Ekbang: menerima laporan lintas kanal, mengubahnya menjadi kasus terstruktur, memberi rekomendasi berbasis AI, memantau tindak lanjut, dan membantu rapat Wasdal menghasilkan keputusan, notulen, serta action plan.

AI di Wasdal hanya memberi rekomendasi. Keputusan hukum, anggaran, penutupan kasus, dan perubahan kewenangan tetap dilakukan manusia.

## Fitur Utama

- Command center kasus, SLA, prioritas, peta, dan aktivitas terbaru.
- AI intake untuk klasifikasi, ringkasan, ekstraksi lokasi, prioritas, instansi, solusi, dan deadline.
- Case management dengan assignment, PIC, komentar, timeline, audit trail, dan versioning.
- Meeting mode untuk transcript, summary, keputusan, action item, deadline, PIC, dan notulen.
- Knowledge base untuk SOP, regulasi, RPJMD, RKPD, DPA, standar harga, dan dokumen pemerintah.
- Worker Celery untuk pemrosesan intake dan meeting secara asynchronous.
- RAG scaffold dengan pgvector-ready retrieval boundary.
- RBAC, JWT auth, audit log, soft delete, seed data, migration, Docker Compose.

## Struktur

```text
frontend/   Next.js, React, TypeScript, TailwindCSS, React Query, Leaflet
backend/    FastAPI, SQLAlchemy, Alembic, JWT, REST API, seed, tests
agents/     AI agent graph: intake, summary, classification, priority, geo, recommendation, meeting
rag/        RAG chunking dan retrieval boundary untuk pgvector
worker/     Celery worker untuk AI processing
shared/     Kontrak domain, role, kategori, dan priority rules
docs/       Arsitektur, ERD, dan API documentation
```

## Menjalankan Lokal

1. Buat file `.env` dari `.env.example`.
2. Jalankan stack:

```bash
docker compose up --build
```

3. Buka aplikasi:

- Frontend: http://localhost:3001
- API: http://localhost:8001
- Swagger: http://localhost:8001/docs
- MinIO Console: http://localhost:9001

Demo login:

```text
admin@wasdal.local / wasdal123
ekbang@wasdal.local / wasdal123
pimpinan@wasdal.local / wasdal123
```

## Menjalankan Test Backend

```bash
cd backend
pytest
```

Test memakai SQLite lokal melalui `backend/app/tests/conftest.py`.

## Perintah Migration

```bash
cd backend
alembic upgrade head
alembic revision --autogenerate -m "change description"
```

Untuk kemudahan lokal, API juga dapat membuat tabel dan seed data saat startup melalui `AUTO_CREATE_TABLES=true`.

## Environment AI

Wasdal siap memakai OpenAI-compatible API:

```text
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_API_KEY=...
EMBEDDING_MODEL=text-embedding-3-small
```

Saat API key kosong, agent graph memakai deterministic local rules agar demo tetap berjalan.
