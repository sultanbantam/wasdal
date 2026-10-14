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

