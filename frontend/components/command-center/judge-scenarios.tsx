'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clapperboard, Loader2, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { JUDGE_SCENARIOS } from '@/lib/scenarios';
import { useJudgeScenario } from '@/hooks/use-judge-scenario';
import { usePatients } from '@/hooks/use-patients';

export function JudgeScenariosDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { startScenario } = useJudgeScenario();
  const { refetch } = usePatients();

  const handleRun = async (scenarioId: string) => {
    setBusyId(scenarioId);
    try {
      const sc = startScenario(scenarioId);
      await refetch();
      setOpen(false);
      const firstHref = sc?.steps[0]?.href || (sc?.patientId ? `/patients/${sc.patientId}` : '/');
      router.push(firstHref);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm">
          <Clapperboard className="h-4 w-4" />
          Scenarios
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Judge scenarios</DialogTitle>
          <DialogDescription>
            Fake but realistic walkthroughs. Each run can reset demo state, then a
            coach bar guides the next click.
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-3 py-1">
          {JUDGE_SCENARIOS.map((sc) => (
            <li
              key={sc.id}
              className="rounded-md border border-neutral-200 p-4 dark:border-neutral-800"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-neutral-900 dark:text-white">
                    {sc.title}
                  </p>
                  <p className="mt-0.5 text-xs text-neutral-500">{sc.duration}</p>
                  <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {sc.summary}
                  </p>
                  {sc.patientId && (
                    <p className="mt-2 font-mono text-xs text-neutral-500">
                      Focus: {sc.patientId}
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  className="h-8 shrink-0 gap-1.5 text-sm"
                  disabled={busyId !== null}
                  onClick={() => handleRun(sc.id)}
                >
                  {busyId === sc.id ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Play className="h-3.5 w-3.5" />
                  )}
                  Run
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
