'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, CheckCircle2, Clock, Info, Loader2, ShieldAlert } from 'lucide-react';
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
import { Card } from '@/components/ui/card';
import { formatScore, getTierConfig } from '@/lib/formatters';

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
  const tierConfig = getTierConfig(effectiveTier);

  return (
    <div className="space-y-6">
      {/* Patient Demographic & Risk Header with Queue Navigation */}
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

      {/* Clinical Triage Protocol Banner */}
      <div className={`p-4 rounded-lg border ${tierConfig.border} ${tierConfig.badgeBg} flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs`}>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Discharge Triage Strategy: {tierConfig.label} ({formatScore(patient.risk_score)})
            </span>
            <span className="font-semibold px-2 py-0.5 rounded text-[11px] bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700">
              Target Window: {tierConfig.timeframe}
            </span>
          </div>
          <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
            {tierConfig.description}
          </p>
        </div>

        {patient.recommendation_templates && patient.recommendation_templates.length > 0 && (
          <div className="sm:border-l sm:border-slate-300 dark:sm:border-slate-700 sm:pl-4 space-y-1 shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
              Suggested Pathways:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {patient.recommendation_templates.slice(0, 2).map((tmpl, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-medium text-[11px] border border-slate-300 dark:border-slate-700"
                >
                  {tmpl}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

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
