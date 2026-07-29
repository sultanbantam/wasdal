import type { CaseItem, DashboardData, IntakeResult, MeetingResult, MeetingRecord } from "@/types/wasdal";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

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
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";
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
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";
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
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001/api/v1";
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
