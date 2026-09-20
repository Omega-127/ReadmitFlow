'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { ModelEvaluationData } from '@/lib/types';

interface LimitationCardProps {
  data: ModelEvaluationData;
}

export function LimitationCard({ data }: LimitationCardProps) {
  const dataset = data.dataset_info;

  return (
    <div className="space-y-6">
      <div className="rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
            Dataset
          </h2>
          <p className="mt-0.5 text-sm text-neutral-500">
            Source and preprocessing for this demo model
          </p>
        </div>

        <div className="space-y-4 p-5">
          {dataset && (
            <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              <div>
                <dt className="text-neutral-500">Name</dt>
                <dd className="mt-0.5 font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {dataset.name}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">Samples</dt>
                <dd className="mt-0.5 font-mono font-medium text-neutral-900 dark:text-neutral-100">
                  {dataset.sample_count}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">Features</dt>
                <dd className="mt-0.5 font-mono font-medium text-neutral-900 dark:text-neutral-100">
                  {dataset.features_count}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-500">Target</dt>
                <dd className="mt-0.5 font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {dataset.target_label}
                </dd>
              </div>
            </dl>
          )}

          <div>
            <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-500">
              Pipeline
            </h3>
            <ol className="mt-2 list-inside list-decimal space-y-1.5 text-sm text-neutral-700 dark:text-neutral-300">
              {data.preprocessing_summary.map((step, idx) => (
                <li key={idx}>{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-amber-300 bg-amber-50/40 dark:border-amber-900 dark:bg-amber-950/20">
        <div className="border-b border-amber-200 px-5 py-4 dark:border-amber-900/60">
          <h2 className="text-base font-semibold text-amber-950 dark:text-amber-100">
            Limits
          </h2>
          <p className="mt-0.5 text-sm text-amber-900/80 dark:text-amber-200/80">
            What this model is not for
          </p>
        </div>

        <div className="space-y-2 p-5">
          {data.limitations.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2 text-sm text-amber-950 dark:text-amber-100"
            >
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700 dark:text-amber-400" />
              <span>{item}</span>
            </div>
          ))}

          <ul className="mt-4 list-inside list-disc space-y-1 border-t border-amber-200 pt-3 text-sm text-neutral-700 dark:border-amber-900/50 dark:text-neutral-300">
            <li>No real PHI — fully synthetic</li>
            <li>Overrides are logged with a reason</li>
            <li>Not a diagnostic or treatment system</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
