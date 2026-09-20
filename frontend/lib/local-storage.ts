import { Action, ActionStatus, AuditEvent, CapacitySettings, Override, Patient } from './types';
import { DEFAULT_CAPACITY_SETTINGS } from './constants';

const OVERRIDES_KEY = 'readmitflow_overrides';
const ACTIONS_KEY = 'readmitflow_actions';
const CAPACITY_KEY = 'readmitflow_capacity';
const AUDIT_KEY = 'readmitflow_audit';
const CUSTOM_PATIENTS_KEY = 'readmitflow_custom_patients';
const INITIALIZED_KEY = 'readmitflow_demo_initialized_v1';

export const STORAGE_SYNC_EVENT = 'readmitflow:state_sync';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

function dispatchSync(): void {
  if (isBrowser()) {
    window.dispatchEvent(new CustomEvent(STORAGE_SYNC_EVENT));
  }
}

// Initial seed data for realistic presentation out-of-the-box
const SEED_OVERRIDES: Record<string, Override> = {
  'PT-1004': {
    id: 'ovr-seed-1',
    patient_id: 'PT-1004',
    previous_tier: 'medium',
    selected_tier: 'high',
    reason: 'Lack of reliable transportation and caregiver frailty noted at bedside discharge review.',
    clinician_name: 'Dr. Marcus Vance, PharmD',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
};

const SEED_ACTIONS: Record<string, Action[]> = {
  'PT-1001': [
    {
      id: 'act-seed-1',
      patient_id: 'PT-1001',
      action_type: 'Telehealth 48h Follow-up Check',
      owner: 'Sarah Jenkins, RN (Care Coordinator)',
      due_date: new Date(Date.now() + 86400000 * 2).toISOString(),
      status: 'in_progress',
      notes: 'Focus on glycemic stability and insulin sliding scale comprehension post-discharge.',
      created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
  ],
  'PT-1004': [
    {
      id: 'act-seed-2',
      patient_id: 'PT-1004',
      action_type: 'Rapid Clinical Outreach & Home Check',
      owner: 'Mobile Community Health Team',
      due_date: new Date(Date.now() + 86400000).toISOString(),
      status: 'pending',
      notes: 'Urgent home visit to verify oxygen delivery and safety environment.',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
    },
  ],
  'PT-1007': [
    {
      id: 'act-seed-3',
      patient_id: 'PT-1007',
      action_type: 'Medication Reconciliation Review',
      owner: 'Dr. Marcus Vance, PharmD',
      due_date: new Date(Date.now() + 86400000).toISOString(),
      status: 'completed',
      notes: 'Reviewed anticoagulant titration with outpatient cardiology clinic.',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      completed_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
  ],
};

const SEED_AUDIT: AuditEvent[] = [
  {
    id: 'aud-seed-1',
    patient_id: 'PT-1001',
    event_type: 'triage_reviewed',
    details: 'Initial synthetic model risk assessment calculated (High Risk: 78.4%).',
    actor: 'ReadmitFlow ML Baseline',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'aud-seed-2',
    patient_id: 'PT-1001',
    event_type: 'action_assigned',
    details: 'Assigned "Telehealth 48h Follow-up Check" to Sarah Jenkins, RN.',
    actor: 'Sarah Jenkins, RN',
    timestamp: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'aud-seed-3',
    patient_id: 'PT-1004',
    event_type: 'override_recorded',
    details: 'Priority tier escalated from Medium Risk to High Risk. Rationale: Lack of reliable transportation and caregiver frailty noted at bedside discharge review.',
    actor: 'Dr. Marcus Vance, PharmD',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'aud-seed-4',
    patient_id: 'PT-1004',
    event_type: 'action_assigned',
    details: 'Assigned "Rapid Clinical Outreach & Home Check" to Mobile Community Health Team.',
    actor: 'Dr. Marcus Vance, PharmD',
    timestamp: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'aud-seed-5',
    patient_id: 'PT-1007',
    event_type: 'action_updated',
    details: 'Completed "Medication Reconciliation Review" — outpatient cardiology contacted.',
    actor: 'Dr. Marcus Vance, PharmD',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export function ensureInitialized(): void {
  if (!isBrowser()) return;
  const isInit = localStorage.getItem(INITIALIZED_KEY);
  if (!isInit) {
    resetDemoState();
  }
}

export function getStoredOverrides(): Record<string, Override> {
  if (!isBrowser()) return SEED_OVERRIDES;
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Error reading overrides from localStorage:', err);
    return {};
  }
}

export function saveOverride(override: Override): void {
  if (!isBrowser()) return;
  try {
    const current = getStoredOverrides();
    current[override.patient_id] = override;
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(current));

    addAuditEvent({
      patient_id: override.patient_id,
      event_type: 'override_recorded',
      details: `Priority tier changed from ${override.previous_tier.toUpperCase()} to ${override.selected_tier.toUpperCase()}. Rationale: ${override.reason}`,
      actor: override.clinician_name,
    });

    dispatchSync();
  } catch (err) {
    console.error('Error saving override to localStorage:', err);
  }
}

export function getStoredActions(): Record<string, Action[]> {
  if (!isBrowser()) return SEED_ACTIONS;
  try {
    const raw = localStorage.getItem(ACTIONS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (err) {
    console.error('Error reading actions from localStorage:', err);
    return {};
  }
}

export function saveAction(action: Action): void {
  if (!isBrowser()) return;
  try {
    const current = getStoredActions();
    const patientActions = current[action.patient_id] || [];
    current[action.patient_id] = [action, ...patientActions];
    localStorage.setItem(ACTIONS_KEY, JSON.stringify(current));

    addAuditEvent({
      patient_id: action.patient_id,
      event_type: 'action_assigned',
      details: `Assigned "${action.action_type}" to ${action.owner} (Due: ${new Date(action.due_date).toLocaleDateString()}).`,
      actor: action.owner,
    });

    dispatchSync();
  } catch (err) {
    console.error('Error saving action to localStorage:', err);
  }
}

export function updateActionStatus(actionId: string, status: ActionStatus, patientId: string): void {
  if (!isBrowser()) return;
  try {
    const current = getStoredActions();
    const patientActions = current[patientId] || [];
    let updatedAction: Action | undefined;

    const updated = patientActions.map((a) => {
      if (a.id === actionId) {
        updatedAction = {
          ...a,
          status,
          completed_at: status === 'completed' ? new Date().toISOString() : undefined,
        };
        return updatedAction;
      }
      return a;
    });

    current[patientId] = updated;
    localStorage.setItem(ACTIONS_KEY, JSON.stringify(current));

    if (updatedAction) {
      addAuditEvent({
        patient_id: patientId,
        event_type: 'action_updated',
        details: `Updated action "${updatedAction.action_type}" status to ${status.toUpperCase().replace('_', ' ')}.`,
        actor: 'Care Coordinator',
      });
    }

    dispatchSync();
  } catch (err) {
    console.error('Error updating action status in localStorage:', err);
  }
}

export function getStoredCapacity(): CapacitySettings {
  if (!isBrowser()) return DEFAULT_CAPACITY_SETTINGS;
  try {
    const raw = localStorage.getItem(CAPACITY_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_CAPACITY_SETTINGS;
  } catch (err) {
    console.error('Error reading capacity from localStorage:', err);
    return DEFAULT_CAPACITY_SETTINGS;
  }
}

export function saveCapacity(capacity: CapacitySettings): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(CAPACITY_KEY, JSON.stringify(capacity));

    addAuditEvent({
      event_type: 'capacity_allocated',
      details: `Care team daily limits updated (Follow-up: ${capacity.follow_up_call_slots}, Specialist: ${capacity.specialist_review_slots}, Outreach: ${capacity.rapid_outreach_slots}, RN Consult: ${capacity.nurse_consult_slots}).`,
      actor: 'Capacity Administrator',
    });

    dispatchSync();
  } catch (err) {
    console.error('Error saving capacity to localStorage:', err);
  }
}

export function getStoredAuditEvents(): AuditEvent[] {
  if (!isBrowser()) return SEED_AUDIT;
  try {
    const raw = localStorage.getItem(AUDIT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading audit log from localStorage:', err);
    return [];
  }
}

export function addAuditEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): AuditEvent {
  const newEvent: AuditEvent = {
    ...event,
    id: `aud-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
  };

  if (!isBrowser()) return newEvent;

  try {
    const current = getStoredAuditEvents();
    const updated = [newEvent, ...current].slice(0, 100); // retain latest 100
    localStorage.setItem(AUDIT_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Error appending audit event to localStorage:', err);
  }

  return newEvent;
}

export function getStoredCustomPatients(): Patient[] {
  if (!isBrowser()) return [];
  try {
    const raw = localStorage.getItem(CUSTOM_PATIENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Error reading custom patients from localStorage:', err);
    return [];
  }
}

export function getStoredCustomPatientById(patientId: string): Patient | undefined {
  return getStoredCustomPatients().find(
    (p) => p.id.toLowerCase() === patientId.toLowerCase()
  );
}

export function saveCustomPatient(patient: Patient): void {
  if (!isBrowser()) return;
  try {
    const current = getStoredCustomPatients().filter((p) => p.id !== patient.id);
    localStorage.setItem(CUSTOM_PATIENTS_KEY, JSON.stringify([patient, ...current]));

    addAuditEvent({
      patient_id: patient.id,
      event_type: 'triage_reviewed',
      details: `Scored synthetic patient ${patient.id} (${patient.risk_tier} risk, ${(patient.risk_score * 100).toFixed(1)}%).`,
      actor: 'Care Coordinator',
    });

    dispatchSync();
  } catch (err) {
    console.error('Error saving custom patient to localStorage:', err);
  }
}

export function resetDemoState(): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(SEED_OVERRIDES));
    localStorage.setItem(ACTIONS_KEY, JSON.stringify(SEED_ACTIONS));
    localStorage.setItem(CAPACITY_KEY, JSON.stringify(DEFAULT_CAPACITY_SETTINGS));
    localStorage.setItem(AUDIT_KEY, JSON.stringify(SEED_AUDIT));
    localStorage.setItem(CUSTOM_PATIENTS_KEY, JSON.stringify([]));
    localStorage.setItem(INITIALIZED_KEY, 'true');

    addAuditEvent({
      event_type: 'demo_reset',
      details: 'Demo workspace state reset to initial seed data.',
      actor: 'System / User Reset',
    });

    dispatchSync();
  } catch (err) {
    console.error('Error resetting demo state in localStorage:', err);
  }
}
