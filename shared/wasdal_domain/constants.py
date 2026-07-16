CASE_CATEGORIES = [
    "Ekonomi",
    "Pembangunan",
    "Infrastruktur",
    "Perizinan",
    "Investasi",
    "Sosial",
    "Lingkungan",
    "Transportasi",
    "Kebersihan",
    "Drainase",
    "Utilitas",
    "Lainnya",
]

CASE_SOURCES = [
    "Rapat Wasdal",
    "WhatsApp",
    "Email",
    "Surat Warga",
    "Survey Lapangan",
    "Media Sosial",
    "SIPD",
    "Open Data",
]

DEFAULT_ROLES = [
    "Administrator",
    "Bagian Ekbang",
    "Sekretariat",
    "Perangkat Daerah",
    "Kecamatan",
    "Kelurahan",
    "Surveyor Lapangan",
    "Pimpinan",
    "Guest",
]

PRIORITY_WEIGHTS = {
    "citizen_count": 0.22,
    "risk": 0.2,
    "urgency": 0.18,
    "media_exposure": 0.1,
    "recurrence": 0.1,
    "economic_impact": 0.12,
    "legal_status": 0.08,
}

CATEGORY_KEYWORDS = {
    "Ekonomi": ["umkm", "pasar", "inflasi", "harga", "pangan", "bansos", "ekonomi"],
    "Pembangunan": ["proyek", "rpjmd", "rkpd", "renja", "dpa", "pembangunan"],
    "Infrastruktur": ["jalan", "jembatan", "trotoar", "aspal", "rusak", "drainase"],
    "Perizinan": ["izin", "perizinan", "imb", "nib", "oss"],
    "Investasi": ["investasi", "investor", "kawasan industri", "usaha"],
    "Sosial": ["warga", "kemiskinan", "sekolah", "kesehatan", "bantuan"],
    "Lingkungan": ["limbah", "banjir", "sampah", "polusi", "pencemaran"],
    "Transportasi": ["angkot", "terminal", "macet", "parkir", "transportasi"],
    "Kebersihan": ["sampah", "tps", "kebersihan", "petugas kebersihan"],
    "Drainase": ["selokan", "saluran", "genangan", "drainase"],
    "Utilitas": ["pju", "listrik", "air", "pdam", "kabel", "internet"],
}
