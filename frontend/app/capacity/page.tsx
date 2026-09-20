import React from 'react';
import { Sliders, Users } from 'lucide-react';
import { CapacitySettingsComponent } from '@/components/capacity/capacity-settings';
import { AllocationBoard } from '@/components/capacity/allocation-board';

export default function CapacityPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <span>Care Capacity Planner</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              Operational Allocation
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure daily clinical staff follow-up bandwidth, track allocated intervention slots, and prevent care coordinator overload.
          </p>
        </div>
      </div>

      {/* Main Grid: Allocation Board & Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 space-y-6">
          <AllocationBoard />
        </div>
        <div className="lg:col-span-5 space-y-6">
          <CapacitySettingsComponent />
        </div>
      </div>
    </div>
  );
}
