'use client';

import React from 'react';
import {
  Activity,
  CalendarCheck,
  CheckCircle2,
  Clock,
  History,
  RotateCcw,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AuditEvent } from '@/lib/types';
import { formatDateTime, formatRelativeTime } from '@/lib/formatters';

interface AuditTimelineProps {
  events: AuditEvent[];
  patientId: string;
}

export function AuditTimeline({ events, patientId }: AuditTimelineProps) {
  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <CardHeader className="p-5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              <History className="h-4 w-4" />
            </span>
            <div>
              <CardTitle className="text-base font-bold">
                Clinical Workflow Audit Trail
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Immutable event log of all automated scores, clinician overrides, and assigned interventions
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
            {events.length} Events Logged
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5">
        {events.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400">
            No audit events recorded for patient {patientId}.
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {events.map((ev, idx) => {
              const isOverride = ev.event_type === 'override_recorded';
              const isAction = ev.event_type === 'action_assigned' || ev.event_type === 'action_updated';
              const isReset = ev.event_type === 'demo_reset';

              return (
                <div key={ev.id || idx} className="relative group">
                  {/* Timeline Dot Icon */}
                  <span
                    className={`absolute -left-6 top-0.5 flex h-5 w-5 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-900 text-white ${
                      isOverride
                        ? 'bg-amber-500'
                        : isAction
                        ? 'bg-indigo-600'
                        : isReset
                        ? 'bg-rose-500'
                        : 'bg-blue-600'
                    }`}
                  >
                    {isOverride ? (
                      <RotateCcw className="h-2.5 w-2.5" />
                    ) : isAction ? (
                      <CalendarCheck className="h-2.5 w-2.5" />
                    ) : (
                      <Activity className="h-2.5 w-2.5" />
                    )}
                  </span>

                  {/* Event content */}
                  <div className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-3 text-xs space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`font-semibold capitalize ${
                            isOverride
                              ? 'text-amber-800 dark:text-amber-300'
                              : isAction
                              ? 'text-indigo-800 dark:text-indigo-300'
                              : 'text-slate-800 dark:text-slate-200'
                          }`}
                        >
                          {ev.event_type.replace('_', ' ')}
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                          {ev.actor}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span title={formatDateTime(ev.timestamp)}>
                          {formatRelativeTime(ev.timestamp)}
                        </span>
                      </div>
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 leading-relaxed pt-0.5">
                      {ev.details}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
