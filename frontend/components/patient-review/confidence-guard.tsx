'use client';

import React from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
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
  const isHigh = confidenceLevel === 'high';

  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <CardHeader className="p-5 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded font-bold border ${
                isHigh
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900'
                  : 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900'
              }`}
            >
              {isHigh ? (
                <ShieldCheck className="h-4 w-4" />
              ) : (
                <ShieldAlert className="h-4 w-4" />
              )}
            </span>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Data Completeness & Clinical Confidence Guard
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Automated record verification safeguards confirming data fidelity before outreach dispatch
              </p>
            </div>
          </div>

          <span
            className={`px-2.5 py-1 rounded text-xs font-bold border ${badgeConfig.bg} ${badgeConfig.text} ${badgeConfig.border}`}
          >
            {badgeConfig.label}
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-4">
        {/* Confidence Summary Statement */}
        <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3.5 text-xs space-y-1.5 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-slate-100">
            <FileCheck2 className="h-4 w-4 text-blue-700 dark:text-blue-400" />
            <span>Assessment Integrity Status</span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
            {confidence?.summary ||
              (isHigh
                ? 'All mandatory clinical variables (inpatient diagnosis, vitals trajectory, discharge medications, and admission type) are verified.'
                : 'Selected post-discharge care context fields require reviewer confirmation before assigning irreversible discharge pathways.')}
          </p>
        </div>

        {/* Quality Flags / Warnings */}
        {flags.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
              <span>Attention Required During Bedside Review ({flags.length})</span>
            </span>
            <div className="space-y-1.5">
              {flags.map((flag, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2 p-2.5 rounded bg-amber-50 text-amber-900 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:border-amber-900 text-xs"
                >
                  <AlertCircle className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
                  <span className="font-medium">{flag}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Fields Checklist */}
        {missingFields.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-blue-600" />
              <span>Unverified Discharge Fields</span>
            </span>
            <div className="flex flex-wrap gap-2">
              {missingFields.map((field, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-medium"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
                  {field}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Clinical Guard Protocol */}
        <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
          <p className="font-bold text-slate-800 dark:text-slate-200">
            Operational Safety Protocol:
          </p>
          <p className="leading-relaxed">
            When confidence is flagged as "Review Needed", care coordinators verify medication tolerance and caregiver contact phone numbers at bedside prior to dispatching follow-up resources.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
