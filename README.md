# Wasdal V2: Talenta ASN + Ruang Kota

Wasdal adalah **Government Execution Control System** untuk Pengawasan dan Pengendalian Pembangunan Daerah Kota Tangerang Selatan. Menghubungkan:
`RPJMD/RKPD → Monitoring → Masalah → Analisis → Decision Required → Percepatan → Penugasan → Bukti → Verifikasi → Hasil`.

AI di Wasdal hanya memberi rekomendasi. Keputusan hukum, anggaran, kepegawaian, dan penutupan kasus tetap dilakukan manusia yang berwenang.

---

## Fitur Utama

### 1. Wasdal & Case Management (Existing)
- Command center kasus, SLA, prioritas, peta, dan aktivitas terbaru.
- AI intake untuk klasifikasi, ringkasan, ekstraksi lokasi, prioritas, instansi, solusi, dan deadline.
- Case management dengan assignment, PIC, komentar, timeline, audit trail, dan versioning.
- Executive Dashboard (Walikota), Decision Required, dan Data Ingestion SIPD/Excel.
- Meeting mode untuk transcript, summary, keputusan, action item, deadline, PIC, dan notulen.
- Knowledge base untuk SOP, regulasi, RPJMD, RKPD, DPA, standar harga, dan dokumen pemerintah.

### 2. Ruang Kota (Baru)
- **Overview & Public Space Health Index**: Pemantauan skor kesehatan ruang publik, rekapitulasi isu kabel semrawut, hambatan pejalan kaki, dan hotspot kota.
- **Kabel & Utilitas (Digital Utility Passport / Kabel.ID)**: Inventaris koridor kabel udara, Utility Clutter Index transparan, filter operator utilitas, dan riwayat penataan bersama APJATEL.
- **Trotoar & Pejalan Kaki**: Inventaris segmen trotoar ramah difabel, jalur pemandu (tactile paving), ramp kursi roda, dan zona pejalan terlindungi.
- **Hambatan & Parkir Liar**: Deteksi dan pelaporan kendaraan di atas trotoar atau lapak penghalang dengan alur verifikasi fisik petugas.
- **PKL & Zona Tertata**: Pengelolaan zona PKL resmi berizin SK Walikota dengan kepastian ruang minimum pejalan kaki tetap steril.
- **Hotspot Masalah Ruang Kota**: Pemetaan titik berulang dengan analisis tren jam sibuk dan integrasi ke Decision Required.
- **WalkPoints (Pedestrian Dividend)**: Program insentif mobilitas pejalan kaki non-tunai, check-in QR koridor, saldo akun poin, dan penukaran voucher mitra UMKM lokal.
- **Kesiapan Pembayaran & Denda**: Pengawasan kepatuhan hukum fiskal bertanda `SIMULATION / NOT ENABLED FOR COLLECTION` dengan audit kas daerah resmi.

### 3. Talenta ASN (Baru)
- **Overview Sistem Merit**: Indeks kesiapan implementasi manajemen talenta, kualitas data, 9-box distribution, dan monitoring suksesi.
- **Sosialisasi & AI FAQ**: Akses materi regulasi PermenPAN-RB No. 3 Tahun 2020, agenda webinar, dan asisten AI FAQ interaktif.
- **Profil ASN Saya**: Akses mandiri riwayat kualifikasi, kinerja resmi (SKP), potensi asesmen BKN, kotak 9-box, dan form usulan koreksi data mandiri.
- **Kualitas Data & Audit BKPSDM**: Monitoring integrasi SIASN BKN dan SIMPEG, audit data conflicting/unverified, serta verifikasi kepegawaian.
- **Standar Kompetensi & Asesmen**: Kamus kompetensi manajerial, sosio-kultural, teknis, dan evaluasi kesenjangan (competency gap).
- **Talent Map (Matriks 9-Box)**: Visualisasi interaktif kuadran kinerja vs potensi yang disahkan Komite Talenta Daerah.
- **Talent Pool**: Kelompok kader talenta unggul (Pimpinan Tinggi, Administrator, Inovasi Digital, Teknis Ekbang).
- **Individual Development Plan (IDP)**: Rencana pengembangan kompetensi terarah 70:20:10 yang disetujui atasan langsung.
- **Succession Planning**: Pemetaan jabatan kritis pimpinan dan pipeline kader suksesor berstatus 'Ready Now'.
- **Mobilitas ASN**: Rekomendasi rotasi terarah berbasis kompetensi dengan kotak transparansi 'Mengapa rekomendasi ini muncul?'.
- **Monitoring Implementasi**: Pengawasan roadmap tahapan Sistem Merit menuju predikat Sangat Baik.

---

## Struktur Codebase

```text
frontend/   Next.js 15, React 19, TypeScript, TailwindCSS, React Query, Leaflet
backend/    FastAPI, SQLAlchemy 2.0, Pydantic v2, SQLite / PostgreSQL, REST API, seed, tests
agents/     AI agent graph: intake, summary, classification, priority, geo, recommendation, meeting
shared/     Kontrak domain, role meritokrasi, kategori, dan priority rules
```

---

## Menjalankan Backend & Test

1. Jalankan test lokal:
```bash
cd backend
python -m pytest
```

2. Jalankan frontend lokal:
```bash
cd frontend
npm run dev
```

---

## Demo Login

```text
admin@wasdal.local / wasdal123 (Administrator)
ekbang@wasdal.local / wasdal123 (Kepala Bagian Ekbang)
pimpinan@wasdal.local / wasdal123 (Pimpinan Daerah)
walikota@wasdal.local / wasdal123 (Wali Kota)
sekda@wasdal.local / wasdal123 (Sekretaris Daerah)
bkpsdm@wasdal.local / wasdal123 (Kepala BKPSDM)
satpolpp@wasdal.local / wasdal123 (Petugas Lapangan)
camat@wasdal.local / wasdal123 (Camat Serpong)
asn@wasdal.local / wasdal123 (Budi Santoso - Pegawai ASN)
```
