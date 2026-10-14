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

export type MeetingResult = {
  title: string;
  summary: string;
  decisions: string[];
  action_items: Array<{ action: string; assignee: string; deadline: string }>;
  confidence: number;
  record_id?: string | null;
};

export type MeetingRecord = {
  id: string;
  title: string;
  summary: string;
  decisions: string[];
  action_items: Array<{ task?: string; action?: string; pic?: string; assignee?: string; deadline: string; status?: string }>;
  confidence: number;
  created_at: string;
};

// --- Ruang Kota Types ---
export type UrbanOverview = {
  health_index: number;
  total_segments: number;
  cables: {
    total: number;
    cluttered: number;
    suspected_inactive: number;
  };
  obstructions: {
    total: number;
    pending_verification: number;
    verified: number;
  };
  hotspots_count: number;
  vendors: {
    total_zones: number;
    registered_vendors: number;
  };
  walkpoints: {
    participants: number;
    total_km: number;
  };
  payment_readiness_status: string;
  last_updated: string;
};

export type UtilityAssetItem = {
  id: string;
  asset_code: string;
  segment_id: string;
  street_name: string;
  district: string;
  operator_name: string;
  utility_type: string;
  ownership_status: string;
  active_status: string;
  visual_condition: string;
  clutter_index: number;
  pole_number?: string | null;
  height_meters?: number | null;
  risk_level: string;
  permit_reference?: string | null;
  inspection_date?: string | null;
  notes?: string | null;
  last_action?: string | null;
};

export type SidewalkItem = {
  id: string;
  segment_id: string;
  street_name: string;
  district: string;
  width_meters: number;
  clear_pedestrian_width_meters: number;
  surface_condition: string;
  has_tactile_paving: boolean;
  has_wheelchair_ramp: boolean;
  lighting_condition: string;
  zone_category: string;
  repair_status: string;
};

export type UrbanObstructionItem = {
  id: string;
  title: string;
  obstruction_type: string;
  description: string;
  location_name: string;
  latitude: number;
  longitude: number;
  source: string;
  accessibility_impact: string;
  ai_confidence: number;
  ai_candidate_flag: boolean;
  status: string;
  responsible_agency: string;
  is_recurring: boolean;
  created_at: string;
};

export type StreetVendorZoneItem = {
  id: string;
  zone_name: string;
  district: string;
  location_description: string;
  legal_basis: string;
  authorized_by: string;
  active_hours: string;
  max_capacity_stalls: number;
  current_registered_stalls: number;
  mandatory_free_pedestrian_width_meters: number;
  is_legal: boolean;
  vendors: Array<{
    vendor_code: string;
    business_type: string;
    stall_number?: string | null;
    verification_status: string;
    cleanliness_score: number;
  }>;
};

export type UrbanHotspotItem = {
  id: string;
  title: string;
  issue_type: string;
  location_name: string;
  district: string;
  latitude: number;
  longitude: number;
  incident_count_30d: number;
  peak_hours: string;
  severity: string;
  lead_agency: string;
  status: string;
};

export type WalkpointRewardItem = {
  id: string;
  partner_merchant_name: string;
  reward_title: string;
  category: string;
  points_required: number;
  stock_available: number;
  terms: string;
};

export type WalkpointsData = {
  program: {
    title: string;
    description: string;
    funding_source: string;
    points_per_km: number;
    daily_cap: number;
    legal_disclaimer: string;
  };
  account_demo: {
    id: string | null;
    participant_name: string;
    balance_points: number;
    total_km: number;
    tier: string;
  };
  rewards: WalkpointRewardItem[];
};

// --- Talenta ASN Types ---
export type TalentOverview = {
  readiness_index_pct: number;
  total_profiles: number;
  average_data_completeness: number;
  nine_box_distribution: Record<number, number>;
  idp_summary: {
    total_active: number;
    average_progress_pct: number;
  };
  succession_summary: {
    critical_positions: number;
    ready_now_successors: number;
  };
  data_quality_issues_pending: number;
  legal_basis: string;
  last_updated: string;
};

export type TalentProfileItem = {
  id: string;
  nip: string;
  full_name: string;
  agency_opd: string;
  current_position: string;
  echelon_or_class: string;
  rank_group: string;
  education_level?: string;
  major?: string | null;
  years_in_position?: number;
  performance_score_official: number;
  potential_score_official: number;
  nine_box_position: number;
  nine_box_status: string;
  data_completeness_pct: number;
  verification_status: string;
  career_aspirations?: string | null;
  certifications?: Array<Record<string, unknown>>;
  project_assignments?: Array<Record<string, unknown>>;
};

export type NineBoxData = {
  formula: string;
  boxes: Array<{
    box_number: number;
    meta: {
      title: string;
      perf: string;
      pot: string;
      color: string;
    };
    members: Array<{
      id: string;
      full_name: string;
      nip: string;
      position: string;
      agency_opd: string;
      performance_score: number;
      potential_score: number;
    }>;
  }>;
};

export type TalentPoolItem = {
  id: string;
  name: string;
  description: string;
  category: string;
  criteria_rule: string;
  total_qualified_members: number;
  sample_candidates: Array<{
    id: string;
    name: string;
    position: string;
    box: number;
  }>;
};

export type TalentIDPItem = {
  id: string;
  employee_name: string;
  nip: string;
  year: number;
  target_career_objective: string;
  mentor_or_coach?: string | null;
  approval_status: string;
  overall_progress_pct: number;
  activities: Array<{
    id: string;
    activity_type: string;
    title: string;
    competency_targeted: string;
    deadline?: string | null;
    progress_status: string;
    verified: boolean;
  }>;
};

export type TalentSuccessionItem = {
  id: string;
  position_title: string;
  agency_opd: string;
  urgency_level: string;
  vacancy_risk_reason: string;
  current_incumbent: string;
  retirement_date?: string | null;
  required_competencies: string;
  successors: Array<{
    candidate_name: string;
    readiness_status: string;
    readiness_score: number;
    gap_summary: string;
    development_plan: string;
    verified: boolean;
  }>;
};

export type TalentMobilityItem = {
  id: string;
  candidate_name: string;
  current_position: string;
  recommended_target_position: string;
  target_agency_opd: string;
  match_score_pct: number;
  rationale_why: string;
  factors_considered: string[];
  ai_disclaimer: string;
  review_status: string;
};

export type TalentMilestoneItem = {
  id: string;
  phase_order: number;
  phase_name: string;
  target_description: string;
  lead_pic: string;
  deadline?: string | null;
  status: string;
  evidence_notes?: string | null;
  decision_required_id?: string | null;
};
