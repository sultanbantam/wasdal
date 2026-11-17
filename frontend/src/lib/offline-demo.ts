import type { CaseItem, DashboardData, IntakeResult, MeetingRecord, MeetingResult } from "@/types/wasdal";

const now = new Date().toISOString();

export const offlineCases: CaseItem[] = [
  {
    id: "offline-case-001",
    number: "WAS-2026-00001",
    title: "Jalan akses pasar induk rusak dan menghambat distribusi pangan",
    description: "Ratusan warga dan pedagang melaporkan kerusakan jalan akses pasar.",
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
    due_date: "2026-11-20T09:00:00+07:00",
    ai_summary: "Akses pasar rusak berdampak pada distribusi pangan dan membutuhkan penanganan cepat.",
    ai_confidence: 0.86,
    suggested_solution: [],
    timeline: [],
    comments: [],
    created_at: now,
    updated_at: now
  },
  {
    id: "offline-case-002",
    number: "WAS-2026-00002",
    title: "Genangan berulang di sekitar kantor kecamatan saat hujan deras",
    description: "Saluran drainase perlu dinormalisasi agar layanan publik tidak terganggu.",
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
    due_date: "2026-11-19T09:00:00+07:00",
    ai_summary: "Genangan mengganggu pelayanan kecamatan dan membutuhkan normalisasi drainase.",
    ai_confidence: 0.79,
    suggested_solution: [],
    timeline: [],
    comments: [],
    created_at: now,
    updated_at: now
  },
  {
    id: "offline-case-003",
    number: "WAS-2026-00003",
    title: "Keterlambatan rekomendasi perizinan investasi gudang logistik",
    description: "Rekomendasi teknis lintas instansi perlu keputusan pimpinan.",
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
    due_date: "2026-11-25T09:00:00+07:00",
    ai_summary: "Perizinan investasi membutuhkan keputusan lintas instansi agar realisasi tidak tertunda.",
    ai_confidence: 0.74,
    suggested_solution: [],
    timeline: [],
    comments: [],
    created_at: now,
    updated_at: now
  }
];

export const offlineDashboard: DashboardData = {
  metrics: [
    { label: "Jumlah Kasus", value: 3, delta: "mode kontinuitas", tone: "neutral" },
    { label: "Kasus Baru", value: 0, delta: "perlu triage", tone: "warning" },
    { label: "Kasus Selesai", value: 0, delta: "bulan berjalan", tone: "success" },
    { label: "Kasus Terlambat", value: 1, delta: "melewati SLA", tone: "danger" },
    { label: "Prioritas Tinggi", value: 2, delta: "Critical/High", tone: "danger" }
  ],
  cases_by_status: { "In Progress": 1, Assigned: 1, "Waiting Decision": 1 },
  cases_by_category: { Infrastruktur: 1, Drainase: 1, Perizinan: 1 },
  cases_by_priority: { Critical: 1, High: 1, Medium: 1 },
  map_points: offlineCases.map((item) => ({
    id: item.id,
    number: item.number,
    title: item.title,
    priority: item.priority,
    status: item.status,
    latitude: item.latitude ?? -6.2,
    longitude: item.longitude ?? 106.83,
    location_name: item.location_name
  })),
  recent_activity: [
    { action: "continuity_mode.enabled", details: { source: "local fallback" }, created_at: now }
  ],
  executive_brief: "Backend belum dapat dihubungi. Dashboard memakai data kontinuitas lokal agar rapat dan peninjauan kasus tetap dapat berjalan.",
  ai_watchlist: offlineCases.slice(0, 2).map((item) => ({
    number: item.number,
    title: item.title,
    priority: item.priority,
    risk: item.ai_summary,
    agency: item.agency
  }))
};

export function offlineIntake(rawText: string): IntakeResult {
  const text = rawText.trim();
  const isRoad = /jalan|jembatan|aspal/i.test(text);
  const isUrgent = /darurat|segera|viral|bahaya|rusak berat/i.test(text);
  return {
    summary: text || "Laporan diterima dalam mode kontinuitas.",
    category: isRoad ? "Infrastruktur" : "Lainnya",
    subcategory: isRoad ? "Jalan" : "Umum",
    priority: isUrgent ? "High" : "Medium",
    priority_score: isUrgent ? 65 : 45,
    severity: isUrgent ? "Major" : "Moderate",
    location_name: "Lokasi perlu verifikasi",
    suggested_agency: isRoad ? "Dinas PUPR" : "Sekretariat Wasdal",
    suggested_deadline: "Perlu ditetapkan",
    recommendations: [
      { horizon: "Quick Win", action: "Validasi lapangan dan tetapkan PIC.", estimated_time: "1-3 hari", confidence: 0.7 }
    ],
    confidence: 0.7,
    audit_notes: ["Hasil dibuat dalam mode kontinuitas lokal.", "Sinkronkan kembali setelah backend tersedia."],
    case_id: null
  };
}

export function offlineMeeting(title: string, transcript: string): MeetingResult {
  return {
    title,
    summary: transcript.trim() || "Belum ada transkrip untuk diproses.",
    decisions: ["Keputusan perlu dikonfirmasi pimpinan rapat."],
    action_items: [{ action: "Validasi dan tetapkan tindak lanjut rapat.", assignee: "Sekretariat Wasdal", deadline: "H+1 rapat" }],
    confidence: 0.58,
    record_id: null
  };
}

export const offlineMeetings: MeetingRecord[] = [
  {
    id: "offline-meeting-001",
    title: "Rapat Wasdal Mingguan",
    summary: "Mode kontinuitas aktif. Data rapat baru dapat disimpan ke server setelah backend kembali tersedia.",
    decisions: ["Prioritaskan verifikasi lapangan untuk kasus Critical dan High."],
    action_items: [{ task: "Validasi kasus prioritas", pic: "Sekretariat Wasdal", deadline: "H+1 rapat", status: "Open" }],
    confidence: 0.6,
    created_at: now
  }
];
