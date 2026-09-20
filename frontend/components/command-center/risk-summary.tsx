'use client';

import React from 'react';
import {
  AlertCircle,
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
      title: 'Urgent Action Required',
      value: stats.highRiskNeedingAction ?? stats.highRisk,
      subtext: 'High-risk patients pending intervention',
      icon: AlertCircle,
      badgeText: '<24h Target',
      color: 'text-rose-700 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      border: 'border-rose-300 dark:border-rose-800',
      badgeBg: 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300',
    },
    {
      title: 'Monitored Inpatient Cohort',
      value: stats.total,
      subtext: `${stats.highRisk} High • ${stats.mediumRisk} Medium • ${stats.lowRisk} Low`,
      icon: Users,
      badgeText: 'Active Triage',
      color: 'text-blue-700 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      border: 'border-slate-200 dark:border-slate-800',
      badgeBg: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
    },
    {
      title: 'Discharge Interventions',
      value: stats.actionsPending + stats.inProgress,
      subtext: `${stats.inProgress} in progress, ${stats.completed ?? 0} completed`,
      icon: Clock,
      badgeText: 'Care Workflow',
      color: 'text-indigo-700 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      border: 'border-slate-200 dark:border-slate-800',
      badgeBg: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    },
    {
      title: 'Clinician Overrides Logged',
      value: stats.overridden,
      subtext: 'Audited staff tier adjustments',
      icon: RotateCcw,
      badgeText: 'Accountable CDS',
      color: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      border: 'border-slate-200 dark:border-slate-800',
      badgeBg: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    },
  ];

  return (
    <div className="space-y-4">
      {/* 4 Clinical Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <Card
              key={idx}
              className={`border ${kpi.border} bg-white dark:bg-slate-900 shadow-sm transition-colors`}
            >
              <CardContent className="p-4 sm:p-5 flex flex-col justify-between h-full space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                    {kpi.title}
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${kpi.badgeBg}`}>
                    {kpi.badgeText}
                  </span>
                </div>

                <div className="flex items-baseline justify-between pt-1">
                  <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
                    {isLoading ? '—' : kpi.value}
                  </span>
                  <div className={`p-2 rounded-md ${kpi.bg} ${kpi.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-2">
                  {kpi.subtext}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Cohort Risk Tier Breakdown Progress Bar */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <CardContent className="p-4 sm:p-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800 text-xs">
            <div>
              <span className="font-bold text-slate-900 dark:text-slate-100">
                Cohort Stratification Breakdown
              </span>
              <span className="text-slate-500 dark:text-slate-400 ml-2">
                Active clinical triage targets across {stats.total} patients
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300">
                <span className="h-2.5 w-2.5 rounded-sm bg-rose-600"></span>
                High: {stats.highRisk} ({highPct.toFixed(0)}%) • &lt;24h
              </span>
              <span className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                <span className="h-2.5 w-2.5 rounded-sm bg-amber-500"></span>
                Medium: {stats.mediumRisk} ({medPct.toFixed(0)}%) • 48-72h
              </span>
              <span className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-600"></span>
                Low: {stats.lowRisk} ({lowPct.toFixed(0)}%) • Routine
              </span>
            </div>
          </div>

          <div>
            <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800 overflow-hidden flex border border-slate-200 dark:border-slate-700">
              <div
                style={{ width: `${highPct}%` }}
                className="bg-rose-600 h-full"
                title={`High Risk: ${highPct.toFixed(1)}%`}
              />
              <div
                style={{ width: `${medPct}%` }}
                className="bg-amber-500 h-full"
                title={`Medium Risk: ${medPct.toFixed(1)}%`}
              />
              <div
                style={{ width: `${lowPct}%` }}
                className="bg-emerald-600 h-full"
                title={`Low Risk: ${lowPct.toFixed(1)}%`}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
