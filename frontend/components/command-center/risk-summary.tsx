'use client';

import React from 'react';
import { usePatients } from '@/hooks/use-patients';

export function RiskSummary() {
  const { stats, isLoading } = usePatients();

  const highPct = stats.total > 0 ? (stats.highRisk / stats.total) * 100 : 0;
  const medPct = stats.total > 0 ? (stats.mediumRisk / stats.total) * 100 : 0;
  const lowPct = stats.total > 0 ? (stats.lowRisk / stats.total) * 100 : 0;

  const items = [
    {
      label: 'Needs action',
      value: stats.highRiskNeedingAction ?? stats.highRisk,
      detail: 'High risk, no follow-up yet',
      emphasize: true,
    },
    {
      label: 'In cohort',
      value: stats.total,
      detail: `${stats.highRisk} high · ${stats.mediumRisk} medium · ${stats.lowRisk} low`,
    },
    {
      label: 'Open follow-ups',
      value: stats.actionsPending + stats.inProgress,
      detail: `${stats.inProgress} in progress · ${stats.completed ?? 0} done`,
    },
    {
      label: 'Overrides',
      value: stats.overridden,
      detail: 'Staff changed the model tier',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-neutral-200 bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-800 lg:grid-cols-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="bg-white p-4 dark:bg-neutral-900"
          >
            <p className="text-sm text-neutral-500">{item.label}</p>
            <p
              className={`mt-1 font-mono text-2xl font-semibold tabular-nums ${
                item.emphasize
                  ? 'text-rose-700 dark:text-rose-400'
                  : 'text-neutral-900 dark:text-white'
              }`}
            >
              {isLoading ? '—' : item.value}
            </p>
            <p className="mt-1 text-xs text-neutral-500">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="rounded-md border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2 text-sm">
          <span className="font-medium text-neutral-800 dark:text-neutral-200">
            Risk mix
          </span>
          <div className="flex flex-wrap gap-4 text-xs text-neutral-600 dark:text-neutral-400">
            <span>
              <span className="mr-1.5 inline-block h-2 w-2 bg-rose-600 align-middle" />
              High {stats.highRisk} ({highPct.toFixed(0)}%)
            </span>
            <span>
              <span className="mr-1.5 inline-block h-2 w-2 bg-amber-500 align-middle" />
              Medium {stats.mediumRisk} ({medPct.toFixed(0)}%)
            </span>
            <span>
              <span className="mr-1.5 inline-block h-2 w-2 bg-emerald-600 align-middle" />
              Low {stats.lowRisk} ({lowPct.toFixed(0)}%)
            </span>
          </div>
        </div>
        <div className="flex h-2 w-full overflow-hidden rounded-sm bg-neutral-100 dark:bg-neutral-800">
          <div style={{ width: `${highPct}%` }} className="bg-rose-600" title="High" />
          <div style={{ width: `${medPct}%` }} className="bg-amber-500" title="Medium" />
          <div style={{ width: `${lowPct}%` }} className="bg-emerald-600" title="Low" />
        </div>
      </div>
    </div>
  );
}
