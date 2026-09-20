'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ModelMetrics } from '@/lib/types';

interface MetricCardsProps {
  metrics: ModelMetrics;
  demoOnly: boolean;
}

export function MetricCards({ metrics, demoOnly }: MetricCardsProps) {
  const cards = [
    {
      label: 'ROC-AUC',
      value: (metrics.roc_auc * 100).toFixed(1) + '%',
      decimal: metrics.roc_auc.toFixed(3),
      target: '> 0.80',
      description:
        'How well the model separates patients who were readmitted from those who were not.',
    },
    {
      label: 'PR-AUC',
      value: (metrics.pr_auc * 100).toFixed(1) + '%',
      decimal: metrics.pr_auc.toFixed(3),
      target: '> 0.70',
      description:
        'Useful when readmissions are uncommon — focuses on the high-risk minority.',
    },
    {
      label: 'Recall',
      value: (metrics.recall * 100).toFixed(1) + '%',
      decimal: metrics.recall.toFixed(3),
      target: '> 0.75',
      description:
        'Share of true readmissions the model flagged. Higher means fewer misses.',
    },
    {
      label: 'Precision',
      value: (metrics.precision * 100).toFixed(1) + '%',
      decimal: metrics.precision.toFixed(3),
      target: '> 0.70',
      description:
        'Of patients flagged high-risk, how many actually needed intervention.',
    },
    {
      label: 'F1',
      value: (metrics.f1 * 100).toFixed(1) + '%',
      decimal: metrics.f1.toFixed(3),
      target: '> 0.75',
      description: 'Balance between precision and recall.',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
          Performance
        </h2>
        {demoOnly && (
          <span className="text-xs text-amber-800 dark:text-amber-400">
            Synthetic baseline · demo only
          </span>
        )}
      </div>

      <p className="rounded-md border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
        Tuned for recall (catching high-risk patients) with a 0.45 decision threshold.
        Staff still decide every follow-up.
      </p>

      <div className="grid grid-cols-1 gap-px overflow-hidden rounded-md border border-neutral-200 bg-neutral-200 dark:border-neutral-800 dark:bg-neutral-800 sm:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <div key={card.label} className="bg-white p-4 dark:bg-neutral-900">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {card.label}
              </span>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    aria-label={`About ${card.label}`}
                  >
                    <HelpCircle className="h-3.5 w-3.5" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">{card.description}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-neutral-900 dark:text-white">
              {card.value}
            </p>
            <p className="mt-1 flex justify-between text-xs text-neutral-500">
              <span className="font-mono">{card.decimal}</span>
              <span>target {card.target}</span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
