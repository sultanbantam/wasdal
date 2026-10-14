# PROMPT.MD --- WASDAL V2: TALENTA ASN + RUANG KOTA

## Instruksi implementasi untuk Agent AI Antigravity IDE

## 0. MISI

Anda adalah Senior Full-Stack Engineer, AI Engineer, Product Architect,
UX Designer, dan QA Engineer. Kembangkan aplikasi Wasdal yang SUDAH ADA
di `https://wasdal.vercel.app/` melalui repository yang terbuka di
Antigravity IDE.

**Jangan membuat aplikasi baru. Jangan mengganti nama Wasdal. Jangan
menghapus atau merusak fitur existing.** Tambahkan dua domain fitur yang
terintegrasi ke aplikasi yang sama:

1.  **TALENTA ASN** --- sosialisasi dan penyelarasan implementasi
    Manajemen Talenta, kualitas data, profil, kompetensi, talent
    mapping, pengembangan, succession planning, serta monitoring.
2.  **RUANG KOTA** --- kabel dan utilitas semrawut, trotoar terhalang,
    PKL, kendaraan yang menggunakan trotoar secara tidak semestinya,
    hotspot, pengelolaan ruang publik, serta insentif pejalan kaki
    melalui WalkPoints.

Keduanya wajib terhubung dengan fitur Wasdal existing: Case Management,
Kinerja Daerah, RPJMD/RKPD, Decision Required, Action Plan, Rapat,
Laporan, Knowledge Base, notifikasi, dan Audit Trail bila modul tersebut
sudah ada.

Wasdal adalah **Government Execution Control System** yang
menghubungkan:

`RPJMD/RKPD → Monitoring → Masalah → Analisis → Decision Required → Percepatan → Penugasan → Bukti → Verifikasi → Hasil`

AI adalah alat bantu analisis dan rekomendasi. Keputusan pemerintahan,
kepegawaian, penegakan, dan penggunaan anggaran tetap dilakukan manusia
yang berwenang.

------------------------------------------------------------------------

## 1. WAJIB: AUDIT REPOSITORY SEBELUM CODING

Sebelum mengubah file:

1.  Periksa struktur folder, README, package manifest, lockfile,
    konfigurasi build, route, komponen UI, auth, database, ORM, API,
    storage, test, dan deployment.
2.  Tentukan stack yang BENAR-BENAR digunakan. Jangan mengasumsikan
    Next.js, Supabase, Firebase, PostgreSQL, atau teknologi lain.
3.  Pelajari pola menu, layout, role/permission, form, validasi, API
    client, loading/error state, logging, dan desain yang sudah ada.
4.  Periksa perubahan Git dan file lokal. Jangan melakukan reset,
    menghapus, atau menimpa pekerjaan pengguna.
5.  Identifikasi model data existing yang bisa dipakai kembali, terutama
    case, action, decision, organization, user, document, evidence,
    notification, dan audit log.
6.  Buat rencana implementasi ringkas: halaman yang ditambah, komponen
    reusable, schema/migration, API, permission, risiko regresi, fase
    pengerjaan, dan acceptance criteria.
7.  Lanjutkan mengerjakan kode setelah rencana dibuat. Jangan berhenti
    hanya pada analisis, wireframe, atau mockup.
8.  Jika URL produksi tidak dapat diakses, gunakan repository sebagai
    sumber kebenaran dan sebutkan keterbatasannya di laporan.
9.  Jangan pernah mengekspos secret/API key atau memasukkannya ke source
    code, frontend, log, atau dokumentasi.
10. Jangan mengklaim integrasi aktif jika belum benar-benar
    diimplementasikan dan diuji.

Gunakan stack dan pola arsitektur existing. Lakukan perubahan modular,
backward-compatible, dan seminimal mungkin terhadap bagian yang tidak
terkait.

------------------------------------------------------------------------

## 2. NAVIGASI

Tambahkan menu berikut ke sidebar existing, tanpa menghilangkan menu
lama. Sesuaikan route dengan konvensi proyek.

-   Dashboard
-   Wasdal
-   Kinerja Daerah
    -   RPJMD
    -   RKPD
    -   Indikator
    -   Program/Kegiatan
    -   OPD
    -   Kecamatan
    -   Forecast
-   Decision Required
-   Percepatan
-   **Ruang Kota**
    -   Overview
    -   Kabel & Utilitas
    -   Trotoar & Pejalan Kaki
    -   PKL & Zona Aktivitas
    -   Parkir & Hambatan
    -   Hotspot
    -   WalkPoints
    -   Pembayaran/Perizinan (readiness; aktif hanya jika sah)
-   **Talenta ASN**
    -   Overview
    -   Sosialisasi
    -   Profil & Kualitas Data
    -   Kompetensi
    -   Talent Map / 9 Box
    -   Talent Pool
    -   Pengembangan / IDP
    -   Succession Planning
    -   Talent Mobility
    -   Monitoring Implementasi
    -   Decision Required
-   Rapat
-   Laporan
-   Knowledge Base
-   Notifikasi
-   Admin

Jangan memaksakan struktur folder atau route baru bila repository
memiliki pola yang lebih sesuai.

------------------------------------------------------------------------

## 3. ROLE-BASED ACCESS CONTROL

Gunakan RBAC existing. Jika belum memadai, perluas tanpa memutus
kompatibilitas.

Role yang perlu didukung sesuai kebutuhan: Wali Kota, Wakil Wali Kota,
Sekda, Staf Ahli, Asisten Daerah, Kepala OPD, admin OPD, Bagian Ekbang,
Bappeda, BKPSDM, Camat, Lurah, petugas lapangan/verifikator, ASN, admin
sistem, auditor/read-only.

Prinsip: - Pimpinan mendapat ringkasan strategis dan agregat secara
default. - Kepala OPD hanya mengakses data sesuai kewenangannya, kecuali
ada izin lintas OPD. - Camat melihat data wilayah dan tindak lanjut yang
relevan. - BKPSDM mengakses data Manajemen Talenta sesuai kewenangan. -
ASN hanya melihat profil dan informasi dirinya yang memang boleh
diakses. - Data asesmen, kinerja, talenta, disiplin, succession,
pelapor, dan lokasi pribadi memerlukan kontrol akses khusus. -
Authorization harus dilakukan di server/API/database, bukan hanya dengan
menyembunyikan menu. - Catat akses dan perubahan data sensitif di audit
log.

------------------------------------------------------------------------

# BAGIAN A --- TALENTA ASN

## 4. TUJUAN DAN BATASAN

Buat Talenta ASN sebagai fitur untuk sosialisasi, penyelarasan
implementasi, kesiapan data, pengembangan kompetensi, pemetaan talenta,
succession planning, dan monitoring Manajemen Talenta Pemkot Tangerang
Selatan.

Modul ini **bukan pengganti SIASN, MyASN, atau sistem resmi BKN**.
Integrasi BKN/SIASN hanya boleh dilakukan melalui API resmi jika
tersedia dan diizinkan. Dilarang scraping atau bypass autentikasi.

## 5. HALAMAN TALENTA ASN

### `/talent` --- Overview

Tampilkan data yang tersedia: - readiness implementasi; - cakupan
sosialisasi; - kelengkapan dan verifikasi data; - asesmen
tersedia/menunggu; - competency gap; - IDP aktif/terlambat; - posisi
kritis; - succession readiness; - keputusan yang diperlukan.

Tampilkan sumber data dan tanggal pembaruan. Jangan menampilkan angka
palsu jika belum ada data.

### `/talent/socialization` --- Sosialisasi

Fitur: - materi, regulasi, infografik, video, FAQ; - jadwal
sosialisasi/webinar; - kehadiran peserta; - learning path; - kuis
pemahaman; - konfirmasi membaca; - rekap per OPD; - pertanyaan yang
belum terjawab; - AI FAQ berdasarkan dokumen resmi yang sudah
diverifikasi.

Kuis hanya mengukur pemahaman materi; bukan dasar promosi atau kelayakan
jabatan.

### `/talent/me` --- Profil ASN

Tampilkan data yang diizinkan: - profil dan unit kerja; - riwayat
jabatan; - pendidikan; - pelatihan dan sertifikasi; - kompetensi; -
kinerja dari sumber resmi/terverifikasi; - penugasan tim/proyek; -
inovasi dan kontribusi yang diverifikasi; - status kelengkapan; -
rencana pengembangan; - sumber dan tanggal pembaruan.

ASN boleh mengajukan koreksi data, tetapi data resmi hanya berubah
melalui workflow verifikasi/approval.

### `/talent/data-quality`

Untuk BKPSDM: - data incomplete, unverified, duplicate, outdated,
conflicting; - asesmen/kinerja/kompetensi yang belum tersedia; - sumber
data; - pemilik tugas koreksi; - status verifikasi dan audit.

### `/talent/competency`

Tampilkan nama kompetensi, level saat ini, level yang dibutuhkan, sumber
asesmen, tanggal, gap, dan rekomendasi pengembangan. Kerangka, rumus,
dan level harus mengikuti pedoman resmi yang telah diverifikasi, bukan
asumsi agent.

### `/talent/9box`

Buat visualisasi 9 Box kinerja-potensi yang dapat difilter berdasarkan
OPD/kelompok jabatan sesuai izin. Formula harus configurable. Jangan
mengarang nilai, memasukkan seseorang ke kotak berdasarkan tebakan AI,
atau menyatakan hasil draft sebagai hasil resmi. Tampilkan definisi,
sumber, waktu, dan status verifikasi.

### `/talent/pool`

Talent pool dapat dikonfigurasi sesuai kebijakan resmi, misalnya
kepemimpinan, teknis, fungsional, digital, inovasi, dan talenta proyek.
Keanggotaan harus berasal dari proses resmi/terverifikasi, bukan
keputusan otomatis AI.

### `/talent/idp`

Individual Development Plan: - tujuan pengembangan; - kompetensi yang
ditingkatkan; - aktivitas/pelatihan/coaching/mentoring/penugasan; -
mentor jika ditetapkan; - tenggat; - progres; - bukti; - evaluasi; -
status verifikasi.

### `/talent/succession`

Tampilkan posisi kritis, kompetensi yang dibutuhkan, risiko kekosongan,
successor pool yang sah, readiness, gap pengembangan, dan tindak lanjut.
Perkiraan pensiun hanya dari sumber resmi dan akses yang diizinkan.
Status seperti `Ready Now`, `Ready < 1 Year`, `Development Required`,
atau `No Verified Successor` harus configurable dan tidak berarti
keputusan pengangkatan.

### `/talent/mobility`

Pencarian berbasis kompetensi, pengalaman, kualifikasi, minat karier
yang diberikan secara sah, dan kebutuhan organisasi. Output hanya
rekomendasi untuk ditinjau manusia, bukan mutasi otomatis.

### `/talent/implementation`

Monitoring persiapan, sosialisasi, kesiapan data, asesmen, pemetaan,
proses komite sesuai aturan, pengembangan, succession planning, dan
evaluasi. Setiap tahap memiliki target, PIC, tenggat, bukti, isu,
status, dan Decision Required.

## 6. AI UNTUK TALENTA ASN

Siapkan service/agent sesuai pola AI existing: - `TalentFAQAgent` -
`TalentDataQualityAgent` - `TalentDevelopmentAgent` -
`TalentSuccessionAnalysisAgent` - `TalentImplementationReadinessAgent`

Setiap output mencakup ringkasan, sumber, data yang digunakan, asumsi,
data yang kurang, confidence jika tersedia, rekomendasi, dan langkah
verifikasi manusia.

AI DILARANG: - menetapkan promosi, mutasi, demosi, atau hukuman; -
mengubah nilai resmi, hasil asesmen, atau 9 Box resmi; - menyimpulkan
seseorang tidak layak jabatan secara otomatis; - menggunakan agama, ras,
suku, jenis kelamin, preferensi politik, hubungan keluarga, atau atribut
terlarang sebagai dasar rekomendasi; - membuat klaim tentang
kinerja/integritas/disiplin tanpa data sah.

Sediakan **"Mengapa rekomendasi ini muncul?"** dengan faktor dan sumber
yang relevan. Jika data tidak cukup, jawab `DATA INSUFFICIENT`.

Hubungkan penugasan ASN pada kasus/proyek Wasdal dengan program/kegiatan
RPJMD/RKPD bila relasinya tersedia. Catat peran, bukti, dan verifikasi
atasan sebagai `Performance Evidence`, bukan perubahan otomatis nilai
kinerja resmi.

------------------------------------------------------------------------

# BAGIAN B --- RUANG KOTA

## 7. TUJUAN

Buat modul Ruang Kota untuk mengelola: 1. kabel dan utilitas semrawut;
2. trotoar yang terhalang; 3. PKL dan penggunaan ruang publik; 4.
kendaraan yang menggunakan trotoar secara tidak semestinya; 5. hotspot
masalah ruang kota; 6. program insentif pejalan kaki melalui WalkPoints.

Prinsipnya: **PREVENT → DETECT → VERIFY → DECIDE → ACT → VERIFY
RESULT**.

MVP tetap harus berjalan dengan laporan manual, foto, peta, verifikasi
petugas, dan action plan. Jangan mengklaim CCTV/AI real-time sudah
terintegrasi jika belum ada perangkat, API, izin, dan service yang
nyata.

## 8. HALAMAN RUANG KOTA

### `/urban` --- Overview

Tampilkan kasus aktif, hotspot prioritas, laporan baru, kabel belum
teridentifikasi, dugaan kabel tidak aktif yang menunggu konfirmasi,
hambatan trotoar, dampak aksesibilitas, titik PKL yang memerlukan
penataan, action plan terlambat, dan keputusan tertunda. Angka harus
berasal dari database; jika belum ada data tampilkan empty state.

### `/urban/cables` --- Kabel & Utilitas

Buat inventaris digital koridor kabel: - ID segmen/aset; - ruas dan
koordinat/geometri bila tersedia; - jenis utilitas; -
operator/pemilik; - status verifikasi kepemilikan; - status aktif
berdasarkan konfirmasi pemilik; - kondisi visual; - risiko; - tanggal
inspeksi; - foto sebelum/sesudah; - izin/rujukan; - tindakan, PIC,
tenggat, dan riwayat pekerjaan.

Fitur: peta/daftar, filter operator/ruas/kondisi/status, laporan kabel
kusut/menggantung/putus/rendah/tidak dikenal, klarifikasi operator, work
order, bukti, dan verifikasi setelah penataan.

**AI hanya boleh memberi label `Suspected inactive` atau
`Ownership unverified`.** Tidak boleh menyatakan kabel mati atau
memerintahkan pencabutan hanya dari foto. Konfirmasi operator dan
persetujuan instansi berwenang diperlukan.

### `/urban/sidewalks` --- Trotoar & Pejalan Kaki

Inventaris segmen trotoar: - ID dan ruas; - kecamatan/kelurahan; - lebar
tercatat; - kondisi permukaan; - tactile paving/jalur pemandu; - akses
kursi roda; - hambatan; - pencahayaan; - foto/tanggal inspeksi; - status
perbaikan.

Kategori internal: - `Protected Pedestrian Zone`; -
`Managed Public-Space Zone` (hanya bila penggunaan diizinkan secara
resmi dan jalur aman tetap terjaga); - `Needs Field Verification`.

Kategori tersebut bukan penetapan legalitas. **Jangan merekomendasikan
PKL/parkir pada tactile paving, akses difabel, jalur minimum pedestrian,
halte, penyeberangan, atau ruang yang wajib bebas hambatan.**

### `/urban/obstructions` --- Hambatan

Kategori: kendaraan di trotoar, PKL/barang menghalangi jalur, utilitas,
material konstruksi, sampah, pohon tumbang, kerusakan fasilitas, dan
lainnya.

Catat ID, waktu, lokasi, sumber, bukti, jenis, dampak, durasi jika
terverifikasi, aksesibilitas terdampak, confidence AI, status
verifikasi, instansi terkait, action plan, bukti penyelesaian, dan
relasi ke kasus berulang.

Deteksi duplikasi untuk menggabungkan laporan tentang kejadian/lokasi
yang sama sambil mempertahankan seluruh sumber laporan.

### `/urban/vendors` --- PKL & Zona Aktivitas

Tujuannya menata, bukan otomatis menggusur semua PKL dan bukan pula
melegalkan penggunaan trotoar. Catat lokasi, jenis usaha, waktu
aktivitas, zona yang diizinkan, kapasitas/luas, status verifikasi,
persyaratan kebersihan/akses, fasilitas alternatif, pembinaan, laporan
hambatan, dan riwayat penataan.

Status izin harus berasal dari proses resmi. Data pribadi pedagang tidak
ditampilkan publik.

### `/urban/hotspots`

Peta/list lokasi berulang untuk kabel semrawut, parkir trotoar, hambatan
PKL, aksesibilitas, trotoar rusak, bongkar muat, dan isu lain yang telah
diverifikasi. Tampilkan tren, jam, frekuensi, dampak, status
penyelesaian, dan OPD/instansi terkait.

### `/urban/field-verification`

Petugas menerima tugas, melihat lokasi, mengisi checklist,
mengambil/mengunggah foto, mencatat koordinat jika diizinkan, memberikan
hasil verifikasi, mengajukan tindak lanjut, dan mengunggah bukti sesudah
tindakan. Catat waktu, user, dan sumber. Jangan mengklaim metadata foto
selalu asli.

------------------------------------------------------------------------

## 9. SOLUSI OUT OF THE BOX: KABEL.ID / DIGITAL UTILITY PASSPORT

Implementasikan sebagai subfitur Kabel & Utilitas, bukan aplikasi
terpisah.

Setiap segmen memiliki catatan digital: ID, operator, jenis, rute,
status verifikasi, foto, tanggal inspeksi, izin/rujukan, pekerjaan,
kewajiban penataan, dan riwayat kasus. QR/NFC fisik adalah opsi fase
lanjut, bukan prasyarat MVP.

Buat **Utility Clutter Index** yang transparan berdasarkan kabel
kusut/bersilangan, menggantung, dugaan rendah, kepemilikan belum jelas,
kepadatan visual, laporan berulang, dan risiko yang sudah diverifikasi.
Tampilkan faktor, sumber foto, tanggal, confidence, dan status
verifikasi. Ini hanya prioritas inspeksi, bukan pengganti pemeriksaan
teknis.

Opsi intervensi yang dapat direkomendasikan: - inspeksi bersama
operator; - penataan/bundling; - identifikasi pemilik; - pencabutan
kabel yang sudah dipastikan tidak aktif melalui prosedur sah; -
konsolidasi tiang; - koridor utilitas bersama; - microduct/duct bawah
tanah untuk kawasan prioritas; - penanganan titik berbahaya.

Biaya dan waktu hanya ditampilkan bila ada data dasar; selain itu tulis
`Perlu survei/estimasi teknis`.

Deposit, performance bond, biaya pemulihan, atau credit penataan hanya
boleh diaktifkan jika dasar hukum, kontrak, perizinan, dan persetujuan
instansi tersedia. Jangan membuat tagihan otomatis.

------------------------------------------------------------------------

## 10. SOLUSI OUT OF THE BOX: PKL & PARKIR TROTOAR

Gunakan workflow:

`Deteksi/Laporan → Bukti → Verifikasi lokasi dan zona → Peringatan bila kebijakan resmi mendukung → Cek pemindahan → Rujuk ke petugas berwenang bila berlanjut → Proses resmi → Verifikasi hasil`

AI vision dapat disiapkan sebagai interface modular untuk mendeteksi
kendaraan pada polygon trotoar, tactile paving terhalang, clear
pedestrian path terganggu, kabel menggantung, dan hambatan berulang.
Untuk MVP, unggah foto + verifikasi manusia sudah cukup.

AI menghasilkan `candidate event` dengan confidence, **bukan vonis
pelanggaran**. Jangan membuat pengenalan wajah. Nomor kendaraan hanya
boleh diproses jika perlu, punya dasar hukum/kewenangan, akses terbatas,
dan kebijakan retensi. Jangan mempublikasikannya.

Zona PKL hanya boleh dicatat sebagai resmi jika ada penetapan/izin yang
sah. Zona harus memiliki jam, kapasitas, dasar hukum/dokumen, ruang
pedestrian yang wajib bebas, tanggal berlaku, dan instansi pengesah.
Aplikasi tidak boleh menciptakan legalitas otomatis.

------------------------------------------------------------------------

## 11. QRIS, DENDA/RETRIBUSI, DAN PEMBAYARAN

Ini memerlukan kontrol hukum dan fiskal paling ketat.

-   QRIS adalah kanal pembayaran, **bukan dasar hukum pungutan**.
-   Jangan menciptakan "pajak parkir trotoar" lewat aplikasi.
-   Jangan mengubah denda menjadi tarif yang seolah melegalkan parkir di
    trotoar.
-   Jangan hardcode nominal denda/retribusi.
-   Jangan memungut uang tanpa dasar hukum, kewenangan, tarif resmi,
    prosedur penetapan, dan kanal penerimaan yang disahkan.
-   Jangan menggunakan QRIS pribadi pegawai/petugas.
-   Jangan menampung pungutan di wallet aplikasi.
-   Jangan mengalirkan denda langsung ke saldo pejalan kaki.
-   Jangan menyatakan pembayaran berhasil hanya berdasarkan screenshot.
-   Integrasi pembayaran nyata hanya melalui kanal/provider resmi yang
    disetujui dan diverifikasi.

Buat workflow modular:

`Case → Human Verification → Legal Basis Check → Authorized Determination → Official Notice/Billing → Official Payment Channel → Reconciliation → Receipt → Audit`

Jika legal basis/integrasi belum tersedia, tampilkan
`SIMULATION / NOT ENABLED FOR COLLECTION`.

Status yang dapat digunakan: `Not Applicable`, `Pending Verification`,
`Awaiting Authorized Determination`, `Awaiting Official Billing`,
`Awaiting Payment`, `Paid - Reconciliation Pending`,
`Paid - Reconciled`, `Cancelled`, `Disputed`, `Integration Not Enabled`.

Setiap perubahan status mencatat actor, timestamp, source, dan audit
log. Jangan aktifkan collection production sebelum dasar hukum,
otorisasi, dan integrasi resmi diverifikasi.

------------------------------------------------------------------------

## 12. WALKPOINTS / PEDESTRIAN DIVIDEND

Buat WalkPoints sebagai program poin non-tunai untuk mobilitas aktif,
bukan cryptocurrency atau uang elektronik. Jangan menjanjikan konversi
tunai kecuali ada program dan struktur hukum yang sesuai.

Sumber pendanaan hanya melalui mekanisme sah dan transparan, misalnya
program APBD yang disetujui, sponsorship/CSR dengan perjanjian resmi,
kontribusi sukarela lewat kanal resmi, atau kerja sama yang disahkan.
**Denda tidak boleh otomatis dialihkan ke WalkPoints.** Penerimaan
pemerintah mengikuti mekanisme penerimaan dan penganggaran yang berlaku.

### WalkPoints MVP

-   program dan syarat;
-   pendaftaran dengan persetujuan;
-   check-in QR pada koridor/kegiatan resmi;
-   akun poin;
-   transaksi poin;
-   batas harian/mingguan;
-   deteksi penyalahgunaan;
-   katalog reward;
-   redemption workflow;
-   status verifikasi;
-   admin program;
-   audit log.

Jangan melacak GPS terus-menerus sebagai default. Jika
geofencing/pedometer digunakan, wajib ada izin eksplisit, minimisasi
data, tujuan jelas, opt-out, dan kebijakan retensi. Jangan menjual atau
memublikasikan riwayat lokasi individual.

Reward dapat berupa voucher UMKM peserta, tiket kegiatan, fasilitas
olahraga, program komunitas, penghargaan partisipasi, atau manfaat lain
yang benar-benar disetujui dan tersedia.

Buat program `Pedestrian-Friendly Merchant` dengan profil usaha yang
setuju tampil, lokasi, jam, status partisipasi, dan reward yang
benar-benar tersedia. Pendaftaran bukan bukti legalitas.

Jika kelak ada donasi/round-up sukarela, pisahkan dari harga barang dan
pungutan pemerintah; gunakan kanal resmi; tampilkan penerima, tujuan,
persetujuan, dan laporan penggunaan dana. Jangan mengaktifkan
pengumpulan uang nyata sebelum tata kelola dan kanal disetujui.

------------------------------------------------------------------------

## 13. URBAN SPACE DIGITAL TWIN

Buat peta/inventaris yang menghubungkan ruas jalan, segmen trotoar,
jalur pemandu, kabel/utilitas, titik hambatan, aktivitas PKL,
parkir/obstruction, fasilitas jalan, proyek perbaikan, laporan warga,
dan penanggung jawab.

Gunakan library peta existing. Jika belum ada, pilih yang kompatibel dan
hemat biaya. Sediakan import CSV/GeoJSON atau format yang sesuai untuk
data resmi yang telah diverifikasi. Jangan mengarang geometri atau
inventaris.

Setiap layer harus punya sumber, tanggal update, status verifikasi,
filter, legend, dan permission.

Buat `Public Space Health Index` dengan komponen yang dapat dijelaskan:
keterhalangan, aksesibilitas, kondisi fisik, pencahayaan, utilitas,
frekuensi kasus, dan waktu penyelesaian. Bobot configurable. Jika data
tidak cukup, tampilkan `Insufficient Data`, bukan skor palsu.

------------------------------------------------------------------------

# BAGIAN C --- DECISION REQUIRED DAN INTEGRASI

## 14. DECISION REQUIRED

Semua modul harus menggunakan mekanisme Decision Required existing. Jika
belum ada, buat komponen/model reusable untuk Wasdal, Kinerja Daerah,
Ruang Kota, dan Talenta ASN.

Decision dapat dipicu oleh: - masalah lintas OPD; - kasus berulang; -
tenggat terlewati; - perlu kebijakan/koordinasi; - perlu penataan
utilitas; - perlu penetapan zona/alternatif PKL; - butuh pendanaan
resmi; - aksesibilitas warga terancam; - indikator RPJMD/RKPD
berisiko; - data talenta belum siap atau posisi kritis belum memiliki
pipeline pengembangan.

Decision Card menampilkan judul, ringkasan, sumber,
lokasi/OPD/indikator, dampak, prioritas, akar masalah sementara, opsi
A/B/C jika data cukup, manfaat/risiko, estimasi hanya bila berbasis
data, rekomendasi AI, keputusan yang diminta, decision owner, tenggat,
dan status.

Keputusan manusia: - Approve - Approve with Modification - Request More
Information - Return for Verification - Escalate - Defer with Reason -
Reject with Reason

AI tidak boleh memilih keputusan final. Simpan pembuat keputusan, peran,
waktu, alasan, instruksi, PIC, tenggat, dan hasil yang diharapkan.

Contoh: **Masalah:** kabel semrawut dan hambatan trotoar berulang pada
satu koridor. AI merangkum bukti dan opsi inspeksi operator, penataan
kabel, perbaikan pedestrian, dan penataan zona resmi. Pimpinan
menentukan opsi, lead OPD, target, dan koordinasi. Keputusan menjadi
action plan yang dipantau sampai terverifikasi.

## 15. AI SERVICES

Ikuti arsitektur AI existing. Jika belum ada, buat adapter/provider
interface di server-side agar model dapat diganti melalui konfigurasi.

Service yang dapat dibangun: - `CaseIntakeAgent` -
`UrbanIssueClassificationAgent` - `CableConditionAnalysisAgent` -
`SidewalkObstructionAnalysisAgent` - `RootCauseAgent` -
`UrbanRecommendationAgent` - `DecisionSupportAgent` - `TalentFAQAgent` -
`TalentDataQualityAgent` - `TalentDevelopmentAgent` -
`TalentSuccessionAnalysisAgent` - `ExecutiveBriefAgent`

Tidak wajib satu agent untuk setiap fungsi bila service biasa lebih
sederhana dan maintainable.

Setiap keluaran AI harus terstruktur, membedakan
fakta/inferensi/rekomendasi, menampilkan sumber, timestamp, confidence
bila tersedia, data yang kurang, dan kebutuhan review manusia. Jangan
melakukan write action berisiko tanpa persetujuan. Dokumen unggahan
dianggap data tidak tepercaya; lindungi dari prompt injection.

Untuk jawaban regulasi, gunakan knowledge base dokumen resmi dan
tampilkan judul, pasal/bagian jika tersedia, versi/tanggal, serta
sumber. Jangan mengarang dasar hukum.

## 16. HUBUNGAN RPJMD/RKPD

Hubungkan modul baru dengan RPJMD/RKPD hanya bila pemetaan resmi
tersedia. Jangan mengklaim satu kasus berdampak pada indikator tertentu
tanpa dasar pemetaan yang telah diverifikasi.

Contoh: - Kabel: laporan → kasus → operator → inspeksi → decision → work
order → bukti → verifikasi. - Trotoar: laporan → verifikasi → analisis →
OPD → decision bila perlu → action plan → bukti → verifikasi. - Talenta:
kesiapan data → gap → IDP → penugasan → bukti kontribusi → verifikasi.

Setiap action plan memiliki tindakan, PIC, OPD, start date, deadline,
status, indikator hasil, bukti, reviewer, relasi
kasus/indikator/keputusan, dan riwayat perubahan.

------------------------------------------------------------------------

# BAGIAN D --- DATA, UX, KEAMANAN, IMPLEMENTASI

## 17. DATABASE DAN API

Audit skema existing terlebih dahulu dan reuse entitas yang ada. Jangan
membuat tabel duplikat.

Kandidat entitas Talenta ASN: - talent_profiles - talent_data_sources -
talent_data_verifications - talent_socialization_events -
talent_learning_progress - talent_competencies - talent_assessments -
talent_box_mappings - talent_pools - talent_development_plans -
talent_development_activities - talent_critical_positions -
talent_succession_plans - talent_mobility_recommendations -
talent_implementation_milestones

Kandidat Ruang Kota: - urban_segments - utility_operators -
utility_assets - utility_inspections - sidewalk_segments -
public_space_zones - urban_obstruction_events - street_vendor_records -
field_verifications - urban_intervention_plans - urban_evidence -
walkpoint_programs - walkpoint_accounts - walkpoint_transactions -
walkpoint_rewards - walkpoint_redemptions - official_payment_records
(hanya jika integrasi resmi diaktifkan)

Gunakan nama dan struktur yang sesuai dengan codebase. Setiap perubahan
penting mencatat actor, timestamp, object, nilai lama/baru jika relevan,
alasan, sumber, dan status verifikasi. Gunakan migration dan transaksi
database sesuai kebutuhan.

## 18. IMPORT DAN KNOWLEDGE BASE

Sediakan import terkontrol untuk daftar OPD/wilayah, dokumen
sosialisasi, data talenta yang diizinkan, inventaris kabel, segmen
trotoar, zona resmi, laporan lapangan, regulasi, dan program insentif.

Alur:
`Upload → Preview → Field Mapping → Validation → Duplicate Check → Human Review → Import → Audit`

Tampilkan error per baris; jangan menimpa data tanpa preview/approval;
catat sumber dan waktu; tandai data belum diverifikasi. Jangan
menyimpulkan legalitas dari file impor saja.

Knowledge base memiliki metadata, versi, tanggal berlaku, status
verifikasi, unit pemilik, permission, pencarian, dan sumber kutipan.

## 19. UI/UX

Gunakan design system existing. Bahasa utama UI adalah Bahasa Indonesia.
Desain harus bersih, modern, responsif, dan mudah dipahami pimpinan
dalam 30 detik.

-   KPI dapat di-drill-down.
-   Tabel memiliki search/filter/sort/pagination.
-   Form memiliki validasi.
-   Semua halaman memiliki loading, empty, error, success, dan
    unauthorized state.
-   Warna bukan satu-satunya penanda status.
-   Semua tombol harus berfungsi.
-   Jika integrasi belum aktif, tampilkan status dan alasan; jangan
    memberi kesan fitur sudah berjalan.

Dashboard: - **Wali Kota/Wakil Wali Kota:** ringkasan kinerja, Decision
Required, isu kritis, hotspot, readiness Talenta ASN, dan maksimal lima
prioritas hari ini. - **Sekda:** isu lintas OPD, keputusan tertunda,
action plan terlambat, kualitas data. - **Staf Ahli:** analisis
strategis, tren, akar masalah, opsi kebijakan. - **Asda:** OPD dalam
koordinasi, isu tertunda, percepatan. - **Kepala OPD:** tugas, deadline,
bukti, isu lintas OPD, kontribusi target. - **Camat:** kasus wilayah,
hotspot, laporan warga, verifikasi, tindak lanjut OPD. - **BKPSDM:**
sosialisasi, kualitas data, asesmen, kompetensi, IDP, succession risk. -
**ASN:** profil sendiri, materi, kelengkapan, dan rencana
pengembangan. - **Petugas lapangan:** penugasan, peta, checklist, unggah
bukti.

## 20. SECURITY DAN PRIVACY

Wajib: - authorization server-side; - validasi input; - proteksi upload
dan pembatasan tipe/ukuran file; - storage aman; - audit log; - least
privilege; - backup/migration aman; - data retention; - field-level
access bila diperlukan; - consent untuk fitur lokasi; - pembatasan
download; - perlindungan prompt injection.

Jangan memublikasikan profil talenta individual, asesmen, data ASN
sensitif, identitas pelapor, nomor kendaraan, atau riwayat perjalanan
individual. Jangan menggunakan pengenalan wajah.

Pembayaran/denda/retribusi/izin/insentif harus memiliki dasar hukum dan
otorisasi. Pembayaran melalui kanal resmi, penerimaan direkonsiliasi,
dan tidak ada pengalihan denda langsung ke individu.

## 21. IMPLEMENTASI BERTAHAP

**Fase 0 --- Audit:** stack, auth, database, routes, pola UI, test,
risiko.

**Fase 1 --- Fondasi:** menu, routes, RBAC, shared Decision
Required/Action Plan/Audit Trail, tanpa merusak modul existing.

**Fase 2 --- Ruang Kota MVP:** overview, inventaris kabel, trotoar,
hambatan, data PKL/zona resmi, hotspot, verifikasi lapangan, evidence,
action plan, import.

**Fase 3 --- Talenta ASN MVP:** overview, sosialisasi, FAQ berbasis
dokumen resmi, profil yang diizinkan, data quality, verifikasi,
kompetensi, IDP, monitoring implementasi.

**Fase 4 --- WalkPoints:** program, check-in QR, akun poin, transaksi,
reward, redemption, audit. Tidak mengaktifkan pungutan uang nyata.

**Fase 5 --- AI:** klasifikasi, ringkasan, rekomendasi, analisis akar
masalah, FAQ, executive brief, source traceability, human review.

**Fase 6 --- Integrasi lanjutan:** GIS lanjutan, computer vision, QR/NFC
aset, payment gateway/QRIS resmi, BKN API resmi, forecasting. Jangan
mengklaim integrasi production-ready sebelum diuji.

Selesaikan alur end-to-end per fase; jangan membuat banyak halaman
statis yang tidak tersambung ke backend.

## 22. TESTING / ACCEPTANCE CRITERIA

Jalankan test yang tersedia dan tambahkan test sesuai pola repository.

Minimal: 1. aplikasi existing tetap berjalan; 2. tidak ada regresi pada
halaman existing; 3. route baru memerlukan autentikasi dan permission
yang benar; 4. akses data sensitif diuji melalui API/server, bukan hanya
UI; 5. CRUD dasar Ruang Kota berfungsi; 6. workflow Talenta ASN
berfungsi sesuai permission; 7. form validation, upload, import,
empty/error states berfungsi; 8. action plan terhubung ke case/decision;
9. perubahan penting tercatat di audit log; 10. data demo diberi label
jelas; 11. AI tidak mengambil keputusan final; 12. tidak ada
pembayaran/denda production tanpa legal basis/integrasi; 13. WalkPoints
tidak dapat dimanipulasi dari browser dan tidak ada double redemption;
14. user tidak dapat melihat profil talenta di luar kewenangannya; 15.
data/indikator menampilkan sumber dan tanggal update; 16. build, lint,
type-check, migration check, dan test berhasil atau kegagalannya
dilaporkan dengan jelas.

Tambahkan test untuk deduplication, status verifikasi, approval
keputusan, pembayaran, pembatasan akses, transaksi poin, dan konsistensi
database.

## 23. DOKUMENTASI DAN LAPORAN AKHIR

Perbarui README, `.env.example` tanpa secret, dokumentasi arsitektur,
modul, permission, import, API, migration/ERD jika tersedia, petunjuk
lokal/deploy, serta daftar integrasi yang belum aktif.

Setelah implementasi, laporkan: 1. ringkasan audit repository; 2. fitur
yang benar-benar selesai; 3. file utama yang berubah; 4.
migration/schema; 5. endpoint/API; 6. hasil build/lint/type-check/test;
7. environment variable yang diperlukan; 8. cara menjalankan lokal; 9.
langkah deploy aman; 10. fitur yang belum terintegrasi; 11. keputusan
legal/operasional yang masih memerlukan persetujuan manusia.

## 24. DEFINISI BERHASIL

Wasdal tetap satu aplikasi terpadu. Pengguna berwenang dapat: - memantau
kesiapan dan pengembangan Talenta ASN; - mengelola data talenta melalui
verifikasi yang sah; - mencatat dan memetakan kabel/utilitas; - menerima
dan memverifikasi laporan hambatan trotoar; - mengelola hotspot dan zona
PKL resmi; - membuat Decision Required dan action plan; - memverifikasi
bukti penyelesaian; - menjalankan WalkPoints dalam program yang
disetujui; - menelusuri sumber data, keputusan, dan audit trail.

**Instruksi akhir:** audit repository, buat rencana, kemudian
implementasikan secara bertahap. Utamakan integrasi dengan Wasdal
existing, keamanan, data nyata, dan alur end-to-end. Jangan menghapus
fitur lama, jangan mengarang regulasi/angka/data, jangan mengaktifkan
pungutan tanpa dasar hukum, dan jangan menjadikan rekomendasi AI sebagai
keputusan pemerintah.

**Visi akhir:** WASDAL menjadi Government Execution Control System yang
menghubungkan kinerja pembangunan, penataan ruang kota, pengembangan
talenta ASN, keputusan pimpinan, dan tindak lanjut yang dapat
diverifikasi.
