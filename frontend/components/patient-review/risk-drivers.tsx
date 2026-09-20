'use client';

import React from 'react';
import {
  Activity,
  CheckCircle2,
  FileText,
  HelpCircle,
  SlidersHorizontal,
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
  if (!feature) return { category: 'Clinical Factor', display: 'General' };

  const [key, val] = feature.split(':');
  switch (key) {
    case 'admission_type':
      return { category: 'Admission Context', display: val ? `${val} Admission` : 'Admission Type' };
    case 'medical_condition':
      return { category: 'Primary Pathology', display: val || 'Condition' };
    case 'billing_amount':
      return { category: 'Resource Utilization', display: val ? `${val} Inpatient Intensity` : 'Billing Intensity' };
    case 'medication_count':
      return { category: 'Polypharmacy', display: `${val} Concurrent Medications` };
    case 'insurance':
      return { category: 'Payer Coverage', display: val ? `${val} Plan` : 'Insurance' };
    case 'data_completeness':
      return { category: 'Record Completeness', display: `${val} Verified EHR` };
    case 'age':
      return { category: 'Demographics', display: `Age ${val}` };
    default:
      return {
        category: 'Clinical Attribute',
        display: feature.replace(/_/g, ' ').replace(':', ': '),
      };
  }
}

export function RiskDrivers({ drivers, score }: RiskDriversProps) {
  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <CardHeader className="p-5 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-900">
              <SlidersHorizontal className="h-4 w-4" />
            </span>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Explainable Risk Drivers & Contributing Factors
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Algorithmic feature attributions (SHAP) explaining the {formatScore(score)} readmission probability
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
            SHAP Attribution
          </span>
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

        <div className="rounded-lg bg-slate-100/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 p-3.5 text-xs text-slate-800 dark:text-slate-200 space-y-1">
          <p className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-slate-100">
            <CheckCircle2 className="h-4 w-4 text-blue-700 dark:text-blue-400" />
            <span>Clinical Translation & Chart Review Guidance</span>
          </p>
          <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400">
            SHAP values represent the magnitude each variable pushed the risk score above or below the cohort baseline. Use these findings to target post-discharge reconciliation (e.g. confirming medication adherence or checking home oxygen delivery).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
