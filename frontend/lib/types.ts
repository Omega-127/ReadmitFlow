export type RiskTier = 'low' | 'medium' | 'high';
export type ConfidenceLevel = 'high' | 'review' | 'low';
export type ActionStatus = 'pending' | 'in_progress' | 'completed';

export interface RiskDriver {
  label: string;
  direction: 'increases' | 'decreases' | 'review';
  summary: string;
  feature?: string;
  impact_weight?: number;
}

export interface ConfidenceInfo {
  level: ConfidenceLevel;
  summary: string;
  flags: string[];
  missing_fields?: string[];
}

export interface Patient {
  id: string;
  display_name: string;
  age: number;
  gender: string;
  blood_type?: string;
  medical_condition: string;
  admission_date: string;
  admission_type: string;
  discharge_date?: string;
  hospital: string;
  insurance_provider: string;
  billing_amount?: number;
  medication?: string;
  test_results?: string;
  risk_score: number;
  risk_tier: RiskTier;
  confidence_level: ConfidenceLevel;
  confidence_flags?: string[];
  risk_drivers: RiskDriver[];
  confidence?: ConfidenceInfo;
  recommendation_templates?: string[];
  assigned_action_status?: ActionStatus;
}

export interface Action {
  id: string;
  patient_id: string;
  action_type: string;
  owner: string;
  due_date: string;
  status: ActionStatus;
  notes?: string;
  created_at: string;
  completed_at?: string;
}

export interface Override {
  id: string;
  patient_id: string;
  previous_tier: RiskTier;
  selected_tier: RiskTier;
  reason: string;
  clinician_name: string;
  timestamp: string;
}

export interface CapacitySettings {
  follow_up_call_slots: number;
  specialist_review_slots: number;
  rapid_outreach_slots: number;
  nurse_consult_slots: number;
  last_updated: string;
}

export interface CapacityAllocation {
  slot_type: string;
  allocated: number;
  capacity: number;
  utilization_pct: number;
  is_over_capacity: boolean;
}

export interface AuditEvent {
  id: string;
  patient_id?: string;
  event_type:
    | 'action_assigned'
    | 'action_updated'
    | 'override_recorded'
    | 'capacity_allocated'
    | 'demo_reset'
    | 'triage_reviewed';
  details: string;
  actor: string;
  timestamp: string;
}

export interface ModelMetrics {
  roc_auc: number;
  pr_auc: number;
  precision: number;
  recall: number;
  f1: number;
  confusion_matrix: [[number, number], [number, number]]; // [[TN, FP], [FN, TP]]
  total_samples: number;
  positive_class_ratio: number;
}

export interface ModelEvaluationData {
  demo_only: boolean;
  metrics: ModelMetrics;
  preprocessing_summary: string[];
  limitations: string[];
  dataset_info?: {
    name: string;
    sample_count: number;
    features_count: number;
    target_label: string;
    notes: string;
  };
}

export interface PatientsResponse {
  demo_only: boolean;
  data_notice: string;
  patients: Patient[];
  total?: number;
}

export interface PatientDetailResponse {
  demo_only: boolean;
  data_notice: string;
  patient: Patient;
}

export interface PredictPatientInput {
  age: number;
  gender: string;
  medical_condition: string;
  admission_type: string;
  insurance_provider: string;
  billing_amount?: number;
  medication?: string;
}

export interface PredictPatientResponse {
  demo_only: boolean;
  risk_score: number;
  risk_tier: RiskTier;
  risk_drivers: RiskDriver[];
  confidence: ConfidenceInfo;
}

export interface HealthResponse {
  status: string;
  demo_only: boolean;
  model_status: string;
  generated_at: string;
}
