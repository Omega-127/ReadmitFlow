'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Action,
  ActionStatus,
  AuditEvent,
  CapacityAllocation,
  CapacitySettings,
  Override,
} from '@/lib/types';
import {
  addAuditEvent,
  ensureInitialized,
  getStoredActions,
  getStoredAuditEvents,
  getStoredCapacity,
  getStoredOverrides,
  resetDemoState,
  saveAction,
  saveCapacity,
  saveOverride,
  STORAGE_SYNC_EVENT,
  updateActionStatus as updateStoredActionStatus,
} from '@/lib/local-storage';
import { DEFAULT_CAPACITY_SETTINGS } from '@/lib/constants';

export function useDemoWorkflow() {
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [actions, setActions] = useState<Record<string, Action[]>>({});
  const [capacity, setCapacity] = useState<CapacitySettings>(DEFAULT_CAPACITY_SETTINGS);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [isReady, setIsReady] = useState(false);

  const loadAllState = useCallback(() => {
    ensureInitialized();
    setOverrides(getStoredOverrides());
    setActions(getStoredActions());
    setCapacity(getStoredCapacity());
    setAuditEvents(getStoredAuditEvents());
    setIsReady(true);
  }, []);

  useEffect(() => {
    loadAllState();

    const handleSync = () => {
      setOverrides(getStoredOverrides());
      setActions(getStoredActions());
      setCapacity(getStoredCapacity());
      setAuditEvents(getStoredAuditEvents());
    };

    window.addEventListener(STORAGE_SYNC_EVENT, handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener(STORAGE_SYNC_EVENT, handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [loadAllState]);

  const addOverride = useCallback(
    (input: Omit<Override, 'id' | 'timestamp'>) => {
      const newOverride: Override = {
        ...input,
        id: `ovr-${Date.now()}`,
        timestamp: new Date().toISOString(),
      };
      saveOverride(newOverride);
    },
    []
  );

  const addAction = useCallback(
    (input: Omit<Action, 'id' | 'created_at'>) => {
      const newAction: Action = {
        ...input,
        id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        created_at: new Date().toISOString(),
      };
      saveAction(newAction);
    },
    []
  );

  const updateAction = useCallback(
    (actionId: string, status: ActionStatus, patientId: string) => {
      updateStoredActionStatus(actionId, status, patientId);
    },
    []
  );

  const updateCapacitySettings = useCallback((newSettings: CapacitySettings) => {
    saveCapacity(newSettings);
  }, []);

  const resetDemo = useCallback(() => {
    resetDemoState();
    loadAllState();
  }, [loadAllState]);

  const getPatientOverride = useCallback(
    (patientId: string): Override | undefined => {
      return overrides[patientId];
    },
    [overrides]
  );

  const getPatientActions = useCallback(
    (patientId: string): Action[] => {
      return actions[patientId] || [];
    },
    [actions]
  );

  const getPatientAudit = useCallback(
    (patientId: string): AuditEvent[] => {
      return auditEvents.filter((ev) => !ev.patient_id || ev.patient_id === patientId);
    },
    [auditEvents]
  );

  const allActions = useMemo(() => {
    return Object.values(actions).flat();
  }, [actions]);

  // Compute live capacity allocations based on active assigned actions
  const capacityAllocations: CapacityAllocation[] = useMemo(() => {
    // Count active (pending or in_progress) actions
    const activeActions = allActions.filter((a) => a.status !== 'completed');

    let followUpCount = 0;
    let specialistCount = 0;
    let outreachCount = 0;
    let nurseCount = 0;

    activeActions.forEach((a) => {
      const lower = a.action_type.toLowerCase();
      if (lower.includes('telehealth') || lower.includes('follow-up') || lower.includes('call')) {
        followUpCount++;
      } else if (lower.includes('specialist') || lower.includes('consult')) {
        specialistCount++;
      } else if (lower.includes('outreach') || lower.includes('rapid') || lower.includes('home check')) {
        outreachCount++;
      } else if (lower.includes('medication') || lower.includes('nurse') || lower.includes('transition')) {
        nurseCount++;
      } else {
        followUpCount++;
      }
    });

    return [
      {
        slot_type: 'Telehealth & Follow-up Calls',
        allocated: followUpCount,
        capacity: capacity.follow_up_call_slots,
        utilization_pct: capacity.follow_up_call_slots > 0 ? (followUpCount / capacity.follow_up_call_slots) * 100 : 0,
        is_over_capacity: followUpCount > capacity.follow_up_call_slots,
      },
      {
        slot_type: 'Specialist Chart Reviews',
        allocated: specialistCount,
        capacity: capacity.specialist_review_slots,
        utilization_pct: capacity.specialist_review_slots > 0 ? (specialistCount / capacity.specialist_review_slots) * 100 : 0,
        is_over_capacity: specialistCount > capacity.specialist_review_slots,
      },
      {
        slot_type: 'Rapid Clinical Outreach & Home Visits',
        allocated: outreachCount,
        capacity: capacity.rapid_outreach_slots,
        utilization_pct: capacity.rapid_outreach_slots > 0 ? (outreachCount / capacity.rapid_outreach_slots) * 100 : 0,
        is_over_capacity: outreachCount > capacity.rapid_outreach_slots,
      },
      {
        slot_type: 'Nurse & Pharmacist Consultations',
        allocated: nurseCount,
        capacity: capacity.nurse_consult_slots,
        utilization_pct: capacity.nurse_consult_slots > 0 ? (nurseCount / capacity.nurse_consult_slots) * 100 : 0,
        is_over_capacity: nurseCount > capacity.nurse_consult_slots,
      },
    ];
  }, [allActions, capacity]);

  return {
    isReady,
    overrides,
    actions,
    allActions,
    capacity,
    capacityAllocations,
    auditEvents,
    addOverride,
    addAction,
    updateAction,
    updateCapacitySettings,
    resetDemo,
    getPatientOverride,
    getPatientActions,
    getPatientAudit,
  };
}
