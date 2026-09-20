'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ConfusionMatrixProps {
  matrix: [[number, number], [number, number]]; // [[TN, FP], [FN, TP]]
  totalSamples: number;
}

export function ConfusionMatrix({ matrix, totalSamples }: ConfusionMatrixProps) {
  const [activeCell, setActiveCell] = useState<string | null>(null);

  const [tn, fp] = matrix[0];
  const [fn, tp] = matrix[1];

  const totalActualNeg = tn + fp;
  const totalActualPos = fn + tp;
  const totalPredNeg = tn + fn;
  const totalPredPos = fp + tp;

  // Calculated diagnostic metrics
  const sensitivity = totalActualPos > 0 ? (tp / totalActualPos) * 100 : 0;
  const specificity = totalActualNeg > 0 ? (tn / totalActualNeg) * 100 : 0;
  const ppv = totalPredPos > 0 ? (tp / totalPredPos) * 100 : 0;
  const npv = totalPredNeg > 0 ? (tn / totalPredNeg) * 100 : 0;

  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400">
              <Layers className="h-4 w-4" />
            </span>
            <div>
              <CardTitle className="text-base font-bold">
                Triage Confusion Matrix (2x2)
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Evaluation cohort: {totalSamples} synthetic test admissions (Stratified 80/20 split)
              </p>
            </div>
          </div>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            N = {totalSamples}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {/* Matrix Grid with Headers */}
        <div className="max-w-md mx-auto">
          {/* Top Column Headers */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold text-slate-600 dark:text-slate-400 pb-2">
            <div className="pl-16">Predicted Negative</div>
            <div>Predicted Positive (High Risk)</div>
          </div>

          {/* Row 1: Actual Negative */}
          <div className="flex items-stretch gap-2 mb-2">
            <div className="w-16 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-400 text-center shrink-0">
              Actual Non-Readmit
            </div>

            <div className="grid grid-cols-2 gap-2 flex-1">
              {/* True Negative */}
              <div
                onMouseEnter={() => setActiveCell('TN')}
                onMouseLeave={() => setActiveCell(null)}
                className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  activeCell === 'TN'
                    ? 'ring-2 ring-emerald-500 bg-emerald-100/60 dark:bg-emerald-950/60'
                    : 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/60'
                }`}
              >
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide block">
                  True Negative (TN)
                </span>
                <div className="text-2xl font-extrabold text-emerald-900 dark:text-emerald-100 mt-1 font-mono">
                  {tn}
                </div>
                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block mt-0.5">
                  {((tn / totalSamples) * 100).toFixed(1)}% of cohort
                </span>
              </div>

              {/* False Positive */}
              <div
                onMouseEnter={() => setActiveCell('FP')}
                onMouseLeave={() => setActiveCell(null)}
                className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  activeCell === 'FP'
                    ? 'ring-2 ring-amber-500 bg-amber-100/60 dark:bg-amber-950/60'
                    : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/60'
                }`}
              >
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wide block">
                  False Positive (FP)
                </span>
                <div className="text-2xl font-extrabold text-amber-900 dark:text-amber-100 mt-1 font-mono">
                  {fp}
                </div>
                <span className="text-[10px] text-amber-700 dark:text-amber-400 block mt-0.5">
                  {((fp / totalSamples) * 100).toFixed(1)}% of cohort
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Actual Positive */}
          <div className="flex items-stretch gap-2">
            <div className="w-16 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-400 text-center shrink-0">
              Actual Readmit
            </div>

            <div className="grid grid-cols-2 gap-2 flex-1">
              {/* False Negative */}
              <div
                onMouseEnter={() => setActiveCell('FN')}
                onMouseLeave={() => setActiveCell(null)}
                className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  activeCell === 'FN'
                    ? 'ring-2 ring-rose-500 bg-rose-100/60 dark:bg-rose-950/60'
                    : 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60'
                }`}
              >
                <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 uppercase tracking-wide block">
                  False Negative (FN)
                </span>
                <div className="text-2xl font-extrabold text-rose-900 dark:text-rose-100 mt-1 font-mono">
                  {fn}
                </div>
                <span className="text-[10px] text-rose-700 dark:text-rose-400 block mt-0.5">
                  {((fn / totalSamples) * 100).toFixed(1)}% of cohort
                </span>
              </div>

              {/* True Positive */}
              <div
                onMouseEnter={() => setActiveCell('TP')}
                onMouseLeave={() => setActiveCell(null)}
                className={`p-4 rounded-xl border text-center transition-all cursor-pointer ${
                  activeCell === 'TP'
                    ? 'ring-2 ring-blue-500 bg-blue-100/60 dark:bg-blue-950/60'
                    : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/60'
                }`}
              >
                <span className="text-[11px] font-bold text-blue-800 dark:text-blue-300 uppercase tracking-wide block">
                  True Positive (TP)
                </span>
                <div className="text-2xl font-extrabold text-blue-900 dark:text-blue-100 mt-1 font-mono">
                  {tp}
                </div>
                <span className="text-[10px] text-blue-700 dark:text-blue-400 block mt-0.5">
                  {((tp / totalSamples) * 100).toFixed(1)}% of cohort
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Clinical Interpretation Callout */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-400 block">Sensitivity (Recall)</span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5 block">
              {sensitivity.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-500">Catches {tp} of {totalActualPos} readmissions</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-400 block">Specificity (TNR)</span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5 block">
              {specificity.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-500">Correctly rules out {tn} non-readmissions</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-400 block">Precision (PPV)</span>
            <span className="text-base font-bold text-slate-900 dark:text-slate-100 font-mono mt-0.5 block">
              {ppv.toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-500">{tp} of {totalPredPos} flagged were true</span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <span className="text-slate-400 block">Miss Rate (FNR)</span>
            <span className="text-base font-bold text-rose-600 dark:text-rose-400 font-mono mt-0.5 block">
              {(100 - sensitivity).toFixed(1)}%
            </span>
            <span className="text-[10px] text-slate-500">{fn} false negatives missed</span>
          </div>
        </div>

        {/* Clinical Impact Explanations */}
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/30 p-3 text-xs space-y-1.5 border border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
            <Info className="h-3.5 w-3.5 text-blue-500" />
            <span>Clinical Trade-Off Analysis:</span>
          </div>
          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            In hospital risk triage, <strong>False Negatives ({fn})</strong> carry higher clinical hazard than <strong>False Positives ({fp})</strong>. The baseline model is calibrated with a lower decision threshold (0.45) to maximize recall while maintaining tolerable care coordinator workload.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
