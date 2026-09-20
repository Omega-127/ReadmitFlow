'use client';

import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Info,
  ShieldAlert,
  ShieldCheck,
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

  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-lg ${
                confidenceLevel === 'high'
                  ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
              }`}
            >
              {confidenceLevel === 'high' ? (
                <ShieldCheck className="h-4 w-4" />
              ) : (
                <ShieldAlert className="h-4 w-4" />
              )}
            </span>
            <div>
              <CardTitle className="text-base font-bold">
                Model Confidence & Data Completeness
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Safety safeguards verifying record integrity prior to care intervention assignment
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${badgeConfig.bg} ${badgeConfig.text} ${badgeConfig.border}`}
          >
            {badgeConfig.label}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-3.5">
        {/* Confidence Summary Statement */}
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/40 p-3.5 text-xs space-y-1 border border-slate-100 dark:border-slate-800">
          <span className="font-semibold text-slate-800 dark:text-slate-200 block">
            Assessment Completeness:
          </span>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
            {confidence?.summary ||
              (confidenceLevel === 'high'
                ? 'All required demographic, clinical comorbidity, and inpatient billing fields are verified against synthetic EHR standards.'
                : 'One or more clinical context fields require reviewer confirmation before assigning irreversible discharge pathways.')}
          </p>
        </div>

        {/* Quality Flags / Warnings */}
        {flags.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
              <span>Active Data Completeness Flags ({flags.length})</span>
            </span>
            <div className="space-y-1">
              {flags.map((flag, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2 rounded bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200"
                >
                  <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{flag}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Fields Checklist */}
        {missingFields.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-blue-500" />
              <span>Unverified Discharge Fields</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {missingFields.map((field, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  {field}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Clinical Guard Disclaimer */}
        <div className="p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 text-[11px] text-slate-500 dark:text-slate-400 space-y-1">
          <p className="font-medium text-slate-700 dark:text-slate-300">
            Confidence Guard Protocol:
          </p>
          <p>
            When confidence is flagged as "Review Needed", care coordinators are prompted to inspect medication regimens and social support systems at bedside prior to dispatching mobile outreach teams.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
