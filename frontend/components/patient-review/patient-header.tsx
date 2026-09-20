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
  prevPatientId?: string | null;
  nextPatientId?: string | null;
  currentIndex?: number;
  totalPatients?: number;
}

export function PatientHeader({
  patient,
  effectiveTier,
  isOverridden,
  originalTier,
  onOpenOverride,
  prevPatientId,
  nextPatientId,
  currentIndex,
  totalPatients,
}: PatientHeaderProps) {
  const tierConfig = getTierConfig(effectiveTier);

  return (
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm p-5">
      {/* Top Bar: Navigation, Title & Override */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Queue</span>
            </Button>
          </Link>

          {/* Previous / Next Patient Quick Navigation */}
          {totalPatients && totalPatients > 1 && (
            <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-3">
              {prevPatientId ? (
                <Link href={`/patients/${prevPatientId}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs font-medium text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                    title="Previous Patient in Queue"
                  >
                    <span>&larr; Prev</span>
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="h-8 px-2 text-xs opacity-40 border-slate-200 dark:border-slate-800"
                >
                  <span>&larr; Prev</span>
                </Button>
              )}

              <span className="text-[11px] font-mono text-slate-500 px-1">
                {(currentIndex ?? 0) + 1} of {totalPatients}
              </span>

              {nextPatientId ? (
                <Link href={`/patients/${nextPatientId}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-2 text-xs font-medium text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
                    title="Next Patient in Queue"
                  >
                    <span>Next &rarr;</span>
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="h-8 px-2 text-xs opacity-40 border-slate-200 dark:border-slate-800"
                >
                  <span>Next &rarr;</span>
                </Button>
              )}
            </div>
          )}

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {patient.display_name}
              </h1>
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-700">
                {patient.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Synthetic Clinical Record • Post-Acute Decision Support
            </p>
          </div>
        </div>

        {/* Override Button & Current Tier Callout */}
        <div className="flex items-center gap-2.5 self-start md:self-center flex-wrap">
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded border ${tierConfig.badgeBg} ${tierConfig.badgeText} ${tierConfig.border}`}
          >
            <span className={`h-2 w-2 rounded-full ${tierConfig.dotBg}`}></span>
            <span className="font-bold text-xs uppercase tracking-wide">
              {tierConfig.label}
            </span>
            <span className="text-xs font-mono font-bold">
              ({formatScore(patient.risk_score)})
            </span>
          </div>

          {isOverridden && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <RotateCcw className="h-3 w-3" />
              <span>Overridden (Model: {originalTier.toUpperCase()})</span>
            </span>
          )}

          <Button
            onClick={onOpenOverride}
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs font-semibold border-amber-300 dark:border-amber-800 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200"
          >
            <RotateCcw className="h-3.5 w-3.5 text-amber-700" />
            <span>Override Priority</span>
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
