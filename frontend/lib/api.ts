import {
  HealthResponse,
  ModelEvaluationData,
  Patient,
  PatientDetailResponse,
  PatientsResponse,
  PredictPatientInput,
  PredictPatientResponse,
  RiskTier,
} from './types';
import { MOCK_MODEL_METRICS } from './constants';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Rich, high-fidelity synthetic mock patients adhering strictly to docs/api-contract.md & docs/data-dictionary.md
const MOCK_PATIENTS: Patient[] = [
  {
    id: 'PT-1001',
    display_name: 'Patient PT-1001',
    age: 67,
    gender: 'Female',
    blood_type: 'O+',
    medical_condition: 'Diabetes',
    admission_date: '2026-09-14T08:30:00Z',
    discharge_date: '2026-09-18T14:00:00Z',
    admission_type: 'Urgent',
    hospital: 'Metro General Health Center',
    insurance_provider: 'Medicare',
    billing_amount: 18450.0,
    medication: 'Insulin Glargine, Metformin',
    test_results: 'Inconclusive / HbA1c 9.2%',
    risk_score: 0.784,
    risk_tier: 'high',
    confidence_level: 'review',
    confidence_flags: ['Incomplete discharge education log', 'Elevated glycemic variability'],
    assigned_action_status: 'in_progress',
    risk_drivers: [
      {
        label: 'Urgent admission context',
        direction: 'increases',
        summary: 'Urgent unplanned admission is strongly associated with high post-discharge readmission vulnerability.',
        feature: 'admission_type:Urgent',
        impact_weight: 0.28,
      },
      {
        label: 'Uncontrolled diabetes indicator',
        direction: 'increases',
        summary: 'Elevated HbA1c trajectory and multiple insulin agents contribute to metabolic instability risk.',
        feature: 'medical_condition:Diabetes',
        impact_weight: 0.22,
      },
      {
        label: 'High treatment billing intensity',
        direction: 'increases',
        summary: 'Upper-quartile inpatient resource utilization reflects high clinical complexity.',
        feature: 'billing_amount:High',
        impact_weight: 0.16,
      },
      {
        label: 'Medicare coverage continuity',
        direction: 'decreases',
        summary: 'Active Medicare primary coverage provides baseline post-acute follow-up access.',
        feature: 'insurance:Medicare',
        impact_weight: -0.08,
      },
    ],
    confidence: {
      level: 'review',
      summary: 'Data completeness is moderate. Post-discharge insulin regimen verification is recommended prior to final discharge clearance.',
      flags: ['Incomplete discharge education log', 'Elevated glycemic variability'],
      missing_fields: ['Discharge transportation confirmation'],
    },
    recommendation_templates: [
      'Telehealth 48h Follow-up Check',
      'Medication Reconciliation Review',
      'Rapid Clinical Outreach & Home Check',
    ],
  },
  {
    id: 'PT-1002',
    display_name: 'Patient PT-1002',
    age: 74,
    gender: 'Male',
    blood_type: 'A+',
    medical_condition: 'Heart Failure',
    admission_date: '2026-09-12T11:15:00Z',
    discharge_date: '2026-09-17T11:00:00Z',
    admission_type: 'Emergency',
    hospital: 'St. Jude Regional Hospital',
    insurance_provider: 'Medicare',
    billing_amount: 32600.0,
    medication: 'Furosemide, Carvedilol, Lisinopril',
    test_results: 'Abnormal / BNP 1240 pg/mL',
    risk_score: 0.862,
    risk_tier: 'high',
    confidence_level: 'high',
    confidence_flags: [],
    assigned_action_status: 'pending',
    risk_drivers: [
      {
        label: 'Emergency heart failure exacerbation',
        direction: 'increases',
        summary: 'Acute decompensation episode with emergency intake is the strongest predictor of 30-day readmission.',
        feature: 'admission_type:Emergency',
        impact_weight: 0.35,
      },
      {
        label: 'Advanced geriatric age (>70)',
        direction: 'increases',
        summary: 'Age 74 is correlated with reduced physiological reserve and increased post-discharge vulnerability.',
        feature: 'age:74',
        impact_weight: 0.21,
      },
      {
        label: 'Complex multi-drug cardiac regimen',
        direction: 'increases',
        summary: 'Diuretic and beta-blocker co-administration requires close electrolyte and BP monitoring.',
        feature: 'medication_count:3',
        impact_weight: 0.18,
      },
      {
        label: 'Full EHR record completeness',
        direction: 'decreases',
        summary: 'Complete diagnostic history and lab values allow high-confidence care coordination.',
        feature: 'data_completeness:100%',
        impact_weight: -0.05,
      },
    ],
    confidence: {
      level: 'high',
      summary: 'High confidence. Complete lab panels and vital trends available throughout 5-day inpatient stay.',
      flags: [],
    },
    recommendation_templates: [
      'Cardio-Pulmonary Specialist Consult',
      'Nurse Transition Consult',
      'Telehealth 48h Follow-up Check',
    ],
  },
  {
    id: 'PT-1003',
    display_name: 'Patient PT-1003',
    age: 54,
    gender: 'Female',
    blood_type: 'B+',
    medical_condition: 'Hypertension',
    admission_date: '2026-09-16T09:40:00Z',
    discharge_date: '2026-09-18T16:30:00Z',
    admission_type: 'Elective',
    hospital: 'University Health System',
    insurance_provider: 'Blue Cross',
    billing_amount: 11200.0,
    medication: 'Amlodipine, Losartan',
    test_results: 'Normal / SBP 128/82',
    risk_score: 0.245,
    risk_tier: 'low',
    confidence_level: 'high',
    confidence_flags: [],
    assigned_action_status: 'completed',
    risk_drivers: [
      {
        label: 'Elective planned admission',
        direction: 'decreases',
        summary: 'Elective procedures with planned discharge trajectories correlate with lower unplanned readmission.',
        feature: 'admission_type:Elective',
        impact_weight: -0.25,
      },
      {
        label: 'Normal vital signs upon discharge',
        direction: 'decreases',
        summary: 'Controlled blood pressure and absence of acute distress lower short-term risk.',
        feature: 'vital_status:Normal',
        impact_weight: -0.19,
      },
      {
        label: 'Age under 60 with commercial coverage',
        direction: 'decreases',
        summary: 'Robust outpatient specialist network and strong primary care continuity.',
        feature: 'insurance:Blue Cross',
        impact_weight: -0.12,
      },
      {
        label: 'Baseline chronic hypertension',
        direction: 'increases',
        summary: 'Lifelong cardiovascular disease history requires routine adherence monitoring.',
        feature: 'medical_condition:Hypertension',
        impact_weight: 0.11,
      },
    ],
    confidence: {
      level: 'high',
      summary: 'High confidence. Predictable elective stay with documented follow-up appointment.',
      flags: [],
    },
    recommendation_templates: [
      'Nurse Transition Consult',
      'Telehealth 48h Follow-up Check',
    ],
  },
  {
    id: 'PT-1004',
    display_name: 'Patient PT-1004',
    age: 62,
    gender: 'Male',
    blood_type: 'AB-',
    medical_condition: 'COPD',
    admission_date: '2026-09-13T14:10:00Z',
    discharge_date: '2026-09-17T10:15:00Z',
    admission_type: 'Urgent',
    hospital: 'Valley Community Hospital',
    insurance_provider: 'Medicaid',
    billing_amount: 21400.0,
    medication: 'Albuterol, Prednisone, Tiotropium',
    test_results: 'Abnormal / SpO2 91% on room air',
    risk_score: 0.648,
    risk_tier: 'medium', // Note: Seed override escalates this to 'high'
    confidence_level: 'review',
    confidence_flags: ['Borderline room-air oxygen saturation', 'Social vulnerability flag'],
    assigned_action_status: 'pending',
    risk_drivers: [
      {
        label: 'COPD acute exacerbation',
        direction: 'increases',
        summary: 'Bronchial inflammation requiring systemic corticosteroids carries high 30-day recurrence.',
        feature: 'medical_condition:COPD',
        impact_weight: 0.26,
      },
      {
        label: 'Urgent admission routing',
        direction: 'increases',
        summary: 'Unscheduled hospitalization indicates sudden clinical deterioration.',
        feature: 'admission_type:Urgent',
        impact_weight: 0.20,
      },
      {
        label: 'Medicaid / Transportation barrier',
        direction: 'increases',
        summary: 'Higher probability of pharmacy fill delays and missed follow-up appointments.',
        feature: 'insurance:Medicaid',
        impact_weight: 0.15,
      },
      {
        label: 'Documented pulmonary rehab referral',
        direction: 'decreases',
        summary: 'Outpatient pulmonary therapy referral initiated prior to discharge.',
        feature: 'referral:PulmonaryRehab',
        impact_weight: -0.10,
      },
    ],
    confidence: {
      level: 'review',
      summary: 'Care coordinator override in effect. Requires verification of home oxygen delivery before discharge.',
      flags: ['Borderline room-air oxygen saturation', 'Social vulnerability flag'],
      missing_fields: ['Oxygen vendor confirmation'],
    },
    recommendation_templates: [
      'Rapid Clinical Outreach & Home Check',
      'Nurse Transition Consult',
      'Medication Reconciliation Review',
    ],
  },
  {
    id: 'PT-1005',
    display_name: 'Patient PT-1005',
    age: 79,
    gender: 'Female',
    blood_type: 'O-',
    medical_condition: 'Pneumonia',
    admission_date: '2026-09-10T16:45:00Z',
    discharge_date: '2026-09-16T13:00:00Z',
    admission_type: 'Emergency',
    hospital: 'Metro General Health Center',
    insurance_provider: 'Medicare',
    billing_amount: 27900.0,
    medication: 'Levofloxacin, Acetaminophen',
    test_results: 'Inconclusive / Residual lung infiltrates',
    risk_score: 0.795,
    risk_tier: 'high',
    confidence_level: 'high',
    confidence_flags: ['Advanced age (>75)', 'Recent intensive care stay'],
    assigned_action_status: 'pending',
    risk_drivers: [
      {
        label: 'Severe bacterial pneumonia at advanced age',
        direction: 'increases',
        summary: 'Pulmonary infection in a 79-year-old poses persistent risks of pleural complication or sepsis recurrence.',
        feature: 'condition_age_interaction',
        impact_weight: 0.32,
      },
      {
        label: 'Emergency department intake',
        direction: 'increases',
        summary: 'High acuity admission route reflects severe initial disease burden.',
        feature: 'admission_type:Emergency',
        impact_weight: 0.24,
      },
      {
        label: 'Prolonged length of stay (6 days)',
        direction: 'increases',
        summary: 'Extended hospitalization is correlated with deconditioning and hospital-acquired weakness.',
        feature: 'los:6_days',
        impact_weight: 0.17,
      },
      {
        label: 'Antibiotic course completion planned',
        direction: 'decreases',
        summary: 'Oral antibiotic step-down regimen verified and provided at bedside.',
        feature: 'rx_compliance:Verified',
        impact_weight: -0.09,
      },
    ],
    confidence: {
      level: 'high',
      summary: 'High confidence. Detailed microbiological cultures and vitals logged throughout hospitalization.',
      flags: ['Advanced age (>75)', 'Recent intensive care stay'],
    },
    recommendation_templates: [
      'Rapid Clinical Outreach & Home Check',
      'Telehealth 48h Follow-up Check',
      'Nurse Transition Consult',
    ],
  },
  {
    id: 'PT-1006',
    display_name: 'Patient PT-1006',
    age: 49,
    gender: 'Male',
    blood_type: 'A-',
    medical_condition: 'Asthma',
    admission_date: '2026-09-17T06:20:00Z',
    discharge_date: '2026-09-18T18:00:00Z',
    admission_type: 'Emergency',
    hospital: 'Eastside Medical Center',
    insurance_provider: 'Aetna',
    billing_amount: 8700.0,
    medication: 'Budesonide/Formoterol, Albuterol',
    test_results: 'Normal / Peak flow 85% predicted',
    risk_score: 0.382,
    risk_tier: 'low',
    confidence_level: 'high',
    confidence_flags: [],
    assigned_action_status: 'pending',
    risk_drivers: [
      {
        label: 'Rapid bronchodilator response',
        direction: 'decreases',
        summary: 'Immediate clinical recovery within 24 hours indicates reversible airway constriction without parenchymal damage.',
        feature: 'recovery_time:24h',
        impact_weight: -0.22,
      },
      {
        label: 'Younger adult demographic (49)',
        direction: 'decreases',
        summary: 'Strong functional reserve and absent chronic cardiac comorbidities.',
        feature: 'age:49',
        impact_weight: -0.16,
      },
      {
        label: 'Emergency presentation route',
        direction: 'increases',
        summary: 'Emergency intake requires follow-up to ensure maintenance inhaler adherence.',
        feature: 'admission_type:Emergency',
        impact_weight: 0.14,
      },
    ],
    confidence: {
      level: 'high',
      summary: 'High confidence. Clear clinical trajectory and straightforward discharge plan.',
      flags: [],
    },
    recommendation_templates: [
      'Telehealth 48h Follow-up Check',
      'Medication Reconciliation Review',
    ],
  },
  {
    id: 'PT-1007',
    display_name: 'Patient PT-1007',
    age: 71,
    gender: 'Female',
    blood_type: 'B-',
    medical_condition: 'Atrial Fibrillation',
    admission_date: '2026-09-11T13:30:00Z',
    discharge_date: '2026-09-15T12:00:00Z',
    admission_type: 'Urgent',
    hospital: 'St. Jude Regional Hospital',
    insurance_provider: 'Medicare',
    billing_amount: 24300.0,
    medication: 'Apixaban, Metoprolol Tartrate',
    test_results: 'Normal / Rate controlled, INR N/A',
    risk_score: 0.584,
    risk_tier: 'medium',
    confidence_level: 'high',
    confidence_flags: [],
    assigned_action_status: 'completed',
    risk_drivers: [
      {
        label: 'Anticoagulation management risk',
        direction: 'increases',
        summary: 'Direct oral anticoagulant (DOAC) initiation requires close adherence to avoid bleeding or stroke.',
        feature: 'medication:Apixaban',
        impact_weight: 0.21,
      },
      {
        label: 'Age > 70 with rhythm disorder',
        direction: 'increases',
        summary: 'Risk of recurrent rapid ventricular response within 30 days of cardioversion/rate control.',
        feature: 'condition:AFib',
        impact_weight: 0.19,
      },
      {
        label: 'Confirmed cardiology outpatient follow-up',
        direction: 'decreases',
        summary: 'Appointment booked within 7 days with primary cardiologist.',
        feature: 'outpatient_followup:Scheduled',
        impact_weight: -0.17,
      },
    ],
    confidence: {
      level: 'high',
      summary: 'High confidence. ECG rhythm strips and pharmacy education documented.',
      flags: [],
    },
    recommendation_templates: [
      'Medication Reconciliation Review',
      'Cardio-Pulmonary Specialist Consult',
    ],
  },
  {
    id: 'PT-1008',
    display_name: 'Patient PT-1008',
    age: 58,
    gender: 'Male',
    blood_type: 'O+',
    medical_condition: 'Chronic Kidney Disease',
    admission_date: '2026-09-14T10:00:00Z',
    discharge_date: '2026-09-18T11:45:00Z',
    admission_type: 'Urgent',
    hospital: 'University Health System',
    insurance_provider: 'UnitedHealthcare',
    billing_amount: 29800.0,
    medication: 'Torsemide, Sodium Bicarbonate, Calcitriol',
    test_results: 'Abnormal / eGFR 28 mL/min, Creatinine 2.4',
    risk_score: 0.721,
    risk_tier: 'high',
    confidence_level: 'review',
    confidence_flags: ['Fluctuating renal labs', 'Pending outpatient nephrology clearance'],
    assigned_action_status: 'pending',
    risk_drivers: [
      {
        label: 'Stage 4 CKD progression',
        direction: 'increases',
        summary: 'Severely impaired renal filtration elevates risk for fluid overload and medication toxicity.',
        feature: 'condition:CKD_Stage4',
        impact_weight: 0.31,
      },
      {
        label: 'Multi-system electrolyte vulnerability',
        direction: 'increases',
        summary: 'Requires frequent basic metabolic panel checks within 72 hours post-discharge.',
        feature: 'lab_trajectory:Abnormal',
        impact_weight: 0.23,
      },
      {
        label: 'Established nephrologist care team',
        direction: 'decreases',
        summary: 'Established care history at university outpatient nephrology clinic.',
        feature: 'specialist_network:Established',
        impact_weight: -0.12,
      },
    ],
    confidence: {
      level: 'review',
      summary: 'Review needed. Post-discharge lab order requisition must be verified with primary caregiver.',
      flags: ['Fluctuating renal labs', 'Pending outpatient nephrology clearance'],
    },
    recommendation_templates: [
      'Rapid Clinical Outreach & Home Check',
      'Cardio-Pulmonary Specialist Consult',
      'Telehealth 48h Follow-up Check',
    ],
  },
];

async function fetchWithFallback<T>(url: string, fallbackData: T): Promise<{ data: T; isMock: boolean }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2-second timeout

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[ReadmitFlow API] Endpoint ${url} returned HTTP ${res.status}. Falling back to synthetic mock.`);
      return { data: fallbackData, isMock: true };
    }

    const json = await res.json();
    return { data: json, isMock: false };
  } catch (error) {
    console.info(`[ReadmitFlow API] Backend at ${url} unreachable or offline. Using local synthetic mock.`);
    return { data: fallbackData, isMock: true };
  }
}

export const api = {
  async getPatients(params?: {
    query?: string;
    risk_tier?: RiskTier;
    limit?: number;
  }): Promise<{ response: PatientsResponse; isMock: boolean }> {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.set('query', params.query);
    if (params?.risk_tier) searchParams.set('risk_tier', params.risk_tier);
    if (params?.limit) searchParams.set('limit', params.limit.toString());

    const url = `${BASE_URL}/patients${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;

    // Filter fallback patients
    let filtered = [...MOCK_PATIENTS];
    if (params?.query) {
      const q = params.query.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.id.toLowerCase().includes(q) ||
          p.display_name.toLowerCase().includes(q) ||
          p.medical_condition.toLowerCase().includes(q) ||
          p.hospital.toLowerCase().includes(q)
      );
    }
    if (params?.risk_tier) {
      filtered = filtered.filter((p) => p.risk_tier === params.risk_tier);
    }
    if (params?.limit) {
      filtered = filtered.slice(0, params.limit);
    }

    const fallback: PatientsResponse = {
      demo_only: true,
      data_notice: 'Synthetic demo data. Not for diagnosis or autonomous clinical decisions.',
      patients: filtered,
      total: filtered.length,
    };

    const result = await fetchWithFallback<PatientsResponse>(url, fallback);
    return { response: result.data, isMock: result.isMock };
  },

  async getPatientById(patientId: string): Promise<{ response: PatientDetailResponse; isMock: boolean }> {
    const url = `${BASE_URL}/patients/${patientId}`;
    const matched = MOCK_PATIENTS.find((p) => p.id.toLowerCase() === patientId.toLowerCase()) || MOCK_PATIENTS[0];

    const fallback: PatientDetailResponse = {
      demo_only: true,
      data_notice: 'Synthetic demo data. Not for diagnosis or autonomous clinical decisions.',
      patient: matched,
    };

    const result = await fetchWithFallback<PatientDetailResponse>(url, fallback);
    return { response: result.data, isMock: result.isMock };
  },

  async getMetrics(): Promise<{ response: ModelEvaluationData; isMock: boolean }> {
    const url = `${BASE_URL}/metrics`;
    const fallback: ModelEvaluationData = MOCK_MODEL_METRICS;

    const result = await fetchWithFallback<ModelEvaluationData>(url, fallback);
    return { response: result.data, isMock: result.isMock };
  },

  async getHealth(): Promise<{ response: HealthResponse; isMock: boolean }> {
    const url = `${BASE_URL}/health`;
    const fallback: HealthResponse = {
      status: 'ok',
      demo_only: true,
      model_status: 'demo-data-synthetic',
      generated_at: new Date().toISOString(),
    };

    const result = await fetchWithFallback<HealthResponse>(url, fallback);
    return { response: result.data, isMock: result.isMock };
  },

  async predictPatient(input: PredictPatientInput): Promise<{ response: PredictPatientResponse; isMock: boolean }> {
    const url = `${BASE_URL}/predict`;

    // High quality synthetic prediction simulation based on clinical rules
    let score = 0.35;
    if (input.age > 70) score += 0.25;
    else if (input.age > 60) score += 0.15;
    if (input.admission_type === 'Emergency') score += 0.25;
    else if (input.admission_type === 'Urgent') score += 0.15;
    if (input.medical_condition === 'Heart Failure') score += 0.20;
    if (input.medical_condition === 'COPD' || input.medical_condition === 'Diabetes') score += 0.15;
    if (input.insurance_provider === 'Medicaid') score += 0.08;
    score = Math.min(0.96, Math.max(0.12, score));

    const tier: RiskTier = score >= 0.7 ? 'high' : score >= 0.45 ? 'medium' : 'low';

    const fallback: PredictPatientResponse = {
      demo_only: true,
      risk_score: parseFloat(score.toFixed(3)),
      risk_tier: tier,
      risk_drivers: [
        {
          label: `${input.admission_type} admission route`,
          direction: input.admission_type === 'Elective' ? 'decreases' : 'increases',
          summary: `Admission acuity profile influences synthetic 30-day readmission risk estimate.`,
          feature: `admission_type:${input.admission_type}`,
          impact_weight: input.admission_type === 'Elective' ? -0.18 : 0.24,
        },
        {
          label: `Condition severity: ${input.medical_condition}`,
          direction: 'increases',
          summary: `Underlying chronic comorbidity requires active post-discharge care management.`,
          feature: `medical_condition:${input.medical_condition}`,
          impact_weight: 0.19,
        },
      ],
      confidence: {
        level: input.billing_amount ? 'high' : 'review',
        summary: 'Demo-only prediction generated from synthetic healthcare baseline model.',
        flags: input.billing_amount ? [] : ['Billing complexity not specified in manual prediction'],
      },
    };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      if (res.ok) {
        const data = await res.json();
        const tier = String(data.risk_tier || '').toLowerCase();
        return {
          response: {
            ...data,
            risk_tier: tier === 'high' || tier === 'medium' || tier === 'low' ? tier : 'medium',
          },
          isMock: false,
        };
      }
    } catch {
      // Fallback below
    }

    return { response: fallback, isMock: true };
  },
};
