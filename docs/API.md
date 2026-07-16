# API Documentation

Swagger tersedia di `/docs` saat backend berjalan.

## Health

`GET /api/v1/health`

```json
{ "status": "ok", "service": "wasdal-api" }
```

## Auth

`POST /api/v1/auth/login`

```json
{
  "email": "admin@wasdal.local",
  "password": "wasdal123"
}
```

## Dashboard

`GET /api/v1/dashboard`

Mengembalikan metric card, distribusi status/kategori/prioritas, titik peta, aktivitas terbaru, executive brief, dan AI watchlist.

## Cases

`GET /api/v1/cases?size=50`

`POST /api/v1/cases`

```json
{
  "title": "Jalan rusak di akses pasar",
  "description": "Ratusan warga melaporkan jalan rusak dan distribusi pangan terganggu.",
  "category": "Infrastruktur",
  "source": "WhatsApp",
  "priority": "High"
}
```

`PATCH /api/v1/cases/{case_id}`

`POST /api/v1/cases/{case_id}/assign`

```json
{
  "pic": "Dinas PUPR",
  "agency": "Dinas PUPR",
  "reason": "Prioritas tinggi dan berdampak ekonomi"
}
```

`POST /api/v1/cases/{case_id}/comments`

`POST /api/v1/cases/{case_id}/status`

## AI Intake

`POST /api/v1/ai/intake`

```json
{
  "raw_text": "Ratusan warga melaporkan jalan pasar rusak berat dan viral di media lokal.",
  "source": "WhatsApp",
  "create_case": true,
  "reporter_name": "Operator Ekbang"
}
```

Output mencakup summary, category, priority, score, location, suggested agency, recommendations, confidence, audit notes, dan optional `case_id`.

## AI Meeting

`POST /api/v1/ai/meeting`

```json
{
  "title": "Rapat Wasdal Mingguan",
  "transcript": "Diputuskan perbaikan darurat jalan pasar. PIC: Dinas PUPR, Deadline: H+3.",
  "save_record": true
}
```

## Knowledge

`GET /api/v1/knowledge`

`POST /api/v1/knowledge`

```json
{
  "title": "SOP Eskalasi Wasdal",
  "document_type": "SOP",
  "summary": "Alur eskalasi lintas OPD",
  "tags": ["sop", "eskalasi"]
}
```

## Reports

`GET /api/v1/reports/executive-summary?period=Bulan%20berjalan`
