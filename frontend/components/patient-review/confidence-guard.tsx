'use client';

import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ConfidenceInfo, ConfidenceLevel } from '@/lib/types';
import { getConfidenceBadgeClasses } from '@/lib/formatters';

interface ConfidenceGuardProps {
  confidence?: ConfidenceInfo;
  confidenceLevel: ConfidenceLevel;
  confidenceFlags?: string[];
}

export function ConfidenceGuard({
  confidence,
  confidenceLevel,
  confidenceFlags = [],
}: ConfidenceGuardProps) {
  const badgeConfig = getConfidenceBadgeClasses(confidenceLevel);
  const flags = confidence?.flags || confidenceFlags;
  const missingFields = confidence?.missing_fields || [];
  const isHigh = confidenceLevel === 'high';

  return (
    <Card className="border border-neutral-200 bg-white shadow-none dark:border-neutral-800 dark:bg-neutral-900">
      <CardHeader className="border-b border-neutral-200 p-5 pb-3 dark:border-neutral-800">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold text-neutral-900 dark:text-white">
              Data confidence
            </CardTitle>
            <p className="mt-0.5 text-sm text-neutral-500">
              How complete the record looks before you assign follow-up
            </p>
          </div>
          <span
            className={`rounded px-2 py-0.5 text-xs font-medium border ${badgeConfig.bg} ${badgeConfig.text} ${badgeConfig.border}`}
          >
            {badgeConfig.label}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-5">
        <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
          {confidence?.summary ||
            (isHigh
              ? 'Key fields look complete: diagnosis, meds, and admission type are present.'
              : 'Some discharge fields need a quick check before you lock in follow-up.')}
        </p>

        {flags.length > 0 && (
          <div className="space-y-2">
            <span className="flex items-center gap-1.5 text-sm font-medium text-amber-900 dark:text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              Review ({flags.length})
            </span>
            <div className="space-y-1.5">
              {flags.map((flag, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 rounded border border-amber-200 bg-amber-50 p-2.5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
                >
                  <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-700 dark:text-amber-400" />
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {missingFields.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Missing or unverified
            </span>
            <div className="flex flex-wrap gap-2">
              {missingFields.map((field, idx) => (
                <span
                  key={idx}
                  className="rounded border border-neutral-200 bg-neutral-50 px-2 py-1 text-xs text-neutral-700 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        )}

        {!isHigh && (
          <p className="text-sm text-neutral-500">
            Confirm meds and a reachable contact before assigning outreach.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
