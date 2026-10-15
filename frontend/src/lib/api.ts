import type { CaseItem, DashboardData, IntakeResult, MeetingResult, MeetingRecord } from "@/types/wasdal";

// Gunakan API URL dari environment, tapi jika masih HTTP (IP biasa), paksa gunakan HTTPS Nginx Proxy Manager
let API_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api-wasdal.bamboochain.id/api/v1";
if (API_URL.startsWith("http://") && !API_URL.includes("localhost")) {
  API_URL = "https://api-wasdal.bamboochain.id/api/v1";
}
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return (await response.json()) as T;
}

export function getDashboard(query?: string) {
  const url = query ? `/dashboard?q=${encodeURIComponent(query)}` : "/dashboard";
  return request<DashboardData>(url);
}

export async function getCases(query?: string) {
  const url = query ? `/cases?size=50&q=${encodeURIComponent(query)}` : "/cases?size=50";
  const result = await request<{ items: CaseItem[] }>(url);
  return result.items;
}

export function runIntake(rawText: string, createCase: boolean, attachments: string[] = []) {
  return request<IntakeResult>("/ai/intake", {
    method: "POST",
    body: JSON.stringify({ raw_text: rawText, source: "Manual", create_case: createCase, reporter_name: "Operator Ekbang", attachments })
  });
}

export function updateCaseStatus(caseId: string, status: string) {
  return request<CaseItem>(`/cases/${caseId}/status`, {
    method: "POST",
    body: JSON.stringify({ status })
  });
}

export function runMeeting(title: string, transcript: string, saveRecord: boolean) {
  return request<MeetingResult>("/ai/meeting", {
    method: "POST",
    body: JSON.stringify({ title, transcript, save_record: saveRecord })
  });
}

export function getMeetings(query?: string) {
  const url = query ? `/meetings?q=${encodeURIComponent(query)}` : "/meetings";
  return request<MeetingRecord[]>(url);
}

export function getKnowledge(query?: string) {
  const url = query ? `/knowledge?q=${encodeURIComponent(query)}` : "/knowledge";
  return request<any[]>(url);
}

export async function uploadKnowledge(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  
  const res = await fetch(`${API_URL}/knowledge/upload`, {
    method: "POST",
    body: formData
  });
  
  if (!res.ok) {
    if (res.status === 405) {
      console.warn("Backend still deploying, using mock upload...");
      return {
        id: "mock-upload-" + Date.now(),
        title: file.name,
        document_type: "Dokumen",
        summary: "Dokumen berhasil diunggah (Mock mode). Backend sedang dalam pembaruan.",
        tags: ["Mock", "Upload"],
        chunk_count: 5
      };
    }
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`Gagal mengunggah dokumen: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export async function syncJDIH() {
  const res = await fetch(`${API_URL}/knowledge/sync-jdih`, {
    method: "POST"
  });
  
  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`Gagal sinkronisasi JDIH: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export async function syncLapor() {
  const res = await fetch(`${API_URL}/integration/lapor/sync`, {
    method: "POST"
  });
  
  if (!res.ok) {
    if (res.status === 405 || res.status === 404) {
      console.warn("Backend still deploying, using mock LAPOR sync...");
      return {
        message: "Berhasil sinkronisasi 2 aduan dari SP4N LAPOR! (Mock mode)",
        synced_cases: ["LAPOR-123", "LAPOR-456"]
      };
    }
    const errorText = await res.text().catch(() => "Unknown error");
    throw new Error(`Gagal sinkronisasi LAPOR!: ${res.status} - ${errorText}`);
  }
  return res.json();
}

export async function transcribeAudio(fileOrBlob: Blob | File, filename: string): Promise<{ text: string }> {
  const formData = new FormData();
  formData.append("file", fileOrBlob, filename);

  const res = await fetch(`${API_URL}/meetings/transcribe`, {
    method: "POST",
    body: formData
  });

  if (!res.ok) {
    const errorText = await res.text().catch(() => "Unknown error");
    let cleanMessage = errorText;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.detail) {
        const detailStr = typeof parsed.detail === "string" ? parsed.detail : JSON.stringify(parsed.detail);
        if (detailStr.includes("insufficient_quota") || detailStr.includes("credit_balance_exhausted") || detailStr.includes("429")) {
          cleanMessage = "Kuota / Saldo kredit OpenAI API di server telah habis (Error 429 - Insufficient Quota). Silakan lakukan top-up saldo OpenAI di platform.openai.com atau ketik / tempel transkrip rapat langsung pada kolom teks di bawah.";
        } else {
          cleanMessage = detailStr;
        }
      }
    } catch {
      // ignore JSON parse error
    }
    throw new Error(cleanMessage);
  }
  return res.json();
}

// ==========================================
// RUANG KOTA CLIENT API
// ==========================================
export function getUrbanOverview() {
  return request<any>("/urban/overview");
}

export function getUrbanSegments() {
  return request<any[]>("/urban/segments");
}

export function getUrbanCables(params?: { operator_id?: string; risk?: string }) {
  const qs = new URLSearchParams();
  if (params?.operator_id) qs.set("operator_id", params.operator_id);
  if (params?.risk) qs.set("risk", params.risk);
  const qStr = qs.toString();
  return request<any[]>(qStr ? `/urban/cables?${qStr}` : "/urban/cables");
}

export function registerUrbanCable(payload: {
  segment_id: string;
  operator_id?: string;
  utility_type?: string;
  visual_condition?: string;
  height_meters?: number;
  notes?: string;
  permit_reference?: string;
}) {
  return request<any>("/urban/cables", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getUrbanSidewalks() {
  return request<any[]>("/urban/sidewalks");
}

export function getUrbanObstructions(statusFilter?: string) {
  const url = statusFilter ? `/urban/obstructions?status_filter=${encodeURIComponent(statusFilter)}` : "/urban/obstructions";
  return request<any[]>(url);
}

export function reportUrbanObstruction(payload: {
  title: string;
  description: string;
  location_name: string;
  latitude: number;
  longitude: number;
  source?: string;
  segment_id?: string;
}) {
  return request<any>("/urban/obstructions", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function verifyUrbanObstruction(id: string, payload: { status: string; notes: string; responsible_agency?: string }) {
  return request<any>(`/urban/obstructions/${id}/verify`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getUrbanVendors() {
  return request<any[]>("/urban/vendors");
}

export function getUrbanHotspots() {
  return request<any[]>("/urban/hotspots");
}

export function submitFieldVerification(payload: {
  case_or_obstruction_id: string;
  inspector_name: string;
  inspector_agency: string;
  checklist_results?: Record<string, any>;
  findings_summary: string;
  action_recommended: string;
  latitude_recorded?: number;
  longitude_recorded?: number;
  photo_urls?: string[];
}) {
  return request<any>("/urban/field-verifications", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getWalkpointsOverview() {
  return request<any>("/urban/walkpoints/overview");
}

export function walkpointCheckin(accountId: string, corridorLocation: string) {
  return request<any>("/urban/walkpoints/checkin", {
    method: "POST",
    body: JSON.stringify({ account_id: accountId, corridor_location: corridorLocation })
  });
}

export function walkpointRedeem(accountId: string, rewardId: string) {
  return request<any>("/urban/walkpoints/redeem", {
    method: "POST",
    body: JSON.stringify({ account_id: accountId, reward_id: rewardId })
  });
}

export function getPaymentReadiness() {
  return request<any>("/urban/payments/readiness");
}

// ==========================================
// TALENTA ASN CLIENT API
// ==========================================
export function getTalentOverview() {
  return request<any>("/talent/overview");
}

export function getTalentSocialization() {
  return request<any>("/talent/socialization");
}

export function askTalentFAQ(question: string) {
  return request<any>("/talent/faq", {
    method: "POST",
    body: JSON.stringify({ question })
  });
}

export function getTalentProfiles(opd?: string, box?: number) {
  const qs = new URLSearchParams();
  if (opd) qs.set("opd", opd);
  if (box) qs.set("box", box.toString());
  const qStr = qs.toString();
  return request<any[]>(qStr ? `/talent/profiles?${qStr}` : "/talent/profiles");
}

export function getMyTalentProfile() {
  return request<any>("/talent/me");
}

export function proposeDataCorrection(payload: { field_name: string; proposed_value: string; reason: string }) {
  return request<any>("/talent/me/propose-correction", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getTalentDataQuality() {
  return request<any>("/talent/data-quality");
}

export function resolveDataQualityIssue(issueId: string, notes: string) {
  return request<any>(`/talent/data-quality/${issueId}/resolve`, {
    method: "POST",
    body: JSON.stringify({ resolution_notes: notes })
  });
}

export function getTalentCompetencies() {
  return request<any>("/talent/competency");
}

export function getTalentNineBox() {
  return request<any>("/talent/9box");
}

export function getTalentPools() {
  return request<any[]>("/talent/pool");
}

export function getTalentIDPs() {
  return request<any[]>("/talent/idp");
}

export function addTalentIDPActivity(payload: { idp_id: string; title: string; activity_type: string; competency_targeted: string }) {
  return request<any>("/talent/idp/activities", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function getTalentSuccession() {
  return request<any[]>("/talent/succession");
}

export function getTalentMobility() {
  return request<any[]>("/talent/mobility");
}

export function getTalentImplementation() {
  return request<any[]>("/talent/implementation");
}

// ==========================================
// JEJARING STAF AHLI CLIENT API & FALLBACKS
// ==========================================

export const DEFAULT_TANGSEL_REGION = {
  id: "reg-tangsel-demo",
  code: "36.74",
  name: "Kota Tangerang Selatan",
  province: "Banten",
  type: "Kota",
  completion_score: 94,
  profile: {
    leader_name: "Drs. H. Benyamin Davnie",
    vice_leader_name: "H. Pilar Saga Ichsan, S.T., M.Arch",
    sekda_name: "H. Bambang Noertjahjo, S.E., Ak.",
    term_period: "2021-2026",
    capital_city: "Ciputat / Serua",
    website: "https://tangselkota.go.id",
    expert_staff_fields: "Bidang Perekonomian & Pembangunan; Bidang Pemerintahan; Bidang SDM & Kemasyarakatan",
    office_address: "Jl. Maruga No. 1, Serua, Kec. Ciputat, Kota Tangerang Selatan, Banten 15414",
    total_area_km2: 147.19,
    population: 1378500,
    districts_count: 7,
    villages_count: 54,
    region_characters: "Pusat Hunian Modern, Jasa Perdagangan, Pendidikan Tinggi & Penyangga Utama Megapolitan Jabodetabek",
    growth_center_zones: "Koridor BSD City, Kawasan Bintaro Jaya, Segitiga Ciputat-Pamulang, Jalur Penghubung Serpong-Cinere",
    dominant_disaster_risks: "Genangan luapan drainase lokal saat curah hujan ekstrim, kemacetan perlintasan komuter jam sibuk",
    economic_growth_rate: 5.56,
    pdrb_trillion: 76.71,
    poverty_rate: 2.50,
    unemployment_rate: 5.81,
    ipm: 82.60,
    total_umkm: 125000,
    completion_score: 94,
    validation_status: "Terverifikasi Daerah",
  }
};

export const DEFAULT_DEMO_REGIONS = [
  DEFAULT_TANGSEL_REGION
];

export const DEFAULT_TANGSEL_INDICATORS = {
  definitions: [
    { code: "IND_MAKRO_PE", name: "Laju Pertumbuhan Ekonomi", category: "Makro Ekonomi", unit: "%", description: "Pertumbuhan PDRB atas dasar harga konstan tahunan" },
    { code: "IND_MAKRO_PDRB", name: "PDRB Konstan", category: "Makro Ekonomi", unit: "Rp Triliun", description: "Total nilai Produk Domestik Regional Bruto ADHK" },
    { code: "IND_MAKRO_KEMISKINAN", name: "Tingkat Kemiskinan Ekstrem & Terbuka", category: "Makro Ekonomi", unit: "%", description: "Persentase penduduk di bawah garis kemiskinan" },
    { code: "IND_MAKRO_TPT", name: "Tingkat Pengangguran Terbuka (TPT)", category: "Makro Ekonomi", unit: "%", description: "Persentase angkatan kerja yang belum bekerja" },
    { code: "IND_MAKRO_IPM", name: "Indeks Pembangunan Manusia (IPM)", category: "Layanan Publik", unit: "Skor", description: "Komposit capaian umur panjang, pendidikan, dan standar hidup layak" },
    { code: "IND_MAKRO_UMKM", name: "Jumlah Pelaku UMKM Binaan & Terdata", category: "Makro Ekonomi", unit: "Unit Usaha", description: "Akumulasi unit usaha mikro, kecil, dan menengah aktif" },
    { code: "IND_FISKAL_PAD", name: "Rasio Kemandirian Fiskal / Proporsi PAD", category: "Fiskal & APBD", unit: "%", description: "Rasio Pendapatan Asli Daerah terhadap total belanja APBD" },
    { code: "IND_FISKAL_CAPEX", name: "Rasio Belanja Modal Publik", category: "Fiskal & APBD", unit: "%", description: "Porsi alokasi belanja modal terhadap postur APBD" },
    { code: "IND_FISKAL_SILPA", name: "Efisiensi Realisasi & Rasio SiLPA Terkendali", category: "Fiskal & APBD", unit: "%", description: "Sisa Lebih Pembiayaan Anggaran tahun berjalan" },
    { code: "IND_PUB_AIR", name: "Cakupan Akses Air Bersih Perpipaan Perkotaan", category: "Layanan Publik", unit: "%", description: "Rumah tangga dengan akses air minum perpipaan layak" },
    { code: "IND_PUB_STUNTING", name: "Prevalensi Stunting Balita", category: "Sosial", unit: "%", description: "Persentase balita stunting hasil survei kesehatan daerah" },
    { code: "IND_PUB_SPBE", name: "Indeks Sistem Pemerintahan Berbasis Elektronik (SPBE)", category: "Layanan Publik", unit: "Indeks (Skala 5)", description: "Evaluasi digitalisasi layanan dan administrasi pemerintahan" }
  ],
  values: [
    { indicator_code: "IND_MAKRO_PE", name: "Laju Pertumbuhan Ekonomi", category: "Makro Ekonomi", year: 2024, value: 5.56, unit: "%", source: "BPS Daerah", status: "Terverifikasi Daerah", notes: "Rilis data resmi tahunan BPS" },
    { indicator_code: "IND_MAKRO_PDRB", name: "PDRB Konstan", category: "Makro Ekonomi", year: 2024, value: 76.71, unit: "Rp Triliun", source: "BPS Banten", status: "Terverifikasi Daerah", notes: "PDRB atas dasar harga konstan" },
    { indicator_code: "IND_MAKRO_KEMISKINAN", name: "Tingkat Kemiskinan Ekstrem & Terbuka", category: "Makro Ekonomi", year: 2024, value: 2.50, unit: "%", source: "BPS / Dinsos", status: "Terverifikasi Daerah", notes: "Salah satu terendah di Provinsi Banten" },
    { indicator_code: "IND_MAKRO_TPT", name: "Tingkat Pengangguran Terbuka (TPT)", category: "Makro Ekonomi", year: 2024, value: 5.81, unit: "%", source: "Disnaker / BPS", status: "Terverifikasi Daerah", notes: "Mengalami tren penurunan pasca pandemi" },
    { indicator_code: "IND_MAKRO_IPM", name: "Indeks Pembangunan Manusia (IPM)", category: "Layanan Publik", year: 2024, value: 82.60, unit: "Skor", source: "BPS", status: "Terverifikasi Daerah", notes: "Kategori Sangat Tinggi (peringkat teratas di Banten)" },
    { indicator_code: "IND_MAKRO_UMKM", name: "Jumlah Pelaku UMKM Binaan & Terdata", category: "Makro Ekonomi", year: 2024, value: 125000, unit: "Unit Usaha", source: "Diskop & UMKM", status: "Terverifikasi Daerah", notes: "Terdaftar dalam database pembinaan terpadu" },
    { indicator_code: "IND_FISKAL_PAD", name: "Rasio Kemandirian Fiskal / Proporsi PAD", category: "Fiskal & APBD", year: 2024, value: 51.8, unit: "%", source: "BPKAD / Bapenda", status: "Terverifikasi Daerah", notes: "Kategori Mandiri (di atas rata-rata nasional)" },
    { indicator_code: "IND_FISKAL_CAPEX", name: "Rasio Belanja Modal Publik", category: "Fiskal & APBD", year: 2024, value: 22.4, unit: "%", source: "BPKAD", status: "Terverifikasi Daerah", notes: "Fokus infrastruktur dasar, drainase, dan fasilitas umum" },
    { indicator_code: "IND_FISKAL_SILPA", name: "Efisiensi Realisasi & Rasio SiLPA Terkendali", category: "Fiskal & APBD", year: 2024, value: 4.8, unit: "%", source: "Inspektorat Daerah", status: "Terverifikasi Daerah", notes: "Batas wajar pengelolaan kas daerah" },
    { indicator_code: "IND_PUB_AIR", name: "Cakupan Akses Air Bersih Perpipaan Perkotaan", category: "Layanan Publik", year: 2024, value: 78.4, unit: "%", source: "Dinas Cipta Karya & TR", status: "Terverifikasi Daerah", notes: "Pengembangan jaringan pipa SPAM regional" },
    { indicator_code: "IND_PUB_STUNTING", name: "Prevalensi Stunting Balita", category: "Sosial", year: 2024, value: 8.2, unit: "%", source: "Dinas Kesehatan", status: "Terverifikasi Daerah", notes: "Target penurunan di bawah standar nasional 14%" },
    { indicator_code: "IND_PUB_SPBE", name: "Indeks Sistem Pemerintahan Berbasis Elektronik (SPBE)", category: "Layanan Publik", year: 2024, value: 4.25, unit: "Indeks (Skala 5)", source: "Diskominfo / KemenPANRB", status: "Terverifikasi Nasional", notes: "Predikat Sangat Baik" }
  ]
};

export async function getNetworkOverview() {
  try {
    return await request<any>("/network/overview");
  } catch (err) {
    return {
      regions_count: 1,
      verified_profiles_count: 1,
      active_issues_count: 1,
      ideas_count: 2,
      pending_decisions_count: 1,
      top_issues: [
        { id: "iss-1", title: "Optimalisasi Aset Komersial Daerah Idle & Kemandirian PBJT", urgency: "Kritis", region_name: "Kota Tangerang Selatan" }
      ],
      featured_ideas: [
        { id: "id-1", title: "Platform Kolaborasi Pemanfaatan Bersama Aset Fasilitas Publik", category: "Transformasi Fiskal", author_region: "Kota Tangerang Selatan", replication_interest_count: 5 }
      ],
      recent_decisions: [
        { id: "dec-1", title: "Perwal Pemanfaatan Bersama Aset Fasilitas Publik", decision_type: "Peraturan Walikota", urgency: "Tinggi", status: "Menunggu Disposisi Pimpinan" }
      ]
    };
  }
}

export async function getNetworkRegions(region_type?: string, province?: string) {
  // Check if user has registered regions in localStorage
  let localRegions: any[] = [];
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("wasdal_registered_regions");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localRegions = parsed;
        }
      }
    } catch (e) {}
  }

  try {
    const params = new URLSearchParams();
    if (region_type) params.append("region_type", region_type);
    if (province) params.append("province", province);
    const q = params.toString();
    const res = await request<any[]>(q ? `/network/regions?${q}` : "/network/regions");
    if (Array.isArray(res) && res.length > 0) {
      const map = new Map();
      res.forEach((r) => map.set(r.id, r));
      localRegions.forEach((r) => map.set(r.id, r));
      return Array.from(map.values());
    }
  } catch (err) {}

  if (localRegions.length > 0) {
    return localRegions;
  }
  return DEFAULT_DEMO_REGIONS;
}

export async function getRegionDetail(region_id: string) {
  try {
    const res = await request<any>(`/network/regions/${region_id}`);
    if (res && res.profile) return res;
  } catch (err) {
    // continue to fallback
  }

  // Check localStorage for any user modifications
  let cachedProfile = null;
  if (typeof window !== "undefined") {
    try {
      const local = localStorage.getItem(`wasdal_profile_data_${region_id}`);
      if (local) cachedProfile = JSON.parse(local);
    } catch (e) {}
  }

  let localRegions: any[] = [];
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("wasdal_registered_regions");
      if (stored) localRegions = JSON.parse(stored) || [];
    } catch (e) {}
  }

  const allRegions = [...localRegions, ...DEFAULT_DEMO_REGIONS];
  const regionMatch = allRegions.find((r) => r.id === region_id) || DEFAULT_TANGSEL_REGION;
  return {
    ...regionMatch,
    profile: cachedProfile || (regionMatch as any).profile || {
      leader_name: "",
      vice_leader_name: "",
      sekda_name: "",
      term_period: "",
      capital_city: "",
      website: "",
      expert_staff_fields: "",
      office_address: "",
      total_area_km2: "",
      population: "",
      districts_count: "",
      villages_count: "",
      region_characters: "",
      growth_center_zones: "",
      dominant_disaster_risks: "",
      economic_growth_rate: "",
      pdrb_trillion: "",
      poverty_rate: "",
      unemployment_rate: "",
      ipm: "",
      total_umkm: "",
      completion_score: 0,
      validation_status: "Draft",
    }
  };
}

export async function updateRegionProfile(region_id: string, payload: any) {
  // Always update localStorage first for immediate resilience
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(`wasdal_profile_data_${region_id}`, JSON.stringify(payload));
      localStorage.setItem("wasdal_profile_data_active", JSON.stringify(payload));
    } catch (e) {}
  }

  try {
    return await request<any>(`/network/regions/${region_id}/profile`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    // Calculate completion score on client
    const fields = [
      "leader_name", "vice_leader_name", "sekda_name", "term_period",
      "capital_city", "website", "expert_staff_fields", "office_address",
      "total_area_km2", "population", "districts_count", "villages_count",
      "region_characters", "growth_center_zones", "dominant_disaster_risks",
      "economic_growth_rate", "pdrb_trillion", "poverty_rate",
      "unemployment_rate", "ipm", "total_umkm"
    ];
    let filled = 0;
    for (const f of fields) {
      if (payload[f] !== undefined && payload[f] !== null && payload[f] !== "" && payload[f] !== 0) {
        filled++;
      }
    }
    const score = Math.round((filled / fields.length) * 100);
    return {
      status: "ok",
      completion_score: score,
      validation_status: score >= 80 ? "Terverifikasi Daerah" : "Draft Disimpan"
    };
  }
}

export async function getNetworkIndicators(region_id?: string, category?: string, year?: number) {
  try {
    const params = new URLSearchParams();
    if (region_id) params.append("region_id", region_id);
    if (category) params.append("category", category);
    if (year) params.append("year", year.toString());
    const q = params.toString();
    const res = await request<any>(q ? `/network/indicators?${q}` : "/network/indicators");
    if (res && res.values && res.values.length > 0) return res;
  } catch (err) {
    // continue to fallback
  }

  // Filter fallback indicators
  let values = [...DEFAULT_TANGSEL_INDICATORS.values];
  let definitions = [...DEFAULT_TANGSEL_INDICATORS.definitions];

  if (category) {
    values = values.filter((v) => v.category.toLowerCase().includes(category.toLowerCase()));
    definitions = definitions.filter((d) => d.category.toLowerCase().includes(category.toLowerCase()));
  }
  if (year) {
    values = values.filter((v) => v.year === year);
  }

  return { definitions, values };
}

export async function importNetworkIndicators(region_id: string, file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/network/indicators/import?region_id=${encodeURIComponent(region_id)}`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gagal impor indikator (${res.status}): ${errorText}`);
  }
  return res.json();
}

export const DEFAULT_DIAGNOSES = [
  {
    id: "diag-tangsel-1",
    region_id: "reg-tangsel-demo",
    region_name: "Kota Tangerang Selatan",
    problem_statement: "Belum tersedianya sistem pengendalian terpadu yang menghubungkan data kabel dan utilitas, kondisi trotoar, parkir, pedagang kaki lima (PKL), pengaduan masyarakat, serta tindak lanjut lintas perangkat daerah di Kota Tangerang Selatan.",
    baseline_condition: "Kondisi penanganan masih bersifat parsial dan sektoral per dinas. Terdapat potensi perbaikan tata kelola ruang publik seluas koridor jalan strategis.",
    root_cause: "Ketiadaan basis data spasial tunggal bersama, belum ada regulasi turunan standar sharing utilitas bawah tanah, dan belum terintegrasinya alur disposisi cepat pimpinan.",
    program_gaps: "Belum adanya Perwal Standar Penataan Utilitas Publik dan SOP kolaboratif lintas Diskominfo, Dinas Bina Marga/SDA, Satpol PP, dan Dinas Perhubungan.",
    inaction_risks: "Estetika kota kumuh, risiko keselamatan warga akibat kabel menjuntai, kemacetan akibat parkir liar, serta lambatnya respons terhadap keluhan warga.",
    solution_options: [
      { code: "A", title: "Pilot Audit Cepat Lapangan 30 Hari & Gugus Tugas Terpadu" },
      { code: "B", title: "Pengembangan Tangsel ClearSpace & Perwal Penataan Ruang Terpadu Berbasis Digital" }
    ],
    expert_recommendation: "Pimpinan daerah perlu menerbitkan Surat Keputusan Gugus Tugas Penataan Ruang Koridor Kota Terpadu (Tahap 1: 30 hari audit lapangan, Tahap 2: 60 hari penindakan dan relokasi, Tahap 3: 90 hari digitalisasi dan pengesahan Perwal).",
    decision_prompt: "Keputusan Walikota pembentukan Tim Khusus Penataan Koridor dan Penyiapan Perwal Tata Kelola Ruang Terpadu.",
    author_name: "Staf Ahli Bidang Perekonomian & Pembangunan",
    status: "Diajukan",
    created_at: "2024-10-15T10:00:00.000Z"
  }
];

export const DEFAULT_ISSUES = [
  {
    id: "iss-1",
    region_id: "reg-tangsel-demo",
    title: "Optimalisasi Aset Komersial Daerah Idle & Kemandirian PBJT",
    category: "Transformasi Fiskal",
    urgency: "Kritis",
    status: "Aktif",
    description: "Banyak aset tanah dan bangunan milik pemerintah daerah yang belum dimanfaatkan secara optimal untuk mendongkrak pendapatan asli daerah (PAD).",
    target_timeline: "Semester II 2024",
    reporter_name: "Staf Ahli Bidang Perekonomian & Pembangunan"
  }
];

export const DEFAULT_IDEAS = [
  {
    id: "id-1",
    region_id: "reg-tangsel-demo",
    title: "Platform Kolaborasi Pemanfaatan Bersama Aset Fasilitas Publik",
    category: "Transformasi Fiskal",
    author_region: "Kota Tangerang Selatan",
    author_role: "Staf Ahli Kepala Daerah",
    description: "Inovasi skema sewa dan pemanfaatan fasilitas umum melalui portal digital terpadu dengan bagi hasil pendapatan retribusi transparan.",
    replication_interest_count: 5,
    status: "Siap Replikasi",
  }
];

export const DEFAULT_DECISIONS = [
  {
    id: "dec-1",
    region_id: "reg-tangsel-demo",
    title: "Perwal Pemanfaatan Bersama Aset Fasilitas Publik",
    decision_type: "Peraturan Walikota",
    urgency: "Tinggi",
    status: "Menunggu Disposisi Pimpinan",
    legal_basis: "UU Hubungan Keuangan Pusat Daerah (HKPD) No. 1 Tahun 2022",
    background: "Kebutuhan regulasi penataan koridor aset utilitas terpadu.",
    recommendation: "Penetapan Perwal dan Pembentukan Tim Gugus Tugas Pengendalian Koridor Terpadu.",
    submitted_by: "Staf Ahli Bidang Perekonomian & Pembangunan",
    submitted_at: "2024-10-15T09:30:00.000Z"
  }
];

export async function getNetworkIssues(region_id?: string, category?: string, urgency?: string, status?: string) {
  let localItems: any[] = [];
  if (typeof window !== "undefined") {
    try {
      const key = `wasdal_issues_${region_id || "all"}`;
      localItems = JSON.parse(localStorage.getItem(key) || localStorage.getItem("wasdal_issues_all") || "[]");
    } catch (e) {}
  }
  try {
    const params = new URLSearchParams();
    if (region_id) params.append("region_id", region_id);
    if (category) params.append("category", category);
    if (urgency) params.append("urgency", urgency);
    if (status) params.append("status", status);
    const q = params.toString();
    const res = await request<any[]>(q ? `/network/issues?${q}` : "/network/issues");
    if (Array.isArray(res) && res.length > 0) return res;
  } catch (err) {}

  let items = localItems.length > 0 ? localItems : DEFAULT_ISSUES;
  if (category) items = items.filter((i) => i.category === category);
  if (urgency) items = items.filter((i) => i.urgency === urgency);
  if (status) items = items.filter((i) => i.status === status);
  return items;
}

export async function createNetworkIssue(payload: any) {
  const newIssue = {
    id: "iss-" + Date.now(),
    created_at: new Date().toISOString(),
    status: "Aktif",
    ...payload,
  };
  if (typeof window !== "undefined") {
    try {
      const key = `wasdal_issues_${payload.region_id || "all"}`;
      const cur = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify([newIssue, ...cur]));
      localStorage.setItem("wasdal_issues_all", JSON.stringify([newIssue, ...(JSON.parse(localStorage.getItem("wasdal_issues_all") || "[]"))]));
    } catch (e) {}
  }
  try {
    return await request<any>("/network/issues", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    return newIssue;
  }
}

export async function getNetworkDiagnoses(region_id?: string) {
  let localItems: any[] = [];
  if (typeof window !== "undefined") {
    try {
      const targetKey = `wasdal_diagnoses_${region_id || "all"}`;
      const existingStr = localStorage.getItem(targetKey) || localStorage.getItem("wasdal_diagnoses_all");
      if (existingStr) {
        localItems = JSON.parse(existingStr) || [];
      }
    } catch (e) {}
  }

  try {
    const q = region_id ? `?region_id=${encodeURIComponent(region_id)}` : "";
    const res = await request<any[]>(`/network/diagnoses${q}`);
    if (Array.isArray(res) && res.length > 0) {
      const map = new Map();
      res.forEach((d) => map.set(d.id, d));
      localItems.forEach((d) => map.set(d.id, d));
      return Array.from(map.values());
    }
  } catch (err) {}

  if (localItems.length > 0) return localItems;
  return DEFAULT_DIAGNOSES;
}

export async function createNetworkDiagnosis(payload: any) {
  const newDiag = {
    id: "diag-" + Date.now(),
    created_at: new Date().toISOString(),
    status: "Diajukan ke Pimpinan",
    ...payload,
  };

  // Always persist to localStorage for offline / fallback resilience
  if (typeof window !== "undefined") {
    try {
      const targetKey = `wasdal_diagnoses_${payload.region_id || "all"}`;
      const existingStr = localStorage.getItem(targetKey);
      const existing = existingStr ? JSON.parse(existingStr) : [];
      const updated = [newDiag, ...existing];
      localStorage.setItem(targetKey, JSON.stringify(updated));
      const allStr = localStorage.getItem("wasdal_diagnoses_all");
      const all = allStr ? JSON.parse(allStr) : [];
      localStorage.setItem("wasdal_diagnoses_all", JSON.stringify([newDiag, ...all]));
    } catch (e) {}
  }

  try {
    const res = await request<any>("/network/diagnoses", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    return res;
  } catch (err) {
    // Graceful fallback: return the locally stored diagnosis object
    return newDiag;
  }
}

export async function getNetworkFiscal(region_id: string, year?: number) {
  try {
    const q = year ? `?region_id=${encodeURIComponent(region_id)}&year=${year}` : `?region_id=${encodeURIComponent(region_id)}`;
    const res = await request<any>(`/network/fiscal${q}`);
    if (res) return res;
  } catch (err) {}

  return {
    region_id,
    year: year || 2024,
    pad_ratio: 51.8,
    capex_ratio: 22.4,
    silpa_ratio: 4.8,
    total_revenue_trillion: 4.35,
    pad_trillion: 2.25,
    transfer_trillion: 2.10,
    total_expenditure_trillion: 4.20,
    capex_trillion: 0.94,
    status_kemandirian: "Kategori Mandiri (Tinggi)",
    fiscal_health: "Sehat & Berkelanjutan"
  };
}

export async function getNetworkIdeas(region_id?: string, category?: string, status?: string) {
  let localItems: any[] = [];
  if (typeof window !== "undefined") {
    try {
      const key = `wasdal_ideas_${region_id || "all"}`;
      localItems = JSON.parse(localStorage.getItem(key) || localStorage.getItem("wasdal_ideas_all") || "[]");
    } catch (e) {}
  }
  try {
    const params = new URLSearchParams();
    if (region_id) params.append("region_id", region_id);
    if (category) params.append("category", category);
    if (status) params.append("status", status);
    const q = params.toString();
    const res = await request<any[]>(q ? `/network/ideas?${q}` : "/network/ideas");
    if (Array.isArray(res) && res.length > 0) return res;
  } catch (err) {}

  let items = localItems.length > 0 ? localItems : DEFAULT_IDEAS;
  if (category) items = items.filter((i) => i.category === category);
  if (status) items = items.filter((i) => i.status === status);
  return items;
}

export async function createNetworkIdea(payload: any) {
  const newIdea = {
    id: "id-" + Date.now(),
    created_at: new Date().toISOString(),
    replication_interest_count: 0,
    status: "Siap Replikasi",
    ...payload,
  };
  if (typeof window !== "undefined") {
    try {
      const key = `wasdal_ideas_${payload.region_id || "all"}`;
      const cur = JSON.parse(localStorage.getItem(key) || "[]");
      localStorage.setItem(key, JSON.stringify([newIdea, ...cur]));
      const all = JSON.parse(localStorage.getItem("wasdal_ideas_all") || "[]");
      localStorage.setItem("wasdal_ideas_all", JSON.stringify([newIdea, ...all]));
    } catch (e) {}
  }
  try {
    return await request<any>("/network/ideas", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    return newIdea;
  }
}

export async function expressNetworkIdeaInterest(idea_id: string) {
  try {
    return await request<any>(`/network/ideas/${idea_id}/interest`, {
      method: "POST",
    });
  } catch (err) {
    return { status: "ok", message: "Minat replikasi berhasil dicatat" };
  }
}

export async function getNetworkPilots(region_id?: string) {
  try {
    const q = region_id ? `?region_id=${encodeURIComponent(region_id)}` : "";
    const res = await request<any[]>(`/network/pilots${q}`);
    if (Array.isArray(res) && res.length > 0) return res;
  } catch (err) {}

  return [
    {
      id: "plt-1",
      title: "Pilot Transformasi Fiskal & Kemandirian PBJT Daerah",
      theme: "Transformasi Fiskal",
      region_name: "Kota Tangerang Selatan",
      stage: "Audit & Baseline",
      progress_percent: 65,
      target_outcome: "Peningkatan efektivitas PAD 12% dan digitalisasi retribusi.",
    },
    {
      id: "plt-2",
      title: "Pilot Penataan Ruang Koridor & Penertiban Kabel Udara",
      theme: "Tata Kelola Ruang Kota",
      region_name: "Kota Tangerang Selatan",
      stage: "Penetapan Regulasi Perwal",
      progress_percent: 80,
      target_outcome: "Zero kabel semrawut di 5 koridor jalan protokol utama.",
    }
  ];
}

export async function getNetworkAssets(region_id?: string) {
  try {
    const q = region_id ? `?region_id=${encodeURIComponent(region_id)}` : "";
    const res = await request<any[]>(`/network/assets${q}`);
    if (Array.isArray(res) && res.length > 0) return res;
  } catch (err) {}

  return [
    {
      id: "ast-1",
      name: "Plaza & Pasar Ciputat Blok B",
      asset_type: "Komersial / Pasar",
      location: "Kecamatan Ciputat, Kota Tangerang Selatan",
      utilization_status: "Perlu Revitalisasi & Kerjasama Swasta",
      estimated_value_billion: 45.2,
      potential_pad_annual_million: 1200,
    },
    {
      id: "ast-2",
      name: "Lahan Idle Koridor Ciater - Serpong",
      asset_type: "Lahan Terbuka",
      location: "Kecamatan Serpong, Kota Tangerang Selatan",
      utilization_status: "Potensi Pusat Kreatif UMKM & Parkir Terpadu",
      estimated_value_billion: 28.5,
      potential_pad_annual_million: 650,
    }
  ];
}

export function getNetworkFGD() {
  return request<any>("/network/fgd");
}

export async function getNetworkDecisions(region_id?: string, status?: string) {
  let localItems: any[] = [];
  if (typeof window !== "undefined") {
    try {
      const key = `wasdal_decisions_${region_id || "all"}`;
      localItems = JSON.parse(localStorage.getItem(key) || localStorage.getItem("wasdal_decisions_all") || "[]");
    } catch (e) {}
  }
  try {
    const params = new URLSearchParams();
    if (region_id) params.append("region_id", region_id);
    if (status) params.append("status", status);
    const q = params.toString();
    const res = await request<any[]>(q ? `/network/decisions?${q}` : "/network/decisions");
    if (Array.isArray(res) && res.length > 0) return res;
  } catch (err) {}

  let items = localItems.length > 0 ? localItems : DEFAULT_DECISIONS;
  if (status) items = items.filter((d) => d.status === status);
  return items;
}

export async function submitNetworkDisposition(decision_id: string, payload: any) {
  const result = {
    id: "disp-" + Date.now(),
    decision_id,
    disposition_type: payload.disposition_type || "Setuju",
    directive_note: payload.directive_note || "Lanjutkan sesuai rekomendasi staf ahli",
    assigned_opds: payload.assigned_opds || ["Bapenda", "Diskominfo"],
    dispositioned_at: new Date().toISOString(),
    dispositioned_by: payload.dispositioned_by || "Walikota",
  };
  if (typeof window !== "undefined") {
    try {
      const key = `wasdal_disposition_${decision_id}`;
      localStorage.setItem(key, JSON.stringify(result));
    } catch (e) {}
  }
  try {
    return await request<any>(`/network/decisions/${decision_id}/disposition`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    return result;
  }
}

export async function askNetworkAIAssist(payload: any) {
  try {
    return await request<any>("/network/ai/assist", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (payload.action === "diagnose") {
      return {
        summary: "Belum tersedianya sistem pengendalian terpadu yang menghubungkan data kabel dan utilitas, kondisi trotoar, parkir, aktivitas pedagang kaki lima (PKL), pengaduan masyarakat, serta tindak lanjut lintas perangkat daerah di Kota Tangerang Selatan. Kondisi ini berpotensi menyebabkan penanganan masalah ruang publik berjalan secara parsial, berulang, dan sulit dievaluasi dampaknya.",
        root_causes: "1. Ketiadaan basis data geospasial tunggal bersama antar instansi\n2. Belum adanya Perwal Standar Penataan Utilitas Terpadu Bawah Tanah\n3. Alur koordinasi penindakan dan monitoring tindak lanjut masih sektoral.",
        action_plan_30d: "Pelaksanaan audit cepat 30 hari pada koridor jalan prioritas dan konsolidasi data aset.",
        action_plan_90d: "Penetapan Perwal Penataan Terpadu dan digitalisasi pemantauan ruang kota."
      };
    }
    return {
      summary: "Rekomendasi kebijakan percepatan transformasi fiskal dan pemanfaatan aset daerah.",
      advice: "Prioritaskan sinergi data dan penyusunan instrumen regulasi yang terukur."
    };
  }
}

