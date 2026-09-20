'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { api } from '@/lib/api';
import { saveCustomPatient } from '@/lib/local-storage';
import { RISK_TIER_CONFIG } from '@/lib/constants';
import { Patient, PredictPatientInput, RiskTier } from '@/lib/types';

const CONDITIONS = [
  'Heart Failure',
  'COPD',
  'Diabetes',
  'Hypertension',
  'Pneumonia',
  'Asthma',
  'Other',
];

const ADMISSION_TYPES = ['Emergency', 'Urgent', 'Elective', 'Inpatient'];
const INSURERS = ['Medicare', 'Medicaid', 'Aetna', 'Blue Cross', 'UnitedHealthcare', 'Cigna'];

function normalizeTier(tier: string): RiskTier {
  const t = tier.toLowerCase();
  if (t === 'high' || t === 'medium' || t === 'low') return t;
  return 'medium';
}

function buildPatientId(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `PT-S${n}`;
}

export function AddPatientDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [age, setAge] = useState('72');
  const [gender, setGender] = useState('Female');
  const [medicalCondition, setMedicalCondition] = useState('Heart Failure');
  const [admissionType, setAdmissionType] = useState('Emergency');
  const [insurance, setInsurance] = useState('Medicare');
  const [billingAmount, setBillingAmount] = useState('18500');
  const [medication, setMedication] = useState('Furosemide');

  const selectClass =
    'h-9 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const ageNum = parseInt(age, 10);
    if (!Number.isFinite(ageNum) || ageNum < 1 || ageNum > 120) {
      setError('Age must be between 1 and 120.');
      return;
    }

    const billing = billingAmount.trim() === '' ? undefined : parseFloat(billingAmount);
    if (billing !== undefined && (!Number.isFinite(billing) || billing < 0)) {
      setError('Billing amount must be zero or greater.');
      return;
    }

    const input: PredictPatientInput = {
      age: ageNum,
      gender,
      medical_condition: medicalCondition,
      admission_type: admissionType,
      insurance_provider: insurance,
      billing_amount: billing,
      medication: medication.trim() || undefined,
    };

    setIsSubmitting(true);
    try {
      const { response } = await api.predictPatient(input);
      const tier = normalizeTier(String(response.risk_tier));
      const id = buildPatientId();
      const today = new Date();
      const admit = new Date(today);
      admit.setDate(admit.getDate() - 4);
      const discharge = new Date(today);
      discharge.setDate(discharge.getDate() - 1);

      const patient: Patient = {
        id,
        display_name: `Synthetic ${id}`,
        age: ageNum,
        gender,
        medical_condition: medicalCondition,
        admission_date: admit.toISOString().split('T')[0],
        admission_type: admissionType,
        discharge_date: discharge.toISOString().split('T')[0],
        hospital: 'Demo General Hospital',
        insurance_provider: insurance,
        billing_amount: billing,
        medication: medication.trim() || undefined,
        risk_score: response.risk_score,
        risk_tier: tier,
        confidence_level: response.confidence?.level || 'review',
        confidence_flags: response.confidence?.flags || [],
        confidence: response.confidence,
        risk_drivers: response.risk_drivers || [],
        recommendation_templates: [RISK_TIER_CONFIG[tier].actionSummary],
        assigned_action_status: 'pending',
      };

      saveCustomPatient(patient);
      setOpen(false);
      router.push(`/patients/${id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Could not score this patient.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-9 gap-1.5 text-sm">
          <Plus className="h-4 w-4" />
          Score patient
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Score a synthetic patient</DialogTitle>
          <DialogDescription>
            Enter demo fields only — not real PHI. The model returns a demo risk
            score and adds the patient to your queue.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="age" className="text-sm text-neutral-600">
                Age
              </label>
              <Input
                id="age"
                type="number"
                min={1}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="gender" className="text-sm text-neutral-600">
                Sex
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={selectClass}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="condition" className="text-sm text-neutral-600">
              Primary condition
            </label>
            <select
              id="condition"
              value={medicalCondition}
              onChange={(e) => setMedicalCondition(e.target.value)}
              className={selectClass}
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="admission" className="text-sm text-neutral-600">
                Admission type
              </label>
              <select
                id="admission"
                value={admissionType}
                onChange={(e) => setAdmissionType(e.target.value)}
                className={selectClass}
              >
                {ADMISSION_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="insurance" className="text-sm text-neutral-600">
                Payer
              </label>
              <select
                id="insurance"
                value={insurance}
                onChange={(e) => setInsurance(e.target.value)}
                className={selectClass}
              >
                {INSURERS.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label htmlFor="billing" className="text-sm text-neutral-600">
                Billing amount (USD)
              </label>
              <Input
                id="billing"
                type="number"
                min={0}
                step={100}
                value={billingAmount}
                onChange={(e) => setBillingAmount(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="meds" className="text-sm text-neutral-600">
                Medication
              </label>
              <Input
                id="meds"
                value={medication}
                onChange={(e) => setMedication(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>

          {error && (
            <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Scoring…
                </>
              ) : (
                'Score & open'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
