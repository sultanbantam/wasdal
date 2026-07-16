# Deployment

## Push ke GitHub

Repository remote:

```bash
git remote add origin https://github.com/sultanbantam/wasdal.git
git branch -M main
git add .
git commit -m "Initial Wasdal application"
git push -u origin main
```

Pastikan `.env` tidak ikut commit. File yang dipush cukup `.env.example`.

## Deploy Frontend ke Vercel

Wasdal adalah monorepo. Vercel sebaiknya dipakai untuk frontend Next.js saja.

Pengaturan project Vercel:

- Framework Preset: `Next.js`
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: default Next.js
- Install Command: `npm install`

Environment variable di Vercel:

```text
NEXT_PUBLIC_API_URL=https://DOMAIN-BACKEND-ANDA/api/v1
```

Jika backend belum online, frontend tetap bisa tampil dengan fallback data demo, tetapi fitur API produksi perlu backend FastAPI yang dapat diakses publik.

## Deploy Backend

Backend FastAPI, PostgreSQL, Redis, MinIO, dan worker Celery tidak ideal dijalankan langsung di Vercel. Pilihan yang lebih cocok:

- VPS dengan Docker Compose.
- Railway/Render/Fly.io untuk backend dan worker.
- Managed PostgreSQL + Redis + object storage kompatibel S3.

Setelah backend punya domain publik, update `NEXT_PUBLIC_API_URL` di Vercel.

## Local Production Check

```bash
docker compose up --build -d
```

URL lokal default di proyek ini:

- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:8001`
- Swagger: `http://localhost:8001/docs`
