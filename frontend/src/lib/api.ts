import { mockCases, mockDashboard } from "@/lib/mock-data";
import type { CaseItem, DashboardData, IntakeResult, MeetingResult, MeetingRecord } from "@/types/wasdal";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

async function request<T>(path: string, init?: RequestInit, fallback?: T): Promise<T> {
  try {
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
  } catch (error) {
    if (fallback !== undefined) return fallback;
    throw error;
  }
}

export function getDashboard() {
  return request<DashboardData>("/dashboard", undefined, mockDashboard);
}

export async function getCases(query?: string) {
  const url = query ? `/cases?size=50&q=${encodeURIComponent(query)}` : "/cases?size=50";
  const result = await request<{ items: CaseItem[] }>(url, undefined, { items: mockCases });
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

export function getMeetings() {
  return request<MeetingRecord[]>("/meetings", undefined, []);
}
