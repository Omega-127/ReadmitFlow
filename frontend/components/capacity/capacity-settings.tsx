'use client';

import React, { useState } from 'react';
import { Check, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { CapacitySettings } from '@/lib/types';
import { DEFAULT_CAPACITY_SETTINGS } from '@/lib/constants';
import { useDemoWorkflow } from '@/hooks/use-demo-workflow';

export function CapacitySettingsComponent() {
  const { capacity, updateCapacitySettings } = useDemoWorkflow();

  const [settings, setSettings] = useState<CapacitySettings>(capacity);
  const [savedMsg, setSavedMsg] = useState(false);

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

  const fields = [
    {
      key: 'follow_up_call_slots' as const,
      label: 'Follow-up calls',
      help: 'Phone or video checks within ~48 hours',
      max: 40,
      min: 2,
    },
    {
      key: 'specialist_review_slots' as const,
      label: 'Specialist chart reviews',
      help: 'Secondary physician review',
      max: 20,
      min: 1,
    },
    {
      key: 'rapid_outreach_slots' as const,
      label: 'Rapid outreach',
      help: 'Home / mobile team visits',
      max: 15,
      min: 1,
    },
    {
      key: 'nurse_consult_slots' as const,
      label: 'Nurse consults',
      help: 'Med reconciliation and education',
      max: 30,
      min: 2,
    },
  ];

  return (
    <div className="rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-3 border-b border-neutral-200 px-5 py-4 dark:border-neutral-800">
        <div>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
            Daily limits
          </h2>
          <p className="mt-0.5 text-sm text-neutral-500">
            How many slots each category can take
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleResetDefaults}
          className="h-8 gap-1 text-sm"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Defaults
        </Button>
      </div>

      <div className="space-y-5 p-5">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Presets
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => applyPreset(16, 6, 4, 10)}
              className="rounded-md border border-neutral-200 px-2 py-2 text-sm text-neutral-800 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Standard
            </button>
            <button
              type="button"
              onClick={() => applyPreset(24, 10, 8, 16)}
              className="rounded-md border border-neutral-200 px-2 py-2 text-sm text-neutral-800 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Busy
            </button>
            <button
              type="button"
              onClick={() => applyPreset(8, 3, 2, 6)}
              className="rounded-md border border-neutral-200 px-2 py-2 text-sm text-neutral-800 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Light
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          {fields.map((field) => (
            <div key={field.key} className="space-y-2">
              <div className="flex items-start justify-between gap-3 text-sm">
                <div>
                  <p className="font-medium text-neutral-800 dark:text-neutral-200">
                    {field.label}
                  </p>
                  <p className="text-xs text-neutral-500">{field.help}</p>
                </div>
                <span className="shrink-0 font-mono text-sm tabular-nums text-neutral-700 dark:text-neutral-300">
                  {settings[field.key]}/day
                </span>
              </div>
              <Slider
                value={[settings[field.key]]}
                max={field.max}
                min={field.min}
                step={1}
                onValueChange={(val) =>
                  setSettings({ ...settings, [field.key]: val[0] })
                }
              />
            </div>
          ))}

          <div className="flex items-center justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
            {savedMsg ? (
              <span className="flex items-center gap-1 text-sm text-emerald-700 dark:text-emerald-400">
                <Check className="h-3.5 w-3.5" />
                Saved
              </span>
            ) : (
              <span className="text-xs text-neutral-400">Applies to overload warnings</span>
            )}

            <Button type="submit" className="h-9 gap-1.5 text-sm">
              <Save className="h-3.5 w-3.5" />
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
