'use client';

import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  FileCheck,
  HelpCircle,
  Lock,
  Scale,
  ShieldAlert,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModelEvaluationData } from '@/lib/types';

interface LimitationCardProps {
  data: ModelEvaluationData;
}

export function LimitationCard({ data }: LimitationCardProps) {
  const dataset = data.dataset_info;

  return (
    <div className="space-y-6">
      {/* Dataset & Preprocessing Card */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Database className="h-4 w-4" />
            </span>
            <div>
              <CardTitle className="text-base font-bold">
                Synthetic Dataset & Preprocessing Pipeline
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Data provenance, feature transformations, and leakage prevention
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          {dataset && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-400 block font-medium">Dataset Cohort</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 block truncate">
                  {dataset.name}
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-400 block font-medium">Sample Volume</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 block font-mono">
                  {dataset.sample_count} Admissions
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-400 block font-medium">Feature Dimension</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 block font-mono">
                  {dataset.features_count} Variables
                </span>
              </div>
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/40">
                <span className="text-slate-400 block font-medium">Target Definition</span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 mt-0.5 block truncate">
                  {dataset.target_label}
                </span>
              </div>
            </div>
          )}

          {/* Preprocessing Steps */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Validation & Pipeline Stages
            </span>
            <div className="space-y-1.5">
              {data.preprocessing_summary.map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50/60 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clinical Limitations & Bias Disclosures Card */}
      <Card className="border border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10 shadow-sm">
        <CardHeader className="p-5 pb-3 border-b border-amber-200/60 dark:border-amber-900/40">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
              <ShieldAlert className="h-4 w-4" />
            </span>
            <div>
              <CardTitle className="text-base font-bold text-amber-950 dark:text-amber-200">
                Clinical Limitations & Bias Disclosures
              </CardTitle>
              <p className="text-xs text-amber-800/80 dark:text-amber-300/80">
                Crucial boundaries required for ethical clinical decision support
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-3">
          {data.limitations.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-3 rounded-lg bg-white/70 dark:bg-slate-900/70 border border-amber-200/70 dark:border-amber-800/40 text-xs text-amber-950 dark:text-amber-200 leading-relaxed"
            >
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{item}</span>
            </div>
          ))}

          {/* Compliance Checklist */}
          <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 block">
              Healthcare Governance Checklist
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 text-blue-600" />
                <span>Zero Real PHI / Fully De-identified</span>
              </div>
              <div className="flex items-center gap-2">
                <Scale className="h-3.5 w-3.5 text-emerald-600" />
                <span>Audited Human Override Protocol</span>
              </div>
              <div className="flex items-center gap-2">
                <FileCheck className="h-3.5 w-3.5 text-indigo-600" />
                <span>Non-Diagnostic Disclaimer Active</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-teal-600" />
                <span>Safe Browser Storage Persistence</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
