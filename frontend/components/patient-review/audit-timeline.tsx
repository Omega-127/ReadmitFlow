'use client';

import React from 'react';
import {
  Activity,
  CalendarCheck,
  CheckCircle2,
  Clock,
  History,
  RotateCcw,
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
    <Card className="border border-neutral-200 bg-white shadow-none dark:border-neutral-800 dark:bg-neutral-900">
      <CardHeader className="border-b border-neutral-200 p-5 pb-3 dark:border-neutral-800">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="text-base font-semibold">
              Activity
            </CardTitle>
            <p className="mt-0.5 text-sm text-neutral-500">
              Scores, overrides, and assigned tasks for this patient
            </p>
          </div>
          <span className="text-sm text-neutral-500">
            {events.length}
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
