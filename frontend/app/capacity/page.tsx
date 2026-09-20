import React from 'react';
import { CapacitySettingsComponent } from '@/components/capacity/capacity-settings';
import { AllocationBoard } from '@/components/capacity/allocation-board';

export default function CapacityPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          Capacity
        </h1>
        <p className="max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          Set how many follow-up slots the team can take today, then see where
          assigned work is landing.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <AllocationBoard />
        </div>
        <div className="lg:col-span-5">
          <CapacitySettingsComponent />
        </div>
      </div>
    </div>
  );
}
