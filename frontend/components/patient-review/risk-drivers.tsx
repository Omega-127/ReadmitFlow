'use client';

import React from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle,
  HelpCircle,
  Sparkles,
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

export function RiskDrivers({ drivers, score }: RiskDriversProps) {
  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Sparkles className="h-4 w-4" />
            </span>
            <div>
              <CardTitle className="text-base font-bold">
                Explainable Risk Drivers (SHAP)
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Key clinical and admission factors contributing to the 30-day readmission estimate ({formatScore(score)})
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
            Model Explainability
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
            const pctBar = Math.min(100, Math.max(10, Math.abs(weight) * 250));

            return (
              <div
                key={idx}
                className="rounded-lg border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 p-3.5 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                        {driver.label}
                      </span>
                      {driver.feature && (
                        <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300">
                          {driver.feature}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {driver.summary}
                    </p>
                  </div>

                  {/* Directional Badge */}
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border ${
                      isIncrease
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/60'
                        : isDecrease
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60'
                        : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60'
                    }`}
                  >
                    {isIncrease ? (
                      <>
                        <TrendingUp className="h-3 w-3" />
                        <span>Increases Risk</span>
                      </>
                    ) : isDecrease ? (
                      <>
                        <TrendingDown className="h-3 w-3" />
                        <span>Mitigating Factor</span>
                      </>
                    ) : (
                      <>
                        <HelpCircle className="h-3 w-3" />
                        <span>Review</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Relative impact bar */}
                <div className="flex items-center gap-2 pt-1">
                  <div className="h-1.5 flex-1 bg-slate-200/80 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pctBar}%` }}
                      className={`h-full rounded-full ${
                        isIncrease ? 'bg-rose-500' : isDecrease ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-slate-500 font-medium">
                    {weight > 0 ? `+${(weight * 100).toFixed(0)}%` : `${(weight * 100).toFixed(0)}%`} SHAP impact
                  </span>
                </div>
              </div>
            );
          })
        )}

        <div className="rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 p-3 text-xs text-blue-900 dark:text-blue-200 space-y-1">
          <p className="font-semibold flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Clinical Translation Note</span>
          </p>
          <p className="text-[11px] leading-relaxed text-blue-800/90 dark:text-blue-300/90">
            Drivers are algorithmically computed feature attributions against the synthetic baseline cohort. They are provided to accelerate chart review, not to substitute for clinician physical exam or comprehensive history.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
