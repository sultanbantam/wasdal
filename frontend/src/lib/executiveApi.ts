// mock implementation for executive api
import type { DashboardData } from "@/types/wasdal";

// Gunakan base API dari lib/api.ts
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

export interface PerformanceSummary {
    rpjmd_achievement: number;
    rkpd_achievement: number;
    financial_realization: number;
    physical_realization: number;
    status_distribution: Record<string, number>;
}

export interface DecisionOption {
    id: string;
    description: string;
    estimated_time: string;
}

export interface DecisionRequired {
    title: string;
    priority: string;
    impact: string;
    responsible_opd: string;
    status: string;
    decision_owner: string;
    options: DecisionOption[];
    recommended_option: string;
}

export function getPerformanceSummary() {
    return request<PerformanceSummary>("/performance/summary");
}

export function getDecisionsRequired() {
    return request<DecisionRequired[]>("/decisions/required");
}
