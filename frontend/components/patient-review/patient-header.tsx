'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    <div className="rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-col gap-4 border-b border-neutral-200 px-5 py-4 dark:border-neutral-800 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/">
            <Button variant="outline" size="sm" className="h-8 gap-1 text-sm">
              <ArrowLeft className="h-3.5 w-3.5" />
              Queue
            </Button>
          </Link>

          {totalPatients && totalPatients > 1 && (
            <div className="flex items-center gap-1 border-l border-neutral-200 pl-3 dark:border-neutral-700">
              {prevPatientId ? (
                <Link href={`/patients/${prevPatientId}`}>
                  <Button variant="outline" size="sm" className="h-8 px-2 text-sm">
                    Prev
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled className="h-8 px-2 text-sm opacity-40">
                  Prev
                </Button>
              )}
              <span className="px-1 font-mono text-xs text-neutral-500">
                {(currentIndex ?? 0) + 1}/{totalPatients}
              </span>
              {nextPatientId ? (
                <Link href={`/patients/${nextPatientId}`}>
                  <Button variant="outline" size="sm" className="h-8 px-2 text-sm">
                    Next
                  </Button>
                </Link>
              ) : (
                <Button variant="outline" size="sm" disabled className="h-8 px-2 text-sm opacity-40">
                  Next
                </Button>
              )}
            </div>
          )}

          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <h1 className="text-xl font-semibold text-neutral-900 dark:text-white">
                {patient.display_name}
              </h1>
              <span className="font-mono text-sm text-neutral-500">{patient.id}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-sm">
            <span className={`inline-block h-2 w-2 ${tierConfig.dotBg}`} />
            <span className="font-medium">{tierConfig.label}</span>
            <span className="font-mono text-neutral-600 dark:text-neutral-400">
              {formatScore(patient.risk_score)}
            </span>
          </div>

          {isOverridden && (
            <span className="text-sm text-amber-800 dark:text-amber-400">
              Overridden (was {originalTier})
            </span>
          )}

          <Button
            onClick={onOpenOverride}
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-sm"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Override
          </Button>
        </div>
      </div>

      <dl className="grid grid-cols-2 gap-4 px-5 py-4 text-sm sm:grid-cols-3 lg:grid-cols-6">
        <div>
          <dt className="text-neutral-500">Age / sex</dt>
          <dd className="mt-0.5 font-medium text-neutral-800 dark:text-neutral-200">
            {patient.age} · {patient.gender}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Condition</dt>
          <dd className="mt-0.5 font-medium text-neutral-800 dark:text-neutral-200">
            {patient.medical_condition}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Admission</dt>
          <dd className="mt-0.5 font-medium text-neutral-800 dark:text-neutral-200">
            {patient.admission_type} · {formatDate(patient.admission_date)}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Discharge</dt>
          <dd className="mt-0.5 font-medium text-neutral-800 dark:text-neutral-200">
            {formatDate(patient.discharge_date)}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Hospital</dt>
          <dd className="mt-0.5 truncate font-medium text-neutral-800 dark:text-neutral-200" title={patient.hospital}>
            {patient.hospital}
          </dd>
        </div>
        <div>
          <dt className="text-neutral-500">Payer</dt>
          <dd className="mt-0.5 truncate font-medium text-neutral-800 dark:text-neutral-200">
            {patient.insurance_provider} · {formatCurrency(patient.billing_amount)}
          </dd>
        </div>
      </dl>

      {(patient.medication || patient.test_results || patient.blood_type) && (
        <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-neutral-100 px-5 py-3 text-sm text-neutral-600 dark:border-neutral-800 dark:text-neutral-400">
          {patient.medication && (
            <p>
              <span className="font-medium text-neutral-700 dark:text-neutral-300">Meds: </span>
              {patient.medication}
            </p>
          )}
          {patient.test_results && (
            <p>
              <span className="font-medium text-neutral-700 dark:text-neutral-300">Labs: </span>
              <span className="font-mono">{patient.test_results}</span>
            </p>
          )}
          {patient.blood_type && (
            <p>
              <span className="font-medium text-neutral-700 dark:text-neutral-300">Blood: </span>
              <span className="font-mono">{patient.blood_type}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
