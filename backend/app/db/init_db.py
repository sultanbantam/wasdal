from __future__ import annotations

from datetime import UTC, datetime, timedelta
import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models import (
    Case,
    KnowledgeDocument,
    MeetingRecord,
    User,
    UtilityOperator,
    UrbanSegment,
    UtilityAsset,
    SidewalkSegment,
    UrbanObstruction,
    StreetVendorZone,
    StreetVendorRecord,
    UrbanHotspot,
    WalkpointProgram,
    WalkpointAccount,
    WalkpointTransaction,
    WalkpointReward,
    OfficialPaymentAudit,
    TalentProfile,
    TalentDataSource,
    TalentDataQualityIssue,
    TalentSocializationMaterial,
    TalentSocializationEvent,
    TalentCompetency,
    TalentAssessment,
    TalentPool,
    TalentIDP,
    TalentIDPActivity,
    TalentCriticalPosition,
    TalentSuccessionPlan,
    TalentMobilityRecommendation,
    TalentImplementationMilestone,
    NetworkRegion,
    RegionProfile,
    RegionMembership,
    NetworkIndicatorDefinition,
    NetworkIndicatorValue,
    NetworkStrategicIssue,
    NetworkDiagnosis,
    NetworkFiscalSnapshot,
    NetworkFiscalRoadmap,
    NetworkIdea,
    NetworkPilotProject,
    NetworkStrategicAsset,
    NetworkFGDEvent,
    NetworkFGDRecommendation,
    NetworkDecisionRequest,
    NetworkDataValidation,
    NetworkAuditLog,
)
from app.repositories.cases import CaseRepository
from app.schemas import CaseCreate


def init_db(db: Session) -> None:
    seed_users(db)
    seed_cases(db)
    seed_knowledge(db)
    seed_meetings(db)
    seed_urban(db)
    seed_talent(db)
    seed_network(db)


def seed_users(db: Session) -> None:
    if db.scalar(select(User).where(User.email == "admin@wasdal.local")):
        return
    users = [
        User(
            name="Administrator Wasdal",
            email="admin@wasdal.local",
            role="Administrator",
            agency="Bagian Ekbang",
            hashed_password=get_password_hash("wasdal123"),
        ),
        User(
            name="Kepala Bagian Ekbang",
            email="ekbang@wasdal.local",
            role="Bagian Ekbang",
            agency="Bagian Ekbang",
            hashed_password=get_password_hash("wasdal123"),
        ),
        User(
            name="Pimpinan Daerah",
            email="pimpinan@wasdal.local",
            role="Pimpinan",
            agency="Setda",
            hashed_password=get_password_hash("wasdal123"),
        ),
        User(
            name="Wali Kota Tangerang Selatan",
            email="walikota@wasdal.local",
            role="Wali Kota",
            agency="Pimpinan Daerah",
            hashed_password=get_password_hash("wasdal123"),
        ),
        User(
            name="Sekretaris Daerah",
            email="sekda@wasdal.local",
            role="Sekda",
            agency="Sekretariat Daerah",
            hashed_password=get_password_hash("wasdal123"),
        ),
        User(
            name="Kepala BKPSDM Tangsel",
            email="bkpsdm@wasdal.local",
            role="BKPSDM",
            agency="BKPSDM",
            hashed_password=get_password_hash("wasdal123"),
        ),
        User(
            name="Petugas Satpol PP Verifikator",
            email="satpolpp@wasdal.local",
            role="Petugas Lapangan",
            agency="Satpol PP",
            hashed_password=get_password_hash("wasdal123"),
        ),
        User(
            name="Camat Serpong",
            email="camat@wasdal.local",
            role="Camat",
            agency="Kecamatan Serpong",
            hashed_password=get_password_hash("wasdal123"),
        ),
        User(
            name="Budi Santoso, S.STP (ASN)",
            email="asn@wasdal.local",
            role="ASN",
            agency="Bagian Ekbang",
            hashed_password=get_password_hash("wasdal123"),
        ),
    ]
    db.add_all(users)
    db.commit()


def seed_cases(db: Session) -> None:
    if db.scalar(select(Case).limit(1)):
        return

    repo = CaseRepository(db)
    now = datetime.now(UTC)
    samples = [
        CaseCreate(
            number="WAS-2026-00001",
            title="Jalan akses pasar induk rusak dan menghambat distribusi pangan",
            description=(
                "Ratusan warga dan pedagang melaporkan jalan akses pasar induk rusak berat. "
                "Distribusi pangan terganggu, beberapa kendaraan logistik terperosok, dan laporan sudah viral di media lokal."
            ),
            category="Infrastruktur",
            subcategory="Jalan",
            location_name="Pasar Induk",
            latitude=-6.1862,
            longitude=106.8348,
            reporter_name="Forum Pedagang Pasar",
            source="WhatsApp",
            status="In Progress",
            priority="Critical",
            severity="Major",
            priority_score=88.4,
            pic="Dinas PUPR",
            agency="Dinas PUPR",
            due_date=now + timedelta(days=2),
            ai_summary="Jalan akses pasar induk rusak berat dan berdampak langsung pada distribusi pangan.",
            ai_confidence=0.86,
            suggested_solution=[
                {
                    "horizon": "Quick Win",
                    "action": "Tambal darurat titik kritis dan atur rekayasa akses logistik.",
                    "agency": "Dinas PUPR",
                    "estimated_time": "1-3 hari",
                    "confidence": 0.84,
                }
            ],
            timeline=[
                {"type": "created", "at": (now - timedelta(days=3)).isoformat(), "note": "Laporan masuk dari WhatsApp."},
                {"type": "assignment", "at": (now - timedelta(days=2)).isoformat(), "pic": "Dinas PUPR"},
            ],
        ),
        CaseCreate(
            number="WAS-2026-00002",
            title="Genangan berulang di sekitar kantor kecamatan saat hujan deras",
            description=(
                "Kelurahan melaporkan genangan berulang pada saluran drainase dekat kantor kecamatan. "
                "Aktivitas pelayanan publik terganggu setiap hujan deras."
            ),
            category="Drainase",
            subcategory="Banjir dan Genangan",
            location_name="Kantor Kecamatan",
            latitude=-6.2146,
            longitude=106.8451,
            reporter_name="Kecamatan",
            source="Survey Lapangan",
            status="Assigned",
            priority="High",
            severity="Moderate",
            priority_score=67.2,
            pic="UPT Drainase",
            agency="Dinas PUPR",
            due_date=now - timedelta(days=1),
            ai_summary="Genangan berulang mengganggu layanan kecamatan dan perlu normalisasi drainase.",
            ai_confidence=0.79,
        ),
        CaseCreate(
            number="WAS-2026-00003",
            title="Keterlambatan rekomendasi perizinan investasi gudang logistik",
            description=(
                "Investor meminta kejelasan rekomendasi teknis untuk gudang logistik. "
                "Proses berulang antara kelurahan, kecamatan, dan dinas teknis."
            ),
            category="Perizinan",
            subcategory="OSS/NIB",
            location_name="Kawasan Pergudangan Barat",
            latitude=-6.2088,
            longitude=106.8456,
            reporter_name="DPMPTSP",
            source="Email",
            status="Waiting Decision",
            priority="Medium",
            severity="Moderate",
            priority_score=54.5,
            pic="DPMPTSP",
            agency="DPMPTSP",
            due_date=now + timedelta(days=6),
            ai_summary="Perizinan investasi membutuhkan keputusan lintas instansi agar tidak menghambat realisasi investasi.",
            ai_confidence=0.74,
        ),
        CaseCreate(
            number="WAS-2026-00004",
            title="PJU padam di koridor sekolah dan halte",
            description="Warga melaporkan lampu PJU padam di koridor sekolah dan halte. Risiko keselamatan meningkat pada malam hari.",
            category="Utilitas",
            subcategory="Penerangan Jalan Umum",
            location_name="Koridor Sekolah Negeri 5",
            latitude=-6.196,
            longitude=106.821,
            reporter_name="RW 03",
            source="Surat Warga",
            status="New",
            priority="Medium",
            severity="Moderate",
            priority_score=45.0,
            agency="Dinas Perhubungan",
            due_date=now + timedelta(days=7),
            ai_summary="PJU padam di koridor sekolah perlu pengecekan teknis dan pengamanan sementara.",
            ai_confidence=0.71,
        ),
    ]
    for payload in samples:
        repo.create(payload)


def seed_knowledge(db: Session) -> None:
    if db.scalar(select(KnowledgeDocument).limit(1)):
        return
    docs = [
        KnowledgeDocument(
            title="SOP Rapat Wasdal dan Eskalasi Lintas OPD",
            document_type="SOP",
            summary="Alur intake, verifikasi, rapat keputusan, penugasan, monitoring, dan eskalasi.",
            tags=["sop", "rapat", "eskalasi"],
            chunk_count=12,
        ),
        KnowledgeDocument(
            title="RPJMD - Prioritas Pembangunan Daerah",
            document_type="RPJMD",
            summary="Referensi prioritas pembangunan dan indikator outcome daerah.",
            tags=["rpjmd", "pembangunan"],
            chunk_count=24,
        ),
    ]
    db.add_all(docs)
    db.commit()


def seed_meetings(db: Session) -> None:
    if db.scalar(select(MeetingRecord).limit(1)):
        return
    meeting = MeetingRecord(
        title="Rapat Wasdal Mingguan",
        transcript="Diputuskan Dinas PUPR melakukan perbaikan darurat pasar induk. PIC: Dinas PUPR, Deadline: H+3.",
        summary="Rapat menetapkan perbaikan darurat akses pasar induk sebagai prioritas minggu ini.",
        decisions=["Diputuskan Dinas PUPR melakukan perbaikan darurat pasar induk."],
        action_items=[
            {
                "task": "Perbaikan darurat akses pasar induk",
                "pic": "Dinas PUPR",
                "deadline": "H+3",
                "status": "Open",
            }
        ],
        minutes="# Notulen Rapat Wasdal Mingguan\n\nPrioritas: akses pasar induk.",
        confidence=0.8,
    )
    db.add(meeting)
    db.commit()


def seed_urban(db: Session) -> None:
    if db.scalar(select(UrbanSegment).limit(1)):
        return

    # Operators
    op_telkom = UtilityOperator(name="PT Telkom Indonesia", utility_type="Fiber Optik / Telekomunikasi", contact_person="Hendra (0812-1111-2222)", mou_number="MOU-TANGSEL/2024/012")
    op_pln = UtilityOperator(name="PLN UID Banten UP3 Serpong", utility_type="Kelistrikan (PLN)", contact_person="Arief (0813-2222-3333)", mou_number="MOU-PLN/2023/005")
    op_fiber = UtilityOperator(name="PT FiberStar Network", utility_type="Fiber Optik / Telekomunikasi", contact_person="Dian (0817-3333-4444)", mou_number="MOU-FS/2024/088")
    db.add_all([op_telkom, op_pln, op_fiber])
    db.flush()

    # Segments
    seg1 = UrbanSegment(
        segment_code="SEG-TGL-001",
        street_name="Jl. Pahlawan Seribu (Koridor BSD)",
        district="Serpong",
        subdistrict="Lengkong Gudang",
        start_latitude=-6.2882,
        start_longitude=106.6644,
        end_latitude=-6.2995,
        end_longitude=106.6712,
        length_meters=1450.0,
        priority_level="High",
        health_index_score=84.5,
    )
    seg2 = UrbanSegment(
        segment_code="SEG-TGL-002",
        street_name="Jl. Ir. H. Juanda (Koridor Ciputat)",
        district="Ciputat",
        subdistrict="Rempoa",
        start_latitude=-6.3082,
        start_longitude=106.7554,
        end_latitude=-6.3211,
        end_longitude=106.7588,
        length_meters=2100.0,
        priority_level="Critical",
        health_index_score=48.2,
    )
    seg3 = UrbanSegment(
        segment_code="SEG-TGL-003",
        street_name="Jl. Surya Kencana (Koridor Pamulang)",
        district="Pamulang",
        subdistrict="Pamulang Barat",
        start_latitude=-6.3421,
        start_longitude=106.7389,
        end_latitude=-6.3533,
        end_longitude=106.7422,
        length_meters=1200.0,
        priority_level="High",
        health_index_score=55.0,
    )
    db.add_all([seg1, seg2, seg3])
    db.flush()

    # Utility Assets (Cables)
    now = datetime.now(UTC)
    cable1 = UtilityAsset(
        asset_code="CBL-001-FO-TELKOM",
        segment_id=seg1.id,
        operator_id=op_telkom.id,
        utility_type="Fiber Optik / Telekomunikasi",
        ownership_status="Ownership verified",
        active_status="Active confirmed",
        visual_condition="Rapi / Tertata",
        clutter_index=16.5,
        pole_number="PLN-SERP-104",
        height_meters=5.2,
        risk_level="Low",
        permit_reference="IZIN-DISPERKIM-2024/89",
        inspection_date=now - timedelta(days=5),
        last_action="Penataan bundling kabel koridor",
    )
    cable2 = UtilityAsset(
        asset_code="CBL-002-SUSPECTED-INACTIVE",
        segment_id=seg2.id,
        operator_id=op_fiber.id,
        utility_type="Fiber Optik / Telekomunikasi",
        ownership_status="Ownership unverified",
        active_status="Suspected inactive",
        visual_condition="Menggantung Rendah (< 4.5m)",
        clutter_index=84.0,
        pole_number="PLN-CPT-042",
        height_meters=3.6,
        risk_level="Critical",
        permit_reference="Perlu klarifikasi izin",
        inspection_date=now - timedelta(days=2),
        notes="Kabel menggantung 3.6 meter membahayakan truk & pesepeda. Menunggu konfirmasi pemilik sebelum pemotongan resmi.",
        last_action="Pemberian tanda inspeksi & notifikasi ke operator",
    )
    cable3 = UtilityAsset(
        asset_code="CBL-003-CROSSING-PAMULANG",
        segment_id=seg3.id,
        operator_id=op_telkom.id,
        utility_type="Fiber Optik / Telekomunikasi",
        ownership_status="Ownership verified",
        active_status="Active confirmed",
        visual_condition="Semrawut / Kusut",
        clutter_index=68.5,
        pole_number="PLN-PML-089",
        height_meters=4.1,
        risk_level="High",
        inspection_date=now - timedelta(days=4),
        last_action="Jadwal penertiban bersama APJATEL",
    )
    db.add_all([cable1, cable2, cable3])

    # Sidewalks
    sw1 = SidewalkSegment(
        segment_id=seg1.id,
        width_meters=3.2,
        surface_condition="Baik",
        has_tactile_paving=True,
        has_wheelchair_ramp=True,
        lighting_condition="Terang",
        zone_category="Protected Pedestrian Zone",
        clear_pedestrian_width_meters=2.8,
        repair_status="No Action Needed",
    )
    sw2 = SidewalkSegment(
        segment_id=seg2.id,
        width_meters=1.8,
        surface_condition="Rusak Ringan",
        has_tactile_paving=True,
        has_wheelchair_ramp=False,
        lighting_condition="Cukup",
        zone_category="Needs Field Verification",
        clear_pedestrian_width_meters=1.1,
        repair_status="Perlu Perbaikan Paving & Ramp",
    )
    sw3 = SidewalkSegment(
        segment_id=seg3.id,
        width_meters=2.0,
        surface_condition="Baik",
        has_tactile_paving=False,
        has_wheelchair_ramp=True,
        lighting_condition="Cukup",
        zone_category="Managed Public-Space Zone",
        clear_pedestrian_width_meters=1.5,
        repair_status="Pemasangan Jalur Pemandu Difabel",
    )
    db.add_all([sw1, sw2, sw3])

    # Obstructions
    obs1 = UrbanObstruction(
        segment_id=seg2.id,
        title="Parkir Mobil di Trotoar Depan Ruko",
        obstruction_type="Kendaraan Parkir di Trotoar",
        description="4 mobil pribadi memarkir badan kendaraan di atas trotoar sehingga pejalan kaki harus turun ke badan jalan raya.",
        location_name="Jl. Ir. H. Juanda No. 88, Ciputat",
        latitude=-6.3112,
        longitude=106.7562,
        source="Laporan Warga Tangsel",
        accessibility_impact="Jalur pedestrian dan akses difabel terblokir total",
        ai_confidence=0.92,
        ai_candidate_flag=True,
        status="Verified",
        responsible_agency="Satpol PP & Dishub",
        is_recurring=True,
    )
    obs2 = UrbanObstruction(
        segment_id=seg3.id,
        title="Gerobak PKL Menutup Jalur Pemandu Difabel",
        obstruction_type="PKL / Barang Dagangan Menghalangi Jalur",
        description="Dua gerobak penjual gorengan menggelar terpal dan meja menutupi ruang pedestrian.",
        location_name="Jl. Surya Kencana Simpang Pamulang",
        latitude=-6.3455,
        longitude=106.7401,
        source="Patroli Lapangan Kecamatan",
        accessibility_impact="Sisa ruang pejalan kaki < 0.6 meter",
        ai_confidence=0.88,
        ai_candidate_flag=True,
        status="Pending Verification",
        responsible_agency="Satpol PP Pamulang",
        is_recurring=False,
    )
    db.add_all([obs1, obs2])

    # Vendor Zones & Records
    vz1 = StreetVendorZone(
        zone_name="Sentra Kuliner Tertata Taman Kota 1 BSD",
        district="Serpong",
        location_description="Area Pujasera Terkelola Taman Kota 1 Serpong",
        legal_basis="Keputusan Walikota No. 511.2/Kep.142-Disperindag/2024",
        authorized_by="Disperindag Kota Tangerang Selatan",
        active_hours="16:00 - 23:00 WIB",
        max_capacity_stalls=25,
        current_registered_stalls=18,
        mandatory_free_pedestrian_width_meters=3.0,
        is_legal=True,
    )
    db.add(vz1)
    db.flush()

    vr1 = StreetVendorRecord(
        zone_id=vz1.id,
        vendor_code="PKL-TKN-001",
        business_type="Kuliner Khas Daerah / Minuman Herbal",
        stall_number="A-04",
        stall_size_sqm=4.0,
        verification_status="Terdaftar Resmi",
        cleanliness_score=90.0,
        coaching_history=[{"date": "2026-02-15", "topic": "Pelatihan Higienitas & Pengelolaan Sampah"}],
    )
    db.add(vr1)

    # Hotspots
    hs1 = UrbanHotspot(
        title="Simpang Pasar Ciputat - Kabel Semrawut & Hambatan Trotoar",
        issue_type="Kabel Semrawut & Parkir Trotoar",
        location_name="Flyover & Pasar Ciputat",
        district="Ciputat",
        latitude=-6.3128,
        longitude=106.7569,
        incident_count_30d=14,
        peak_hours="06:30 - 09:00 & 16:30 - 19:30",
        severity="Critical",
        lead_agency="Dishub, Satpol PP & Disperkim",
        status="Fokus Penertiban Terpadu",
    )
    hs2 = UrbanHotspot(
        title="Koridor Kampus Pamulang - PKL Meluber Jalur Pejalan Kaki",
        issue_type="Hambatan Trotoar",
        location_name="Jl. Surya Kencana Kampus Unpam",
        district="Pamulang",
        latitude=-6.3440,
        longitude=106.7395,
        incident_count_30d=9,
        peak_hours="11:30 - 13:30 & 17:00 - 20:00",
        severity="High",
        lead_agency="Satpol PP & Kecamatan Pamulang",
        status="Penataan Berjalan",
    )
    db.add_all([hs1, hs2])

    # WalkPoints
    wp_prog = WalkpointProgram(
        title="Tangsel Melangkah: Mobilitas Bersih & Sehat",
        description="Program insentif pejalan kaki pada koridor publik yang tertata. Poin dapat ditukarkan voucher mitra UMKM lokal.",
        funding_source="CSR Kemitraan Lingkungan & Program APBD Dispora/Dishub",
        points_per_km=50,
        daily_cap_points=250,
        is_active=True,
    )
    db.add(wp_prog)

    wp_acc = WalkpointAccount(
        participant_name="Budi Santoso (Pejalan Terdaftar)",
        balance_points=320,
        lifetime_points_earned=680,
        total_km_walked=13.6,
        tier="Pejalan Unggul",
        is_active=True,
    )
    db.add(wp_acc)
    db.flush()

    wp_tx1 = WalkpointTransaction(
        account_id=wp_acc.id,
        tx_type="CHECKIN_QR",
        points_delta=50,
        location_corridor="Jl. Pahlawan Seribu - Segmen BSD",
        note="Check-in koridor pedestrian terawat",
        anti_fraud_status="Verified Valid",
    )
    wp_reward1 = WalkpointReward(
        partner_merchant_name="Kopi Sahabat UMKM Serpong",
        reward_title="Diskon Kopi & Snack 20% (Max Rp 15.000)",
        category="Voucher UMKM",
        points_required=100,
        stock_available=45,
        terms="Berlaku untuk pejalan kaki terverifikasi WalkPoints di gerai BSD.",
    )
    db.add_all([wp_tx1, wp_reward1])

    # Official Payment Audit Record (Perda/Tibum)
    pay_audit = OfficialPaymentAudit(
        case_or_obstruction_id="AUDIT-OBS-2026-01",
        reference_number="REF-TIBUM-TGL-2026-0089",
        subject_title="Pelanggaran Parkir di Atas Trotoar Ir. Juanda",
        legal_basis_check="Perda Kota Tangsel No. 9 Tahun 2022 tentang Ketertiban Umum",
        determination_status="Awaiting Authorized Determination",
        collection_readiness="SIMULATION / NOT ENABLED FOR COLLECTION",
        official_channel="Kas Daerah via Bank BJB / Bapenda Official Gateway",
        reconciliation_status="Not Applicable",
        audit_notes="Pungutan denda di aplikasi tidak diaktifkan sebelum penetapan vonis hakim/pejabat berwenang dan integrasi kas daerah sah.",
    )
    db.add(pay_audit)
    db.commit()


def seed_talent(db: Session) -> None:
    if db.scalar(select(TalentProfile).limit(1)):
        return

    now = datetime.now(UTC)

    # Talent Profiles
    p1 = TalentProfile(
        nip="198804122010011002",
        full_name="Budi Santoso, S.STP, M.AP",
        agency_opd="Bagian Perekonomian dan Pembangunan",
        current_position="Subkoordinator Pengendalian Pembangunan Daerah",
        echelon_or_class="Jabatan Fungsional Keahlian Madya",
        rank_group="Pembina (IV/a)",
        education_level="S2",
        major="Administrasi Publik",
        years_in_position=3.5,
        performance_score_official=94.2,
        potential_score_official=91.0,
        nine_box_position=9,  # Box 9: Top Talent
        nine_box_status="Disahkan Komite Talenta Daerah",
        data_completeness_pct=98.0,
        verification_status="Terverifikasi BKPSDM & SIASN BKN",
        career_aspirations="Kepala Bagian Ekbang / Kepala Bidang Bappeda",
        certifications=[{"name": "Sertifikasi Manajemen Kinerja ASN", "year": 2024, "issuer": "Puslatbang BKN"}],
        project_assignments=[{"project": "Tim Task Force Wasdal Inflasi & Stunting", "role": "Ketua Tim Teknis"}],
    )
    p2 = TalentProfile(
        nip="199105232014022003",
        full_name="Rina Kartika, S.Kom, M.T.",
        agency_opd="Dinas Komunikasi dan Informatika",
        current_position="Pranata Komputer Ahli Muda",
        echelon_or_class="Jabatan Fungsional Keahlian Muda",
        rank_group="Penata Tk. I (III/d)",
        education_level="S2",
        major="Teknologi Informasi",
        years_in_position=2.8,
        performance_score_official=88.5,
        potential_score_official=92.4,
        nine_box_position=8,  # Box 8: Future Leader
        nine_box_status="Disahkan Komite Talenta Daerah",
        data_completeness_pct=95.0,
        verification_status="Terverifikasi BKPSDM & SIASN BKN",
        career_aspirations="Kepala Bidang Infrastruktur TIK / Smart City",
        certifications=[{"name": "Certified Enterprise Architecture & SPBE", "year": 2025, "issuer": "KemenPAN-RB"}],
        project_assignments=[{"project": "Pengembangan Digital Twin Ruang Kota Wasdal", "role": "Lead Architect"}],
    )
    p3 = TalentProfile(
        nip="198509172009021004",
        full_name="Ahmad Fauzi, S.T.",
        agency_opd="Dinas Sumber Daya Air, Bina Marga dan Bina Konstruksi",
        current_position="Teknik Pengairan Ahli Muda",
        echelon_or_class="Jabatan Fungsional Keahlian Muda",
        rank_group="Penata Tk. I (III/d)",
        education_level="S1",
        major="Teknik Sipil",
        years_in_position=4.2,
        performance_score_official=91.0,
        potential_score_official=74.5,
        nine_box_position=6,  # Box 6: High Performer
        nine_box_status="Disahkan Komite Talenta Daerah",
        data_completeness_pct=90.0,
        verification_status="Terverifikasi BKPSDM",
        career_aspirations="Kepala Seksi Drainase & Pengendalian Banjir",
        certifications=[{"name": "Keahlian Pengawasan Jaringan Utilitas dan Drainase", "year": 2023, "issuer": "LPJK"}],
        project_assignments=[{"project": "Satgas Kabel Udara & Trotoar Ciputat", "role": "Koordinator Lapangan"}],
    )
    p4 = TalentProfile(
        nip="199302142018012001",
        full_name="Siti Nurhaliza, S.E.",
        agency_opd="Badan Perencanaan Pembangunan Daerah (Bappeda)",
        current_position="Perencana Ahli Pertama",
        echelon_or_class="Jabatan Fungsional Keahlian Pertama",
        rank_group="Penata Muda Tk. I (III/b)",
        education_level="S1",
        major="Ekonomi Pembangunan",
        years_in_position=2.1,
        performance_score_official=82.5,
        potential_score_official=79.0,
        nine_box_position=5,  # Box 5: Core Talent
        nine_box_status="Disahkan Komite Talenta Daerah",
        data_completeness_pct=89.0,
        verification_status="Terverifikasi BKPSDM",
        career_aspirations="Perencana Madya Bidang Evaluasi RPJMD",
        certifications=[{"name": "Sertifikasi Perencana Pembangunan Daerah", "year": 2024, "issuer": "Pusbindiklatren Bappenas"}],
        project_assignments=[{"project": "Penyelarasan Indikator Kinerja Wasdal-RKPD", "role": "Anggota Tim Analis"}],
    )
    db.add_all([p1, p2, p3, p4])
    db.flush()

    # Data Sources
    ds1 = TalentDataSource(source_name="SIASN BKN", data_type="Data Pokok ASN & Riwayat Kepangkatan", last_sync_at=now - timedelta(hours=6), sync_status="Connected - Official API")
    ds2 = TalentDataSource(source_name="e-Kinerja BKN", data_type="Hasil SKP dan Evaluasi Kinerja Tahunan", last_sync_at=now - timedelta(hours=12), sync_status="Connected - Official API")
    ds3 = TalentDataSource(source_name="SIMPEG Pemkot Tangerang Selatan", data_type="Riwayat Jabatan & Diklat Lokal", last_sync_at=now - timedelta(hours=2), sync_status="Active Database Sync")
    db.add_all([ds1, ds2, ds3])

    # Data Quality Issues
    dqi1 = TalentDataQualityIssue(
        nip=p3.nip,
        employee_name=p3.full_name,
        agency_opd=p3.agency_opd,
        issue_type="Conflicting",
        description="Nama jabatan pada SK mutasi terakhir berbeda 1 kata dengan data di SIASN BKN.",
        field_name="current_position",
        correction_owner="Admin Kepegawaian DSDABMBK",
        status="In Correction",
    )
    dqi2 = TalentDataQualityIssue(
        nip=p4.nip,
        employee_name=p4.full_name,
        agency_opd=p4.agency_opd,
        issue_type="Incomplete",
        description="Berkas digital sertifikat pelatihan perencana belum diunggah ke repositori arsip.",
        field_name="certifications_evidence",
        correction_owner="Siti Nurhaliza (Mandiri)",
        status="Pending Verification",
    )
    db.add_all([dqi1, dqi2])

    # Socialization Materials
    mat1 = TalentSocializationMaterial(
        title="Pedoman Manajemen Talenta ASN Berdasarkan Sistem Merit",
        category="Regulasi & Pedoman",
        summary="Panduan lengkap implementasi talent acquisition, talent mapping 9-box, talent development, dan succession planning.",
        official_source_doc="Peraturan Menteri PAN-RB No. 3 Tahun 2020",
        file_url="/docs/permenpanrb-3-2020.pdf",
        read_count=184,
        quiz_available=True,
    )
    mat2 = TalentSocializationMaterial(
        title="Infografis: Cara Memahami 9 Box Kinerja & Potensi",
        category="Infografis & Media",
        summary="Penjelasan visual definisi kotak 1 sampai kotak 9, hakikat penilaian objektif, dan langkah penyusunan rencana IDP.",
        official_source_doc="Surat Edaran BKPSDM Kota Tangerang Selatan No. 800/2025",
        file_url="/docs/infografis-9box-tangsel.pdf",
        read_count=320,
        quiz_available=False,
    )
    db.add_all([mat1, mat2])

    # Socialization Events
    ev1 = TalentSocializationEvent(
        event_title="Sosialisasi Akbar: Percepatan Sistem Merit & Validasi Data Talenta ASN Tangsel",
        event_date=now + timedelta(days=7),
        location_or_link="Aula Lantai 4 Gedung Pemkot Tangerang Selatan / Hybrid Zoom",
        speakers="Kepala BKPSDM Tangsel & Asisten Komisioner KASN / Deputi BKN",
        target_audience="Sekretaris OPD, Kepala Subbagian Kepegawaian se-Kota Tangerang Selatan",
        attendance_count=168,
        max_quota=200,
        status="Upcoming",
    )
    db.add(ev1)

    # Competencies
    comp1 = TalentCompetency(
        code="COMP-MAN-01",
        name="Integritas dan Etika Birokrasi",
        cluster="Manajerial",
        description="Konsistensi berperilaku selaras dengan nilai, norma, dan etika organisasi dalam tugas kedinasan.",
        standard_level=4,
        behavior_indicators=["Menciptakan situasi kerja yang transparan", "Berani menolak gratifikasi dan intervensi menyimpang"],
    )
    comp2 = TalentCompetency(
        code="COMP-MAN-02",
        name="Kerjasama Lintas Sektor & Inovasi",
        cluster="Manajerial",
        description="Kemampuan membangun aliansi kerja lintas OPD dan menyelesaikan persoalan riil di lapangan.",
        standard_level=3,
        behavior_indicators=["Menginisiasi solusi bersama lintas instansi", "Menghubungkan target RPJMD dengan penugasan lapangan"],
    )
    comp3 = TalentCompetency(
        code="COMP-TEK-01",
        name="Pengendalian Pembangunan & Kebijakan Ekbang",
        cluster="Teknis",
        description="Keahlian teknis merumuskan rekomendasi percepatan, pengendalian inflasi, dan pemantauan proyek strategis.",
        standard_level=4,
        behavior_indicators=["Menganalisis deviasi fisik vs keuangan", "Menyusun skema percepatan tindak lanjut rapat Wasdal"],
    )
    db.add_all([comp1, comp2, comp3])
    db.flush()

    # Assessments
    ass1 = TalentAssessment(
        profile_id=p1.id,
        competency_id=comp1.id,
        current_level=4,
        required_level=4,
        gap=0,
        assessment_body="Asesmen Center BKN Terakreditasi A",
        development_recommendation="Pertahankan standar etika dan jadilah role model bagi pegawai muda.",
    )
    ass2 = TalentAssessment(
        profile_id=p1.id,
        competency_id=comp2.id,
        current_level=4,
        required_level=3,
        gap=1,
        assessment_body="Asesmen Center BKN Terakreditasi A",
        development_recommendation="Siap memimpin proyek strategis kolaborasi antar instansi.",
    )
    db.add_all([ass1, ass2])

    # Talent Pools
    pool1 = TalentPool(
        name="Talent Pool Administrator / Kepala Bagian",
        description="Kelompok ASN berkinerja tinggi dan berpotensi tinggi untuk suksesi jabatan administrator (Eselon III).",
        category="Kepemimpinan",
        criteria_rule="Nine Box 8 atau 9, Nilai SKP >= 85, Rekomendasi Bebas Temuan Inspektorat",
        total_qualified_members=12,
    )
    pool2 = TalentPool(
        name="Talent Pool Inovasi Digital & Smart City",
        description="Kelompok ASN penggerak transformasi sistem SPBE, digital twin ruang kota, dan integrasi data.",
        category="Digital & Inovasi",
        criteria_rule="Keahlian TI/Teknis, Sertifikasi SPBE/Data, Proyek inovasi terverifikasi",
        total_qualified_members=18,
    )
    db.add_all([pool1, pool2])

    # IDP
    idp1 = TalentIDP(
        profile_id=p1.id,
        year=2026,
        target_career_objective="Kesiapan Jabatan Pimpinan Tinggi Pratama / Administrator Utama",
        mentor_or_coach="Asisten Daerah Bidang Perekonomian dan Pembangunan",
        approval_status="Disetujui Atasan Langsung",
        overall_progress_pct=75.0,
        evaluation_notes="Menunjukkan komitmen tinggi dan aktif dalam penyelesaian kasus Wasdal berisiko tinggi.",
    )
    db.add(idp1)
    db.flush()

    idp_act1 = TalentIDPActivity(
        idp_id=idp1.id,
        activity_type="Pelatihan Kepemimpinan",
        title="Pelatihan Kepemimpinan Administrator (PKA) Angkatan V",
        competency_targeted="Kerjasama Lintas Sektor & Inovasi Kepemimpinan",
        deadline=now + timedelta(days=60),
        progress_status="In Progress",
        verified_by_supervisor=True,
    )
    idp_act2 = TalentIDPActivity(
        idp_id=idp1.id,
        activity_type="Penugasan Khusus",
        title="Lead Koordinator Pengendalian Inflasi dan Stabilisasi Pangan Wasdal",
        competency_targeted="Pengendalian Pembangunan & Kebijakan Ekbang",
        deadline=now + timedelta(days=30),
        progress_status="Completed",
        verified_by_supervisor=True,
    )
    db.add_all([idp_act1, idp_act2])

    # Critical Positions & Succession
    cp1 = TalentCriticalPosition(
        position_title="Kepala Bagian Perekonomian dan Pembangunan (Ekbang)",
        agency_opd="Sekretariat Daerah",
        urgency_level="Critical",
        vacancy_risk_reason="Pejabat definitif memasuki batas usia pensiun (BUP) dalam 7 bulan.",
        current_incumbent_name="Drs. H. Mulyadi, M.Si",
        retirement_estimated_date=now + timedelta(days=210),
        required_competencies_summary="Keahlian kepemimpinan koordinasi 14 OPD teknis, pengendalian inflasi, dan monitoring RPJMD.",
    )
    db.add(cp1)
    db.flush()

    sp1 = TalentSuccessionPlan(
        position_id=cp1.id,
        candidate_profile_id=p1.id,
        readiness_status="Ready Now",
        readiness_score=94.0,
        competency_gap_summary="Kompetensi manajerial dan teknis terpenuhi 100%. Telah memimpin tim Wasdal dengan capaian target terverifikasi.",
        development_action_plan="Pemberian wewenang Plh bila diperlukan transisi penugasan.",
        verified_by_committee=True,
    )
    sp2 = TalentSuccessionPlan(
        position_id=cp1.id,
        candidate_profile_id=p3.id,
        readiness_status="Ready < 1 Year",
        readiness_score=82.5,
        competency_gap_summary="Perlu pemenuhan sertifikasi kepemimpinan administrator dan pemahaman makroekonomi daerah.",
        development_action_plan="Ikut serta dalam mentoring berkala bersama Tim Asda Ekbang.",
        verified_by_committee=True,
    )
    db.add_all([sp1, sp2])

    # Mobility Recommendation
    mr1 = TalentMobilityRecommendation(
        candidate_profile_id=p2.id,
        recommended_target_position="Kepala Seksi Integrasi Data & SPBE",
        target_agency_opd="Dinas Komunikasi dan Informatika",
        match_score_pct=94.5,
        rationale_why="Sesuai kompetensi enterprise architecture dan rekam jejak sukses membangun pipeline digital twin Wasdal.",
        factors_considered=["Kesesuaian Kompetensi Teknis (96%)", "Kinerja SKP Sangat Baik (88.5%)", "Potensi Kepemimpinan Masa Depan"],
        review_status="Direkomendasikan ke Tim Penilai Kinerja BKPSDM",
    )
    db.add(mr1)

    # Implementation Milestones
    m1 = TalentImplementationMilestone(
        phase_order=1,
        phase_name="Penyusunan Regulasi & Pedoman Sistem Merit",
        target_description="Pengesahan Perwal Manajemen Talenta & SOP Komite Talenta Pemkot Tangsel.",
        lead_pic="BKPSDM & Bagian Hukum Setda",
        deadline=now - timedelta(days=90),
        status="Completed",
        evidence_notes="Perwal No. 24 Tahun 2025 telah diundangkan.",
    )
    m2 = TalentImplementationMilestone(
        phase_order=2,
        phase_name="Sosialisasi & Edukasi Manajemen Talenta ASN",
        target_description="Sosialisasi 100% OPD dan asesmen pemahaman materi regulasi.",
        lead_pic="Bidang Pengembangan Karir BKPSDM",
        deadline=now - timedelta(days=20),
        status="Completed",
        evidence_notes="Telah terlaksana pada 36 unit kerja perangkat daerah.",
    )
    m3 = TalentImplementationMilestone(
        phase_order=3,
        phase_name="Integrasi Kualitas Data SIASN & SIMPEG",
        target_description="Penyelesaian data conflicting dan unverified pada seluruh pegawai eselon III dan IV.",
        lead_pic="Subbidang Data & Informasi Kepegawaian",
        deadline=now + timedelta(days=15),
        status="In Progress",
        evidence_notes="Pencapaian verifikasi saat ini 92.4%.",
    )
    m4 = TalentImplementationMilestone(
        phase_order=4,
        phase_name="Asesmen Kompetensi Terakreditasi BKN",
        target_description="Pelaksanaan uji kompetensi terstandar untuk seluruh pemangku jabatan kritis.",
        lead_pic="Pusat Asesmen BKPSDM Banten / BKN",
        deadline=now + timedelta(days=45),
        status="In Progress",
        evidence_notes="Gelombang I selesai 120 orang, gelombang II dalam penjadwalan.",
    )
    m5 = TalentImplementationMilestone(
        phase_order=5,
        phase_name="Sidang Komite Talenta & Penetapan 9-Box Resmi",
        target_description="Sidang penetapan talent pool dan succession planning jabatan eselon III prioritas.",
        lead_pic="Sekda selaku Ketua Komite Talenta",
        deadline=now + timedelta(days=70),
        status="Pending Decision",
        evidence_notes="Menunggu penyelesaian asesmen gelombang II.",
    )
    db.add_all([m1, m2, m3, m4, m5])

    db.commit()


def seed_network(db: Session) -> None:
    if db.scalar(select(NetworkRegion).where(NetworkRegion.code == "36.74")):
        return

    now = datetime.now(UTC)

    # 1. Wilayah Pemerintahan (1 Provinsi, 2 Kab/Kota)
    prov_banten = NetworkRegion(
        code="36",
        name="Provinsi Banten [DEMO]",
        region_type="Provinsi",
        province_name="Banten",
        is_active=True,
        is_demo=True,
    )
    kota_tangsel = NetworkRegion(
        code="36.74",
        name="Kota Tangerang Selatan [DEMO]",
        region_type="Kota",
        province_name="Banten",
        is_active=True,
        is_demo=True,
    )
    kab_bogor = NetworkRegion(
        code="32.01",
        name="Kabupaten Bogor [DEMO]",
        region_type="Kabupaten",
        province_name="Jawa Barat",
        is_active=True,
        is_demo=True,
    )
    db.add_all([prov_banten, kota_tangsel, kab_bogor])
    db.flush()

    # 2. Profil Daerah Tangerang Selatan & Bogor
    profile_tangsel = RegionProfile(
        region_id=kota_tangsel.id,
        capital_city="Kecamatan Setu (Pusat Pemkot)",
        office_address="Jl. Maruga No. 1, Serua, Kec. Ciputat, Kota Tangerang Selatan, Banten",
        website="https://tangselkota.go.id",
        leader_name="Drs. H. Benyamin Davnie",
        vice_leader_name="H. Pilar Saga Ichsan, S.T., M.Arch",
        sekda_name="H. Bambang Noertjahjo, S.E., Ak.",
        term_period="2021-2026",
        expert_staff_count=3,
        expert_staff_fields="Bidang Perekonomian & Pembangunan; Bidang Pemerintahan & Hukum; Bidang SDM & Kemasyarakatan",
        total_area_km2=147.19,
        districts_count=7,
        villages_count=54,
        population=1384000,
        density_per_km2=9402.8,
        region_characters="Perkotaan Modern, Pusat Jasa, Perdagangan, Pendidikan, Penyangga Megapolitan",
        growth_center_zones="Koridor BSD City, Kawasan Bintaro Jaya, Segitiga Emas Ciputat-Pamulang, Koridor Alam Sutera",
        dominant_disaster_risks="Genangan luapan drainase lokal, kemacetan perlintasan komuter jam sibuk",
        economic_growth_rate=5.48,
        pdrb_trillion=98.42,
        poverty_rate=2.50,
        unemployment_rate=5.81,
        gini_ratio=0.342,
        ipm=82.15,
        total_umkm=46200,
        completion_score=94,
        validation_status="Terverifikasi Daerah",
        last_verified_at=now - timedelta(days=2),
        last_verified_by="Drs. H. Heru Sudarmanto (Staf Ahli Ekbang)",
    )

    profile_bogor = RegionProfile(
        region_id=kab_bogor.id,
        capital_city="Cibinong",
        office_address="Jl. Raya Tegar Beriman No. 1, Cibinong, Kab. Bogor, Jawa Barat",
        website="https://bogorkab.go.id",
        leader_name="Pj. Bupati Bogor",
        vice_leader_name="-",
        sekda_name="Sekda Kabupaten Bogor",
        term_period="2024-2025 (Pj)",
        expert_staff_count=3,
        expert_staff_fields="Perekonomian, Pembangunan, Pemerintahan",
        total_area_km2=2986.20,
        districts_count=40,
        villages_count=435,
        population=5427000,
        density_per_km2=1817.3,
        region_characters="Agraris, Industri Manufaktur, Pariwisata Alam, Kawasan Resapan Air DAS Cisadane",
        growth_center_zones="Kawasan Sentul, Cibinong Raya, Jalur Puncak, Koridor Cileungsi-Klapanunggal",
        dominant_disaster_risks="Longsor tebing perbukitan, luapan sungai kali Ciliwung/Cisadane",
        economic_growth_rate=4.95,
        pdrb_trillion=272.50,
        poverty_rate=7.25,
        unemployment_rate=7.80,
        gini_ratio=0.385,
        ipm=71.20,
        total_umkm=78000,
        completion_score=78,
        validation_status="Diajukan",
        last_verified_at=now - timedelta(days=5),
        last_verified_by="Admin Daerah Kab. Bogor",
    )
    db.add_all([profile_tangsel, profile_bogor])

    # 3. Keanggotaan Tim Daerah
    m_tangsel1 = RegionMembership(
        region_id=kota_tangsel.id,
        user_name="Drs. H. Heru Sudarmanto, M.Si",
        user_email="stafahli.ekbang@tangselkota.go.id",
        role="Staf Ahli Kepala Daerah",
        agency="Sekretariat Daerah - Staf Ahli Ekbang",
        is_active=True,
    )
    m_tangsel2 = RegionMembership(
        region_id=kota_tangsel.id,
        user_name="Ahmad Fauzi, S.Kom",
        user_email="admin.jejaring@tangselkota.go.id",
        role="Admin Daerah",
        agency="Bagian Perekonomian dan Pembangunan (Ekbang)",
        is_active=True,
    )
    db.add_all([m_tangsel1, m_tangsel2])

    # 4. Master Kamus Indikator
    ind_defs = [
        NetworkIndicatorDefinition(
            code="IND_MAKRO_PDRB",
            name="PDRB Atas Dasar Harga Konstan",
            category="Makro Ekonomi",
            unit="Rp Triliun",
            formula_description="Total nilai tambah bruto barang dan jasa pada periode konstan.",
            default_source="BPS",
            is_mandatory=True,
        ),
        NetworkIndicatorDefinition(
            code="IND_MAKRO_PE",
            name="Laju Pertumbuhan Ekonomi",
            category="Makro Ekonomi",
            unit="%",
            formula_description="Pertumbuhan PDRB tahun n dibandingkan tahun n-1.",
            default_source="BPS",
            is_mandatory=True,
        ),
        NetworkIndicatorDefinition(
            code="IND_FISKAL_PAD",
            name="Rasio Kemandirian PAD terhadap Total Pendapatan",
            category="Fiskal & APBD",
            unit="%",
            formula_description="(Realisasi PAD / Total Pendapatan Daerah) * 100",
            default_source="BPKAD",
            is_mandatory=True,
        ),
        NetworkIndicatorDefinition(
            code="IND_FISKAL_MODAL",
            name="Porsi Belanja Modal terhadap Total Belanja",
            category="Fiskal & APBD",
            unit="%",
            formula_description="(Realisasi Belanja Modal / Total Belanja Daerah) * 100",
            default_source="BPKAD",
            is_mandatory=True,
        ),
        NetworkIndicatorDefinition(
            code="IND_SOSIAL_IPM",
            name="Indeks Pembangunan Manusia (IPM)",
            category="Layanan Publik",
            unit="Skor (0-100)",
            formula_description="Komposit angka harapan hidup, harapan lama sekolah, dan pengeluaran riil per kapita.",
            default_source="BPS",
            is_mandatory=True,
        ),
    ]
    db.add_all(ind_defs)

    # 5. Nilai Indikator 3 Tahun (2022, 2023, 2024)
    ind_values = [
        NetworkIndicatorValue(region_id=kota_tangsel.id, indicator_code="IND_MAKRO_PE", indicator_name="Laju Pertumbuhan Ekonomi", category="Makro Ekonomi", year=2022, value=5.37, unit="%", source="BPS Tangsel"),
        NetworkIndicatorValue(region_id=kota_tangsel.id, indicator_code="IND_MAKRO_PE", indicator_name="Laju Pertumbuhan Ekonomi", category="Makro Ekonomi", year=2023, value=5.48, unit="%", source="BPS Tangsel"),
        NetworkIndicatorValue(region_id=kota_tangsel.id, indicator_code="IND_MAKRO_PE", indicator_name="Laju Pertumbuhan Ekonomi", category="Makro Ekonomi", year=2024, value=5.56, unit="%", source="BPS Tangsel (Proyeksi)"),
        NetworkIndicatorValue(region_id=kota_tangsel.id, indicator_code="IND_FISKAL_PAD", indicator_name="Rasio Kemandirian PAD terhadap Total Pendapatan", category="Fiskal & APBD", year=2022, value=48.2, unit="%", source="BPKAD Tangsel"),
        NetworkIndicatorValue(region_id=kota_tangsel.id, indicator_code="IND_FISKAL_PAD", indicator_name="Rasio Kemandirian PAD terhadap Total Pendapatan", category="Fiskal & APBD", year=2023, value=50.1, unit="%", source="BPKAD Tangsel"),
        NetworkIndicatorValue(region_id=kota_tangsel.id, indicator_code="IND_FISKAL_PAD", indicator_name="Rasio Kemandirian PAD terhadap Total Pendapatan", category="Fiskal & APBD", year=2024, value=51.8, unit="%", source="BPKAD Tangsel"),
        NetworkIndicatorValue(region_id=kota_tangsel.id, indicator_code="IND_SOSIAL_IPM", indicator_name="Indeks Pembangunan Manusia (IPM)", category="Layanan Publik", year=2022, value=81.65, unit="Skor", source="BPS"),
        NetworkIndicatorValue(region_id=kota_tangsel.id, indicator_code="IND_SOSIAL_IPM", indicator_name="Indeks Pembangunan Manusia (IPM)", category="Layanan Publik", year=2023, value=82.15, unit="Skor", source="BPS"),
        NetworkIndicatorValue(region_id=kota_tangsel.id, indicator_code="IND_SOSIAL_IPM", indicator_name="Indeks Pembangunan Manusia (IPM)", category="Layanan Publik", year=2024, value=82.60, unit="Skor", source="BPS"),
    ]
    db.add_all(ind_values)

    # 6. Isu Strategis Daerah
    issue1 = NetworkStrategicIssue(
        region_id=kota_tangsel.id,
        title="Optimalisasi Kemandirian Fiskal & Harmonisasi PBJT Pasca Pemberlakuan UU HKPD",
        summary="Kebutuhan penyesuaian regulasi tarif Pajak Barang dan Jasa Tertentu (PBJT) restoran dan hiburan, pencegahan kebocoran tapping box kasir, serta insentif kepatuhan wajib pajak lokal.",
        category="Fiskal",
        location_name="Kawasan Pusat Kuliner & Komersial BSD - Alam Sutera - Bintaro",
        authority_level="Kabupaten/Kota",
        target_opd="Bapenda, Disperindag, Satpol PP",
        affected_groups="Pelaku usaha F&B, UMKM, hotel dan restoran",
        urgency_level="Tinggi",
        impact_level="Tinggi",
        priority_score=91.5,
        status="Aktif",
        pic_name="Kabid Pajak Daerah Bapenda Tangsel",
        deadline_target="Triwulan IV 2026",
        linked_rpjmd_indicator="Peningkatan Kontribusi PAD terhadap APBD di atas 52%",
        decision_required=True,
    )
    db.add(issue1)
    db.flush()

    # 7. Diagnosis Staf Ahli
    diag1 = NetworkDiagnosis(
        region_id=kota_tangsel.id,
        issue_id=issue1.id,
        problem_statement="Meskipun PAD Tangsel sudah mencapai ~50% dari total APBD, potensi penerimaan PBJT jasa perhotelan, restoran, dan parkir komersial belum tervaluasi secara real-time akibat disparitas digitalisasi kasir UMKM menengah.",
        baseline_condition="Realisasi PBJT 2023 tercapai Rp 410 Miliar. Masih terdapat ~1.200 merchant tier-2 tanpa integrasi payment gateway terdata.",
        root_cause="Pemberlakuan UU No. 1/2022 (HKPD) mengubah klasifikasi objek pajak daerah, sementara instrumen pengawasan tapping box lama sering mengalami gangguan koneksi internet di gerai merchant.",
        program_gaps="Program sosialisasi Bapenda belum menyertakan skema insentif timbal balik (misal cashback diskon perizinan bagi merchant taat integrasi pos).",
        inaction_risks="Risiko potensi kehilangan penerimaan daerah (potential loss) sebesar Rp 65 - 80 Miliar per tahun yang semestinya memperkuat belanja modal infrastruktur publik.",
        solution_options=[
            {"code": "A", "label": "Revitalisasi Digital Tapping Box berbasis QRIS Nasional & Dashboard Kasir Terintegrasi", "cost": "Rp 1.2 Miliar", "impact": "Peningkatan akurasi pelaporan 95%"},
            {"code": "B", "label": "Insentif Cashback Biaya Retribusi Sampah bagi Wajib Pajak Restoran Berstatus Hijau", "cost": "Rp 600 Juta", "impact": "Kepatuhan sukarela naik 40%"},
            {"code": "C", "label": "Operasi Pengawasan Gabungan Berkala Satpol PP & Auditor Bapenda", "cost": "Rp 350 Juta", "impact": "Dampak penegakan hukum jangka pendek"},
        ],
        expert_recommendation="Merekomendasikan Pilihan A dikombinasikan dengan Insentif Pilihan B: Penerapan digital merchant portal terpadu disertai insentif pengurangan retribusi persampahan bagi gerai taat rekapitulasi.",
        decision_prompt="Persetujuan Walikota untuk penerbitan Perwal Insentif Kepatuhan Wajib Pajak Daerah dan Pengadaan Dashboard Rekonsiliasi PBJT Realtime.",
        status="Terverifikasi Daerah",
        author_name="Drs. H. Heru Sudarmanto, M.Si (Staf Ahli Ekbang)",
    )
    db.add(diag1)

    # 8. Snapshot Fiskal & Roadmap
    fiscal1 = NetworkFiscalSnapshot(
        region_id=kota_tangsel.id,
        year=2024,
        total_revenue_billion=4420.0,
        pad_billion=2280.0,
        transfer_revenue_billion=2010.0,
        other_legal_revenue_billion=130.0,
        total_expenditure_billion=4560.0,
        personnel_expenditure_billion=1390.0,
        goods_services_expenditure_billion=1580.0,
        capital_expenditure_billion=1020.0,
        infrastructure_expenditure_billion=850.0,
        silpa_billion=260.0,
        pad_ratio_pct=51.58,
        transfer_dependency_pct=45.47,
        personnel_ratio_pct=30.48,
        capital_ratio_pct=22.37,
        fiscal_space_level="Sedang",
        notes="Ruang fiskal cukup sehat dengan belanja modal di atas 22% dan belanja pegawai terkendali di ~30%.",
    )
    db.add(fiscal1)

    roadmap1 = NetworkFiscalRoadmap(
        region_id=kota_tangsel.id,
        title="Roadmap Kemandirian Fiskal & Efisiensi Belanja Kota Tangsel 2024-2026",
        target_year=2026,
        efficiency_programs="Audit efisiensi listrik gedung kantor dinas (penghematan 15%), digitalisasi SPPD paperless.",
        pad_optimization_strategy="Integrasi billing PBB-P2 online, sistem self-assessment PBJT dengan validasi AI anomali omzet.",
        asset_optimization_strategy="Pemanfaatan aset gedung eks-kantor kelurahan untuk creative hub & co-working berbayar non-tunai.",
        central_support_needs="Dukungan penyelarasan alokasi Dana Bagi Hasil (DBH) PPh Pasal 21 dan harmonisasi regulasi insentif fiskal Kemenkeu.",
        lead_agency="Bapenda, BPKAD, Bagian Ekbang",
        status="Dalam Penyusunan",
    )
    db.add(roadmap1)

    # 9. Bank Gagasan (2 Gagasan Inovasi)
    idea1 = NetworkIdea(
        region_id=kota_tangsel.id,
        title="Satu Aset Banyak Manfaat: Co-working & Inkubasi UMKM di Fasilitas Publik Idle",
        summary_plain="Memanfaatkan ruang rapat atau aula gedung kantor pemerintah yang tidak terpakai pada akhir pekan atau sore hari sebagai sentra pendampingan legalitas, foto produk, dan inkubasi UMKM muda.",
        novelty_element="Skema pemanfaatan aset pemerintah daerah tanpa sewa memberatkan, digantikan sistem point loyalitas dan kontribusi kebersihan.",
        target_beneficiaries="Pelaku wirausaha pemula, komunitas kreatif, mahasiswa Tangsel",
        category="Aset & Ekonomi Kreatif",
        primary_opd="Diskop UKM & BPKAD",
        estimated_budget_million=180.0,
        funding_source_options="APBD Perubahan & CSR BJB Banten",
        readiness_status="Siap Direplikasi",
        impact_vs_effort="High Impact / Low Effort",
        is_replicable=True,
        interested_regions_count=5,
    )
    idea2 = NetworkIdea(
        region_id=kota_tangsel.id,
        title="Digital Tax Rebound: Integrasi Kasir Merchant PBJT & Cashback Poin Mobilitas",
        summary_plain="Konsumen yang bertransaksi di restoran resmi ber-PBJT mendapatkan poin loyalti WalkPoints yang dapat ditukarkan voucher diskon moda feeder transit Trans Tangsel.",
        novelty_element="Menghubungkan kepatuhan pajak daerah dengan mobilitas hijau pejalan kaki dan angkutan umum kota.",
        target_beneficiaries="Warga konsumen, pengelola merchant, pengguna transportasi publik",
        category="Fiskal & Transportasi",
        primary_opd="Bapenda & Dishub",
        estimated_budget_million=320.0,
        funding_source_options="APBD murni & Kemitraan Pengelola Kawasan Swasta",
        readiness_status="Layak Uji",
        impact_vs_effort="High Impact / High Effort",
        is_replicable=True,
        interested_regions_count=3,
    )
    db.add_all([idea1, idea2])

    # 10. Proyek Percontohan (Pilot Project)
    pilot1 = NetworkPilotProject(
        region_id=kota_tangsel.id,
        title="Dividen Efisiensi Gedung Pemerintah: Solar Rooftop & Smart Lighting Balai Kota",
        template_type="Dividen Efisiensi Gedung Pemerintah",
        location="Kompleks Balai Kota Maruga, Ciputat",
        pic_team="Dinas Bangunan & Tata Ruang bersama Bagian Umum",
        duration_months=6,
        progress_pct=60,
        success_indicators="Penurunan tagihan listrik gedung sebesar 22%, pemantauan konsumsi energi real-time via IoT dashboard.",
        evaluation_gate="Evaluasi Gerbang 1 (Lanjut)",
    )
    db.add(pilot1)

    # 11. Aset Strategis Daerah
    asset1 = NetworkStrategicAsset(
        region_id=kota_tangsel.id,
        name="Gedung Creative Hub & Galeri Koperasi Graha Wisata BSD",
        asset_type="Gedung / Ruang Publik",
        location="Jl. Letnan Sutopo, BSD Sektor XIV, Serpong",
        managing_agency="Dinas Pariwisata & Diskop UKM",
        condition="Baik",
        utilization_level_pct=55,
        idle_time_pattern="Senin sampai Kamis siang (09:00 - 14:00) tingkat keterisian aula hanya 20%",
        shared_use_potential="Dapat digunakan bersama jejaring staf ahli antardaerah untuk showroom produk unggulan UMKM binaan lintas kota.",
        required_followup="Penyusunan SOP pemakaian bersama antar-OPD dan skema penjadwalan digital.",
        is_restricted=False,
    )
    db.add(asset1)

    # 12. FGD Nasional & Rekomendasi Bersama
    fgd1 = NetworkFGDEvent(
        title="FGD Nasional Staf Ahli Kepala Daerah: Strategi Penguatan Kemandirian Fiskal & Tata Kelola Perkotaan",
        theme="Transformasi Fiskal Pusat dan Daerah: Menuju Kemandirian Berkeadilan",
        organizer="Jejaring Staf Ahli Nasional bersama Pemkot Tangerang Selatan",
        event_date=now - timedelta(days=7),
        location="Tangerang Selatan (Hybrid)",
        status="Selesai (Dalam Perumusan)",
        invited_regions_count=38,
        submissions_count=29,
        summary_consensus="Disepakati perlunya formulasi usulan kebijakan revisi formula pembobotan DAU dan fleksibilitas pemanfaatan barang milik daerah (BMD) untuk menunjang stimulus ekonomi pasca pandemi.",
    )
    db.add(fgd1)
    db.flush()

    rec1 = NetworkFGDRecommendation(
        fgd_event_id=fgd1.id,
        pillar="Harmonisasi Alokasi DAU & Fleksibilitas Belanja Modal",
        proposal_text="Mengusulkan kepada Kemenkeu dan Bappenas RI agar formula DAU yang ditentukan penggunaannya (earmarked) memberikan ruang diskresi 15% bagi daerah berkapasitas fiskal mandiri untuk dialokasikan pada proyek percepatan pengentasan kemiskinan dan penataan kawasan kumuh.",
        addressed_ministry="Kementerian Keuangan & Kemendagri",
        consensus_score_pct=94,
        status="Siap Diserahkan",
    )
    db.add(rec1)

    # 13. Decision Required Pimpinan Daerah
    dec1 = NetworkDecisionRequest(
        region_id=kota_tangsel.id,
        title="Penetapan Perwal Tata Kelola Pemanfaatan Bersama Aset Fasilitas Publik (Creative Hub)",
        issue_brief="Tingkat utilisasi beberapa aset gedung publik masih berkisar 50-60%. Diperlukan regulasi tingkat kepala daerah agar fasilitas dapat dimanfaatkan oleh komunitas binaan tanpa terbentur retribusi sewa kaku.",
        urgency_reason="Optimalisasi aset harus terakomodasi sebelum pembahasan APBD Perubahan agar alokasi pemeliharaan fasilitas dapat disinergikan dengan skema kemitraan.",
        options=[
            {"code": "Option A", "title": "Penerbitan Perwal Pemanfaatan Aset Bersama dengan Model Subsidi Operasional 50%", "risk": "Beban APBD awal", "benefit": "Aset hidup dan UMKM tumbuh pesat"},
            {"code": "Option B", "title": "Kerja Sama Pemanfaatan Pihak Ketiga (KSP Penuh)", "risk": "Proses tender lama (min. 6 bulan)", "benefit": "Pendapatan sewa tetap"},
            {"code": "Option C", "title": "Status Quo (Pengelolaan internal per OPD)", "risk": "Gedung terus idle dan biaya rawat tetap keluar", "benefit": "Tidak perlu regulasi baru"},
        ],
        expert_recommendation="Staf Ahli merekomendasikan Opsi A: Walikota menerbitkan Perwal insentif pemanfaatan bersama fasilitas publik dengan target evaluasi 6 bulan.",
        decision_owner="Wali Kota Tangerang Selatan",
        deadline=now + timedelta(days=10),
        inaction_impact="Potensi kerugian idle asset berlanjut dan memicu persepsi negatif masyarakat terhadap gedung pemerintah yang terbengkalai.",
        status="Menunggu Disposisi",
        disposition_notes=None,
    )
    db.add(dec1)

    # 14. Audit Log
    audit1 = NetworkAuditLog(
        region_id=kota_tangsel.id,
        user_name="Drs. H. Heru Sudarmanto, M.Si",
        user_role="Staf Ahli Kepala Daerah",
        action="SUBMIT_DIAGNOSIS",
        details="Mengajukan lembar diagnosis kemandirian fiskal dan usulan Decision Required penetapan Perwal Aset.",
        ip_address="182.253.112.44",
    )
    db.add(audit1)

    db.commit()
