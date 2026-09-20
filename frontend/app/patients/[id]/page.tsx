'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { Patient, RiskTier } from '@/lib/types';
import { useDemoWorkflow } from '@/hooks/use-demo-workflow';
import { PatientHeader } from '@/components/patient-review/patient-header';
import { RiskDrivers } from '@/components/patient-review/risk-drivers';
import { ConfidenceGuard } from '@/components/patient-review/confidence-guard';
import { ActionForm } from '@/components/patient-review/action-form';
import { OverrideDialog } from '@/components/patient-review/override-dialog';
import { AuditTimeline } from '@/components/patient-review/audit-timeline';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function PatientReviewPage() {
  const params = useParams();
  const router = useRouter();
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
          setError(`No patient record matching ID "${patientId}".`);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load patient record.');
      } finally {
        setIsLoading(false);
      }
    }

    loadPatient();
  }, [patientId]);

  if (isLoading || !isReady) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading clinical profile and audit records...</p>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <Card className="p-8 text-center max-w-lg mx-auto border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20 space-y-4">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto" />
        <div>
          <h3 className="text-base font-bold text-rose-900 dark:text-rose-100">
            Patient Record Not Found
          </h3>
          <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
            {error || `The patient identifier "${patientId}" does not exist in the active synthetic cohort.`}
          </p>
        </div>
        <Link href="/">
          <Button variant="outline" size="sm" className="gap-2 text-xs">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Triage Queue</span>
          </Button>
        </Link>
      </Card>
    );
  }

  const patientOverride = getPatientOverride(patient.id);
  const effectiveTier: RiskTier = patientOverride ? patientOverride.selected_tier : patient.risk_tier;
  const isOverridden = !!patientOverride;
  const auditEvents = getPatientAudit(patient.id);

  return (
    <div className="space-y-6">
      {/* Patient Demographic & Risk Header */}
      <PatientHeader
        patient={patient}
        effectiveTier={effectiveTier}
        isOverridden={isOverridden}
        originalTier={patient.risk_tier}
        onOpenOverride={() => setShowOverrideDialog(true)}
      />

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Risk Drivers (SHAP) & Confidence Guard */}
        <div className="lg:col-span-7 space-y-6">
          <RiskDrivers drivers={patient.risk_drivers} score={patient.risk_score} />
          <ConfidenceGuard
            confidence={patient.confidence}
            confidenceLevel={patient.confidence_level}
            confidenceFlags={patient.confidence_flags}
          />
        </div>

        {/* Right Column: Care Actions & Audit Timeline */}
        <div className="lg:col-span-5 space-y-6">
          <ActionForm patient={patient} />
          <AuditTimeline events={auditEvents} patientId={patient.id} />
        </div>
      </div>

      {/* Tier Override Modal */}
      <OverrideDialog
        open={showOverrideDialog}
        onOpenChange={setShowOverrideDialog}
        patient={patient}
        currentEffectiveTier={effectiveTier}
      />
    </div>
  );
}
