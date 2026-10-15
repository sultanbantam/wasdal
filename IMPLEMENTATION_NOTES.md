# IMPLEMENTATION NOTES: MODUL JEJARING STAF AHLI DAERAH
**Wasdal — Pengawasan dan Pengendalian Pemerintahan Daerah**
*Tagline: "Satu Data, Banyak Gagasan, Solusi Bersama untuk Daerah"*

---

## 1. Audit Arsitektur dan Teknologi Eksisting

### 1.1 Stack Teknologi & Versi Runtime
| Komponen | Teknologi | Keterangan |
|---|---|---|
| **Backend Framework** | FastAPI (Python 3.12+) | Asynchronous REST API, OpenAPI docs terintegrasi di `/docs` |
| **Database & ORM** | PostgreSQL (Prod) / SQLite (Test/Dev) + SQLAlchemy 2.0 | `DeclarativeBase` dengan mapped columns bertipe ketat (`Mapped[...]`), connection pooling |
| **Data Validation** | Pydantic v2 | Validasi skema request/response DTO di layer schemas |
| **Worker & Queue** | Celery 5.4 + Redis 7 | Background task runner untuk pemrosesan asinkron dan batch job |
| **Storage** | MinIO / S3 compatible object storage | Penyimpanan dokumen evidence, lampiran rapat, dan berkas CSV/PDF |
| **Frontend Framework**| Next.js 15.5.22 (App Router) + React 19 + TypeScript | Static prerendering & client side components |
| **Styling & Design System** | TailwindCSS + Radix/Lucide Icons + Vanilla Tokens | Dark mode support, custom shadow, badge, panel, responsive mobile-first |
| **Deployment** | Vercel (Frontend) + Docker / Nginx NPM (Backend) | Frontend live di `https://frontend-xi-five-29.vercel.app` & `https://wasdal.vercel.app` |

### 1.2 Struktur Route, Layout, & Navigasi
- **Root Command Center** (`/`): Dashboard utama Wasdal (Case Board, AI Intake, Meeting Mode, AI Security, Integrasi SP4N LAPOR & JDIH).
- **Executive Dashboard** (`/executive/mayor`, `/executive/decision`, `/executive/upload`): Tampilan ringkas pimpinan daerah dan unggah data.
- **Ruang Kota** (`/urban/*`): 8 subhalaman (Overview, Cables, Sidewalks, Obstructions, Vendors, Hotspots, WalkPoints, Payments).
- **Talenta ASN** (`/talent/*`): 12 subhalaman (Sistem Merit, Sosialisasi, Profil ASN, Kualitas Data, Kompetensi, 9-Box, Talent Pool, IDP, Suksesi, Mobilitas, Roadmap).
- **Modul Baru — Jejaring Staf Ahli** (`/network/*`):
  Menggunakan layout mandiri `frontend/src/app/network/layout.tsx` yang responsif, dilengkapi drawer navigasi mobile dan tabs navigasi yang dikelompokkan ke dalam 4 pilar:
  1. **Data Daerah** (Beranda, Profil Daerah, Data Wilayah/Indikator, Fiskal & APBD, RPJMD/RKPD)
  2. **Analisis** (Diagnosis Daerah, Isu Strategis, Aset & Potensi)
  3. **Gagasan & Aksi** (Bank Gagasan, Proyek Percontohan, Decision Required Pimpinan)
  4. **Kolaborasi** (Kolaborasi & Replikasi, FGD Nasional, Validasi Data, Pengaturan Tim)

---

## 2. Pemetaan Role & Permission Matrix

### 2.1 Role Eksisting & Ekstensi Baru
Sistem Wasdal telah memiliki role dasar (`Administrator`, `Wali Kota`, `Wakil Wali Kota`, `Sekda`, `Staf Ahli`, `Asisten Daerah`, `Kepala OPD`, `admin OPD`, `Bappeda`).
Untuk mendukung **Jejaring Staf Ahli Nasional & Daerah**, ditambahkan pemetaan 7 hierarki role:

| Role Jejaring | Scope | Hak Akses Utama |
|---|---|---|
| **Super Admin Nasional** | Lintas Seluruh Daerah | Kelola master provinsi/kota, indikator nasional, verifikasi & publikasi nasional, akses agregat nasional. |
| **Koordinator Nasional** | Nasional & Regional | Kelola agenda FGD, permintaan data lintas daerah, kurasi konsensus rekomendasi kebijakan. |
| **Admin Daerah** | Tenant Daerah Tertentu (`region_id`) | Manajemen anggota tim daerah, verifikasi input OPD daerahnya, kirim usulan verifikasi ke pusat. |
| **Staf Ahli Kepala Daerah** | Tenant Daerah Tertentu (`region_id`) | Input diagnosis, isu strategis, formulasi gagasan, rekomendasi kebijakan, pengajuan `Decision Required`. |
| **Kontributor OPD** | OPD & Daerah Tertentu | Input indikator capaian, upload bukti dukung, perbaikan data atas catatan verifikator. |
| **Pimpinan Daerah** (Wali Kota/Bupati/Gubernur/Sekda) | Daerah Tertentu | Tampilan eksekutif ringkas, disposisi pimpinan, penetapan pilihan keputusan (`Decision Required`). |
| **Viewer / Publik / Peserta FGD** | Terbuka / Read-Only | Hanya melihat data yang berstatus `Dipublikasikan` (tidak dapat mengakses draf internal / catatan rahasia). |

### 2.2 Row-Level Access & Multi-Tenancy
- Seluruh model data jejaring memiliki foreign key `region_id`.
- Setiap query data pada server FastAPI diverifikasi dengan dependency `require_region_access`:
  - User ber-role Nasional dapat melihat data lintas daerah (dengan filter status publikasi).
  - User tingkat daerah diisolasi secara ketat hanya pada `region_id` miliknya.

---

## 3. Integrasi dengan Fitur Wasdal Eksisting (Zero Regression)

1. **Integrasi RPJMD & RKPD**:
   - Memanfaatkan tabel eksisting: `rpjmd`, `missions`, `goals`, `strategic_objectives`, `performance_indicators`, `programs`, `activities`.
   - Modul Jejaring Staf Ahli menautkan `strategic_issues` ke `performance_indicators.id` atau `programs.id` untuk melacak sasaran pembangunan yang terhambat.
2. **Integrasi Decision Required**:
   - Memperluas siklus `executive_decisions` dan menghubungkannya dengan `network_decisions` agar disposisi pimpinan daerah (Wali Kota/Sekda) tersinkronisasi langsung ke Executive Dashboard Wasdal.
3. **Integrasi Pengaduan & Kasus**:
   - Kasus-kasus taktis masyarakat (`cases`) dapat dijadikan *evidence* pendukung timbulnya Isu Strategis Daerah.
4. **Integrasi AI Assistant**:
   - Menggunakan `AIOrchestrator` dengan guardrail: AI hanya menyusun draf sintesis diagnosis/policy brief, tidak mengambil keputusan legal. Jika OpenAI kuota habis, fallback heuristik lokal tetap menjamin sistem berjalan.

---

## 4. Skema Database Modul Jejaring Staf Ahli

Tabel baru yang didefinisikan dalam `backend/app/models/network.py`:
1. `NetworkRegion`: Data master wilayah (provinsi, kabupaten, kota, kode wilayah Kemendagri).
2. `RegionProfile`: Profil lengkap identitas pemerintahan, demografi, sosial-ekonomi, karakter wilayah.
3. `RegionMembership`: Keanggotaan tim daerah (user_id, region_id, role, status aktif).
4. `NetworkIndicatorDefinition`: Master kamus indikator (makro, fiskal, SPM, layanan publik).
5. `NetworkIndicatorValue`: Nilai capaian indikator berkala (tahun, nilai, satuan, sumber, status verifikasi).
6. `NetworkStrategicIssue`: Isu strategis daerah (5W1H, urgensi, dampak, OPD PIC, tautan RPJMD).
7. `NetworkDiagnosis`: Lembar diagnosis staf ahli (masalah utama, akar penyebab, kesenjangan program, rekomendasi).
8. `NetworkFiscalSnapshot`: Snapshot fiskal dan APBD (PAD, Transfer, Belanja Pegawai, Belanja Modal, SILPA, ruang fiskal).
9. `NetworkFiscalRoadmap`: Rencana aksi transformasi fiskal menuju kemandirian daerah.
10. `NetworkIdea`: Bank gagasan & inovasi daerah (matriks dampak vs kemudahan, kesiapan replikasi).
11. `NetworkPilotProject`: Proyek percontohan (milestone, indikator keberhasilan, hasil evaluasi).
12. `NetworkStrategicAsset`: Inventaris aset strategis & optimalisasi pemanfaatan bersama.
13. `NetworkCollaboration`: Ruang kerja sama antardaerah & adopsi gagasan.
14. `NetworkFGDEvent`: Agenda FGD nasional/regional (tema, peserta, rumusan Tangerang Selatan).
15. `NetworkFGDRecommendation`: Rekomendasi bersama hasil konsensus FGD.
16. `NetworkDecisionRequest`: Kebutuhan keputusan pimpinan daerah (pilihan A/B/C, risiko, disposisi pimpinan).
17. `NetworkDataValidation`: Riwayat review validasi data (draft, perbaikan, terverifikasi daerah, substansi, publikasi).
18. `NetworkAuditLog`: Jejak audit perubahan data penting.

---

## 5. Rencana Migrasi & Rollback

- **Migration**: Menggunakan SQLAlchemy DDL (`Base.metadata.create_all(bind=engine)` pada startup atau script migration idempotent) dengan tipe UUID / String(36) PK.
- **Rollback Safety**: Semua tabel baru memiliki prefix `network_` atau nama entitas yang terisolasi (`regions`, `region_profiles`), sehingga tidak mengubah atau menghapus satu pun kolom pada tabel inti Wasdal (`cases`, `rpjmd`, `users`, `urban_*`, `talent_*`).
- **Seed Data**: Data contoh diberikan label tegas `[DEMO]` (misal: "Kota Tangerang Selatan [DEMO]", "Kabupaten Bogor [DEMO]", "Provinsi Banten [DEMO]") dan diinisialisasi otomatis tanpa merusak data live.

---

## 6. Kriteria Pengujian & Verifikasi Kualitas
1. **Unit & Integration Test (Backend)**:
   - Pengujian CRUD Profil Daerah & kelengkapan wizard.
   - Pengujian impor CSV data indikator & validasi baris gagal/sukses.
   - Pengujian isolasi data antar `region_id` (User Daerah A tidak boleh membaca draf internal Daerah B).
   - Pengujian alur verifikasi (Draft -> Diajukan -> Terverifikasi Daerah -> Terverifikasi Substansi).
   - Pengujian siklus Decision Required & Disposisi Walikota/Sekda.
2. **Frontend Build & Lint**:
   - `tsc --noEmit` 0 type error.
   - `next build` 100% prerender success pada semua rute `/network/*`.
3. **Mobile Viewport Test**:
   - Drawer navigasi responsif, layout kartu diagnosis dan indikator tidak overflow pada layar 375px–768px.
