import React from 'react';
import { RiskSummary } from '@/components/command-center/risk-summary';
import { PatientFilters } from '@/components/command-center/patient-filters';
import { PatientQueue } from '@/components/command-center/patient-queue';

export default function CommandCenterPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          Patients
        </h1>
        <p className="max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          Who needs follow-up after discharge, ordered by 30-day readmission risk.
          Open a row to review drivers and assign an action.
        </p>
      </header>

      <section aria-label="Summary" className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          At a glance
        </h2>
        <RiskSummary />
      </section>

      <section aria-label="Queue" className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          Queue
        </h2>
        <PatientFilters />
        <PatientQueue />
      </section>
    </div>
  );
}
