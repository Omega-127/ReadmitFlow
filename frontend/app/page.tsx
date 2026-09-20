import React from 'react';
import { Activity, ShieldCheck } from 'lucide-react';
import { RiskSummary } from '@/components/command-center/risk-summary';
import { PatientFilters } from '@/components/command-center/patient-filters';
import { PatientQueue } from '@/components/command-center/patient-queue';

export default function CommandCenterPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <span>Clinical Command Center</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              Live Triage
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Prioritize post-acute patient follow-up, review explainable model drivers, and coordinate accountable discharge interventions.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Synthetic Cohort Triage</span>
        </div>
      </div>

      {/* Cohort KPIs & Stratification */}
      <section aria-label="Risk Summary Metrics">
        <RiskSummary />
      </section>

      {/* Search, Filter Pills & Sort Controls */}
      <section aria-label="Triage Queue Controls">
        <PatientFilters />
      </section>

      {/* Patient Priority Queue Table */}
      <section aria-label="Patient Priority Queue">
        <PatientQueue />
      </section>
    </div>
  );
}
