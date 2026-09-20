'use client';

import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  RotateCcw,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { usePatients } from '@/hooks/use-patients';

export function RiskSummary() {
  const { stats, isLoading } = usePatients();

  const highPct = stats.total > 0 ? (stats.highRisk / stats.total) * 100 : 0;
  const medPct = stats.total > 0 ? (stats.mediumRisk / stats.total) * 100 : 0;
  const lowPct = stats.total > 0 ? (stats.lowRisk / stats.total) * 100 : 0;

  const kpis = [
    {
      title: 'Monitored Cohort',
      value: stats.total,
      subtext: 'Synthetic inpatient records',
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-blue-200/80 dark:border-blue-800/60',
    },
    {
      title: 'High Risk Triage',
      value: stats.highRisk,
      subtext: `${highPct.toFixed(0)}% of active cohort`,
      icon: ShieldAlert,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-200/80 dark:border-rose-800/60',
      alert: stats.highRisk > 0,
    },
    {
      title: 'Clinician Overrides',
      value: stats.overridden,
      subtext: 'Audited tier adjustments',
      icon: RotateCcw,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-amber-200/80 dark:border-amber-800/60',
    },
    {
      title: 'Actions Pending',
      value: stats.actionsPending,
      subtext: `${stats.inProgress} in progress`,
      icon: Clock,
      color: 'text-indigo-600 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      border: 'border-indigo-200/80 dark:border-indigo-800/60',
    },
  ];

  return (
    <div className="space-y-4">
      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={idx}
              className={`border ${kpi.border} shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`}
            >
              <CardContent className="p-5 flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {kpi.title}
                  </p>
                  <h4 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mt-1">
                    {isLoading ? '—' : kpi.value}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {kpi.subtext}
                  </p>
                </div>
                <div
                  className={`p-2.5 rounded-xl ${kpi.bg} ${kpi.color} ring-1 ring-black/5 dark:ring-white/10`}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cohort Risk Tier Breakdown Progress Bar */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800/80 text-xs">
            <div>
              <span className="font-semibold text-slate-900 dark:text-slate-100">
                Cohort Stratification Breakdown
              </span>
              <span className="text-slate-500 dark:text-slate-400 ml-2">
                (Triage distribution based on current effective tiers)
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium">
              <span className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span>
                High Risk: {stats.highRisk} ({highPct.toFixed(0)}%)
              </span>
              <span className="flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                Medium Risk: {stats.mediumRisk} ({medPct.toFixed(0)}%)
              </span>
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                Low Risk: {stats.lowRisk} ({lowPct.toFixed(0)}%)
              </span>
            </div>
          </div>

          <div className="mt-3">
            <div className="h-2.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${highPct}%` }}
                className="bg-rose-500 h-full transition-all duration-500"
                title={`High Risk: ${highPct.toFixed(1)}%`}
              />
              <div
                style={{ width: `${medPct}%` }}
                className="bg-amber-500 h-full transition-all duration-500"
                title={`Medium Risk: ${medPct.toFixed(1)}%`}
              />
              <div
                style={{ width: `${lowPct}%` }}
                className="bg-emerald-500 h-full transition-all duration-500"
                title={`Low Risk: ${lowPct.toFixed(1)}%`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
