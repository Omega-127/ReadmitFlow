'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Patient, RiskTier } from '@/lib/types';
import { useDemoWorkflow } from '@/hooks/use-demo-workflow';
import { usePatients } from '@/hooks/use-patients';
import { PatientHeader } from '@/components/patient-review/patient-header';
import { RiskDrivers } from '@/components/patient-review/risk-drivers';
import { ConfidenceGuard } from '@/components/patient-review/confidence-guard';
import { ActionForm } from '@/components/patient-review/action-form';
import { OverrideDialog } from '@/components/patient-review/override-dialog';
import { AuditTimeline } from '@/components/patient-review/audit-timeline';
import { Button } from '@/components/ui/button';
import { formatScore, getTierConfig } from '@/lib/formatters';

export default function PatientReviewPage() {
  const params = useParams();
  const patientId = (params?.id as string) || '';

  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showOverrideDialog, setShowOverrideDialog] = useState(false);

  const {
    getPatientOverride,
    getPatientAudit,
    isReady,
  } = useDemoWorkflow();

  const { allPatients } = usePatients();

  const currentIndex = allPatients.findIndex((p) => p.id === patientId);
  const prevPatientId = currentIndex > 0 ? allPatients[currentIndex - 1].id : null;
  const nextPatientId =
    currentIndex >= 0 && currentIndex < allPatients.length - 1
      ? allPatients[currentIndex + 1].id
      : null;

  useEffect(() => {
    async function loadPatient() {
      if (!patientId) return;
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.getPatientById(patientId);
        if (res.response.patient) {
          setPatient(res.response.patient);
        } else {
          setError(`No patient matching "${patientId}".`);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load patient.');
      } finally {
        setIsLoading(false);
      }
    }

    loadPatient();
  }, [patientId]);

  if (isLoading || !isReady) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
        <p className="text-sm text-neutral-500">Loading patient…</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="mx-auto max-w-md space-y-4 rounded-md border border-rose-300 bg-rose-50 p-8 text-center dark:border-rose-900 dark:bg-rose-950/30">
        <AlertCircle className="mx-auto h-8 w-8 text-rose-600" />
        <div>
          <h3 className="font-medium text-rose-900 dark:text-rose-100">Patient not found</h3>
          <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">
            {error || `No record for "${patientId}".`}
          </p>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-2 text-sm">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to queue
          </Button>
        </Link>
      </div>
    );
  }

  const patientOverride = getPatientOverride(patient.id);
  const effectiveTier: RiskTier = patientOverride ? patientOverride.selected_tier : patient.risk_tier;
  const isOverridden = !!patientOverride;
  const auditEvents = getPatientAudit(patient.id);
  const tierConfig = getTierConfig(effectiveTier);

  return (
    <div className="space-y-6">
      <PatientHeader
        patient={patient}
        effectiveTier={effectiveTier}
        isOverridden={isOverridden}
        originalTier={patient.risk_tier}
        onOpenOverride={() => setShowOverrideDialog(true)}
        prevPatientId={prevPatientId}
        nextPatientId={nextPatientId}
        currentIndex={currentIndex >= 0 ? currentIndex : undefined}
        totalPatients={allPatients.length > 0 ? allPatients.length : undefined}
      />

      <div
        className={`flex flex-col gap-3 rounded-md border px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between ${tierConfig.border} ${tierConfig.badgeBg}`}
      >
        <div>
          <p className="font-medium text-neutral-900 dark:text-neutral-100">
            {tierConfig.label} · {formatScore(patient.risk_score)} · follow up within{' '}
            {tierConfig.timeframe}
          </p>
          <p className="mt-0.5 text-neutral-700 dark:text-neutral-300">{tierConfig.description}</p>
        </div>

        {patient.recommendation_templates && patient.recommendation_templates.length > 0 && (
          <div className="shrink-0 sm:border-l sm:border-neutral-300 sm:pl-4 dark:sm:border-neutral-700">
            <p className="text-xs text-neutral-500">Suggested</p>
            <ul className="mt-1 space-y-0.5 text-sm text-neutral-800 dark:text-neutral-200">
              {patient.recommendation_templates.slice(0, 2).map((tmpl, idx) => (
                <li key={idx}>{tmpl}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className="space-y-6 lg:col-span-7">
          <RiskDrivers drivers={patient.risk_drivers} score={patient.risk_score} />
          <ConfidenceGuard
            confidence={patient.confidence}
            confidenceLevel={patient.confidence_level}
            confidenceFlags={patient.confidence_flags}
          />
        </div>
        <div className="space-y-6 lg:col-span-5">
          <ActionForm patient={patient} />
          <AuditTimeline events={auditEvents} patientId={patient.id} />
        </div>
      </div>

      <OverrideDialog
        open={showOverrideDialog}
        onOpenChange={setShowOverrideDialog}
        patient={patient}
        currentEffectiveTier={effectiveTier}
      />
    </div>
  );
}
