'use client';

import React from 'react';
import {
  Activity,
  BarChart3,
  CheckCircle,
  HelpCircle,
  Info,
  Layers,
  Percent,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { ModelMetrics } from '@/lib/types';
import { formatPercentage } from '@/lib/formatters';

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
      benchmark: 'Target: > 0.80',
      description:
        'Area Under the Receiver Operating Characteristic Curve. Measures discrimination between readmitted vs non-readmitted synthetic patients across all classification thresholds.',
      status: metrics.roc_auc >= 0.8 ? 'good' : 'fair',
    },
    {
      label: 'PR-AUC',
      value: (metrics.pr_auc * 100).toFixed(1) + '%',
      decimal: metrics.pr_auc.toFixed(3),
      benchmark: 'Target: > 0.70',
      description:
        'Area Under the Precision-Recall Curve. Crucial metric for imbalanced healthcare datasets where positive readmissions represent a minority cohort.',
      status: metrics.pr_auc >= 0.7 ? 'good' : 'fair',
    },
    {
      label: 'Recall (Sensitivity)',
      value: (metrics.recall * 100).toFixed(1) + '%',
      decimal: metrics.recall.toFixed(3),
      benchmark: 'Target: > 0.75',
      description:
        'Proportion of actual high-risk readmissions correctly identified by the triage model. High sensitivity minimizes missed vulnerable patients.',
      status: metrics.recall >= 0.75 ? 'good' : 'fair',
    },
    {
      label: 'Precision (PPV)',
      value: (metrics.precision * 100).toFixed(1) + '%',
      decimal: metrics.precision.toFixed(3),
      benchmark: 'Target: > 0.70',
      description:
        'Positive Predictive Value: Proportion of predicted high-risk patients who genuinely required readmission intervention. High precision prevents alert fatigue.',
      status: metrics.precision >= 0.7 ? 'good' : 'fair',
    },
    {
      label: 'F1-Score (Harmonic Mean)',
      value: (metrics.f1 * 100).toFixed(1) + '%',
      decimal: metrics.f1.toFixed(3),
      benchmark: 'Target: > 0.75',
      description:
        'Balanced harmonic mean between Precision and Recall. Evaluates overall triage trade-off for care team allocation.',
      status: metrics.f1 >= 0.75 ? 'good' : 'fair',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
            <BarChart3 className="h-3.5 w-3.5" />
          </span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Performance & Discrimination Benchmarks
          </h3>
        </div>

        {demoOnly && (
          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded font-mono font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <ShieldAlert className="h-3 w-3" />
            <span>Synthetic Baseline • Demo Only</span>
          </span>
        )}
      </div>

      <div className="rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50/60 dark:bg-blue-950/40 p-3.5 text-xs text-blue-950 dark:text-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-0.5">
          <span className="font-bold text-blue-900 dark:text-blue-200 block">
            Clinical Model Reliability Summary:
          </span>
          <p className="text-[11px] text-blue-800/90 dark:text-blue-300 leading-relaxed">
            The synthetic readmission baseline achieves <strong>79.1% Recall</strong> and <strong>82.4% ROC-AUC</strong>, tuned with an alert threshold (0.45) to prioritize capturing high-risk patients before discharge while keeping false alerts manageable for care coordination staff.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {cards.map((card, idx) => (
          <Card
            key={idx}
            className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition-colors"
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {card.label}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
                    >
                      <HelpCircle className="h-3.5 w-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">{card.description}</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div>
                <div className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                  {card.value}
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                  <span>score: {card.decimal}</span>
                  <span className="text-emerald-700 dark:text-emerald-400 font-sans font-semibold">
                    {card.benchmark}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
