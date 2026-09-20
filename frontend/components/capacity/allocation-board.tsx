'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  PhoneCall,
  Stethoscope,
  Truck,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDemoWorkflow } from '@/hooks/use-demo-workflow';
import { usePatients } from '@/hooks/use-patients';

export function AllocationBoard() {
  const { capacityAllocations } = useDemoWorkflow();
  const { stats } = usePatients();

  const totalAllocated = capacityAllocations.reduce((sum, a) => sum + a.allocated, 0);
  const totalCapacity = capacityAllocations.reduce((sum, a) => sum + a.capacity, 0);
  const overallPct = totalCapacity > 0 ? (totalAllocated / totalCapacity) * 100 : 0;
  const hasOverCapacity = capacityAllocations.some((a) => a.is_over_capacity);

  const icons = [PhoneCall, Stethoscope, Truck, Users];

  return (
    <div className="space-y-6 rounded-md border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-col gap-2 border-b border-neutral-100 pb-4 dark:border-neutral-800 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-neutral-900 dark:text-white">
            Today&apos;s slots
          </h2>
          <p className="mt-0.5 text-sm text-neutral-500">
            Assigned work vs daily limits
          </p>
        </div>
        <p
          className={`text-sm font-medium ${
            hasOverCapacity
              ? 'text-rose-700 dark:text-rose-400'
              : 'text-neutral-600 dark:text-neutral-400'
          }`}
        >
          {hasOverCapacity ? 'Over capacity on at least one category' : 'Within daily limits'}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4 text-sm">
        <div>
          <p className="text-neutral-500">Used</p>
          <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-neutral-900 dark:text-white">
            {totalAllocated}
            <span className="text-sm font-normal text-neutral-500"> / {totalCapacity}</span>
          </p>
        </div>
        <div>
          <p className="text-neutral-500">Utilization</p>
          <p
            className={`mt-1 font-mono text-xl font-semibold tabular-nums ${
              overallPct > 100
                ? 'text-rose-700'
                : overallPct > 80
                ? 'text-amber-700'
                : 'text-neutral-900 dark:text-white'
            }`}
          >
            {overallPct.toFixed(0)}%
          </p>
        </div>
        <div>
          <p className="text-neutral-500">High risk in queue</p>
          <p className="mt-1 font-mono text-xl font-semibold tabular-nums text-rose-700 dark:text-rose-400">
            {stats.highRisk}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wide text-neutral-500">
          By type
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {capacityAllocations.map((alloc, idx) => {
            const Icon = icons[idx % icons.length];
            const isOver = alloc.is_over_capacity;
            const isWarning = !isOver && alloc.utilization_pct >= 75;

            return (
              <div
                key={idx}
                className={`rounded-md border p-4 ${
                  isOver
                    ? 'border-rose-300 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/20'
                    : 'border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-500" />
                    <div>
                      <h4 className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {alloc.slot_type}
                      </h4>
                      <p className="text-xs text-neutral-500">
                        {alloc.allocated} used · {Math.max(0, alloc.capacity - alloc.allocated)} left
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-mono text-sm font-semibold tabular-nums ${
                        isOver
                          ? 'text-rose-700 dark:text-rose-400'
                          : isWarning
                          ? 'text-amber-700 dark:text-amber-400'
                          : 'text-neutral-700 dark:text-neutral-300'
                      }`}
                    >
                      {alloc.allocated}/{alloc.capacity}
                    </span>
                  </div>
                </div>

                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-sm bg-neutral-200 dark:bg-neutral-700">
                  <div
                    style={{ width: `${Math.min(100, alloc.utilization_pct)}%` }}
                    className={`h-full ${
                      isOver ? 'bg-rose-600' : isWarning ? 'bg-amber-500' : 'bg-neutral-700 dark:bg-neutral-400'
                    }`}
                  />
                </div>

                {isOver && (
                  <p className="mt-2 flex items-start gap-1 text-xs text-rose-700 dark:text-rose-300">
                    <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                    Over the daily limit — raise capacity or reassign work.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-col gap-3 border-t border-neutral-100 pt-4 text-sm dark:border-neutral-800 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-neutral-600 dark:text-neutral-400">
          Prefer rapid outreach for high-risk patients before filling routine call slots.
        </p>
        <Link href="/" className="shrink-0">
          <Button size="sm" variant="outline" className="h-8 gap-1 text-sm">
            Patient queue
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
