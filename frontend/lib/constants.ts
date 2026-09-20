import { CapacitySettings, RiskTier } from './types';

export const SAFETY_DISCLAIMER =
  'Decision Support Only — Synthetic Data Demonstration — Non-Diagnostic';

export const SAFETY_SUBTITLE =
  'All patient profiles, risk assessments, and model outputs are generated from synthetic healthcare data. This prototype is designed exclusively for clinical workflow evaluation and care-capacity planning, not for autonomous diagnostic or treatment decisions.';

export const RISK_TIER_CONFIG: Record<
  RiskTier,
  {
    label: string;
    description: string;
    badgeBg: string;
    badgeText: string;
    border: string;
    dotBg: string;
    gradient: string;
  }
> = {
  high: {
    label: 'High Risk',
    description: 'Immediate multi-disciplinary review and rapid intervention recommended within 24h.',
    badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
    badgeText: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800/60',
    dotBg: 'bg-rose-500',
    gradient: 'from-rose-500/20 to-rose-500/5',
  },
  medium: {
    label: 'Medium Risk',
    description: 'Post-discharge follow-up call and medication reconciliation recommended within 48-72h.',
    badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
    badgeText: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800/60',
    dotBg: 'bg-amber-500',
    gradient: 'from-amber-500/20 to-amber-500/5',
  },
  low: {
    label: 'Low Risk',
    description: 'Standard outpatient discharge summary and routine primary care visit recommended within 14 days.',
    badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
    badgeText: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    dotBg: 'bg-emerald-500',
    gradient: 'from-emerald-500/20 to-emerald-500/5',
  },
};

export const ACTION_TEMPLATES = [
  {
    id: 'telehealth_check',
    type: 'Telehealth 48h Follow-up Check',
    category: 'follow_up_call',
    defaultOwner: 'Sarah Jenkins, RN (Care Coordinator)',
    dueDays: 2,
    description: 'Structured post-discharge symptom and recovery check via secure video call.',
  },
  {
    id: 'med_rec_review',
    type: 'Medication Reconciliation Review',
    category: 'nurse_consult',
    defaultOwner: 'Dr. Marcus Vance, PharmD',
    dueDays: 1,
    description: 'Verify discharge prescriptions against home medications and screen for interactions.',
  },
  {
    id: 'rapid_outreach',
    type: 'Rapid Clinical Outreach & Home Check',
    category: 'rapid_outreach',
    defaultOwner: 'Mobile Community Health Team',
    dueDays: 1,
    description: 'Urgent home visit or rapid check-in for high-risk patients with social vulnerability.',
  },
  {
    id: 'specialist_consult',
    type: 'Cardio-Pulmonary Specialist Consult',
    category: 'specialist_review',
    defaultOwner: 'Dr. Aris Thorne, MD (Attending)',
    dueDays: 3,
    description: 'Specialist chart review and tailored disease-management optimization protocol.',
  },
  {
    id: 'nurse_consult',
    type: 'Nurse Transition Consult',
    category: 'nurse_consult',
    defaultOwner: 'Elena Rostova, BSN, RN',
    dueDays: 2,
    description: 'Review discharge red flags, wound care, and diet/fluid restrictions with patient and family.',
  },
];

export const CLINICAL_ROLES = [
  'Care Coordinator (Lead RN)',
  'Attending Physician',
  'Clinical Pharmacist',
  'Hospitalist',
  'Transitions of Care Specialist',
];

export const OVERRIDE_REASON_OPTIONS = [
  'Clinical judgment: Patient stability exceeds model assessment',
  'Clinical judgment: Patient frailty/social risk not captured by data',
  'Complex comorbidity interaction requires escalation',
  'Recent successful specialist intervention reduces readmission risk',
  'Family/Caregiver support system robust post-discharge',
  'Lack of reliable transportation or home support identified',
  'Organ failure / critical lab trajectory requires aggressive monitoring',
  'Other clinical rationale (detailed below)',
];

export const DEFAULT_CAPACITY_SETTINGS: CapacitySettings = {
  follow_up_call_slots: 16,
  specialist_review_slots: 6,
  rapid_outreach_slots: 4,
  nurse_consult_slots: 10,
  last_updated: new Date().toISOString(),
};

export const MOCK_MODEL_METRICS = {
  demo_only: true,
  metrics: {
    roc_auc: 0.824,
    pr_auc: 0.748,
    precision: 0.763,
    recall: 0.791,
    f1: 0.777,
    confusion_matrix: [
      [382, 68],  // [TN, FP]
      [52, 198],  // [FN, TP]
    ] as [[number, number], [number, number]],
    total_samples: 700,
    positive_class_ratio: 0.357,
  },
  preprocessing_summary: [
    'Synthetic EHR dataset with 700 stratified patient admissions.',
    'Feature standardization with RobustScaler for billing amount and length of stay.',
    'One-hot categorical encoding for admission type, medical condition, and medication class.',
    'Leakage prevention: Strict stratified train/test split (80/20) prior to transformation.',
    'Explainability: Model-agnostic SHAP approximations computed across test cohort.',
  ],
  limitations: [
    'Synthetic Data Demonstration: All patient profiles are algorithmically synthesized; metrics do not guarantee clinical generalization.',
    'Non-Diagnostic Boundary: ReadmitFlow is a triage prioritization aid, not a diagnostic or autonomous clinical agent.',
    'Underrepresented Demographics: Extreme pediatric and geriatric edge-cases (>95) have wider uncertainty bands.',
    'Social Determinants of Health (SDOH): Socioeconomic and food insecurity markers are approximated from synthetic proxies.',
    'Human-in-the-Loop Mandate: Overrides must be logged with verified clinical rationale before changing triage tier.',
  ],
  dataset_info: {
    name: 'Healthcare Synthetic Cohort (EHR Demo v2.4)',
    sample_count: 700,
    features_count: 14,
    target_label: '30-Day Readmission Proxy (Synthetic Outcome)',
    notes: 'Dataset validated for zero personally identifiable health information (PHI).',
  },
};
