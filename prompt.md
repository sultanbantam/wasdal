# PROMPT PENGEMBANGAN MODUL JEJARING STAF AHLI DAERAH

## Konteks Produk

Anda adalah senior full-stack engineer, product architect, UX designer, data architect, dan QA engineer yang ditugaskan mengembangkan aplikasi **Wasdal** yang sudah berjalan dan dipublikasikan di `https://wasdal.vercel.app`.

Wasdal adalah aplikasi pengawasan dan pengendalian pemerintahan daerah. Aplikasi ini membantu pimpinan daerah, Sekretaris Daerah, Staf Ahli, Asisten Daerah, kepala OPD, dan camat memantau RPJMD/RKPD, perkembangan program, laporan kewilayahan, pengaduan, tindak lanjut, hambatan, kebutuhan keputusan pimpinan, dan percepatan pencapaian target.

Tambahkan sebuah halaman dan modul khusus bernama:

# **JEJARING STAF AHLI DAERAH**

Tagline:

> **Satu Data, Banyak Gagasan, Solusi Bersama untuk Daerah**

Modul ini harus memudahkan staf ahli gubernur, bupati, dan wali kota dari seluruh Indonesia menginput, memperbarui, memverifikasi, membandingkan, dan memanfaatkan database wilayahnya masing-masing. Data tersebut harus dapat digunakan untuk menyusun diagnosis daerah, rekomendasi kepada kepala daerah, proyek percontohan, bahan FGD, dan usulan kebijakan kepada pemerintah pusat, terutama terkait transformasi fiskal pusat dan daerah.

Modul tidak boleh hanya menjadi formulir panjang atau gudang dokumen. Sistem harus mengubah data menjadi **informasi, peringatan, perbandingan, rekomendasi, dan keputusan yang perlu diambil**.

---

## Prinsip Pelaksanaan

1. Audit dahulu repository dan aplikasi yang sudah ada sebelum menulis kode.
2. Pertahankan teknologi, pola folder, komponen, autentikasi, design system, bahasa visual, dan konvensi coding yang sudah digunakan.
3. Jangan melakukan rewrite aplikasi jika tidak diperlukan.
4. Jangan menghapus, mengubah arti, atau merusak fitur dan data Wasdal yang sudah ada.
5. Buat migration yang aman dan dapat dijalankan berulang tanpa merusak data.
6. Gunakan TypeScript secara ketat jika proyek saat ini menggunakan TypeScript.
7. Semua halaman harus responsif dan nyaman digunakan melalui ponsel karena sebagian besar input akan dilakukan dari lapangan.
8. Gunakan bahasa Indonesia yang sederhana. Istilah teknis diberi tooltip atau penjelasan singkat.
9. Setiap perubahan data penting harus memiliki riwayat, sumber, waktu pembaruan, dan pengguna yang mengubahnya.
10. Jangan mengarang data nyata. Demo dan seed harus diberi label jelas sebagai data contoh.

---

## Tahap 1 — Audit Aplikasi yang Ada

Sebelum implementasi, lakukan pemeriksaan dan tuliskan ringkasannya dalam `IMPLEMENTATION_NOTES.md`:

- framework, versi runtime, package manager, database, ORM, autentikasi, storage, dan deployment;
- struktur route, layout, navigasi, komponen UI, state management, API, dan pola validasi;
- role dan permission yang sudah tersedia;
- struktur database eksisting serta hubungan dengan RPJMD, RKPD, program, kegiatan, OPD, wilayah, pengaduan, tindak lanjut, dan `Decision Required`;
- komponen yang dapat digunakan kembali;
- potensi konflik atau duplikasi data;
- migration plan, rollback plan, dan risiko implementasi.

Jika sebuah konsep sudah tersedia, integrasikan. Jangan membuat tabel, role, halaman, atau komponen ganda dengan fungsi serupa.

---

## Sasaran Pengguna

Modul harus mendukung pengguna berikut:

### 1. Super Admin Nasional

- mengelola master provinsi, kabupaten/kota, kategori, periode, indikator, dan akun koordinator;
- melihat seluruh data agregat nasional;
- tidak boleh sembarangan mengubah data daerah tanpa jejak audit;
- mengelola proses verifikasi dan publikasi nasional.

### 2. Koordinator Nasional Jejaring Staf Ahli

- melihat data lintas daerah;
- membuat agenda FGD dan permintaan data;
- mengelompokkan persoalan serta gagasan;
- menyusun rekomendasi bersama;
- mengelola proses verifikasi substansi.

### 3. Admin Daerah

- ditetapkan untuk satu daerah;
- mengelola anggota tim daerah;
- mengisi dan memperbarui seluruh data daerahnya;
- mengirim data untuk verifikasi;
- tidak dapat melihat data terbatas milik daerah lain.

### 4. Staf Ahli Kepala Daerah

- dapat menginput diagnosis, isu strategis, gagasan, rekomendasi, proyek percontohan, dan kebutuhan keputusan pimpinan;
- dapat mengomentari dan memvalidasi data sesuai kewenangan;
- hanya dapat menyunting data daerah yang ditugaskan kepadanya.

### 5. Kontributor OPD

- hanya dapat menginput atau memperbarui bagian yang ditugaskan;
- tidak dapat memublikasikan data final;
- dapat mengunggah bukti pendukung dan menjawab permintaan perbaikan.

### 6. Pimpinan Daerah

- Wali Kota/Bupati/Gubernur, Wakil Kepala Daerah, dan Sekda memperoleh tampilan ringkas;
- dapat memberikan disposisi, persetujuan, penolakan, catatan, dan menetapkan keputusan;
- fokus pada data strategis dan `Decision Required`.

### 7. Viewer Publik atau Peserta FGD

- hanya melihat data yang sudah ditandai publik;
- tidak dapat melihat data pribadi, dokumen internal, catatan pimpinan, atau data fiskal yang dibatasi.

Terapkan **role-based access control** dan **row-level access** per daerah. Penentuan akses harus dilakukan di server, bukan hanya menyembunyikan tombol pada antarmuka.

---

## Struktur Navigasi Modul

Tambahkan menu utama **Jejaring Staf Ahli** dengan subhalaman:

1. Beranda Jejaring
2. Profil Daerah Saya
3. Data Wilayah
4. Diagnosis Daerah
5. Fiskal dan APBD
6. RPJMD dan RKPD
7. Isu Strategis
8. Bank Gagasan
9. Proyek Percontohan
10. Aset dan Potensi Daerah
11. Kolaborasi dan Replikasi
12. FGD Nasional
13. Decision Required
14. Laporan dan Ekspor
15. Validasi Data
16. Pengaturan Tim Daerah

Jika navigasi menjadi terlalu padat pada layar ponsel, kelompokkan menu ke dalam: **Data Daerah**, **Analisis**, **Gagasan dan Aksi**, serta **Kolaborasi**.

---

## Halaman 1 — Beranda Jejaring

Beranda harus berbeda berdasarkan role.

### Dashboard Staf Ahli Daerah

Tampilkan:

- persentase kelengkapan database daerah;
- tanggal pembaruan terakhir;
- data yang segera kedaluwarsa;
- daftar isian yang belum lengkap;
- permintaan koreksi dari verifikator;
- lima isu paling mendesak;
- lima gagasan prioritas;
- status proyek percontohan;
- rekomendasi yang belum ditindaklanjuti;
- `Decision Required` yang menunggu pimpinan;
- agenda FGD dan tenggat permintaan data;
- tombol cepat `Tambah Isu`, `Tambah Gagasan`, `Perbarui Data`, dan `Ajukan Keputusan`.

### Dashboard Nasional

Tampilkan:

- jumlah daerah terdaftar, aktif, lengkap, belum lengkap, dan belum memperbarui data;
- peta Indonesia yang dapat difilter;
- persebaran isu strategis;
- gagasan yang paling banyak diajukan;
- daerah dengan solusi yang dapat direplikasi;
- kelompok kapasitas fiskal dan tantangan utama;
- status verifikasi;
- daftar permintaan data nasional;
- ringkasan FGD dan rekomendasi yang sedang dirumuskan.

Gunakan kartu, tabel, grafik, dan peta hanya jika membantu pengambilan keputusan. Setiap angka harus dapat diklik untuk melihat data sumbernya.

---

## Halaman 2 — Profil Daerah Saya

Buat wizard bertahap dengan autosave dan indikator kelengkapan.

### A. Identitas Pemerintahan

- nama provinsi;
- nama kabupaten/kota;
- kode wilayah resmi;
- jenis daerah;
- ibu kota/pusat pemerintahan;
- alamat kantor;
- situs resmi;
- nama kepala daerah, wakil, dan Sekda;
- periode jabatan;
- jumlah dan bidang staf ahli;
- daftar OPD;
- nama admin serta PIC data daerah.

### B. Gambaran Wilayah

- luas wilayah;
- jumlah kecamatan, kelurahan/desa, RW dan RT jika tersedia;
- jumlah penduduk;
- kepadatan penduduk;
- karakter wilayah: perkotaan, perdesaan, kepulauan, pesisir, perbatasan, pegunungan, industri, pertanian, pariwisata, atau kombinasi;
- peta batas wilayah;
- pusat pertumbuhan dan kawasan strategis;
- akses transportasi utama;
- risiko bencana dominan.

### C. Sosial dan Ekonomi

- pertumbuhan ekonomi;
- PDRB dan sektor dominan;
- tingkat kemiskinan;
- pengangguran;
- ketimpangan;
- IPM;
- jumlah UMKM;
- investasi;
- indikator pendidikan, kesehatan, perumahan, sanitasi, dan layanan dasar lainnya.

Setiap nilai harus memiliki:

- tahun/periode;
- satuan;
- sumber data;
- tautan atau dokumen bukti;
- status sementara/terverifikasi;
- catatan metodologi;
- waktu pembaruan.

---

## Halaman 3 — Data Wilayah

Buat pusat data indikator yang fleksibel dan tidak mengunci semua daerah pada struktur yang sama.

Fitur wajib:

- tabel indikator dengan filter tahun, kategori, kecamatan, dan status validasi;
- input manual satu per satu;
- input massal melalui template Excel/CSV;
- preview sebelum impor;
- pemetaan kolom;
- validasi tipe data, satuan, kode wilayah, duplikasi, dan periode;
- laporan baris berhasil dan gagal beserta alasan;
- kemampuan memperbaiki baris gagal tanpa mengulang seluruh impor;
- riwayat versi dan rollback oleh pengguna berwenang;
- unduh kembali data beserta metadata sumber;
- tampilan tren dan perbandingan internal antarkecamatan bila datanya tersedia.

Sediakan template impor yang ramah pengguna dengan kolom minimum:

`kode_wilayah`, `nama_wilayah`, `kode_indikator`, `nama_indikator`, `periode`, `nilai`, `satuan`, `sumber`, `status_data`, `catatan`.

---

## Halaman 4 — Diagnosis Daerah

Diagnosis bukan kumpulan angka. Sistem harus membantu staf ahli menjawab:

- Apa masalah utamanya?
- Siapa yang terdampak?
- Di mana lokasi masalah?
- Apa penyebab langsung dan akar masalahnya?
- Data apa yang membuktikannya?
- Apa yang sudah dilakukan?
- Mengapa belum selesai?
- Siapa yang memiliki kewenangan?
- Keputusan apa yang diperlukan?

Gunakan format diagnosis:

1. Pernyataan masalah.
2. Kondisi awal/baseline.
3. Kelompok dan wilayah terdampak.
4. Akar masalah.
5. Kewenangan: pusat, provinsi, kabupaten/kota, lintas daerah, atau multipihak.
6. Program yang sudah berjalan.
7. Kesenjangan program.
8. Risiko jika tidak ditangani.
9. Pilihan solusi.
10. Rekomendasi staf ahli.
11. Decision Required.

Tambahkan prioritas berdasarkan **dampak, urgensi, jumlah warga terdampak, risiko fiskal, risiko layanan, kelayakan, dan kewenangan**. Sistem boleh menghitung skor awal, tetapi pengguna harus dapat melihat komponennya dan memberikan alasan jika mengubah prioritas.

---

## Halaman 5 — Fiskal dan APBD

Buat halaman diagnosis fiskal yang sederhana tetapi kuat. Jangan menjadikannya sistem akuntansi pengganti SIPD.

### Data yang Dapat Diinput

- total pendapatan;
- PAD dan komponennya;
- transfer pusat/provinsi;
- pendapatan sah lainnya;
- total belanja;
- belanja pegawai;
- belanja barang dan jasa;
- belanja modal;
- belanja infrastruktur pelayanan publik sesuai definisi yang digunakan daerah;
- belanja wajib/mandatory spending;
- pembiayaan;
- SILPA;
- kewajiban jangka menengah/panjang jika relevan;
- nilai dan biaya pemeliharaan aset;
- data target dan realisasi minimal lima tahun jika tersedia.

### Analisis Otomatis

- rasio PAD terhadap pendapatan;
- ketergantungan transfer;
- rasio belanja pegawai;
- rasio belanja modal;
- tren belanja pelayanan publik;
- pertumbuhan pendapatan dan belanja;
- selisih target dan realisasi;
- ruang fiskal indikatif;
- peringatan data anomali;
- simulasi sederhana jika pendapatan atau transfer naik/turun.

Setiap rumus harus dapat dilihat pengguna. Tampilkan disclaimer bahwa analisis merupakan alat bantu dan wajib diverifikasi BPKAD serta mengikuti definisi dan regulasi yang berlaku.

### Peta Jalan Transformasi Fiskal

Sediakan form untuk:

- kondisi awal;
- target tahunan;
- program efisiensi;
- optimalisasi pendapatan;
- optimalisasi aset;
- produktivitas aparatur;
- peningkatan kualitas pelayanan;
- kebutuhan dukungan pemerintah pusat;
- risiko dan mitigasi;
- penanggung jawab;
- indikator serta bukti hasil.

---

## Halaman 6 — Integrasi RPJMD dan RKPD

Gunakan data RPJMD/RKPD yang sudah ada di Wasdal. Jangan menggandakan sumber data.

Tampilkan hubungan:

`Isu Strategis → Misi/Tujuan/Sasaran RPJMD → Indikator → Program/Kegiatan RKPD → OPD → Anggaran → Realisasi → Outcome → Hambatan → Tindak Lanjut → Decision Required`.

Staf ahli harus dapat melihat:

- sasaran yang tertinggal;
- indikator merah/kuning/hijau;
- program yang tidak cukup berkontribusi terhadap sasaran;
- anggaran tinggi tetapi outcome rendah;
- isu wilayah yang belum terhubung ke program;
- rekomendasi percepatan;
- keputusan lintas OPD yang diperlukan.

---

## Halaman 7 — Isu Strategis

Setiap isu memiliki:

- judul dan ringkasan;
- kategori;
- wilayah/lokasi;
- tingkat pemerintahan terkait;
- OPD terkait;
- kelompok terdampak;
- data pendukung;
- foto, video, dokumen, dan tautan;
- status: draft, diajukan, diverifikasi, aktif, ditangani, selesai, atau diarsipkan;
- tingkat urgensi dan dampak;
- PIC;
- target penyelesaian;
- tindak lanjut;
- hubungan dengan RPJMD/RKPD;
- hubungan dengan gagasan atau proyek percontohan;
- kebutuhan keputusan pimpinan.

Sediakan tampilan daftar, kanban, peta, dan timeline. Hindari duplikasi dengan fitur pengaduan: pengaduan warga dapat ditautkan sebagai bukti munculnya isu strategis.

---

## Halaman 8 — Bank Gagasan

Gagasan harus dapat berasal dari staf ahli, OPD, kepala daerah, akademisi, komunitas, atau hasil FGD.

Struktur setiap gagasan:

- nama gagasan;
- masalah yang diselesaikan;
- ringkasan solusi dalam bahasa awam;
- unsur kebaruan;
- penerima manfaat;
- wilayah penerapan;
- OPD utama dan OPD pendukung;
- kebutuhan anggaran dan sumber pembiayaan potensial;
- kebutuhan regulasi atau keputusan;
- tahapan 30, 60, 90 hari;
- target 1–3 tahun;
- indikator output, outcome, dan dampak;
- risiko serta mitigasi;
- bukti atau referensi;
- status kesiapan;
- dapat/tidak dapat direplikasi;
- lisensi atau kepemilikan gagasan jika relevan.

Status kesiapan:

`Ide → Dikaji → Layak Uji → Pilot → Dievaluasi → Siap Direplikasi → Diadopsi`.

Sediakan matriks **Dampak vs Kemudahan Implementasi** dan filter berdasarkan kategori, biaya, waktu, daerah, status, serta kebutuhan kewenangan.

Tambahkan tombol `Saya Tertarik Mereplikasi`. Daerah peminat dapat membuka ruang kolaborasi tanpa otomatis memperoleh akses ke data internal daerah asal.

---

## Halaman 9 — Proyek Percontohan

Setiap pilot project harus mempunyai:

- masalah dan baseline;
- hipotesis perubahan;
- ruang lingkup serta lokasi;
- penanggung jawab;
- jadwal dan milestone;
- biaya dan sumber pembiayaan;
- metode pengadaan/kerja sama yang masih berstatus usulan sampai diverifikasi;
- indikator keberhasilan;
- metode pengukuran;
- bukti sebelum dan sesudah;
- risiko;
- keputusan pada setiap gerbang: lanjut, revisi, perluas, atau hentikan;
- evaluasi dan pelajaran;
- peluang replikasi.

Siapkan template proyek awal:

1. Dividen Efisiensi Gedung Pemerintah.
2. Satu Aset Banyak Manfaat.
3. Pajak Mudah, Usaha Tumbuh.
4. Tantangan Inovasi Kota.
5. Kesepakatan Pelayanan Kawasan.
6. Layanan Pendukung Bersama Antardaerah.

Template hanya membantu pengisian; pengguna tetap dapat membuat proyek lain.

---

## Halaman 10 — Aset dan Potensi Daerah

Jangan menggantikan sistem resmi barang milik daerah. Modul ini menjadi inventaris strategis tingkat kebijakan.

Data minimum:

- nama dan jenis aset/potensi;
- lokasi dan titik koordinat;
- OPD/pengelola;
- status penguasaan atau status hukum secara ringkas;
- kondisi;
- fungsi saat ini;
- tingkat pemanfaatan;
- biaya operasi dan pemeliharaan;
- waktu kosong jika berupa fasilitas;
- potensi pemanfaatan bersama;
- risiko;
- foto dan dokumen;
- tindak lanjut yang diperlukan.

Tampilkan aset yang tidak optimal, aset yang berpotensi digunakan bersama, dan kebutuhan layanan yang mungkin dipenuhi tanpa membangun fasilitas baru.

Data sensitif seperti nilai tertentu, dokumen legal, dan koordinat aset strategis harus dapat dibatasi aksesnya.

---

## Halaman 11 — Kolaborasi dan Replikasi

Fasilitasi kerja sama antardaerah:

- cari daerah berdasarkan masalah atau gagasan;
- lihat kartu ringkas daerah tanpa membuka data internal;
- nyatakan minat kolaborasi;
- undang anggota ke ruang kerja bersama;
- buat agenda, tugas, catatan rapat, keputusan, dan dokumen bersama;
- bandingkan baseline sebelum replikasi;
- catat adaptasi yang diperlukan;
- pantau hasil replikasi.

Berikan rekomendasi kecocokan berdasarkan karakter wilayah, skala masalah, kapasitas fiskal, dan kesiapan implementasi. Jelaskan bahwa rekomendasi sistem merupakan bantuan pencarian, bukan keputusan otomatis.

---

## Halaman 12 — FGD Nasional

Fitur harus mendukung rangkaian kegiatan sebelum, saat, dan setelah FGD:

### Sebelum FGD

- membuat tema dan pertanyaan kunci;
- mengundang daerah;
- meminta data atau policy brief;
- memantau daerah yang sudah/belum mengirim;
- mengelompokkan masukan secara manual dan berbantuan AI;

### Saat FGD

- daftar hadir;
- pembagian kelompok;
- agenda;
- catatan langsung;
- daftar masalah, gagasan, perbedaan pendapat, dan kesepakatan;
- voting atau prioritisasi yang transparan;
- keputusan dan PIC;

### Setelah FGD

- notulen;
- matriks rekomendasi;
- draf rumusan bersama;
- periode komentar;
- persetujuan final;
- tindak lanjut 30/60/90 hari;
- ekspor policy brief dan laporan.

Sediakan template **Rumusan Tangerang Selatan tentang Transformasi Fiskal Pusat dan Daerah** tanpa mengunci nama apabila penyelenggara atau lokasi berubah.

---

## Halaman 13 — Decision Required

Gunakan atau perluas fitur `Decision Required` yang sudah ada.

Setiap pengajuan harus memuat:

- masalah singkat;
- alasan keputusan diperlukan sekarang;
- pilihan A, B, C;
- manfaat, biaya, risiko, dan konsekuensi tiap pilihan;
- rekomendasi staf ahli;
- pihak yang harus memutuskan;
- batas waktu keputusan;
- data dan dokumen pendukung;
- dampak jika keputusan ditunda;
- disposisi dan status keputusan;
- tindak lanjut setelah keputusan.

Berikan notifikasi pengingat tanpa mengirim spam. Semua keputusan dan perubahan status harus masuk audit trail.

---

## Halaman 14 — Laporan dan Ekspor

Sediakan generator laporan:

- Profil Daerah;
- Dashboard Eksekutif;
- Diagnosis Daerah;
- Diagnosis Fiskal;
- Policy Brief maksimal 5 halaman;
- Bank Gagasan;
- Laporan Proyek Percontohan;
- Bahan FGD;
- Matriks Rekomendasi Nasional;
- Peta Jalan Transformasi Fiskal;
- Daftar Decision Required.

Format ekspor minimum: PDF, DOCX, XLSX/CSV untuk data tabular, serta tautan baca yang tunduk pada permission. Setiap ekspor harus menampilkan periode data, status verifikasi, sumber, dan tanggal pembuatan.

---

## Halaman 15 — Validasi dan Kualitas Data

Buat pusat kontrol kualitas dengan status:

`Draft → Diajukan → Perlu Perbaikan → Terverifikasi Daerah → Terverifikasi Substansi → Dipublikasikan → Diarsipkan`.

Fitur wajib:

- checklist kelengkapan;
- komentar verifikator per bagian/per field;
- alasan penolakan atau permintaan koreksi;
- perbandingan versi;
- data lama atau kedaluwarsa;
- deteksi nilai tidak wajar;
- sumber yang belum dicantumkan;
- konflik satuan dan periode;
- duplikasi indikator atau isu;
- bulk verification hanya untuk pengguna berwenang;
- audit trail yang tidak dapat diedit pengguna biasa.

Sistem tidak boleh menyebut sebuah data “benar” hanya karena formatnya lengkap. Bedakan **lolos validasi format**, **diverifikasi daerah**, dan **diverifikasi substansi**.

---

## Skema Data Minimum

Sesuaikan nama dan relasi dengan database yang sudah ada. Konsep minimum:

- `regions`
- `region_profiles`
- `region_memberships`
- `regional_units`
- `indicator_definitions`
- `indicator_values`
- `data_sources`
- `data_import_jobs`
- `data_validation_reviews`
- `strategic_issues`
- `issue_evidence`
- `diagnoses`
- `fiscal_snapshots`
- `fiscal_roadmaps`
- `ideas`
- `idea_interests`
- `pilot_projects`
- `pilot_milestones`
- `strategic_assets`
- `collaboration_spaces`
- `fgd_events`
- `fgd_submissions`
- `fgd_recommendations`
- `decision_requests`
- `comments`
- `attachments`
- `notifications`
- `audit_logs`

Semua tabel yang relevan harus memiliki:

- primary key UUID;
- `region_id` untuk isolasi tenant;
- status;
- created/updated timestamp;
- created_by/updated_by;
- soft delete jika sesuai;
- version atau concurrency control untuk mencegah penimpaan data;
- indeks pada filter yang sering digunakan.

Jangan simpan file besar langsung di database. Gunakan object storage yang sudah digunakan proyek dan simpan metadata serta aksesnya di database.

---

## AI Assistant yang Aman dan Berguna

Jika aplikasi sudah mempunyai atau akan memakai AI, tambahkan asisten bernama **Asisten Staf Ahli** untuk:

- merangkum data daerah yang dipilih pengguna;
- membantu menyusun diagnosis;
- menunjukkan data yang masih kurang;
- membuat draf policy brief;
- mengelompokkan isu dan gagasan FGD;
- membandingkan dua atau lebih daerah dengan periode dan satuan yang sama;
- mengusulkan pertanyaan lanjutan;
- menyusun pilihan keputusan dari data yang tersedia.

Ketentuan wajib:

- AI hanya menggunakan data yang boleh diakses pengguna;
- selalu menampilkan sumber data internal yang digunakan;
- membedakan fakta, perhitungan, dan usulan AI;
- tidak boleh otomatis memublikasikan, memverifikasi, atau mengambil keputusan;
- hasil AI selalu berupa draf yang memerlukan persetujuan manusia;
- jangan mengirim dokumen sensitif ke model tanpa izin dan konfigurasi keamanan yang sesuai;
- log aktivitas AI tanpa menyimpan rahasia atau data pribadi secara berlebihan.

---

## UX dan Desain

- Ikuti design system Wasdal.
- Mobile-first dan dapat digunakan pada koneksi lambat.
- Form panjang menggunakan wizard, section, autosave, dan `Simpan sebagai Draft`.
- Tampilkan progress kelengkapan dan estimasi waktu pengisian.
- Sediakan tooltip dan contoh pengisian.
- Jangan menggunakan warna saja untuk menjelaskan status.
- Pastikan aksesibilitas keyboard, label input, contrast, focus state, dan pesan error.
- Filter harus dapat disimpan sebagai view pribadi.
- Tabel besar menggunakan pagination atau virtualisation.
- Tampilkan empty state yang menjelaskan langkah berikutnya.
- Konfirmasi sebelum tindakan berisiko, tetapi jangan memberi dialog berlebihan.

---

## Keamanan dan Privasi

- Terapkan validasi client dan server.
- Sanitasi input dan lindungi dari XSS, CSRF, injection, insecure direct object reference, dan upload berbahaya.
- Terapkan batas ukuran dan tipe file, pemeriksaan malware jika infrastruktur mendukung, serta signed URL dengan masa berlaku.
- Pisahkan data publik, internal, terbatas, dan rahasia.
- Terapkan least privilege.
- Jangan mengekspos service key, secret, atau data sensitif ke browser.
- Pastikan seluruh query sensitif dibatasi oleh `region_id` dan role pada server/database policy.
- Audit login, ekspor data, perubahan permission, publikasi, verifikasi, dan keputusan.
- Sediakan kebijakan retensi dan penghapusan data sesuai kewenangan admin.
- Data pribadi pengguna hanya dikumpulkan sejauh diperlukan.

---

## Notifikasi

Gunakan pusat notifikasi dalam aplikasi. Tambahkan email/WhatsApp hanya jika integrasi dan persetujuan pengguna sudah tersedia.

Pemicu notifikasi:

- undangan bergabung;
- permintaan pengisian atau koreksi data;
- data mendekati kedaluwarsa;
- komentar/verifikasi;
- tenggat FGD;
- milestone pilot terlambat;
- Decision Required menunggu;
- keputusan telah diberikan;
- daerah lain berminat mereplikasi gagasan.

Pengguna harus dapat mengatur jenis dan frekuensi notifikasi.

---

## API dan Integrasi

1. Buat service layer agar sumber data eksternal dapat ditambahkan tanpa mengubah UI utama.
2. Prioritaskan integrasi melalui API resmi jika tersedia dan diizinkan.
3. Data dari sumber eksternal masuk sebagai `data kandidat`, bukan langsung terverifikasi.
4. Simpan sumber, waktu sinkronisasi, periode, dan transformasi data.
5. Siapkan kemampuan impor dari Excel/CSV sebagai jalur utama ketika API belum tersedia.
6. Jangan melakukan scraping yang melanggar ketentuan layanan.
7. Siapkan webhook/API internal terdokumentasi untuk integrasi dengan modul Wasdal lainnya.

---

## Pencarian dan Perbandingan

Bangun pencarian global berdasarkan:

- nama daerah;
- isu;
- indikator;
- gagasan;
- proyek percontohan;
- aset/potensi;
- rekomendasi;
- dokumen.

Fitur perbandingan daerah harus:

- membandingkan indikator dengan definisi, periode, dan satuan yang kompatibel;
- menampilkan peringatan jika data tidak sebanding;
- memungkinkan normalisasi per kapita/per luas jika rumus dan data pendukung tersedia;
- tidak membuat ranking tunggal yang menyesatkan;
- menyediakan catatan konteks wilayah.

---

## Kebutuhan Pengujian

Tambahkan pengujian mengikuti alat yang sudah digunakan proyek:

- unit test untuk rumus dan validation schema;
- integration test untuk API, permission, import, dan workflow verifikasi;
- end-to-end test untuk alur utama;
- security test untuk akses lintas daerah;
- test upload dan ekspor;
- test mobile viewport;
- test migration pada salinan database pengembangan.

Skenario E2E minimum:

1. Admin membuat akun tim daerah.
2. Staf ahli mengisi profil melalui wizard.
3. Kontributor mengimpor indikator dari CSV dan memperbaiki baris gagal.
4. Staf ahli membuat diagnosis dari indikator.
5. Staf ahli membuat gagasan dan pilot project.
6. Staf ahli mengirim data untuk verifikasi.
7. Verifikator meminta perbaikan pada satu field.
8. Data diperbaiki dan disetujui.
9. Staf ahli mengajukan Decision Required.
10. Sekda/Wali Kota memberikan disposisi.
11. Koordinator nasional memasukkan data terverifikasi ke bahan FGD.
12. Daerah lain menyatakan minat mereplikasi gagasan tanpa memperoleh akses data internal.

---

## Seed dan Demo

Buat seed data **fiktif** yang menampilkan:

- satu provinsi;
- dua kabupaten/kota;
- beberapa indikator tiga tahun;
- satu isu strategis;
- satu diagnosis fiskal;
- dua gagasan;
- satu pilot project;
- satu FGD;
- satu Decision Required.

Semua data contoh harus diberi label `DEMO` dan tidak boleh tercampur dengan data produksi.

---

## Tahapan Implementasi

### Fase 1 — Fondasi dan MVP

- audit aplikasi;
- skema database dan RBAC;
- profil daerah;
- data wilayah dan impor CSV/Excel;
- diagnosis daerah;
- isu strategis;
- bank gagasan;
- Decision Required;
- validasi dan audit log;
- dashboard staf ahli.

### Fase 2 — Transformasi Fiskal dan Aksi

- fiskal/APBD;
- peta jalan transformasi fiskal;
- integrasi RPJMD/RKPD;
- proyek percontohan;
- aset dan potensi;
- dashboard pimpinan.

### Fase 3 — Jejaring Nasional

- dashboard nasional;
- kolaborasi dan replikasi;
- FGD nasional;
- perbandingan daerah;
- laporan/policy brief;
- AI Assistant dengan guardrail.

Selesaikan tiap fase secara end-to-end. Jangan membuat banyak halaman kosong atau tombol palsu.

---

## Kriteria Penerimaan MVP

MVP dianggap selesai apabila:

- pengguna hanya dapat mengakses daerah sesuai kewenangannya;
- admin daerah dapat mengundang dan mengatur tim;
- profil daerah dapat disimpan bertahap dan memiliki progress kelengkapan;
- data indikator dapat diinput manual dan diimpor massal;
- sumber, periode, satuan, dan status verifikasi tercatat;
- staf ahli dapat membuat isu, diagnosis, gagasan, dan Decision Required;
- data dapat dikirim, dikoreksi, diverifikasi, dan dilacak versinya;
- dashboard menampilkan hal yang harus dilengkapi dan ditindaklanjuti;
- pimpinan dapat membaca ringkasan serta memberi disposisi;
- semua tindakan kritis tercatat dalam audit trail;
- fitur lama Wasdal tetap berjalan;
- build, lint, typecheck, migration, dan test lulus;
- tidak ada secret atau data demo yang masuk ke produksi.

---

## Definition of Done

Sebelum menyatakan pekerjaan selesai:

1. Jalankan lint, typecheck, unit test, integration test, dan E2E penting.
2. Jalankan migration pada environment pengembangan dan verifikasi rollback.
3. Periksa hak akses dengan setidaknya empat role berbeda.
4. Uji akses ilegal dari pengguna daerah A ke data daerah B.
5. Uji tampilan ponsel dan desktop.
6. Periksa error, loading, empty, offline/interrupted connection, dan retry states.
7. Perbarui dokumentasi setup, environment variables, migration, seed, permission matrix, dan cara penggunaan.
8. Buat `CHANGELOG.md` dan `IMPLEMENTATION_NOTES.md`.
9. Sertakan daftar file yang diubah dan keputusan arsitektur penting.
10. Sertakan keterbatasan yang masih ada serta rekomendasi fase berikutnya.

---

## Perintah Eksekusi untuk Agent

Mulai dengan mengaudit repository. Setelah itu, tampilkan:

1. ringkasan arsitektur saat ini;
2. risiko dan hal yang perlu dipertahankan;
3. peta integrasi modul baru dengan fitur Wasdal;
4. rencana implementasi bertahap;
5. migration dan permission matrix yang diusulkan.

Kemudian langsung implementasikan **Fase 1/MVP** secara end-to-end tanpa menunggu konfirmasi tambahan, selama tidak ditemukan keputusan bisnis yang benar-benar mengubah ruang lingkup atau berisiko merusak data produksi.

Jika ada ketidakjelasan kecil, pilih solusi yang paling konsisten dengan aplikasi yang ada dan dokumentasikan asumsi. Jika ada risiko terhadap data produksi, autentikasi, atau hak akses, hentikan bagian berisiko tersebut, jelaskan masalahnya, dan lanjutkan bagian lain yang aman.

Jangan berhenti pada desain atau mockup. Hasil akhir harus berupa fitur yang berjalan, terintegrasi, diuji, dan siap ditinjau.
