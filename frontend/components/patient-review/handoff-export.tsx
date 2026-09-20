'use client';

import React, { useMemo, useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Action, AuditEvent, Override, Patient, RiskTier } from '@/lib/types';
import {
  buildHandoffCsv,
  buildHandoffText,
  downloadHandoffPdf,
  downloadTextFile,
} from '@/lib/handoff';

interface HandoffExportProps {
  patient: Patient;
  effectiveTier: RiskTier;
  override?: Override;
  actions: Action[];
  auditEvents: AuditEvent[];
  triggerVariant?: 'header' | 'panel';
}

export function HandoffExport({
  patient,
  effectiveTier,
  override,
  actions,
  auditEvents,
  triggerVariant = 'panel',
}: HandoffExportProps) {
  const [open, setOpen] = useState(false);
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const payload = useMemo(
    () => ({
      patient,
      effectiveTier,
      override,
      actions,
      auditEvents,
      generatedAt: new Date().toISOString(),
    }),
    [patient, effectiveTier, override, actions, auditEvents]
  );

  const preview = useMemo(() => buildHandoffText(payload), [payload]);

  const handleDownloadTxt = () => {
    downloadTextFile(
      `readmitflow-handoff-${patient.id}.txt`,
      buildHandoffText(payload),
      'text/plain'
    );
  };

  const handleDownloadCsv = () => {
    downloadTextFile(
      `readmitflow-handoff-${patient.id}.csv`,
      buildHandoffCsv(payload),
      'text/csv'
    );
  };

  const handleDownloadPdf = async () => {
    setPdfError(null);
    setPdfBusy(true);
    try {
      await downloadHandoffPdf(payload);
    } catch (err: unknown) {
      setPdfError(err instanceof Error ? err.message : 'Could not create PDF.');
    } finally {
      setPdfBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerVariant === 'header' ? (
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-sm">
            <FileText className="h-3.5 w-3.5" />
            Handoff
          </Button>
        ) : (
          <Button variant="outline" className="w-full gap-2 text-sm">
            <FileText className="h-4 w-4" />
            Export shift handoff
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="flex max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-neutral-200 px-6 py-4 dark:border-neutral-800">
          <DialogTitle>Shift handoff</DialogTitle>
          <DialogDescription>
            One-page summary for the next coordinator: risk, open actions,
            overrides, and recent activity. Demo / synthetic data only.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          <pre className="whitespace-pre-wrap rounded-md border border-neutral-200 bg-neutral-50 p-4 font-mono text-xs leading-relaxed text-neutral-800 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-200">
            {preview}
          </pre>
          {pdfError && (
            <p className="mt-3 text-sm text-rose-700 dark:text-rose-400">{pdfError}</p>
          )}
        </div>

        <DialogFooter className="gap-2 border-t border-neutral-200 px-6 py-4 dark:border-neutral-800 sm:justify-end">
          <div className="flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={handleDownloadTxt}>
              <Download className="h-3.5 w-3.5" />
              .txt
            </Button>
            <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={handleDownloadCsv}>
              <Download className="h-3.5 w-3.5" />
              .csv
            </Button>
            <Button
              type="button"
              size="sm"
              className="gap-1.5"
              onClick={handleDownloadPdf}
              disabled={pdfBusy}
            >
              {pdfBusy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5" />
              )}
              .pdf
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
