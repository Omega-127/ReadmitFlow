'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { SAFETY_DISCLAIMER, SAFETY_SUBTITLE } from '@/lib/constants';

export function SafetyBanner() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <aside
      aria-label="Clinical decision support notice"
      className="w-full border-b border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-100"
    >
      <div className="mx-auto flex max-w-6xl items-start justify-between gap-3 px-4 py-2 sm:items-center sm:px-6">
        <p className="text-sm leading-snug">
          <span className="font-semibold">Demo only.</span>{' '}
          <span className="text-amber-900/90 dark:text-amber-100/90">{SAFETY_DISCLAIMER}</span>
        </p>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-amber-900 underline-offset-2 hover:underline dark:text-amber-200"
          aria-expanded={isExpanded}
        >
          {isExpanded ? 'Less' : 'Details'}
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mx-auto max-w-6xl space-y-2 border-t border-amber-200 px-4 py-3 text-sm text-amber-950/90 dark:border-amber-900 dark:text-amber-100/90 sm:px-6">
          <p className="leading-relaxed">{SAFETY_SUBTITLE}</p>
          <ul className="list-inside list-disc space-y-1 text-amber-900/80 dark:text-amber-200/80">
            <li>Staff must review and approve any follow-up action</li>
            <li>All patients are synthetic — no real PHI</li>
            <li>This tool does not diagnose or treat</li>
          </ul>
        </div>
      )}
    </aside>
  );
}
