'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, ShieldAlert, CheckCircle2, Lock, Users } from 'lucide-react';
import { SAFETY_DISCLAIMER, SAFETY_SUBTITLE } from '@/lib/constants';

export function SafetyBanner() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      aria-label="Clinical decision support notice"
      className="w-full bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 text-amber-950 dark:text-amber-100 px-4 py-2 transition-colors select-none text-xs"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-amber-200/80 text-amber-900 dark:bg-amber-900/80 dark:text-amber-200 font-bold">
            <ShieldAlert className="h-3.5 w-3.5" />
          </span>
          <div className="flex flex-wrap items-center gap-x-2">
            <span className="font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-amber-200/90 text-amber-900 dark:bg-amber-900 dark:text-amber-200">
              CDS Protocol
            </span>
            <span className="font-semibold text-amber-950 dark:text-amber-100">
              {SAFETY_DISCLAIMER}
            </span>
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[11px] font-medium text-amber-900 dark:text-amber-200 hover:text-amber-950 dark:hover:text-white underline-offset-2 hover:underline transition-colors focus:outline-none shrink-0 self-end sm:self-center"
          aria-expanded={isExpanded}
        >
          <span>{isExpanded ? 'Hide clinical governance' : 'Governance & safety boundaries'}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-2.5 pt-2.5 border-t border-amber-200/70 dark:border-amber-900/60 text-[11px] text-amber-900/90 dark:text-amber-200/90 space-y-2">
          <p className="leading-relaxed">{SAFETY_SUBTITLE}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
            <div className="flex items-center gap-1.5 p-1.5 rounded bg-white/60 dark:bg-slate-900/60 border border-amber-200/60 dark:border-amber-900/40 text-slate-800 dark:text-slate-200">
              <Users className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
              <span><strong>Human-in-the-Loop:</strong> Overrides require clinical staff rationale</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded bg-white/60 dark:bg-slate-900/60 border border-amber-200/60 dark:border-amber-900/40 text-slate-800 dark:text-slate-200">
              <Lock className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <span><strong>Zero PHI:</strong> De-identified synthetic patient cohort</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded bg-white/60 dark:bg-slate-900/60 border border-amber-200/60 dark:border-amber-900/40 text-slate-800 dark:text-slate-200">
              <CheckCircle2 className="h-3.5 w-3.5 text-blue-700 dark:text-blue-400 shrink-0" />
              <span><strong>Decision Support:</strong> Staff retain discharge authority</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
