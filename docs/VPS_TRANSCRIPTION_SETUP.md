# Mengaktifkan Transkripsi Otomatis di VPS Contabo

Frontend Vercel mengirim rekaman ke:

```text
https://api-wasdal.bamboochain.id/api/v1/meetings/transcribe
```

Domain tersebut harus mengarah ke VPS Contabo dan Nginx meneruskannya ke container backend Wasdal di port lokal `8001`.

## 1. Buat DNS Record

Di penyedia DNS domain `bamboochain.id`, buat atau perbarui record berikut:

```text
Type: A
Host/Name: api-wasdal
Value: IP publik VPS Contabo
TTL: 300 atau Auto
```

Jangan memakai record `CNAME` lain dengan nama `api-wasdal`.

Setelah beberapa menit, verifikasi dari VPS:

```bash
getent hosts api-wasdal.bamboochain.id
```

## 2. Siapkan environment backend

Pada folder proyek di VPS, buat `.env` dari `.env.example`. Isi nilai penting berikut dan jangan masukkan API key ke GitHub:

```dotenv
OPENAI_API_KEY=sk-proyek-anda
OPENAI_BASE_URL=https://api.openai.com/v1
JWT_SECRET=ganti-dengan-random-string-panjang
CORS_ORIGINS=https://wasdal.vercel.app
```

Jika memakai domain Vercel lain, tambahkan dengan pemisah koma pada `CORS_ORIGINS`.

## 3. Jalankan backend dan dependensinya

```bash
git pull origin main
docker compose up --build -d postgres redis minio createbuckets backend worker
docker compose ps
curl -i http://127.0.0.1:8001/api/v1/health
```

Hasil health check harus memuat `"status":"ok"`.

Port backend dipetakan ke `127.0.0.1:8001` saja. Akses publik dilakukan melalui Nginx dan HTTPS, bukan langsung ke port 8001.

## 4. Pasang Nginx dan HTTPS

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
sudo cp deploy/nginx/wasdal-api.conf /etc/nginx/sites-available/wasdal-api
sudo ln -sf /etc/nginx/sites-available/wasdal-api /etc/nginx/sites-enabled/wasdal-api
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d api-wasdal.bamboochain.id
```

Jika UFW aktif, buka HTTP dan HTTPS:

```bash
sudo ufw allow 'Nginx Full'
```

## 5. Uji dari VPS dan browser

```bash
curl -i https://api-wasdal.bamboochain.id/api/v1/health
```

Jika health check berhasil, rekam suara singkat di Wasdal lalu hentikan rekaman. Transkrip akan masuk ke kolom notulen.

## Jika Masih Gagal

Periksa log backend:

```bash
docker compose logs --tail=150 backend
```

Interpretasi umum:

- `OpenAI API Key is not configured`: isi `OPENAI_API_KEY` di `.env`, lalu restart `docker compose up -d backend`.
- `429` atau `insufficient_quota`: API key benar, tetapi kredit OpenAI habis.
- `502 Bad Gateway`: backend belum hidup atau Nginx tidak dapat mengakses `127.0.0.1:8001`.
- Domain tidak resolve: record DNS belum benar atau belum propagasi.
