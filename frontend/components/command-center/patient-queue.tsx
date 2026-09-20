'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  RotateCcw,
  ShieldAlert,
  User,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePatients } from '@/hooks/use-patients';
import {
  formatDate,
  formatPercentage,
  formatScore,
  getConfidenceBadgeClasses,
  getTierConfig,
} from '@/lib/formatters';

export function PatientQueue() {
  const router = useRouter();
  const { patients, isLoading, error } = usePatients();

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 w-full bg-slate-100 dark:bg-slate-800/60 rounded-lg animate-pulse" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8 text-center border-rose-200 dark:border-rose-900 bg-rose-50/50 dark:bg-rose-950/20">
        <AlertCircle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
        <h3 className="font-bold text-rose-800 dark:text-rose-200">Unable to load patient queue</h3>
        <p className="text-sm text-rose-600 dark:text-rose-300 mt-1">{error}</p>
      </Card>
    );
  }

  if (patients.length === 0) {
    return (
      <Card className="p-12 text-center border-slate-200 dark:border-slate-800">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mx-auto mb-3">
          <User className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200">No matching patients found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          Try adjusting your search query, clearing tier filters, or switching off "Overrides Only".
        </p>
      </Card>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
      <div className="p-4 sm:px-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
            Triage Priority Queue
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Showing {patients.length} patient records sorted by current triage priority
          </p>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Decision Support Only
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-100/70 dark:bg-slate-800/60 text-[11px] font-bold tracking-wider text-slate-600 dark:text-slate-300 uppercase border-b border-slate-200 dark:border-slate-700">
              <TableHead className="w-[180px]">Patient & Demographics</TableHead>
              <TableHead className="w-[200px]">Diagnosis & Facility</TableHead>
              <TableHead className="w-[190px]">30-Day Risk Triage</TableHead>
              <TableHead className="w-[240px]">Primary Clinical Risk Driver</TableHead>
              <TableHead className="w-[180px]">Discharge Follow-Up</TableHead>
              <TableHead className="text-right w-[110px]">Triage Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => {
              const tierConfig = getTierConfig(patient.risk_tier);
              const confConfig = getConfidenceBadgeClasses(patient.confidence_level);
              const primaryDriver = patient.risk_drivers?.[0];

              return (
                <TableRow
                  key={patient.id}
                  onClick={() => router.push(`/patients/${patient.id}`)}
                  className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group border-b border-slate-100 dark:border-slate-800"
                >
                  {/* Patient & Demographics */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-bold text-xs border border-slate-200 dark:border-slate-700">
                        {patient.gender === 'Female' ? 'F' : 'M'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                          <span className="font-mono">{patient.id}</span>
                          {patient.blood_type && (
                            <span className="text-[10px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono border border-slate-200 dark:border-slate-700">
                              {patient.blood_type}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {patient.age}y • {patient.gender} • {patient.insurance_provider}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Diagnosis & Facility */}
                  <TableCell className="py-3">
                    <div className="space-y-0.5">
                      <div className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span>{patient.medical_condition}</span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                            patient.admission_type === 'Emergency'
                              ? 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
                              : patient.admission_type === 'Urgent'
                              ? 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900'
                              : 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                          }`}
                        >
                          {patient.admission_type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]" title={patient.hospital}>
                        {patient.hospital}
                      </div>
                    </div>
                  </TableCell>

                  {/* 30-Day Risk Triage */}
                  <TableCell className="py-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold border ${tierConfig.badgeBg} ${tierConfig.badgeText} ${tierConfig.border}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${tierConfig.dotBg}`}></span>
                          {tierConfig.label}
                        </span>

                        <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                          {formatScore(patient.risk_score)}
                        </span>

                        {patient.is_overridden && (
                          <span
                            className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                            title={`Clinician override from ${patient.original_risk_tier.toUpperCase()}`}
                          >
                            <RotateCcw className="h-2.5 w-2.5" />
                            Overridden
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 bg-slate-200 dark:bg-slate-700 rounded overflow-hidden">
                          <div
                            style={{ width: `${patient.risk_score * 100}%` }}
                            className={`h-full ${tierConfig.barColor}`}
                          />
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                          Target: {tierConfig.timeframe}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Primary Clinical Driver */}
                  <TableCell className="py-3">
                    {primaryDriver ? (
                      <div className="space-y-0.5 max-w-[230px]">
                        <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate" title={primaryDriver.label}>
                          {primaryDriver.label}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1" title={primaryDriver.summary}>
                          {primaryDriver.summary}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">Standard profile</span>
                    )}
                  </TableCell>

                  {/* Discharge Follow-Up Status */}
                  <TableCell className="py-3">
                    <div className="space-y-0.5">
                      {patient.assigned_action_status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span>Action Completed</span>
                        </span>
                      ) : patient.assigned_action_status === 'in_progress' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900">
                          <Clock className="h-3 w-3 text-blue-600" />
                          <span>In Progress</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900">
                          <AlertTriangle className="h-3 w-3 text-amber-600" />
                          <span>Action Needed</span>
                        </span>
                      )}

                      {patient.active_action_count > 0 && (
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 pl-0.5">
                          {patient.active_action_count} assigned task{patient.active_action_count > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Review Action */}
                  <TableCell className="py-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-2.5 text-xs font-semibold text-blue-700 dark:text-blue-300 border-slate-300 dark:border-slate-700 group-hover:border-blue-500 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40"
                    >
                      <span>Review</span>
                      <ChevronRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
