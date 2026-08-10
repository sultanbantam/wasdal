# ADDITIONAL MODULE — RPJMD & RKPD PERFORMANCE CONTROL CENTER

Tambahkan modul strategis bernama:

# KINERJA DAERAH

Module ini harus menjadi pusat monitoring, evaluasi, early warning, dan acceleration management untuk RPJMD dan RKPD.

Target pengguna:

* Wali Kota
* Wakil Wali Kota
* Sekretaris Daerah
* Staf Ahli Wali Kota
* Asisten Daerah
* Kepala Bappeda
* Kepala OPD
* Kepala Bagian Ekbang
* Camat
* pejabat terkait lainnya sesuai RBAC

Tujuan utama:

1. Menampilkan kemajuan pencapaian RPJMD.
2. Menampilkan kemajuan target RKPD setiap tahun.
3. Membandingkan target dengan realisasi.
4. Menemukan indikator yang tertinggal.
5. Menemukan penyebab keterlambatan.
6. Memberikan early warning.
7. Memberikan rekomendasi percepatan menggunakan AI.
8. Menentukan OPD/PIC yang bertanggung jawab.
9. Memantau tindak lanjut percepatan.
10. Menyediakan executive dashboard untuk pimpinan daerah.

---

# CORE CONCEPT

Bangun struktur data berjenjang:

RPJMD

→ Visi

→ Misi

→ Tujuan

→ Sasaran

→ Indikator Kinerja Utama

→ Target Tahunan

→ Program

→ Outcome

→ OPD Penanggung Jawab

→ RKPD

→ Program

→ Kegiatan

→ Subkegiatan

→ Indikator

→ Target

→ Anggaran

→ Realisasi Fisik

→ Realisasi Keuangan

→ Output

→ Outcome

→ Wilayah

→ PIC

→ Permasalahan

→ Tindak Lanjut

→ Status

Sistem harus dapat melakukan drill-down dari level Wali Kota sampai level subkegiatan.

Contoh:

Visi Daerah

→ Sasaran Strategis

→ Indikator

→ Target RPJMD

→ Target RKPD 2026

→ Program

→ OPD

→ Kegiatan

→ Subkegiatan

→ Anggaran

→ Realisasi

→ Permasalahan

→ Action Plan

---

# EXECUTIVE DASHBOARD

Buat dashboard khusus pimpinan daerah.

Header:

Kinerja Pembangunan Kota

Tampilkan:

* persentase pencapaian RPJMD
* pencapaian RKPD tahun berjalan
* indikator tercapai
* indikator belum tercapai
* indikator berisiko
* indikator kritis
* realisasi fisik
* realisasi keuangan
* deviasi target
* jumlah program bermasalah
* jumlah OPD dengan target tertinggal
* jumlah action plan aktif
* jumlah action plan terlambat

Gunakan visualization:

* KPI cards
* progress bar
* gauge
* line chart
* bar chart
* trend
* heatmap
* map
* traffic light indicator
* ranking table

Status warna:

GREEN
On Track

YELLOW
Need Attention

ORANGE
At Risk

RED
Critical

GREY
Data Not Available

---

# RPJMD DASHBOARD

Tampilkan semua sasaran strategis RPJMD.

Untuk setiap sasaran tampilkan:

Nama Sasaran

Indikator

Baseline

Target Akhir RPJMD

Target Tahun Berjalan

Realisasi

Persentase Capaian

Gap

Trend

Projection

Responsible OPD

Supporting OPD

Status

AI Assessment

Klik indikator harus membuka halaman detail.

---

# RKPD DASHBOARD

Tampilkan capaian RKPD tahun berjalan.

Filter:

Tahun

OPD

Kecamatan

Program

Kegiatan

Subkegiatan

Indikator

Prioritas Daerah

Status

Tampilkan:

Target

Realisasi

Persentase

Anggaran

Realisasi Anggaran

Realisasi Fisik

Deviasi

Forecast

Issues

Action Plan

---

# PERFORMANCE SCORE

Buat performance scoring engine.

Jangan hanya menggunakan realisasi anggaran.

Gunakan beberapa parameter:

Target Outcome

Target Output

Realisasi Fisik

Realisasi Keuangan

Milestone

Timeline

Quality

Benefit

Impact

Risk

Data Completeness

Bobot harus dapat dikonfigurasi oleh administrator.

Contoh default:

Outcome: 30%

Output: 20%

Physical Progress: 15%

Financial Progress: 10%

Milestone: 10%

Timeline: 5%

Quality: 5%

Impact: 5%

Jangan hardcode.

Admin harus dapat mengubah formula.

---

# TARGET VS REALIZATION

Untuk setiap indikator hitung:

Target

Realisasi

Variance

Achievement Percentage

Time Elapsed

Expected Achievement

Performance Gap

Forecast End of Year

Contoh:

Target Tahun 2026:
80%

Realisasi saat ini:
51%

Expected progress berdasarkan waktu:
63%

Gap:
-12%

Status:
AT RISK

---

# TIME BASED EXPECTATION

Progress tidak boleh hanya dibandingkan dengan target akhir tahun.

Gunakan waktu berjalan.

Contoh:

Jika tahun sudah berjalan 70%

namun indikator baru tercapai 40%

maka sistem memberikan warning.

Gunakan:

expected_progress

actual_progress

time_elapsed

variance

---

# FORECAST ENGINE

Bangun forecasting module.

Sistem memprediksi apakah target akhir tahun kemungkinan:

Achieved

Likely Achieved

At Risk

Unlikely Achieved

Critical

Gunakan:

historical progress

current velocity

remaining time

budget absorption

milestone completion

dependency

issues

OPD response

Untuk versi MVP gunakan rule-based forecasting terlebih dahulu.

Siapkan interface agar nantinya dapat menggunakan statistical atau ML forecasting.

---

# AI PERFORMANCE ANALYST

Buat agent:

PerformanceAnalystAgent

Tugas:

menganalisis capaian indikator

membandingkan target dan realisasi

menemukan gap

menemukan tren

mendeteksi potensi kegagalan target

mencari kemungkinan root cause

memberikan executive summary

Output structured JSON.

---

# AI ROOT CAUSE ANALYSIS

Buat:

RootCauseAgent

Untuk indikator yang tertinggal, AI harus menganalisis:

Planning Issue

Budget Issue

Procurement Issue

Land Issue

Permit Issue

Contractor Issue

Coordination Issue

Human Resources Issue

Data Issue

Technical Issue

Regulation Issue

Community Issue

Weather

External Dependency

Other

AI harus menjelaskan kemungkinan penyebab berdasarkan data yang tersedia.

Jangan membuat fakta baru.

Jika data tidak cukup tampilkan:

INSUFFICIENT DATA

---

# AI ACCELERATION AGENT

Buat agent:

AccelerationAgent

Fungsi utama:

menjawab pertanyaan:

“Bagaimana target ini dapat dipercepat agar tercapai?”

AI harus menghasilkan:

Quick Action

30 Day Action

60 Day Action

90 Day Action

Strategic Action

Setiap rekomendasi berisi:

Action

Responsible OPD

Supporting OPD

PIC

Deadline

Expected Impact

Required Resources

Dependency

Risk

Priority

Confidence Score

---

# ACCELERATION PLAYBOOK

Untuk indikator berstatus:

AT RISK

atau

CRITICAL

Sistem otomatis membuat:

ACCELERATION PLAN

Isi:

Current Condition

Target

Gap

Root Cause

Required Decision

Action Plan

Responsible Agency

Supporting Agency

PIC

Start Date

Deadline

Milestone

Required Budget

Budget Availability

Dependency

Risk

Expected Result

---

# EXECUTIVE DECISION

Untuk kasus yang membutuhkan keputusan pimpinan, tampilkan:

DECISION REQUIRED

Contoh:

Perlu keputusan Wali Kota

Perlu keputusan Sekda

Perlu koordinasi lintas OPD

Perlu percepatan pengadaan

Perlu penyesuaian kegiatan

Perlu koordinasi Pemerintah Provinsi

Perlu koordinasi Pemerintah Pusat

Perlu dukungan BUMD

Perlu dukungan swasta

Perlu penyelesaian lahan

Perlu kebijakan khusus

---

# EXECUTIVE BRIEF

Buat ExecutiveBriefAgent.

Setiap pagi atau berdasarkan permintaan sistem dapat menghasilkan:

EXECUTIVE PERFORMANCE BRIEF

Isi maksimal satu halaman.

Contoh:

KINERJA DAERAH

Overall RPJMD Performance

Overall RKPD Performance

Top 5 Achievements

Top 5 Risks

Critical Indicators

Delayed Programs

Budget Risk

Issues Requiring Mayor Decision

Recommended Acceleration

Next 7 Days Priorities

---

# ASK WASDAL AI

Tambahkan command interface.

Bukan chatbot umum.

Ini adalah executive query interface.

Contoh pertanyaan:

“Bagaimana progres RPJMD?”

“Indikator apa yang paling tertinggal?”

“OPD mana yang memiliki target paling berisiko?”

“Apa program prioritas yang berpotensi tidak tercapai?”

“Bagaimana pencapaian RKPD Kecamatan Serpong?”

“Bagaimana percepatan indikator kemiskinan?”

“Program mana yang realisasi anggarannya tinggi tetapi outcome rendah?”

“Masalah apa yang menghambat pencapaian target?”

“Keputusan apa yang perlu saya ambil minggu ini?”

Jawaban harus berdasarkan database.

Gunakan RAG/database retrieval.

Tidak boleh hallucination.

Setiap jawaban harus menunjukkan sumber data.

---

# PERFORMANCE TREE

Buat visual interactive performance tree.

Contoh:

RPJMD

├── Misi 1
│
├── Sasaran 1
│
├── Indikator A
│
├── OPD
│
└── Program
│
├── Kegiatan
│
└── Subkegiatan

User dapat klik setiap node.

Warna node berdasarkan performance.

---

# STRATEGY MAP

Tambahkan Strategy Map.

Hubungkan:

Misi

Tujuan

Sasaran

Indikator

Program

OPD

Outcome

Impact

Visualisasikan hubungan antar indikator.

---

# OPD PERFORMANCE DASHBOARD

Setiap OPD memiliki dashboard.

Tampilkan:

Performance Score

RPJMD indicators

RKPD indicators

Programs

Activities

Budget

Physical Progress

Financial Progress

Issues

Action Plans

Deadlines

Alerts

---

# OPD RANKING

Buat ranking dengan hati-hati.

Tujuannya untuk management dashboard, bukan hukuman otomatis.

Ranking berdasarkan:

Data Completeness

Timeliness

Target Achievement

Action Plan Completion

Physical Progress

Outcome Achievement

Tampilkan:

Top Performer

On Track

Need Attention

At Risk

Tidak boleh menghasilkan sanksi otomatis.

---

# CAMAT DASHBOARD

Buat dashboard khusus camat.

Filter berdasarkan wilayah kecamatan.

Tampilkan:

Program di wilayah

Kegiatan pembangunan

Progress

Issues

Public Complaints

Wasdal Cases

Infrastructure

Economic Indicators

Social Indicators

Priority Programs

Camat dapat:

melaporkan kondisi

memberikan verifikasi lapangan

mengunggah foto

memberikan komentar

mengusulkan percepatan

mengkonfirmasi progres

---

# GEOSPATIAL PERFORMANCE

Integrasikan dengan Map.

Tampilkan:

program

kegiatan

proyek

indikator

wasdal case

complaint

per kecamatan

per kelurahan

User dapat klik peta untuk melihat:

Project

Budget

Progress

Responsible OPD

Issues

Photo

Timeline

---

# BUDGET PERFORMANCE

Integrasikan:

Budget

Committed

Contracted

Realization

Remaining

Physical Progress

Financial Progress

Performance Outcome

Deteksi kondisi seperti:

High Budget Absorption + Low Physical Progress

High Physical Progress + Low Financial Progress

High Spending + Low Outcome

Low Spending + High Risk

---

# PROBLEM LINKAGE

Hubungkan modul Wasdal Case Management dengan RPJMD/RKPD.

Setiap Case harus dapat ditautkan ke:

RPJMD Indicator

RKPD Indicator

Program

Activity

Sub Activity

OPD

Location

Dengan demikian sistem dapat mengetahui apakah masalah lapangan berpotensi mempengaruhi pencapaian target pembangunan.

---

# ISSUE MANAGEMENT

Setiap indikator/program dapat memiliki issue.

Field:

Issue ID

Description

Category

Impact

Severity

Responsible OPD

PIC

Created Date

Target Resolution

Status

Root Cause

Solution

Evidence

Escalation

---

# ACTION PLAN

Setiap rekomendasi percepatan dapat dijadikan action plan.

Field:

Action

Indicator

Program

Responsible OPD

PIC

Supporting OPD

Start

Deadline

Progress

Expected Impact

Status

Evidence

Result

---

# ESCALATION SYSTEM

Jika target terlambat:

Level 1

PIC

Level 2

Head of Division

Level 3

Head of OPD

Level 4

Assistant Regional Secretary

Level 5

Sekda

Level 6

Mayor / Vice Mayor

Escalation rule harus configurable.

---

# EARLY WARNING SYSTEM

Bangun EarlyWarningAgent.

Alert jika:

progress terlalu lambat

target tidak sesuai timeline

anggaran rendah

anggaran terlalu tinggi dibanding output

milestone terlambat

action plan terlambat

data belum diupdate

indikator memburuk

masalah berulang

OPD belum memberikan tindak lanjut

---

# ALERT CENTER

Buat notification center.

Kategori:

Critical

Risk

Deadline

Budget

Data

Decision Required

Coordination Required

---

# WEEKLY PERFORMANCE REVIEW

Sistem otomatis membuat bahan rapat mingguan.

Bukan rapat laporan.

Format:

What Changed

What Is On Track

What Is Off Track

Why

Decision Required

Acceleration Plan

Responsible Person

Deadline

Expected Impact

---

# QUARTERLY REVIEW

Generate:

Quarterly Performance Review

Tampilkan:

Quarter Target

Actual

Variance

Forecast

Issues

Acceleration Plan

Outcome

OPD Performance

---

# DATA IMPORT

Admin harus dapat import data melalui:

Excel

CSV

API

Template Import

Siapkan template:

RPJMD

RKPD

Indicator

Program

Activity

Subactivity

Budget

Realization

OPD

Region

---

# DOCUMENT IMPORT

Admin dapat upload:

RPJMD

RKPD

Renstra

Renja

DPA

Perjanjian Kinerja

LKjIP

Laporan Realisasi

Laporan OPD

AI membantu ekstraksi data.

Tetapi data hasil AI harus diverifikasi manusia sebelum menjadi master data.

---

# DATA QUALITY

Setiap data memiliki:

Source

Period

Updated At

Updated By

Verification Status

Confidence

Tambahkan status:

Draft

AI Extracted

Verified

Approved

---

# HUMAN IN THE LOOP

AI tidak boleh mengubah target RPJMD.

AI tidak boleh mengubah target RKPD.

AI tidak boleh menetapkan capaian final.

AI tidak boleh mengubah anggaran.

AI tidak boleh menentukan OPD bersalah.

AI tidak boleh memberikan sanksi.

AI hanya:

Analyze

Recommend

Forecast

Alert

Summarize

Manusia:

Verify

Approve

Decide

Execute

---

# DATA MODEL

Tambahkan tabel minimal:

rpjmd

missions

goals

strategic_objectives

performance_indicators

indicator_targets

rkpd

priorities

programs

activities

subactivities

opds

regions

budgets

budget_realizations

physical_progress

indicator_realizations

milestones

issues

acceleration_plans

action_items

performance_scores

performance_forecasts

executive_decisions

performance_alerts

data_sources

data_verifications

---

# AUDIT TRAIL

Semua perubahan data kinerja harus tercatat.

Record:

User

Role

Time

Old Value

New Value

Reason

Source

IP

---

# UI NAVIGATION

Tambahkan sidebar:

Dashboard

Wasdal

Kinerja Daerah

RPJMD

RKPD

Program

Kegiatan

Peta

OPD

Kecamatan

Permasalahan

Percepatan

Rapat

Executive Brief

Laporan

Knowledge Base

Admin

---

# HOMEPAGE EXECUTIVE

Untuk:

Mayor

Vice Mayor

Sekda

Homepage default bukan dashboard teknis.

Homepage harus menjawab:

1.

Apakah target pembangunan kita tercapai?

2.

Apa yang tertinggal?

3.

Mengapa tertinggal?

4.

Apa yang harus dilakukan?

5.

Siapa yang harus melakukan?

6.

Kapan harus selesai?

7.

Apa keputusan yang diperlukan dari saya?

---

# EXECUTIVE UI

Desain harus sangat sederhana.

Jangan tampilkan terlalu banyak tabel di homepage.

Gunakan:

Large KPI

Progress

Traffic Light

Map

Top Risk

Decision Required

Acceleration

Klik untuk drill-down.

---

# AI ORCHESTRATOR

Tambahkan PerformanceOrchestrator.

Workflow:

Data

↓

Validation

↓

Performance Analysis

↓

Gap Detection

↓

Root Cause

↓

Risk Assessment

↓

Forecast

↓

Acceleration Recommendation

↓

Human Review

↓

Action Plan

↓

Monitoring

↓

Evaluation

---

# IMPORTANT DEVELOPMENT PRINCIPLE

Jangan membuat mock dashboard saja.

Bangun data flow sebenarnya dari database sampai UI.

Setiap chart harus menggunakan data API.

Setiap indicator harus dapat drill down.

Setiap action plan harus dapat ditrack.

Setiap alert harus dapat ditindaklanjuti.

Setiap recommendation harus dapat dikonversi menjadi task.

Setiap task harus memiliki PIC dan deadline.

---

# MVP PRIORITY

Implementasikan terlebih dahulu:

1. RPJMD structure
2. RKPD structure
3. Indicator target
4. Realization
5. OPD
6. Dashboard
7. Performance gap
8. Traffic light status
9. AI analysis
10. AI acceleration recommendation
11. Action plan
12. Executive dashboard
13. Wasdal linkage
14. Excel import
15. Audit log

Setelah MVP stabil baru implementasikan:

Forecasting advanced

Automatic document extraction

SIPD integration

WhatsApp integration

Advanced GIS

Machine Learning

Predictive analytics

---

# FINAL PRODUCT VISION

Wasdal bukan hanya aplikasi pengawasan dan pengendalian.

Wasdal harus berkembang menjadi:

AI-POWERED LOCAL GOVERNMENT PERFORMANCE CONTROL CENTER

Sistem harus membantu pimpinan daerah berpindah dari:

REPORTING

menjadi:

MONITORING

↓

ANALYSIS

↓

DECISION

↓

ACCELERATION

↓

EXECUTION

↓

VERIFICATION

↓

OUTCOME

Tujuan akhirnya adalah memastikan target RPJMD dan RKPD tidak hanya dilaporkan, tetapi benar-benar dikawal sampai tercapai.


# WASDAL V2

## Executive Performance, Decision & Acceleration Control Center

Wasdal versi 2 harus dikembangkan dari sekadar aplikasi pengawasan menjadi **Executive Decision Support System Pemerintah Daerah**.

Prinsip utama:

DATA
↓
MONITORING
↓
ANALYSIS
↓
PROBLEM DETECTION
↓
DECISION REQUIRED
↓
ACCELERATION
↓
EXECUTION
↓
MONITORING
↓
VERIFICATION
↓
OUTCOME

Wasdal harus mampu menjawab pertanyaan pimpinan:

1. Apa yang sedang terjadi?
2. Apa yang sudah tercapai?
3. Apa yang belum tercapai?
4. Apa yang mulai berisiko?
5. Mengapa terjadi?
6. Siapa yang bertanggung jawab?
7. Apa pilihan solusinya?
8. Apa keputusan yang diperlukan?
9. Apa yang harus dipercepat?
10. Apa yang harus dilakukan hari ini?

---

# 1. DECISION REQUIRED

Tambahkan modul utama:

# DECISION REQUIRED

Modul ini menjadi salah satu halaman terpenting Wasdal.

Tujuannya adalah mengubah:

DATA

menjadi:

KEPUTUSAN YANG HARUS DIAMBIL.

Sistem harus mendeteksi persoalan yang membutuhkan keputusan pimpinan secara otomatis.

---

# Decision Required Categories

Kategori:

## Policy Decision

Contoh:

* membutuhkan kebijakan baru
* membutuhkan perubahan kebijakan
* membutuhkan arahan Wali Kota
* membutuhkan keputusan strategis daerah

## Budget Decision

Contoh:

* kebutuhan anggaran tambahan
* pergeseran anggaran
* efisiensi anggaran
* prioritas ulang anggaran
* sumber pendanaan alternatif

## Cross OPD Decision

Jika suatu masalah melibatkan lebih dari satu OPD.

Contoh:

Dinas PU

*

Dinas Perhubungan

*

Kecamatan

*

Bagian Hukum

Sistem harus meminta:

penetapan Lead OPD.

---

## Procurement Decision

Contoh:

* proses tender terlambat
* kontrak bermasalah
* perubahan pekerjaan
* procurement bottleneck

---

## Land Decision

Masalah:

* pembebasan lahan
* status aset
* konflik tanah
* akses lahan

---

## Regulation Decision

Masalah:

* regulasi tidak tersedia
* interpretasi regulasi
* aturan menghambat pelaksanaan

---

## External Coordination

Membutuhkan koordinasi dengan:

* Pemerintah Provinsi
* Pemerintah Pusat
* kementerian
* BUMN
* BUMD
* pengembang
* swasta
* masyarakat

---

## Program Acceleration

Target RPJMD/RKPD berpotensi tidak tercapai.

Sistem meminta keputusan:

APPROVE ACCELERATION PLAN.

---

## Issue Escalation

Masalah yang sudah terlalu lama belum selesai.

Contoh:

Issue Age:

45 days

Tidak ada progres.

Sistem otomatis melakukan escalation.

---

# Decision Required Card

Setiap Decision Required tampil sebagai CARD.

Contoh:

DECISION REQUIRED

Judul:

Percepatan Penanganan Genangan Kawasan X

Priority:

CRITICAL

Impact:

Berpotensi mempengaruhi indikator RPJMD

Responsible OPD:

Dinas X

Supporting OPD:

Dinas Y

Kecamatan Z

Current Situation:

Progress 42%

Expected Progress:

71%

Gap:

-29%

Problem:

Pekerjaan belum dapat dilanjutkan karena masalah aset.

AI Root Cause:

Status kepemilikan lahan belum terselesaikan.

AI Recommendation:

Option A

Negosiasi percepatan penyelesaian aset.

Option B

Alternative engineering solution.

Option C

Relokasi sebagian pekerjaan.

Decision Needed:

Menentukan opsi percepatan.

Decision Owner:

Sekda

Deadline Decision:

3 hari.

---

# Decision Options

Setiap decision harus memiliki minimal:

Option A

Option B

Option C

jika data mencukupi.

Setiap pilihan memiliki:

Description

Benefits

Risks

Estimated Time

Estimated Cost

Required Resources

Responsible OPD

Dependencies

Legal Consideration

Impact

AI Confidence

---

# Human Decision

AI tidak boleh memilih keputusan final.

AI hanya memberikan:

RECOMMENDED OPTION

Pimpinan memilih:

APPROVE

APPROVE WITH MODIFICATION

REQUEST MORE DATA

RETURN TO OPD

ESCALATE

DEFER

REJECT

---

# Decision Record

Setelah keputusan dibuat simpan:

Decision ID

Issue

Decision Maker

Role

Decision

Selected Option

Reason

Date

Deadline

Responsible OPD

PIC

Expected Result

Follow-up

Evidence

Status

---

# Decision Status

Status:

Waiting Decision

Under Review

Need More Information

Approved

Execution

Monitoring

Completed

Rejected

Escalated

---

# Decision Deadline

Semua Decision Required harus memiliki:

Created Date

Decision Deadline

Age

Escalation Level

Jika melewati deadline:

otomatis escalate.

---

# Decision Impact

Hubungkan keputusan dengan:

RPJMD

RKPD

Indicator

Program

Activity

Subactivity

Wasdal Case

OPD

Budget

Location

---

# Decision History

Tampilkan timeline:

Problem Identified

AI Analysis

Recommendation

Meeting Discussion

Decision

Execution

Progress

Result

---

# AI DECISION SUPPORT AGENT

Buat:

DecisionSupportAgent

Tugas:

mendeteksi kebutuhan keputusan

merangkum situasi

menemukan opsi

membandingkan opsi

menjelaskan risiko

menampilkan rekomendasi

mengidentifikasi decision owner

mengidentifikasi deadline

Output structured JSON.

---

# 2. WASDAL V2 INFORMATION ARCHITECTURE

Gunakan struktur sidebar utama:

HOME

EXECUTIVE

KINERJA DAERAH

WASDAL

DECISION REQUIRED

PERCEPATAN

PETA

RAPAT

LAPORAN

KNOWLEDGE

ADMIN

---

# 3. LOGIN PAGE

Route:

/login

Tampilan:

Logo Wasdal

Pemerintah Kota

Username

Password

SSO placeholder

Forgot Password

Security Notice

---

# 4. HOME / EXECUTIVE COMMAND CENTER

Route:

/dashboard

Dashboard menyesuaikan role.

Gunakan Role Based Dashboard.

Jangan menampilkan semua informasi kepada semua pengguna.

---

# 5. DASHBOARD WALI KOTA

Route:

/executive/mayor

Homepage Wali Kota harus sangat sederhana.

Pertanyaan utama yang dijawab:

Apakah pembangunan berjalan sesuai rencana?

Tampilkan:

# A. Overall Performance

RPJMD Achievement

RKPD Achievement

Strategic Indicator Achievement

Financial Realization

Physical Realization

---

# B. City Performance Status

GREEN

On Track

YELLOW

Need Attention

ORANGE

At Risk

RED

Critical

---

# C. Decision Required

Tampilkan:

Top 5 Decisions Required

Setiap card:

Problem

Impact

Option

Recommended Action

Decision Deadline

Button:

REVIEW DECISION

---

# D. Critical Indicators

Tampilkan indikator:

Critical

At Risk

Trend Down

---

# E. Priority Programs

Program prioritas:

Progress

Budget

Issues

Forecast

---

# F. City Map

Peta Kota Tangerang Selatan.

Tampilkan:

program

project

issue

complaint

wasdal case

performance

per kecamatan.

---

# G. Top Acceleration

5 program yang harus dipercepat.

---

# H. What Needs My Attention Today

AI menghasilkan:

TODAY PRIORITIES

maksimal 5 item.

---

# I. Executive AI Brief

Tombol:

GENERATE MAYOR BRIEF

Output maksimal satu halaman.

---

# 6. DASHBOARD WAKIL WALI KOTA

Route:

/executive/vice-mayor

Tampilan mirip Wali Kota.

Tambahkan:

Monitoring Strategic Programs

Cross OPD Coordination

Public Issues

Field Monitoring

Acceleration Follow Up

---

# 7. DASHBOARD SEKDA

Route:

/executive/sekda

Lebih operasional.

Tampilkan:

Overall Performance

OPD Performance

Cross OPD Issues

Decision Required

Escalation

Delayed Action Plans

Procurement Risk

Budget Risk

Data Quality

Meeting Follow Up

Sekda harus dapat melihat:

OPD yang belum menindaklanjuti.

---

# 8. DASHBOARD STAF AHLI

Route:

/executive/staf-ahli

Fokus:

strategic analysis

policy analysis

cross-sector analysis

performance gap

trend

executive recommendation

decision support

Staf Ahli dapat:

membuat policy note

memberikan recommendation

memberikan comment

membuat strategic review

mengusulkan decision.

---

# 9. DASHBOARD ASISTEN DAERAH

Route:

/executive/asda

Filter berdasarkan bidang koordinasi.

Tampilkan:

OPD binaan

Performance

Issues

Delayed Programs

Cross OPD Coordination

Decision Required

Action Plan

Escalation

---

# 10. DASHBOARD KEPALA OPD

Route:

/opd/dashboard

Tampilkan hanya OPD terkait.

KPI:

RPJMD Indicators

RKPD Indicators

Programs

Activities

Budget

Physical Progress

Financial Progress

Issues

Action Plans

Wasdal Cases

Decision Required

Deadlines

Kepala OPD dapat:

assign PIC

approve response

submit clarification

submit action plan

update progress

submit evidence

request escalation

---

# 11. DASHBOARD CAMAT

Route:

/district/dashboard

Tampilkan berdasarkan wilayah kecamatan.

Informasi:

Kinerja Kecamatan

Program Pemerintah Kota di wilayah

Projects

Infrastructure

Wasdal Cases

Public Complaints

Economic Indicators

Social Indicators

Environment

Issues

Action Plans

Map

Camat dapat:

verify field condition

upload evidence

submit issue

submit proposal

comment on OPD response

request coordination

---

# 12. KINERJA DAERAH

Route:

/performance

Submenu:

Overview

RPJMD

RKPD

Indicators

Programs

OPD

District

Forecast

Performance Tree

Strategy Map

---

# 13. PERFORMANCE OVERVIEW

Route:

/performance/overview

Tampilkan:

Overall Score

RPJMD

RKPD

Outcome

Output

Budget

Physical

Forecast

Top Risks

Top Achievement

---

# 14. RPJMD PAGE

Route:

/performance/rpjmd

Tampilkan struktur:

Visi

Misi

Tujuan

Sasaran

Indikator

Target

Realisasi

Status

Forecast

OPD

Klik indikator:

/performance/rpjmd/indicator/[id]

---

# 15. RPJMD INDICATOR DETAIL

Tampilkan:

Indicator Name

Definition

Formula

Unit

Baseline

Annual Target

Current Realization

Achievement

Expected Progress

Gap

Trend

Forecast

Responsible OPD

Supporting OPD

Programs

Activities

Budget

Issues

Acceleration

Decision Required

Documents

History

---

# 16. RKPD PAGE

Route:

/performance/rkpd

Filter:

Year

OPD

District

Priority

Program

Status

Tampilkan:

Priority

Indicator

Program

Target

Realization

Budget

Physical

Financial

Gap

Status

Forecast

---

# 17. PROGRAM PAGE

Route:

/performance/programs

Program list.

Klik:

/performance/programs/[id]

---

# 18. PROGRAM DETAIL

Tampilkan:

Program

Objective

Indicator

OPD

Budget

Physical Progress

Financial Progress

Outcome

Activities

Subactivities

Milestones

Issues

Cases

Acceleration Plan

Decision Required

Timeline

Documents

---

# 19. OPD PERFORMANCE

Route:

/performance/opd

Cards:

OPD

Score

Indicators

Budget

Physical

Financial

Issues

Action Plan

---

# 20. OPD DETAIL

Route:

/performance/opd/[id]

Tampilkan:

Performance Score

RPJMD Contribution

RKPD Contribution

Indicators

Programs

Budget

Realization

Issues

Action Plan

Decision Required

Wasdal Cases

Timeline

---

# 21. DISTRICT PERFORMANCE

Route:

/performance/districts

Tampilkan semua kecamatan.

Map + ranking.

Klik:

/performance/districts/[id]

---

# 22. DISTRICT DETAIL

Tampilkan:

District Indicators

Programs

Projects

Issues

Complaints

Wasdal

Infrastructure

Economy

Social

Environment

Map

Photos

---

# 23. PERFORMANCE TREE

Route:

/performance/tree

Interactive visualization:

RPJMD

↓

Mission

↓

Goal

↓

Strategic Objective

↓

Indicator

↓

Program

↓

Activity

↓

Subactivity

↓

OPD

Gunakan warna performance.

---

# 24. STRATEGY MAP

Route:

/performance/strategy-map

Visual network.

Hubungkan:

Goal

Indicator

Program

Outcome

Impact

---

# 25. FORECAST

Route:

/performance/forecast

Tampilkan:

Likely Achieved

At Risk

Unlikely Achieved

Critical

Forecast End of Year

---

# 26. WASDAL

Route:

/wasdal

Submenu:

All Cases

New

Critical

In Progress

Delayed

Completed

Map

---

# 27. CASE LIST

Route:

/wasdal/cases

Filter:

Status

Priority

OPD

District

Category

Date

Search

---

# 28. CASE DETAIL

Route:

/wasdal/cases/[id]

Tampilkan:

Case Summary

Location

Reporter

Evidence

AI Analysis

Classification

Root Cause

Recommendation

Responsible OPD

PIC

Timeline

Action Plan

Comments

Documents

Decision Required

Linked RPJMD

Linked RKPD

Audit Trail

---

# 29. NEW CASE

Route:

/wasdal/new

Input:

Text

Audio

Photo

Video

Document

Location

AI melakukan preprocessing.

---

# 30. DECISION REQUIRED PAGE

Route:

/decisions

Ini harus menjadi halaman utama untuk pimpinan.

Submenu:

My Decisions

Critical

Waiting

Overdue

Approved

Execution

Completed

---

# 31. DECISION DETAIL

Route:

/decisions/[id]

Layout:

LEFT:

Situation

Data

Evidence

Timeline

CENTER:

AI Analysis

Root Cause

Impact

RIGHT:

Options

AI Recommendation

Decision Form

---

# 32. DECISION FORM

Input:

Select Option

Decision

Instruction

Responsible OPD

PIC

Deadline

Notes

Button:

APPROVE & EXECUTE

---

# 33. ACCELERATION CENTER

Route:

/acceleration

Submenu:

Critical

RPJMD

RKPD

Program

OPD

District

---

# 34. ACCELERATION PLAN

Route:

/acceleration/[id]

Tampilkan:

Target

Current

Gap

Root Cause

Plan

30 Day

60 Day

90 Day

Responsible OPD

PIC

Milestones

Expected Impact

Resources

Risk

Status

---

# 35. CREATE ACCELERATION

Button:

CREATE ACCELERATION PLAN

AI membuat draft.

Human review.

Approve.

---

# 36. ACTION PLAN BOARD

Route:

/actions

View:

Kanban

Table

Timeline

Calendar

Status:

Not Started

In Progress

Blocked

At Risk

Completed

---

# 37. GIS MAP

Route:

/map

Layers:

RPJMD

RKPD

Programs

Projects

Wasdal

Complaints

Issues

Infrastructure

OPD

District

Performance

Gunakan Layer Control.

---

# 38. MEETING CENTER

Route:

/meetings

Submenu:

Upcoming

Previous

Wasdal Meeting

Performance Review

Executive Meeting

---

# 39. MEETING DETAIL

Route:

/meetings/[id]

Tampilkan:

Agenda

Cases

Indicators

Decision Required

Documents

Participants

AI Brief

---

# 40. MEETING MODE

Route:

/meetings/[id]/present

Fullscreen.

Untuk ruang rapat.

Tampilkan satu item per layar.

Problem

Data

AI Analysis

Decision Required

Options

Decision

Action

PIC

Deadline

---

# 41. MEETING RECORDING

Upload audio/video.

AI:

Transcription

Summary

Decision Extraction

Action Extraction

PIC Extraction

Deadline Extraction

Generate Minutes

---

# 42. EXECUTIVE BRIEF

Route:

/brief

Generate:

Daily Brief

Weekly Brief

Monthly Brief

Quarterly Brief

RPJMD Brief

RKPD Brief

OPD Brief

District Brief

---

# 43. REPORT CENTER

Route:

/reports

Generate:

PDF

Excel

CSV

Report Types:

RPJMD Performance

RKPD Performance

OPD Performance

District Performance

Wasdal

Decision

Acceleration

Action Plan

---

# 44. KNOWLEDGE BASE

Route:

/knowledge

Documents:

RPJMD

RKPD

Renstra

Renja

DPA

Perwal

Perda

SOP

Regulation

Performance Reports

---

# 45. KNOWLEDGE DOCUMENT DETAIL

Route:

/knowledge/[id]

Display:

Document

Metadata

Version

Extracted Content

RAG Status

Source

Verification

---

# 46. ASK WASDAL

Tambahkan floating button:

ASK WASDAL

Tidak menjadi chatbot umum.

Pertanyaan berdasarkan data.

Contoh:

“Apa 5 masalah terbesar minggu ini?”

“Target RPJMD apa yang berisiko?”

“Kenapa indikator X tertinggal?”

“Apa yang membutuhkan keputusan saya?”

“Program apa yang harus dipercepat?”

“OPD apa yang membutuhkan perhatian?”

“Bagaimana kinerja Kecamatan Ciputat?”

---

# 47. NOTIFICATION CENTER

Route:

/notifications

Kategori:

Decision

Risk

Deadline

Action

Wasdal

Performance

Data

Meeting

Escalation

---

# 48. GLOBAL SEARCH

Search dapat menemukan:

Case

Indicator

Program

Activity

OPD

District

Decision

Action Plan

Document

---

# 49. ADMIN

Route:

/admin

Submenu:

Users

Roles

OPD

District

Organization

RPJMD

RKPD

Indicator

Program

Import

AI

Knowledge

Notification

Audit

System

---

# 50. ROLE & PERMISSION

Route:

/admin/roles

Permission granular.

Contoh:

view_rpjmd

edit_rpjmd

approve_data

view_decision

make_decision

assign_action

view_budget

view_case

verify_case

upload_evidence

manage_user

---

# 51. DATA IMPORT CENTER

Route:

/admin/import

Import:

Excel

CSV

Documents

Template.

Workflow:

Upload

↓

Preview

↓

Validation

↓

AI Mapping

↓

Human Verification

↓

Import

---

# 52. AUDIT LOG

Route:

/admin/audit

Catat:

User

Action

Object

Old Value

New Value

Time

IP

Device

---

# 53. EXECUTIVE HOMEPAGE DESIGN

Untuk Wali Kota, Wakil Wali Kota dan Sekda jangan tampilkan sidebar terlalu kompleks.

Prioritaskan:

1. PERFORMANCE

2. DECISION REQUIRED

3. CRITICAL ISSUES

4. ACCELERATION

5. MAP

6. EXECUTIVE BRIEF

Homepage harus bisa dipahami dalam waktu kurang dari 30 detik.

---

# 54. EXECUTIVE COMMAND BAR

Tambahkan command bar:

WHAT NEEDS MY ATTENTION?

SHOW CRITICAL ISSUES

SHOW DECISIONS

SHOW AT RISK TARGETS

SHOW ACCELERATION

GENERATE BRIEF

---

# 55. DAILY EXECUTIVE VIEW

Tampilan default:

GOOD MORNING

Executive Summary

City Performance

Critical Indicator

Decision Required

Acceleration Required

Overdue Action

Today Agenda

---

# 56. PERFORMANCE STATUS ENGINE

Gunakan status:

ON TRACK

NEED ATTENTION

AT RISK

CRITICAL

ACHIEVED

NO DATA

Status tidak hanya berdasarkan persentase.

Pertimbangkan:

target

time

trend

budget

milestone

issues

dependency

---

# 57. DATA CONFIDENCE

Setiap AI analysis harus menunjukkan:

High Confidence

Medium Confidence

Low Confidence

dan:

Data Source

Updated At

Verification Status

---

# 58. SOURCE TRACEABILITY

Semua rekomendasi AI harus memiliki:

SOURCE

Contoh:

RKPD 2026

DPA Dinas X

Update OPD 8 August 2026

Wasdal Case #123

Field Verification

Jika tidak ada data:

AI harus menyatakan:

DATA INSUFFICIENT.

---

# 59. RESPONSIVE DESIGN

Desktop:

full dashboard.

Tablet:

executive mode.

Mobile:

simplified monitoring.

Mobile priority:

Alerts

Decision

Action

Case

Evidence

---

# 60. UI DESIGN PRINCIPLES

Gunakan:

simple

modern

premium

clean

government executive

minimal clutter

high information hierarchy

Inspirasi:

Linear

Palantir

Stripe

Vercel

Notion

Microsoft Fabric

Power BI Executive Dashboard

Jangan meniru persis.

---

# 61. DASHBOARD HIERARCHY

Informasi harus menggunakan konsep:

LEVEL 1

EXECUTIVE

Apa yang perlu perhatian?

LEVEL 2

MANAGEMENT

Mengapa?

LEVEL 3

OPERATIONAL

Apa yang terjadi?

LEVEL 4

EVIDENCE

Data dan bukti.

---

# 62. DRILL DOWN PRINCIPLE

Semua KPI harus clickable.

Contoh:

RPJMD Achievement 72%

↓

Strategic Objective

↓

Indicator

↓

Program

↓

Activity

↓

Subactivity

↓

OPD

↓

Issue

↓

Action

↓

Evidence

---

# 63. CRITICAL RELATIONSHIP

Semua module harus saling terhubung.

Contoh:

WASDAL CASE

↓

mempengaruhi

PROGRAM

↓

mempengaruhi

RKPD INDICATOR

↓

mempengaruhi

RPJMD INDICATOR

↓

muncul sebagai

PERFORMANCE RISK

↓

membuat

DECISION REQUIRED

↓

menghasilkan

ACCELERATION PLAN

↓

menjadi

ACTION PLAN

↓

dilaksanakan OPD

↓

VERIFICATION

↓

PERFORMANCE UPDATE

---

# 64. SYSTEM HOME FLOW

Saat user login:

Detect Role

↓

Load Relevant Dashboard

↓

Analyze Alerts

↓

Analyze Decisions

↓

Analyze Performance

↓

Display Priority

---

# 65. MAYOR EXPERIENCE

Wali Kota sebaiknya tidak perlu mencari data.

Wasdal harus aktif menyampaikan:

“3 keputusan membutuhkan perhatian.”

“5 indikator berisiko tidak mencapai target.”

“2 program prioritas mengalami keterlambatan.”

“4 action plan melewati deadline.”

“1 masalah membutuhkan koordinasi Pemerintah Provinsi.”

Klik langsung membuka konteks dan opsi keputusan.

---

# 66. SEKDA EXPERIENCE

Sekda harus dapat melihat:

apa yang stuck

OPD mana

berapa lama

penyebab

siapa PIC

apa yang harus dilakukan

apa yang perlu dieskalasikan.

---

# 67. OPD EXPERIENCE

OPD harus melihat:

TARGET SAYA

ISSUE SAYA

ACTION SAYA

DEADLINE SAYA

DECISION YANG MENUNGGU SAYA

BUKTI YANG HARUS DIUPLOAD

---

# 68. CAMAT EXPERIENCE

Camat harus melihat:

APA YANG TERJADI DI WILAYAH SAYA

PROGRAM YANG SEDANG BERJALAN

MASALAH WILAYAH

STATUS TINDAK LANJ OPD

TARGET WILAYAH

PENGADUAN

---

# 69. STAF AHLI EXPERIENCE

Staf Ahli harus melihat:

STRATEGIC ISSUES

CROSS SECTOR TREND

POLICY GAP

PERFORMANCE RISK

DECISION OPTIONS

ACCELERATION OPPORTUNITIES

---

# 70. FINAL PRODUCT PRINCIPLE

Wasdal V2 tidak boleh menjadi sekadar:

dashboard

ticketing system

notulen digital

atau

pengaduan masyarakat.

Wasdal V2 harus menjadi:

# GOVERNMENT EXECUTION CONTROL SYSTEM

yang menghubungkan:

STRATEGY

RPJMD

↓

ANNUAL PLAN

RKPD

↓

BUDGET

↓

PROGRAM

↓

EXECUTION

↓

FIELD CONDITION

↓

WASDAL

↓

ISSUE

↓

DECISION

↓

ACCELERATION

↓

ACTION

↓

VERIFICATION

↓

OUTCOME

---

# 71. CODING INSTRUCTION

Implementasikan modul secara modular.

Jangan membuat semua halaman sekaligus tanpa fungsi backend.

Prioritas development:

PHASE 1

Authentication

RBAC

Organization

RPJMD

RKPD

Indicator

Program

Dashboard

PHASE 2

Wasdal Case

Action Plan

Meeting

Evidence

PHASE 3

Decision Required

Acceleration

Executive Dashboard

PHASE 4

AI Agents

RAG

AI Analysis

Executive Brief

PHASE 5

GIS

Advanced Analytics

Forecast

Integration

---

# 72. CRITICAL IMPLEMENTATION RULE

Jangan menggunakan fake static data setelah database selesai.

Gunakan seed hanya untuk development.

Semua production screen harus mengambil data melalui API.

Gunakan loading state.

Empty state.

Error state.

Permission state.

---

# 73. SYSTEM SUCCESS CRITERIA

Wasdal V2 dianggap berhasil apabila Wali Kota dapat membuka aplikasi dan dalam waktu maksimal 30 detik mengetahui:

1. kondisi pencapaian RPJMD;
2. kondisi pencapaian RKPD;
3. indikator yang tertinggal;
4. program yang bermasalah;
5. wilayah yang membutuhkan perhatian;
6. keputusan yang harus diambil;
7. percepatan yang direkomendasikan;
8. siapa yang harus melaksanakan;
9. kapan harus selesai;
10. apakah keputusan sebelumnya sudah dilaksanakan.

Tujuan akhir:

# FROM REPORTING TO EXECUTION

Wasdal harus mengubah budaya kerja dari:

“sudah dilaporkan”

menjadi:

“sudah diputuskan”

↓

“sudah ditugaskan”

↓

“sudah dikerjakan”

↓

“sudah diverifikasi”

↓

“target tercapai”.
