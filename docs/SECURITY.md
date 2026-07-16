# Security Notes

## Guardrails AI

AI tidak boleh:

- Menghapus data.
- Mengambil keputusan hukum.
- Menyetujui anggaran.
- Menentukan hukuman.
- Menutup kasus.
- Mengubah kewenangan.

Semua rekomendasi AI harus memiliki confidence score dan tetap diverifikasi manusia.

## Data Protection

- JWT dipakai untuk autentikasi.
- `require_roles()` tersedia untuk enforcement RBAC per endpoint.
- Password memakai PBKDF2-SHA256 dengan salt.
- Semua perubahan kasus dicatat dalam audit log.
- Soft delete disiapkan melalui `deleted_at`.
- Dokumen disimpan di MinIO, metadata di PostgreSQL.

## Production Checklist

- Ganti `JWT_SECRET`.
- Aktifkan HTTPS di reverse proxy.
- Batasi CORS ke domain resmi.
- Aktifkan backup PostgreSQL dan MinIO.
- Gunakan credential MinIO/PostgreSQL/Redis yang kuat.
- Tambahkan log redaction untuk data pribadi.
- Terapkan object lifecycle policy untuk dokumen sensitif.
