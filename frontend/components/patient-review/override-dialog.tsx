'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Check,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Patient, RiskTier } from '@/lib/types';
import { OVERRIDE_REASON_OPTIONS, RISK_TIER_CONFIG } from '@/lib/constants';
import { useDemoWorkflow } from '@/hooks/use-demo-workflow';

interface OverrideDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
  currentEffectiveTier: RiskTier;
}

export function OverrideDialog({
  open,
  onOpenChange,
  patient,
  currentEffectiveTier,
}: OverrideDialogProps) {
  const { addOverride } = useDemoWorkflow();

  const [selectedTier, setSelectedTier] = useState<RiskTier>(() => {
    // Default to the next tier or alternate
    return currentEffectiveTier === 'high' ? 'medium' : 'high';
  });
  const [selectedPresetReason, setSelectedPresetReason] = useState<string>(
    OVERRIDE_REASON_OPTIONS[0]
  );
  const [customRationale, setCustomRationale] = useState<string>('');
  const [clinicianName, setClinicianName] = useState<string>(
    'Dr. Marcus Vance, PharmD'
  );
  const [errorMsg, setErrorMsg] = useState<string>('');

  const tiers: RiskTier[] = ['high', 'medium', 'low'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const fullReason =
      selectedPresetReason === 'Other clinical rationale (detailed below)'
        ? customRationale.trim()
        : customRationale.trim()
        ? `${selectedPresetReason} — ${customRationale.trim()}`
        : selectedPresetReason;

    if (!fullReason) {
      setErrorMsg('A detailed clinical rationale is required to override the triage priority.');
      return;
    }

    if (!clinicianName.trim()) {
      setErrorMsg('Clinician name or credentialed role is required for audit logging.');
      return;
    }

    addOverride({
      patient_id: patient.id,
      previous_tier: currentEffectiveTier,
      selected_tier: selectedTier,
      reason: fullReason,
      clinician_name: clinicianName.trim(),
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DialogHeader>
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                <RotateCcw className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle>Override Clinical Triage Priority</DialogTitle>
                <DialogDescription className="text-xs mt-0.5">
                  Escalate or downgrade risk tier for {patient.display_name} ({patient.id})
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Safety Notice */}
          <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 p-3 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2.5">
            <ShieldAlert className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-semibold block">Accountable Human Oversight:</span>
              <p className="text-[11px] leading-relaxed">
                Overrides supersede automated model outputs. All adjustments are permanently logged in the audit trail alongside the reviewer's clinical justification.
              </p>
            </div>
          </div>

          {/* Select Target Tier */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Target Priority Tier:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {tiers.map((tier) => {
                const isSelected = selectedTier === tier;
                const config = RISK_TIER_CONFIG[tier];

                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setSelectedTier(tier)}
                    className={`p-3 rounded-lg border text-center transition-all ${
                      isSelected
                        ? `ring-2 ring-blue-500 border-transparent ${config.badgeBg} ${config.badgeText} font-bold shadow-sm`
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="text-xs block capitalize">{config.label}</span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {tier === 'high' ? '<24h action' : tier === 'medium' ? '48-72h action' : 'Routine'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Select Preset Clinical Reason */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Clinical Rationale Category:
            </label>
            <select
              value={selectedPresetReason}
              onChange={(e) => setSelectedPresetReason(e.target.value)}
              className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-background px-3 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {OVERRIDE_REASON_OPTIONS.map((opt, idx) => (
                <option key={idx} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          {/* Clinical Narrative Detail */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Bedside Observation / Clinical Narrative:
            </label>
            <textarea
              rows={2}
              value={customRationale}
              onChange={(e) => setCustomRationale(e.target.value)}
              placeholder="e.g. Bedside exam shows strong family support and confirmed outpatient clinic transportation; home oxygen already active..."
              className="w-full rounded-md border border-slate-200 dark:border-slate-800 bg-background p-2.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Clinician Signature / Role */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Reviewer Name & Role:
            </label>
            <Input
              value={clinicianName}
              onChange={(e) => setClinicianName(e.target.value)}
              placeholder="e.g. Dr. Jane Doe, Attending Physician"
              className="h-9 text-xs"
              required
            />
          </div>

          {errorMsg && (
            <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>
          )}

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs gap-1.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Record Clinical Override</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
