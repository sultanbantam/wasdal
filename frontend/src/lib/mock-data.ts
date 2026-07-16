import type { CaseItem, DashboardData } from "@/types/wasdal";

export const mockCases: CaseItem[] = [
  {
    id: "1",
    number: "WAS-2026-00001",
    title: "Jalan akses pasar induk rusak dan menghambat distribusi pangan",
    description: "Ratusan warga dan pedagang melaporkan jalan akses pasar induk rusak berat.",
    category: "Infrastruktur",
    subcategory: "Jalan",
    location_name: "Pasar Induk",
    latitude: -6.1862,
    longitude: 106.8348,
    reporter_name: "Forum Pedagang Pasar",
    source: "WhatsApp",
    status: "In Progress",
    priority: "Critical",
    severity: "Major",
    priority_score: 88.4,
    pic: "Dinas PUPR",
    agency: "Dinas PUPR",
    due_date: "2026-07-18T09:00:00+07:00",
    ai_summary: "Akses pasar rusak berdampak pada distribusi pangan dan perlu penanganan cepat.",
    ai_confidence: 0.86,
    suggested_solution: [
      {
        horizon: "Quick Win",
        action: "Tambal darurat titik kritis dan atur akses logistik.",
        agency: "Dinas PUPR",
        estimated_time: "1-3 hari",
        confidence: 0.84
      }
    ],
    timeline: [],
    comments: [],
    created_at: "2026-07-13T08:00:00+07:00",
    updated_at: "2026-07-16T10:00:00+07:00"
  },
  {
    id: "2",
    number: "WAS-2026-00002",
    title: "Genangan berulang di sekitar kantor kecamatan saat hujan deras",
    description: "Kelurahan melaporkan genangan berulang pada saluran drainase dekat kantor kecamatan.",
    category: "Drainase",
    subcategory: "Banjir dan Genangan",
    location_name: "Kantor Kecamatan",
    latitude: -6.2146,
    longitude: 106.8451,
    reporter_name: "Kecamatan",
    source: "Survey Lapangan",
    status: "Assigned",
    priority: "High",
    severity: "Moderate",
    priority_score: 67.2,
    pic: "UPT Drainase",
    agency: "Dinas PUPR",
    due_date: "2026-07-15T09:00:00+07:00",
    ai_summary: "Genangan mengganggu layanan kecamatan dan membutuhkan normalisasi saluran.",
    ai_confidence: 0.79,
    suggested_solution: [],
    timeline: [],
    comments: [],
    created_at: "2026-07-12T08:00:00+07:00",
    updated_at: "2026-07-16T10:00:00+07:00"
  },
  {
    id: "3",
    number: "WAS-2026-00003",
    title: "Keterlambatan rekomendasi perizinan investasi gudang logistik",
    description: "Investor meminta kejelasan rekomendasi teknis untuk gudang logistik.",
    category: "Perizinan",
    subcategory: "OSS/NIB",
    location_name: "Kawasan Pergudangan Barat",
    latitude: -6.2088,
    longitude: 106.8456,
    reporter_name: "DPMPTSP",
    source: "Email",
    status: "Waiting Decision",
    priority: "Medium",
    severity: "Moderate",
    priority_score: 54.5,
    pic: "DPMPTSP",
    agency: "DPMPTSP",
    due_date: "2026-07-22T09:00:00+07:00",
    ai_summary: "Perizinan investasi perlu keputusan lintas instansi agar realisasi tidak tertunda.",
    ai_confidence: 0.74,
    suggested_solution: [],
    timeline: [],
    comments: [],
    created_at: "2026-07-11T08:00:00+07:00",
    updated_at: "2026-07-16T10:00:00+07:00"
  },
  {
    id: "4",
    number: "WAS-2026-00004",
    title: "PJU padam di koridor sekolah dan halte",
    description: "Warga melaporkan lampu PJU padam di koridor sekolah dan halte.",
    category: "Utilitas",
    subcategory: "Penerangan Jalan Umum",
    location_name: "Koridor Sekolah Negeri 5",
    latitude: -6.196,
    longitude: 106.821,
    reporter_name: "RW 03",
    source: "Surat Warga",
    status: "New",
    priority: "Medium",
    severity: "Moderate",
    priority_score: 45,
    pic: null,
    agency: "Dinas Perhubungan",
    due_date: "2026-07-23T09:00:00+07:00",
    ai_summary: "PJU padam meningkatkan risiko keselamatan dan perlu pengecekan teknis.",
    ai_confidence: 0.71,
    suggested_solution: [],
    timeline: [],
    comments: [],
    created_at: "2026-07-16T08:00:00+07:00",
    updated_at: "2026-07-16T10:00:00+07:00"
  }
];

export const mockDashboard: DashboardData = {
  metrics: [
    { label: "Jumlah Kasus", value: 4, delta: "+12% bulan ini", tone: "neutral" },
    { label: "Kasus Baru", value: 1, delta: "perlu triage", tone: "warning" },
    { label: "Kasus Selesai", value: 0, delta: "bulan berjalan", tone: "success" },
    { label: "Kasus Terlambat", value: 1, delta: "melewati SLA", tone: "danger" },
    { label: "Prioritas Tinggi", value: 2, delta: "Critical/High", tone: "danger" }
  ],
  cases_by_status: { New: 1, Assigned: 1, "In Progress": 1, "Waiting Decision": 1 },
  cases_by_category: { Infrastruktur: 1, Drainase: 1, Perizinan: 1, Utilitas: 1 },
  cases_by_priority: { Critical: 1, High: 1, Medium: 2 },
  map_points: mockCases
    .filter((item) => item.latitude && item.longitude)
    .map((item) => ({
      id: item.id,
      number: item.number,
      title: item.title,
      priority: item.priority,
      status: item.status,
      latitude: item.latitude as number,
      longitude: item.longitude as number,
      location_name: item.location_name
    })),
  recent_activity: [
    { action: "case.assigned", details: { number: "WAS-2026-00001", agency: "Dinas PUPR" }, created_at: "2026-07-16T10:00:00+07:00" },
    { action: "case.created", details: { number: "WAS-2026-00004", source: "Surat Warga" }, created_at: "2026-07-16T08:00:00+07:00" }
  ],
  executive_brief:
    "Terdapat 4 kasus aktif dengan 2 kasus prioritas tinggi. 1 kasus melewati SLA dan perlu keputusan atau eskalasi lintas OPD.",
  ai_watchlist: [
    {
      number: "WAS-2026-00001",
      title: "Jalan akses pasar induk rusak",
      priority: "Critical",
      risk: "Dampak pangan dan sorotan media lokal",
      agency: "Dinas PUPR"
    },
    {
      number: "WAS-2026-00002",
      title: "Genangan kantor kecamatan",
      priority: "High",
      risk: "Layanan publik terganggu dan kasus berulang",
      agency: "Dinas PUPR"
    }
  ]
};
