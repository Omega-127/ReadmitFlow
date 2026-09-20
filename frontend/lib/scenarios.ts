import { CapacitySettings } from './types';
import { DEFAULT_CAPACITY_SETTINGS } from './constants';

export interface ScenarioStep {
  title: string;
  detail: string;
  /** Optional route to open for this step */
  href?: string;
  /** Short line the presenter can say */
  say?: string;
}

export interface JudgeScenario {
  id: string;
  title: string;
  duration: string;
  summary: string;
  /** Synthetic patient to spotlight */
  patientId?: string;
  setup: {
    reset: boolean;
    /** If set, replace daily capacity after reset */
    capacity?: CapacitySettings;
  };
  steps: ScenarioStep[];
}

const TIGHT_CAPACITY: CapacitySettings = {
  follow_up_call_slots: 2,
  specialist_review_slots: 1,
  rapid_outreach_slots: 1,
  nurse_consult_slots: 2,
  last_updated: new Date().toISOString(),
};

export const JUDGE_SCENARIOS: JudgeScenario[] = [
  {
    id: 'high-risk-triage',
    title: 'High-risk triage',
    duration: '~2 min',
    summary:
      'Prioritize a heart-failure discharge, review drivers, assign outreach, then export a handoff.',
    patientId: 'PT-1002',
    setup: { reset: true },
    steps: [
      {
        title: 'Queue',
        detail: 'On Patients, filter High or Action needed. Point at “Needs action” in the summary.',
        href: '/',
        say: 'The queue shows who to review first — it does not make the care decision.',
      },
      {
        title: 'Open PT-1002',
        detail: 'Open the high-risk heart-failure patient. Show score, top drivers, and confidence.',
        href: '/patients/PT-1002',
        say: 'Staff see why the score is high before they act.',
      },
      {
        title: 'Assign follow-up',
        detail: 'In Follow-up, pick Rapid Clinical Outreach, assign an owner, and save.',
        href: '/patients/PT-1002',
        say: 'Every intervention stays human-approved.',
      },
      {
        title: 'Handoff',
        detail: 'Open Handoff and download the PDF for the next shift.',
        href: '/patients/PT-1002',
        say: 'The next coordinator gets a packet — not just a number.',
      },
    ],
  },
  {
    id: 'override-audit',
    title: 'Override & audit',
    duration: '~90 sec',
    summary:
      'Show accountable override: change priority with a reason and prove it in Activity.',
    patientId: 'PT-1003',
    setup: { reset: true },
    steps: [
      {
        title: 'Open a low-risk case',
        detail: 'Open PT-1003 (low risk). Note the model tier before you change anything.',
        href: '/patients/PT-1003',
        say: 'The model suggests a tier — staff can disagree.',
      },
      {
        title: 'Override priority',
        detail: 'Click Override, raise to High, enter a clear clinical reason, confirm.',
        href: '/patients/PT-1003',
        say: 'No silent changes — every override needs a person and a reason.',
      },
      {
        title: 'Show Activity',
        detail: 'Scroll to Activity and point at the timestamped override event.',
        href: '/patients/PT-1003',
        say: 'This is the audit trail a hospital would want for governance.',
      },
    ],
  },
  {
    id: 'capacity-crunch',
    title: 'Capacity crunch',
    duration: '~90 sec',
    summary:
      'Shrink daily slots and show the team hitting overload before more work is piled on.',
    patientId: 'PT-1002',
    setup: {
      reset: true,
      capacity: TIGHT_CAPACITY,
    },
    steps: [
      {
        title: 'Tight limits',
        detail: 'Open Capacity. Limits are already set low (1–2 slots). Point at utilization.',
        href: '/capacity',
        say: 'Care teams cannot take unlimited outreach in one day.',
      },
      {
        title: 'Assign under pressure',
        detail: 'Open PT-1002 and assign Rapid Outreach. Return to Capacity if it flips over limit.',
        href: '/patients/PT-1002',
        say: 'The workflow warns when demand exceeds staff bandwidth.',
      },
      {
        title: 'Back to Capacity',
        detail: 'Confirm the over-capacity warning and remaining slots.',
        href: '/capacity',
        say: 'Prioritization is operational — not just predictive.',
      },
    ],
  },
  {
    id: 'score-live',
    title: 'Score a live synthetic case',
    duration: '~75 sec',
    summary:
      'Use Score patient to create a new synthetic case and drop it into the queue.',
    setup: { reset: true },
    steps: [
      {
        title: 'Open Score patient',
        detail:
          'On Patients, click Score patient. Suggested demo inputs: age 78, Emergency, Heart Failure, Medicare.',
        href: '/',
        say: 'This is not a static list — we can score a new synthetic case live.',
      },
      {
        title: 'Score & open',
        detail: 'Submit Score & open. Land on the new patient review page.',
        href: '/',
        say: 'Judges see the model respond in real time on synthetic fields only.',
      },
      {
        title: 'Optional handoff',
        detail: 'Assign a follow-up or export handoff if time allows.',
        say: 'Same workflow as seed patients — explain, act, hand off.',
      },
    ],
  },
  {
    id: 'model-honesty',
    title: 'Model honesty',
    duration: '~60 sec',
    summary:
      'Walk the Model page: metrics, confusion matrix, and hard limits — demo only.',
    setup: { reset: false, capacity: undefined },
    steps: [
      {
        title: 'Open Model',
        detail: 'Go to Model. Show performance numbers briefly.',
        href: '/model-safety',
        say: 'We publish the scorecard in the product, not only in slides.',
      },
      {
        title: 'Confusion matrix',
        detail: 'Point at false negatives vs false positives and the miss-rate tradeoff.',
        href: '/model-safety',
        say: 'Missing a high-risk patient is costlier than an extra follow-up alert.',
      },
      {
        title: 'Limits',
        detail: 'Scroll to Limits. Emphasize synthetic data and non-diagnostic use.',
        href: '/model-safety',
        say: 'Decision support only — staff retain authority.',
      },
    ],
  },
];

export function getScenarioById(id: string): JudgeScenario | undefined {
  return JUDGE_SCENARIOS.find((s) => s.id === id);
}

export const ACTIVE_SCENARIO_KEY = 'readmitflow_active_scenario';

export interface ActiveScenarioState {
  scenarioId: string;
  stepIndex: number;
  startedAt: string;
}

export function getDefaultCapacityForScenario(): CapacitySettings {
  return { ...DEFAULT_CAPACITY_SETTINGS, last_updated: new Date().toISOString() };
}
