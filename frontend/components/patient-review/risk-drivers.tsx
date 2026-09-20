'use client';

import React from 'react';
import {
  HelpCircle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RiskDriver } from '@/lib/types';
import { formatScore } from '@/lib/formatters';

interface RiskDriversProps {
  drivers: RiskDriver[];
  score: number;
}

function getClinicalFeatureCategory(feature?: string): { category: string; display: string } {
  if (!feature) return { category: 'Factor', display: 'General' };

  const [key, val] = feature.split(':');
  switch (key) {
    case 'admission_type':
      return { category: 'Admission', display: val ? `${val} admission` : 'Admission type' };
    case 'medical_condition':
      return { category: 'Condition', display: val || 'Condition' };
    case 'billing_amount':
      return { category: 'Utilization', display: val ? `${val} intensity` : 'Billing intensity' };
    case 'medication_count':
      return { category: 'Meds', display: `${val} medications` };
    case 'insurance':
      return { category: 'Payer', display: val ? `${val} plan` : 'Insurance' };
    case 'data_completeness':
      return { category: 'Record', display: `${val} verified` };
    case 'age':
      return { category: 'Demographics', display: `Age ${val}` };
    default:
      return {
        category: 'Factor',
        display: feature.replace(/_/g, ' ').replace(':', ': '),
      };
  }
}

export function RiskDrivers({ drivers, score }: RiskDriversProps) {
  return (
    <Card className="border border-neutral-200 bg-white shadow-none dark:border-neutral-800 dark:bg-neutral-900">
      <CardHeader className="border-b border-neutral-200 p-5 pb-3 dark:border-neutral-800">
        <div>
          <CardTitle className="text-base font-semibold text-neutral-900 dark:text-white">
            Why this score
          </CardTitle>
          <p className="mt-0.5 text-sm text-neutral-500">
            Factors that pushed the {formatScore(score)} readmission probability up or down
          </p>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {drivers.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No specific risk drivers recorded for this patient.</p>
        ) : (
          drivers.map((driver, idx) => {
            const isIncrease = driver.direction === 'increases';
            const isDecrease = driver.direction === 'decreases';
            const weight = driver.impact_weight || 0.15;
            const pctBar = Math.min(100, Math.max(12, Math.abs(weight) * 250));
            const meta = getClinicalFeatureCategory(driver.feature);

            return (
              <div
                key={idx}
                className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/40 p-3.5 space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                        {driver.label}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {meta.category}: {meta.display}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      {driver.summary}
                    </p>
                  </div>

                  {/* Directional Badge */}
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold border ${
                      isIncrease
                        ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-900'
                        : isDecrease
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900'
                        : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900'
                    }`}
                  >
                    {isIncrease ? (
                      <>
                        <TrendingUp className="h-3.5 w-3.5" />
                        <span>Increases Risk</span>
                      </>
                    ) : isDecrease ? (
                      <>
                        <TrendingDown className="h-3.5 w-3.5" />
                        <span>Protective Factor</span>
                      </>
                    ) : (
                      <>
                        <HelpCircle className="h-3.5 w-3.5" />
                        <span>Contextual Factor</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Relative impact bar */}
                <div className="flex items-center gap-3 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                  <div className="h-2 flex-1 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden">
                    <div
                      style={{ width: `${pctBar}%` }}
                      className={`h-full ${
                        isIncrease ? 'bg-rose-600' : isDecrease ? 'bg-emerald-600' : 'bg-amber-500'
                      }`}
                    />
                  </div>
                  <span className="font-mono text-xs text-slate-700 dark:text-slate-300 font-bold shrink-0">
                    {weight > 0 ? `+${(weight * 100).toFixed(0)}%` : `${(weight * 100).toFixed(0)}%`} relative weight
                  </span>
                </div>
              </div>
            );
          })
        )}

        <p className="rounded-md border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/40 dark:text-neutral-400">
          Use these factors to focus chart review — for example med adherence or home support —
          before assigning follow-up.
        </p>
      </CardContent>
    </Card>
  );
}
