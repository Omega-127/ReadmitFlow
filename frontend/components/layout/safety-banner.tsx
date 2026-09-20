'use client';

import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import { SAFETY_DISCLAIMER, SAFETY_SUBTITLE } from '@/lib/constants';

export function SafetyBanner() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      aria-label="Clinical safety and synthetic data disclaimer"
      className="w-full bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/15 border-b border-amber-300 dark:border-amber-800/80 text-amber-950 dark:text-amber-200 px-4 py-2 transition-all duration-200 select-none shadow-sm"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5 font-medium">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-400 ring-1 ring-amber-500/40 animate-pulse">
            <ShieldAlert className="h-3.5 w-3.5" />
          </span>
          <div className="flex flex-wrap items-center gap-x-2">
            <span className="font-semibold tracking-wide uppercase text-xs px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-800 dark:text-amber-300">
              Safety Notice
            </span>
            <span className="font-semibold text-amber-900 dark:text-amber-100">
              {SAFETY_DISCLAIMER}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-xs text-amber-800 dark:text-amber-300 hover:text-amber-950 dark:hover:text-amber-100 underline-offset-2 hover:underline transition-colors focus:outline-none"
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? 'Hide disclosures' : 'Clinical disclosures & boundaries'}</span>
            {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto mt-2 pt-2 border-t border-amber-300/60 dark:border-amber-800/50 text-xs text-amber-900/90 dark:text-amber-200/90 space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
          <p>{SAFETY_SUBTITLE}</p>
          <div className="flex flex-wrap gap-4 pt-1 font-mono text-[11px] text-amber-800 dark:text-amber-300">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
              Human-in-the-Loop Mandate: Overrides require clinical rationale
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
              Zero PHI: Synthetic patient records only
            </span>
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
              Readmission model outputs marked Demo Only
            </span>
          </div>
        </div>
      )}
    </aside>
  );
}
