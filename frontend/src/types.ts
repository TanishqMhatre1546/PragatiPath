export type UserRole = 'trainee' | 'employer' | 'government' | 'provider' | 'policymaker';

export interface Checkpoint {
  id: number;
  month_mark: number;
  status: 'employed' | 'self-employed' | 'apprentice' | 'unemployed';
  employer_name: string | null;
  wage: number | null;
  same_employer: boolean | null;
  recorded_at: string | null;
  verification?: {
    id: number;
    status: 'pending' | 'verified' | 'disputed';
    employer_name: string;
    requested_at: string | null;
    resolved_at: string | null;
  } | null;
}

export interface OutboundMessage {
  id: number;
  channel: 'whatsapp' | 'sms' | 'email';
  message_text: string;
  sent_at: string | null;
  trainee_id?: number;
  trainee_name?: string;
  district?: string;
}

export interface TraineeSummary {
  id: number;
  name: string;
  district: string;
  course_id: number;
  course_name: string;
  enrollment_date: string;
  current_status: 'employed' | 'self-employed' | 'apprentice' | 'unemployed';
  checkpoint_count: number;
  latest_month_mark: number;
  latest_wage: number | null;
  latest_employer: string | null;
}

export interface TraineeDetail extends TraineeSummary {
  course_skills_taught: string[];
  checkpoints: Checkpoint[];
  outbound_messages: OutboundMessage[];
}

export interface VerificationItem {
  id: number;
  trainee_id: number;
  trainee_name: string;
  district: string;
  course_name: string;
  employer_name: string;
  checkpoint_id: number;
  month_mark: number;
  reported_wage: number | null;
  reported_status?: string;
  same_employer?: boolean | null;
  requested_at: string | null;
  status: 'pending' | 'verified' | 'disputed';
  resolved_at?: string | null;
}

export interface AnalyticsSummary {
  total_trainees: number;
  overall_employment_rate: number;
  status_split: { status: string; count: number; percentage: number }[];
  longitudinal_progression: {
    month_mark: string;
    month_number: number;
    total_candidates: number;
    retained_candidates: number;
    retention_rate: number;
    average_wage: number;
  }[];
  district_breakdown: {
    district: string;
    total_trainees: number;
    employed_count: number;
    unemployed_count: number;
    placement_rate: number;
    average_wage: number;
  }[];
  course_breakdown: {
    course_id: number;
    course_name: string;
    total_trainees: number;
    employed_count: number;
    unemployed_count: number;
    placement_rate: number;
    average_wage: number;
  }[];
  baseline_wage_3m: number;
  current_avg_wage_12m: number;
  wage_growth_rate: number;
}

export interface VerificationQuality {
  total_verification_requests: number;
  verified_count: number;
  pending_count: number;
  disputed_count: number;
  verified_percentage: number;
  pending_percentage: number;
  disputed_percentage: number;
  confidence_index: number;
  confidence_grade: string;
  methodology: string;
}

export interface SkillGapCourse {
  course_id: number;
  course_name: string;
  similarity_score: number;
  alignment_percentage: number;
  gap_status: 'High Skill Gap' | 'Moderate Gap' | 'Well Aligned';
  is_flagged: boolean;
  skills_taught_count: number;
  skills_demanded_count: number;
  skills_taught: string[];
  skills_demanded: string[];
  matching_skills: string[];
  missing_skills: string[];
  algorithm: string;
  recommendation: string;
}

export interface SkillGapResponse {
  algorithm: string;
  threshold_percentage: number;
  total_courses_analyzed: number;
  flagged_courses_count: number;
  courses: SkillGapCourse[];
  explanation: string;
}

export interface AttritionRiskItem {
  trainee_id: number;
  name: string;
  district: string;
  course_name: string;
  current_status: string;
  latest_wage: number;
  latest_month_mark: number;
  attrition_risk_score: number;
  risk_probability: number;
  risk_level: 'High' | 'Medium' | 'Low';
  risk_color: 'red' | 'amber' | 'green';
  recommended_action: string;
  disclaimer: string;
  model_type: string;
}

export interface AttritionRiskResponse {
  model: string;
  mandatory_disclaimer: string;
  summary: {
    total_evaluated: number;
    high_risk_count: number;
    medium_risk_count: number;
    low_risk_count: number;
  };
  predictions: AttritionRiskItem[];
}
