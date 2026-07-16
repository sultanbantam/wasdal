export type Priority = "Critical" | "High" | "Medium" | "Low";

export type CaseItem = {
  id: string;
  number: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string | null;
  location_name?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  reporter_name?: string | null;
  source: string;
  status: string;
  priority: Priority;
  severity: string;
  priority_score: number;
  pic?: string | null;
  agency?: string | null;
  due_date?: string | null;
  ai_summary?: string | null;
  ai_confidence: number;
  suggested_solution: Array<Record<string, unknown>>;
  timeline: Array<Record<string, unknown>>;
  comments: Array<Record<string, unknown>>;
  created_at: string;
  updated_at: string;
};

export type MetricCard = {
  label: string;
  value: number | string;
  delta?: string | null;
  tone: "neutral" | "warning" | "danger" | "success";
};

export type DashboardData = {
  metrics: MetricCard[];
  cases_by_status: Record<string, number>;
  cases_by_category: Record<string, number>;
  cases_by_priority: Record<string, number>;
  map_points: Array<{
    id: string;
    number: string;
    title: string;
    priority: Priority;
    status: string;
    latitude: number;
    longitude: number;
    location_name?: string | null;
  }>;
  recent_activity: Array<Record<string, unknown>>;
  executive_brief: string;
  ai_watchlist: Array<Record<string, unknown>>;
};

export type IntakeResult = {
  summary: string;
  category: string;
  subcategory: string;
  priority: Priority;
  priority_score: number;
  severity: string;
  location_name: string;
  latitude?: number | null;
  longitude?: number | null;
  suggested_agency: string;
  suggested_deadline?: string | null;
  recommendations: Array<Record<string, unknown>>;
  confidence: number;
  audit_notes: string[];
  case_id?: string | null;
};
