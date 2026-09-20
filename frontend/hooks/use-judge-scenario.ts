'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ACTIVE_SCENARIO_KEY,
  ActiveScenarioState,
  getScenarioById,
  JudgeScenario,
} from '@/lib/scenarios';
import { applyScenarioCapacity, resetDemoState } from '@/lib/local-storage';

function readActive(): ActiveScenarioState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(ACTIVE_SCENARIO_KEY);
    return raw ? (JSON.parse(raw) as ActiveScenarioState) : null;
  } catch {
    return null;
  }
}

function writeActive(state: ActiveScenarioState | null): void {
  if (typeof window === 'undefined') return;
  if (!state) {
    sessionStorage.removeItem(ACTIVE_SCENARIO_KEY);
  } else {
    sessionStorage.setItem(ACTIVE_SCENARIO_KEY, JSON.stringify(state));
  }
  window.dispatchEvent(new CustomEvent('readmitflow:scenario'));
}

export function useJudgeScenario() {
  const [active, setActive] = useState<ActiveScenarioState | null>(null);

  useEffect(() => {
    setActive(readActive());
    const sync = () => setActive(readActive());
    window.addEventListener('readmitflow:scenario', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('readmitflow:scenario', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const scenario: JudgeScenario | null = active
    ? getScenarioById(active.scenarioId) || null
    : null;

  const stepIndex = active?.stepIndex ?? 0;
  const step = scenario?.steps[stepIndex] ?? null;
  const isLastStep = scenario ? stepIndex >= scenario.steps.length - 1 : false;

  const startScenario = useCallback((scenarioId: string) => {
    const sc = getScenarioById(scenarioId);
    if (!sc) return null;

    if (sc.setup.reset) {
      resetDemoState();
    }
    if (sc.setup.capacity) {
      applyScenarioCapacity(sc.setup.capacity);
    }

    const state: ActiveScenarioState = {
      scenarioId: sc.id,
      stepIndex: 0,
      startedAt: new Date().toISOString(),
    };
    writeActive(state);
    setActive(state);
    return sc;
  }, []);

  const nextStep = useCallback(() => {
    const current = readActive();
    const sc = current ? getScenarioById(current.scenarioId) : undefined;
    if (!current || !sc) return null;

    if (current.stepIndex >= sc.steps.length - 1) {
      writeActive(null);
      setActive(null);
      return null;
    }

    const next: ActiveScenarioState = {
      ...current,
      stepIndex: current.stepIndex + 1,
    };
    writeActive(next);
    setActive(next);
    return sc.steps[next.stepIndex] ?? null;
  }, []);

  const prevStep = useCallback(() => {
    const current = readActive();
    const sc = current ? getScenarioById(current.scenarioId) : undefined;
    if (!current || !sc || current.stepIndex <= 0) return null;

    const prev: ActiveScenarioState = {
      ...current,
      stepIndex: current.stepIndex - 1,
    };
    writeActive(prev);
    setActive(prev);
    return sc.steps[prev.stepIndex] ?? null;
  }, []);

  const dismissScenario = useCallback(() => {
    writeActive(null);
    setActive(null);
  }, []);

  return {
    active,
    scenario,
    step,
    stepIndex,
    isLastStep,
    startScenario,
    nextStep,
    prevStep,
    dismissScenario,
  };
}
