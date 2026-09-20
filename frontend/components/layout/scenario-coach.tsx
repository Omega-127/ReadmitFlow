'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useJudgeScenario } from '@/hooks/use-judge-scenario';

export function ScenarioCoach() {
  const router = useRouter();
  const {
    scenario,
    step,
    stepIndex,
    isLastStep,
    nextStep,
    prevStep,
    dismissScenario,
  } = useJudgeScenario();

  if (!scenario || !step) return null;

  const go = (direction: 'next' | 'prev') => {
    if (direction === 'prev') {
      const prev = prevStep();
      if (prev?.href) router.push(prev.href);
      return;
    }
    handleNext();
  };

  const handleNext = () => {
    if (isLastStep) {
      dismissScenario();
      return;
    }
    const next = nextStep();
    if (next?.href) router.push(next.href);
  };

  return (
    <div
      role="status"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-neutral-300 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.08)] dark:border-neutral-700 dark:bg-neutral-900 lg:left-56"
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            <span className="font-medium text-neutral-800 dark:text-neutral-200">
              Scenario: {scenario.title}
            </span>
            <span>
              Step {stepIndex + 1} of {scenario.steps.length}
            </span>
          </div>
          <p className="mt-1 text-sm font-medium text-neutral-900 dark:text-white">
            {step.title}
          </p>
          <p className="mt-0.5 text-sm text-neutral-600 dark:text-neutral-400">
            {step.detail}
          </p>
          {step.say && (
            <p className="mt-2 border-l-2 border-neutral-300 pl-3 text-sm italic text-neutral-700 dark:border-neutral-600 dark:text-neutral-300">
              “{step.say}”
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1 text-sm"
            onClick={() => go('prev')}
            disabled={stepIndex === 0}
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Back
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-8 gap-1 text-sm"
            onClick={handleNext}
          >
            {isLastStep ? 'Done' : 'Next'}
            {!isLastStep && <ChevronRight className="h-3.5 w-3.5" />}
          </Button>
          {step.href && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-sm"
              onClick={() => router.push(step.href!)}
            >
              Go
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={dismissScenario}
            aria-label="Dismiss scenario"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
