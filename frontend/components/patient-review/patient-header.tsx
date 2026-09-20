'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Building2,
  Calendar,
  CreditCard,
  Droplets,
  HeartPulse,
  RotateCcw,
  ShieldAlert,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Patient, RiskTier } from '@/lib/types';
import {
  formatCurrency,
  formatDate,
  formatScore,
  getTierConfig,
} from '@/lib/formatters';

interface PatientHeaderProps {
  patient: Patient;
  effectiveTier: RiskTier;
  isOverridden: boolean;
  originalTier: RiskTier;
  onOpenOverride: () => void;
}

export function PatientHeader({
  patient,
  effectiveTier,
  isOverridden,
  originalTier,
  onOpenOverride,
}: PatientHeaderProps) {
  const tierConfig = getTierConfig(effectiveTier);

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5 sm:p-6">
      {/* Back button & MRN */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs text-slate-600 dark:text-slate-300"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Queue</span>
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {patient.display_name}
              </h2>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                {patient.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Synthetic Patient Profile • Decision Support Only
            </p>
          </div>
        </div>

        {/* Override Button & Current Tier Callout */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg border ${tierConfig.badgeBg} ${tierConfig.badgeText} ${tierConfig.border}`}
            >
              <span className={`h-2 w-2 rounded-full ${tierConfig.dotBg}`}></span>
              <span className="font-bold text-xs uppercase tracking-wide">
                {tierConfig.label}
              </span>
            </div>

            {isOverridden && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                <RotateCcw className="h-3 w-3" />
                <span>Overridden (Model: {originalTier.toUpperCase()})</span>
              </span>
            )}
          </div>

          <Button
            onClick={onOpenOverride}
            variant="outline"
            size="sm"
            className="h-9 gap-1.5 text-xs font-semibold border-amber-300 dark:border-amber-800/80 bg-amber-50/50 hover:bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5 text-amber-600" />
            <span>Override Tier</span>
          </Button>
        </div>
      </div>

      {/* Patient Demographic & Admission Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-4 text-xs">
        <div>
          <span className="text-slate-400 dark:text-slate-500 font-medium block">
            Age & Gender
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block text-sm">
            {patient.age} yrs • {patient.gender}
          </span>
        </div>

        <div>
          <span className="text-slate-400 dark:text-slate-500 font-medium block">
            Primary Condition
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block text-sm flex items-center gap-1">
            <HeartPulse className="h-3.5 w-3.5 text-rose-500" />
            {patient.medical_condition}
          </span>
        </div>

        <div>
          <span className="text-slate-400 dark:text-slate-500 font-medium block">
            Admission Context
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block text-sm">
            {patient.admission_type} ({formatDate(patient.admission_date)})
          </span>
        </div>

        <div>
          <span className="text-slate-400 dark:text-slate-500 font-medium block">
            Discharge Date
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block text-sm">
            {formatDate(patient.discharge_date)}
          </span>
        </div>

        <div>
          <span className="text-slate-400 dark:text-slate-500 font-medium block">
            Hospital / Facility
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block text-sm truncate" title={patient.hospital}>
            {patient.hospital}
          </span>
        </div>

        <div>
          <span className="text-slate-400 dark:text-slate-500 font-medium block">
            Payer & Billing
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 block text-sm truncate">
            {patient.insurance_provider} • {formatCurrency(patient.billing_amount)}
          </span>
        </div>
      </div>

      {/* Medication & Lab Summary */}
      {(patient.medication || patient.test_results) && (
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-600 dark:text-slate-400">
          {patient.medication && (
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Medications: </span>
              <span>{patient.medication}</span>
            </div>
          )}
          {patient.test_results && (
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Test Context: </span>
              <span className="font-mono">{patient.test_results}</span>
            </div>
          )}
          {patient.blood_type && (
            <div>
              <span className="font-semibold text-slate-700 dark:text-slate-300">Blood Type: </span>
              <span className="font-mono">{patient.blood_type}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
