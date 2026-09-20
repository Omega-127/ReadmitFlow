'use client';

import React, { useState } from 'react';
import {
  Check,
  RotateCcw,
  Save,
  Sliders,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { CapacitySettings } from '@/lib/types';
import { DEFAULT_CAPACITY_SETTINGS } from '@/lib/constants';
import { useDemoWorkflow } from '@/hooks/use-demo-workflow';

export function CapacitySettingsComponent() {
  const { capacity, updateCapacitySettings } = useDemoWorkflow();

  const [settings, setSettings] = useState<CapacitySettings>(capacity);
  const [savedMsg, setSavedMsg] = useState(false);

  // Synchronize when external capacity changes
  React.useEffect(() => {
    setSettings(capacity);
  }, [capacity]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCapacitySettings({
      ...settings,
      last_updated: new Date().toISOString(),
    });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const handleResetDefaults = () => {
    setSettings(DEFAULT_CAPACITY_SETTINGS);
    updateCapacitySettings(DEFAULT_CAPACITY_SETTINGS);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const applyPreset = (calls: number, specialist: number, outreach: number, consults: number) => {
    const updated = {
      follow_up_call_slots: calls,
      specialist_review_slots: specialist,
      rapid_outreach_slots: outreach,
      nurse_consult_slots: consults,
      last_updated: new Date().toISOString(),
    };
    setSettings(updated);
    updateCapacitySettings(updated);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <CardHeader className="p-5 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              <Sliders className="h-4 w-4" />
            </span>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Daily Care Team Capacity Limits
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Adjust available daily slots for transitions of care interventions
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleResetDefaults}
            className="h-8 gap-1 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            title="Reset capacity settings to defaults"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Defaults</span>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-5">
        {/* Quick Operational Presets */}
        <div className="space-y-1.5 pb-3 border-b border-slate-200 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
            Staffing Schedule Presets:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => applyPreset(16, 6, 4, 10)}
              className="px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 text-center transition-colors"
            >
              Standard Shift
            </button>
            <button
              type="button"
              onClick={() => applyPreset(24, 10, 8, 16)}
              className="px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 text-center transition-colors"
            >
              Surge / Peak
            </button>
            <button
              type="button"
              onClick={() => applyPreset(8, 3, 2, 6)}
              className="px-2.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 text-center transition-colors"
            >
              Weekend Low
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Sliders Grid */}
          <div className="space-y-5">
            {/* Follow-up Calls */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Telehealth & Care Coordinator Follow-Up Calls
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Post-discharge phone checks within 48 hours
                  </p>
                </div>
                <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900">
                  {settings.follow_up_call_slots} slots/day
                </span>
              </div>
              <Slider
                value={[settings.follow_up_call_slots]}
                max={40}
                min={2}
                step={1}
                onValueChange={(val) =>
                  setSettings({ ...settings, follow_up_call_slots: val[0] })
                }
              />
            </div>

            {/* Specialist Reviews */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Cardio-Pulmonary Specialist Chart Reviews
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Attending physician secondary chart evaluations
                  </p>
                </div>
                <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900">
                  {settings.specialist_review_slots} slots/day
                </span>
              </div>
              <Slider
                value={[settings.specialist_review_slots]}
                max={20}
                min={1}
                step={1}
                onValueChange={(val) =>
                  setSettings({ ...settings, specialist_review_slots: val[0] })
                }
              />
            </div>

            {/* Rapid Outreach */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Rapid Clinical Outreach & Home Visits
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Mobile health units for fragile or socially vulnerable patients
                  </p>
                </div>
                <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900">
                  {settings.rapid_outreach_slots} slots/day
                </span>
              </div>
              <Slider
                value={[settings.rapid_outreach_slots]}
                max={15}
                min={1}
                step={1}
                onValueChange={(val) =>
                  setSettings({ ...settings, rapid_outreach_slots: val[0] })
                }
              />
            </div>

            {/* Nurse Consultations */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Medication Reconciliation & Nurse Consults
                  </span>
                  <p className="text-[11px] text-slate-500">
                    In-depth pharmacy review and transition education
                  </p>
                </div>
                <span className="font-mono font-bold text-sm text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900">
                  {settings.nurse_consult_slots} slots/day
                </span>
              </div>
              <Slider
                value={[settings.nurse_consult_slots]}
                max={30}
                min={2}
                step={1}
                onValueChange={(val) =>
                  setSettings({ ...settings, nurse_consult_slots: val[0] })
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
            {savedMsg ? (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <Check className="h-3.5 w-3.5" />
                <span>Capacity limits updated!</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">
                Changes apply immediately to slot allocation warnings.
              </span>
            )}

            <Button
              type="submit"
              className="h-9 gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Capacity Limits</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
