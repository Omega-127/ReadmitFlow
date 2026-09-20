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
            <TableRow className="bg-slate-50/60 dark:bg-slate-800/40 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
              <TableHead className="w-[200px]">Patient & MRN</TableHead>
              <TableHead className="w-[240px]">Condition & Admission</TableHead>
              <TableHead className="w-[200px]">30-Day Risk Triage</TableHead>
              <TableHead className="w-[160px]">Confidence Guard</TableHead>
              <TableHead className="w-[160px]">Action Status</TableHead>
              <TableHead className="text-right w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => {
              const tierConfig = getTierConfig(patient.risk_tier);
              const confConfig = getConfidenceBadgeClasses(patient.confidence_level);

              return (
                <TableRow
                  key={patient.id}
                  onClick={() => router.push(`/patients/${patient.id}`)}
                  className="cursor-pointer hover:bg-blue-50/40 dark:hover:bg-blue-950/20 transition-colors group"
                >
                  {/* Patient & MRN */}
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs">
                        {patient.gender === 'Female' ? 'F' : 'M'}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex items-center gap-1.5">
                          <span>{patient.id}</span>
                          {patient.blood_type && (
                            <span className="text-[10px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                              {patient.blood_type}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {patient.age} yrs • {patient.gender} • {patient.insurance_provider}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Condition & Admission */}
                  <TableCell className="py-3.5">
                    <div className="space-y-0.5">
                      <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                        <span>{patient.medical_condition}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                            patient.admission_type === 'Emergency'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : patient.admission_type === 'Urgent'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {patient.admission_type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[220px]">
                        {patient.hospital}
                      </div>
                    </div>
                  </TableCell>

                  {/* 30-Day Risk Triage */}
                  <TableCell className="py-3.5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold border ${tierConfig.badgeBg} ${tierConfig.badgeText} ${tierConfig.border}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${tierConfig.dotBg}`}></span>
                          {tierConfig.label}
                        </span>

                        {patient.is_overridden && (
                          <span
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                            title={`Human override: previously ${patient.original_risk_tier.toUpperCase()}`}
                          >
                            <RotateCcw className="h-2.5 w-2.5" />
                            Overridden
                          </span>
                        )}
                      </div>

                      {/* Score gauge mini bar */}
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-20 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${patient.risk_score * 100}%` }}
                            className={`h-full ${
                              patient.risk_score >= 0.7
                                ? 'bg-rose-500'
                                : patient.risk_score >= 0.45
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                          />
                        </div>
                        <span className="font-mono text-xs text-slate-700 dark:text-slate-300 font-medium">
                          {formatScore(patient.risk_score)}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Confidence Guard */}
                  <TableCell className="py-3.5">
                    <div className="space-y-0.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border ${confConfig.bg} ${confConfig.text} ${confConfig.border}`}
                      >
                        {confConfig.label}
                      </span>
                      {patient.confidence_flags && patient.confidence_flags.length > 0 && (
                        <div className="text-[10px] text-amber-700 dark:text-amber-400 truncate max-w-[150px]">
                          {patient.confidence_flags[0]}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Action Status */}
                  <TableCell className="py-3.5">
                    <div>
                      {patient.assigned_action_status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                          <span>Action Completed</span>
                        </span>
                      ) : patient.assigned_action_status === 'in_progress' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 dark:text-blue-400">
                          <Clock className="h-3.5 w-3.5 text-blue-600 animate-spin" />
                          <span>In Progress</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600" />
                          <span>Action Needed</span>
                        </span>
                      )}
                      {patient.active_action_count > 0 && (
                        <div className="text-[10px] text-slate-500">
                          {patient.active_action_count} active intervention{patient.active_action_count > 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  {/* Review Action */}
                  <TableCell className="py-3.5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 group-hover:bg-blue-100/60 dark:group-hover:bg-blue-900/40"
                    >
                      <span>Review</span>
                      <ChevronRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
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
