'use client';

import React, { useState } from 'react';

interface ConfusionMatrixProps {
  matrix: [[number, number], [number, number]];
  totalSamples: number;
}

export function ConfusionMatrix({ matrix, totalSamples }: ConfusionMatrixProps) {
  const [activeCell, setActiveCell] = useState<string | null>(null);

  const [tn, fp] = matrix[0];
  const [fn, tp] = matrix[1];

  const totalActualNeg = tn + fp;
  const totalActualPos = fn + tp;
  const totalPredPos = fp + tp;

  const sensitivity = totalActualPos > 0 ? (tp / totalActualPos) * 100 : 0;
  const specificity = totalActualNeg > 0 ? (tn / totalActualNeg) * 100 : 0;
  const ppv = totalPredPos > 0 ? (tp / totalPredPos) * 100 : 0;

  const cellClass = (id: string, tone: string) =>
    `cursor-pointer rounded-md border p-3 text-center transition-colors ${
      activeCell === id ? 'ring-2 ring-neutral-900 dark:ring-neutral-100' : ''
    } ${tone}`;

  return (
    <div className="rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
        <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
          Confusion matrix
        </h2>
        <p className="mt-0.5 text-sm text-neutral-500">
          Test set · {totalSamples} admissions
        </p>
      </div>

      <div className="space-y-5 p-5">
        <div className="mx-auto max-w-md">
          <div className="mb-2 grid grid-cols-[4rem_1fr_1fr] gap-2 text-center text-xs text-neutral-500">
            <div />
            <div>Predicted low</div>
            <div>Predicted high</div>
          </div>

          <div className="mb-2 grid grid-cols-[4rem_1fr_1fr] gap-2">
            <div className="flex items-center justify-center text-center text-xs text-neutral-500">
              No readmit
            </div>
            <div
              onMouseEnter={() => setActiveCell('TN')}
              onMouseLeave={() => setActiveCell(null)}
              className={cellClass(
                'TN',
                'border-emerald-200 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30'
              )}
            >
              <p className="text-xs text-emerald-800 dark:text-emerald-300">TN</p>
              <p className="mt-1 font-mono text-xl font-semibold text-emerald-900 dark:text-emerald-100">
                {tn}
              </p>
            </div>
            <div
              onMouseEnter={() => setActiveCell('FP')}
              onMouseLeave={() => setActiveCell(null)}
              className={cellClass(
                'FP',
                'border-amber-200 bg-amber-50/60 dark:border-amber-900 dark:bg-amber-950/30'
              )}
            >
              <p className="text-xs text-amber-800 dark:text-amber-300">FP</p>
              <p className="mt-1 font-mono text-xl font-semibold text-amber-900 dark:text-amber-100">
                {fp}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-[4rem_1fr_1fr] gap-2">
            <div className="flex items-center justify-center text-center text-xs text-neutral-500">
              Readmit
            </div>
            <div
              onMouseEnter={() => setActiveCell('FN')}
              onMouseLeave={() => setActiveCell(null)}
              className={cellClass(
                'FN',
                'border-rose-200 bg-rose-50/60 dark:border-rose-900 dark:bg-rose-950/30'
              )}
            >
              <p className="text-xs text-rose-800 dark:text-rose-300">FN</p>
              <p className="mt-1 font-mono text-xl font-semibold text-rose-900 dark:text-rose-100">
                {fn}
              </p>
            </div>
            <div
              onMouseEnter={() => setActiveCell('TP')}
              onMouseLeave={() => setActiveCell(null)}
              className={cellClass(
                'TP',
                'border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800/50'
              )}
            >
              <p className="text-xs text-neutral-600 dark:text-neutral-300">TP</p>
              <p className="mt-1 font-mono text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                {tp}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 border-t border-neutral-100 pt-4 text-sm dark:border-neutral-800 sm:grid-cols-4">
          <div>
            <p className="text-neutral-500">Recall</p>
            <p className="mt-0.5 font-mono font-semibold tabular-nums">{sensitivity.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-neutral-500">Specificity</p>
            <p className="mt-0.5 font-mono font-semibold tabular-nums">{specificity.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-neutral-500">Precision</p>
            <p className="mt-0.5 font-mono font-semibold tabular-nums">{ppv.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-neutral-500">Miss rate</p>
            <p className="mt-0.5 font-mono font-semibold tabular-nums text-rose-700 dark:text-rose-400">
              {(100 - sensitivity).toFixed(1)}%
            </p>
          </div>
        </div>

        <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          Misses (FN = {fn}) are costlier than false alarms (FP = {fp}) in this workflow,
          so the threshold favors catching high-risk patients.
        </p>
      </div>
    </div>
  );
}
