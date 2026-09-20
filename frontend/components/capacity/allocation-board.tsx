'use client';

import React from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Gauge,
  PhoneCall,
  ShieldAlert,
  Stethoscope,
  Truck,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDemoWorkflow } from '@/hooks/use-demo-workflow';
import { usePatients } from '@/hooks/use-patients';

export function AllocationBoard() {
  const { capacityAllocations, allActions } = useDemoWorkflow();
  const { stats } = usePatients();

  const totalAllocated = capacityAllocations.reduce((sum, a) => sum + a.allocated, 0);
  const totalCapacity = capacityAllocations.reduce((sum, a) => sum + a.capacity, 0);
  const overallPct = totalCapacity > 0 ? (totalAllocated / totalCapacity) * 100 : 0;
  const hasOverCapacity = capacityAllocations.some((a) => a.is_over_capacity);

  const icons = [PhoneCall, Stethoscope, Truck, Users];

  return (
    <div className="space-y-6">
      {/* Overall Utilization Card */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <Gauge className="h-4 w-4" />
              </span>
              <div>
                <CardTitle className="text-base font-bold">
                  Care Team Slot Allocation Board
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Live workload distribution across active post-acute intervention types
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {hasOverCapacity ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-200 border border-rose-300 dark:border-rose-800">
                  <AlertCircle className="h-3.5 w-3.5 text-rose-700" />
                  <span>Over Capacity Warning</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                  <span>Within Operational Capacity</span>
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-5 space-y-6">
          {/* Top Level Utilization Metric */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-4 border-b border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Total Allocated Slots</span>
              <span className="text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1 block">
                {totalAllocated} <span className="text-sm font-normal text-slate-500">/ {totalCapacity} slots</span>
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">Overall Utilization</span>
              <span className={`text-2xl font-bold mt-1 block ${
                overallPct > 100 ? 'text-rose-600' : overallPct > 80 ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {overallPct.toFixed(0)}%
              </span>
            </div>

            <div>
              <span className="text-slate-400 block font-medium">High Risk Unassigned Triage</span>
              <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 mt-1 block">
                {stats.highRisk} patients
              </span>
            </div>
          </div>

          {/* Allocation Categories Breakdown */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Intervention Slot Allocation by Category
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {capacityAllocations.map((alloc, idx) => {
                const Icon = icons[idx % icons.length];
                const isOver = alloc.is_over_capacity;
                const isWarning = !isOver && alloc.utilization_pct >= 75;

                return (
                  <div
                    key={idx}
                    className={`rounded-xl border p-4 space-y-3 transition-colors ${
                      isOver
                        ? 'border-rose-300 bg-rose-50/40 dark:border-rose-900/60 dark:bg-rose-950/20'
                        : isWarning
                        ? 'border-amber-300 bg-amber-50/30 dark:border-amber-900/60 dark:bg-amber-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`p-2 rounded-lg ${
                            isOver
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-slate-200/80 text-slate-700 dark:bg-slate-700 dark:text-slate-200'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h5 className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                            {alloc.slot_type}
                          </h5>
                          <p className="text-[11px] text-slate-500">
                            {alloc.allocated} active • {Math.max(0, alloc.capacity - alloc.allocated)} remaining
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span
                          className={`font-mono font-bold text-sm ${
                            isOver
                              ? 'text-rose-700 dark:text-rose-400'
                              : isWarning
                              ? 'text-amber-700 dark:text-amber-400'
                              : 'text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {alloc.allocated} / {alloc.capacity}
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          {alloc.utilization_pct.toFixed(0)}% full
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        style={{ width: `${Math.min(100, alloc.utilization_pct)}%` }}
                        className={`h-full transition-all duration-300 ${
                          isOver
                            ? 'bg-rose-600'
                            : isWarning
                            ? 'bg-amber-500'
                            : 'bg-blue-600'
                        }`}
                      />
                    </div>

                    {isOver && (
                      <p className="text-[11px] text-rose-700 dark:text-rose-300 flex items-center gap-1 font-semibold">
                        <AlertTriangle className="h-3 w-3 shrink-0 text-rose-600" />
                        <span>Exceeds daily target. Adjust limits or reassign non-urgent slots.</span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Operational Advisory */}
          <div className="rounded-lg bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <span className="font-semibold text-blue-900 dark:text-blue-200">
                Care Capacity Triage Recommendation:
              </span>
              <p className="text-blue-800/90 dark:text-blue-300/90 text-[11px]">
                Prioritize Rapid Clinical Outreach for patients with both High Risk scores and active social vulnerability flags before allocating remaining follow-up call slots.
              </p>
            </div>
            <Link href="/" className="shrink-0">
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1 border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-800 dark:text-blue-300">
                <span>View Triage Queue</span>
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
