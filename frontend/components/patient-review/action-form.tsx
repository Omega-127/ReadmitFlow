'use client';

import React, { useState } from 'react';
import {
  Calendar,
  CalendarCheck,
  CheckCircle2,
  Clock,
  Plus,
  Send,
  User,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Action, ActionStatus, Patient } from '@/lib/types';
import { ACTION_TEMPLATES } from '@/lib/constants';
import { useDemoWorkflow } from '@/hooks/use-demo-workflow';
import { formatDate, formatDateTime, formatRelativeTime } from '@/lib/formatters';

interface ActionFormProps {
  patient: Patient;
}

export function ActionForm({ patient }: ActionFormProps) {
  const {
    addAction,
    updateAction,
    getPatientActions,
    capacityAllocations,
  } = useDemoWorkflow();

  const currentActions = getPatientActions(patient.id);

  // Form state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(ACTION_TEMPLATES[0].id);
  const [owner, setOwner] = useState<string>(ACTION_TEMPLATES[0].defaultOwner);
  const [dueDate, setDueDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const currentTemplate =
    ACTION_TEMPLATES.find((t) => t.id === selectedTemplateId) || ACTION_TEMPLATES[0];

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = ACTION_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      setOwner(tmpl.defaultOwner);
      const d = new Date();
      d.setDate(d.getDate() + tmpl.dueDays);
      setDueDate(d.toISOString().split('T')[0]);
    }
  };

  const handleAssignAction = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    addAction({
      patient_id: patient.id,
      action_type: currentTemplate.type,
      owner: owner.trim() || currentTemplate.defaultOwner,
      due_date: new Date(dueDate).toISOString(),
      status: 'pending',
      notes: notes.trim() || undefined,
    });

    setNotes('');
    setIsSubmitting(false);
    setSuccessMsg(`Intervention scheduled: "${currentTemplate.type}"`);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
      <CardHeader className="p-5 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-900">
              <CalendarCheck className="h-4 w-4" />
            </span>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Discharge Follow-Up & Intervention Planning
              </CardTitle>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Schedule accountable transitions-of-care tasks and assign to care team staff
              </p>
            </div>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-900">
            {currentActions.length} Assigned
          </span>
        </div>
      </CardHeader>

      <CardContent className="p-5 space-y-6">
        {/* Active Assigned Actions for this Patient */}
        {currentActions.length > 0 && (
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Interventions for {patient.id}
            </h4>
            <div className="space-y-2">
              {currentActions.map((action) => {
                const isCompleted = action.status === 'completed';
                const isInProgress = action.status === 'in_progress';

                return (
                  <div
                    key={action.id}
                    className={`rounded-lg border p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs transition-colors ${
                      isCompleted
                        ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30'
                        : isInProgress
                        ? 'border-blue-300 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30'
                        : 'border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 dark:text-slate-100">
                          {action.action_type}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase border ${
                            isCompleted
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                              : isInProgress
                              ? 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {action.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 space-x-2">
                        <span>Staff: <strong>{action.owner}</strong></span>
                        <span>•</span>
                        <span>Due: {formatDate(action.due_date)}</span>
                        {action.completed_at && (
                          <>
                            <span>•</span>
                            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                              Done {formatRelativeTime(action.completed_at)}
                            </span>
                          </>
                        )}
                      </div>
                      {action.notes && (
                        <p className="text-[11px] text-slate-700 dark:text-slate-300 italic pt-0.5">
                          "{action.notes}"
                        </p>
                      )}
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                      {action.status !== 'in_progress' && !isCompleted && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateAction(action.id, 'in_progress', patient.id)}
                          className="h-7 px-2.5 text-xs text-blue-700 border-blue-300 hover:bg-blue-100 dark:text-blue-300 dark:border-blue-800"
                        >
                          Start Task
                        </Button>
                      )}
                      {!isCompleted ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateAction(action.id, 'completed', patient.id)}
                          className="h-7 px-2.5 text-xs text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:text-emerald-300 dark:border-emerald-800 font-semibold"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Mark Completed
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateAction(action.id, 'pending', patient.id)}
                          className="h-7 px-2 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
                        >
                          Reopen
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Assignment Form */}
        <form onSubmit={handleAssignAction} className="space-y-4 pt-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Schedule Care Intervention
            </h4>
            {successMsg && (
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                {successMsg}
              </span>
            )}
          </div>

          {/* Action Template Selection Grid */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Standardized Clinical Pathways:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {ACTION_TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplateId === tmpl.id;
                return (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleTemplateChange(tmpl.id)}
                    className={`text-left p-2.5 rounded-md border transition-all text-xs ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/80 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-100 font-semibold ring-1 ring-indigo-600'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{tmpl.type}</span>
                      <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        +{tmpl.dueDays}d
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5 line-clamp-1">
                      {tmpl.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Owner selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Responsible Staff Member:
              </label>
              <Input
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="e.g. Sarah Jenkins, RN"
                className="h-9 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                required
              />
            </div>

            {/* Target Due Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Target Completion Due Date:
              </label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="h-9 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                required
              />
            </div>
          </div>

          {/* Clinical Instructions */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Discharge Instructions & Clinical Focus (Optional):
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Confirm home oxygen delivery, verify insulin titration schedule, check 48h vitals..."
              className="h-9 text-xs bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>

          {/* Submit button */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Logged in patient clinical audit trail.
            </span>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="h-9 gap-1.5 text-xs bg-indigo-700 hover:bg-indigo-800 text-white font-bold"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Assign Follow-Up Task</span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
