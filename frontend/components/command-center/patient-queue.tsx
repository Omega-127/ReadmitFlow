'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
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
import { Button } from '@/components/ui/button';
import { usePatients } from '@/hooks/use-patients';
import {
  formatScore,
  getTierConfig,
} from '@/lib/formatters';

export function PatientQueue() {
  const router = useRouter();
  const { patients, isLoading, error } = usePatients();

  if (isLoading) {
    return (
      <div className="space-y-3 rounded-md border border-neutral-200 bg-white p-6 dark:border-neutral-800 dark:bg-neutral-900">
        <div className="h-5 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-14 w-full animate-pulse rounded bg-neutral-100 dark:bg-neutral-800/60"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-rose-300 bg-rose-50 p-8 text-center dark:border-rose-900 dark:bg-rose-950/30">
        <AlertCircle className="mx-auto mb-2 h-7 w-7 text-rose-600" />
        <h3 className="font-medium text-rose-900 dark:text-rose-100">Could not load patients</h3>
        <p className="mt-1 text-sm text-rose-700 dark:text-rose-300">{error}</p>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="rounded-md border border-neutral-200 bg-white p-12 text-center dark:border-neutral-800 dark:bg-neutral-900">
        <User className="mx-auto mb-3 h-8 w-8 text-neutral-400" />
        <h3 className="font-medium text-neutral-800 dark:text-neutral-200">No matching patients</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-neutral-500">
          Try clearing search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex items-baseline justify-between gap-3 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800 sm:px-5">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {patients.length}
          </span>{' '}
          {patients.length === 1 ? 'patient' : 'patients'}
        </p>
        <p className="text-xs text-neutral-400">Decision support only</p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-neutral-200 bg-neutral-50 text-xs text-neutral-500 dark:border-neutral-800 dark:bg-neutral-900/80 dark:text-neutral-400">
              <TableHead className="w-[160px] font-medium">Patient</TableHead>
              <TableHead className="w-[200px] font-medium">Condition</TableHead>
              <TableHead className="w-[160px] font-medium">Risk</TableHead>
              <TableHead className="w-[220px] font-medium">Top driver</TableHead>
              <TableHead className="w-[140px] font-medium">Follow-up</TableHead>
              <TableHead className="w-[90px] text-right font-medium" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.map((patient) => {
              const tierConfig = getTierConfig(patient.risk_tier);
              const primaryDriver = patient.risk_drivers?.[0];

              return (
                <TableRow
                  key={patient.id}
                  onClick={() => router.push(`/patients/${patient.id}`)}
                  className="cursor-pointer border-b border-neutral-100 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/40"
                >
                  <TableCell className="py-3">
                    <div className="font-mono text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {patient.id}
                    </div>
                    <div className="mt-0.5 text-xs text-neutral-500">
                      {patient.age}y · {patient.gender}
                    </div>
                  </TableCell>

                  <TableCell className="py-3">
                    <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {patient.medical_condition}
                    </div>
                    <div className="mt-0.5 truncate text-xs text-neutral-500" title={patient.hospital}>
                      {patient.admission_type} · {patient.hospital}
                    </div>
                  </TableCell>

                  <TableCell className="py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block h-2 w-2 shrink-0 ${tierConfig.dotBg}`}
                      />
                      <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
                        {tierConfig.label}
                      </span>
                      <span className="font-mono text-sm tabular-nums text-neutral-600 dark:text-neutral-400">
                        {formatScore(patient.risk_score)}
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1 w-14 overflow-hidden rounded-sm bg-neutral-200 dark:bg-neutral-700">
                        <div
                          style={{ width: `${patient.risk_score * 100}%` }}
                          className={`h-full ${tierConfig.barColor}`}
                        />
                      </div>
                      <span className="text-xs text-neutral-500">{tierConfig.timeframe}</span>
                      {patient.is_overridden && (
                        <span className="text-xs text-amber-700 dark:text-amber-400">
                          overridden
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="py-3">
                    {primaryDriver ? (
                      <div className="max-w-[220px]">
                        <div
                          className="truncate text-sm text-neutral-800 dark:text-neutral-200"
                          title={primaryDriver.label}
                        >
                          {primaryDriver.label}
                        </div>
                        <p
                          className="mt-0.5 line-clamp-1 text-xs text-neutral-500"
                          title={primaryDriver.summary}
                        >
                          {primaryDriver.summary}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-neutral-400">—</span>
                    )}
                  </TableCell>

                  <TableCell className="py-3">
                    {patient.assigned_action_status === 'completed' ? (
                      <span className="inline-flex items-center gap-1 text-sm text-emerald-700 dark:text-emerald-400">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Done
                      </span>
                    ) : patient.assigned_action_status === 'in_progress' ? (
                      <span className="inline-flex items-center gap-1 text-sm text-neutral-700 dark:text-neutral-300">
                        <Clock className="h-3.5 w-3.5" />
                        In progress
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sm text-amber-800 dark:text-amber-400">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Needed
                      </span>
                    )}
                  </TableCell>

                  <TableCell className="py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 px-2 text-sm text-neutral-600"
                    >
                      Open
                      <ChevronRight className="h-3.5 w-3.5" />
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
