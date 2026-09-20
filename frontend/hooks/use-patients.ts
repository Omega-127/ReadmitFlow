'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActionStatus, Override, Patient, RiskTier } from '@/lib/types';
import { api } from '@/lib/api';
import { useDemoWorkflow } from './use-demo-workflow';

export interface EnrichedPatient extends Patient {
  is_overridden: boolean;
  override?: Override;
  original_risk_tier: RiskTier;
  active_action_count: number;
}

export function usePatients() {
  const [rawPatients, setRawPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<RiskTier | 'all'>('all');
  const [showOverridesOnly, setShowOverridesOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'risk_desc' | 'risk_asc' | 'age_desc' | 'date_desc'>('risk_desc');

  const { overrides, actions, isReady } = useDemoWorkflow();

  const fetchPatients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.getPatients();
      setRawPatients(res.response.patients || []);
      setIsMock(res.isMock);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch patients');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  // Merge raw patients with live localStorage overrides and actions
  const enrichedPatients = useMemo<EnrichedPatient[]>(() => {
    return rawPatients.map((patient) => {
      const patientOverride = overrides[patient.id];
      const patientActions = actions[patient.id] || [];

      // Determine effective tier
      const effectiveTier = patientOverride ? patientOverride.selected_tier : patient.risk_tier;

      // Determine active action status
      let effectiveActionStatus: ActionStatus = patient.assigned_action_status || 'pending';
      if (patientActions.length > 0) {
        if (patientActions.some((a) => a.status === 'in_progress')) {
          effectiveActionStatus = 'in_progress';
        } else if (patientActions.every((a) => a.status === 'completed')) {
          effectiveActionStatus = 'completed';
        } else {
          effectiveActionStatus = 'pending';
        }
      }

      return {
        ...patient,
        original_risk_tier: patient.risk_tier,
        risk_tier: effectiveTier,
        is_overridden: !!patientOverride,
        override: patientOverride,
        assigned_action_status: effectiveActionStatus,
        active_action_count: patientActions.filter((a) => a.status !== 'completed').length,
      };
    });
  }, [rawPatients, overrides, actions]);

  // Filtered and sorted patients
  const filteredPatients = useMemo(() => {
    return enrichedPatients
      .filter((p) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchId = p.id.toLowerCase().includes(q);
          const matchName = p.display_name.toLowerCase().includes(q);
          const matchCond = p.medical_condition.toLowerCase().includes(q);
          const matchHosp = p.hospital.toLowerCase().includes(q);
          const matchMed = p.medication?.toLowerCase().includes(q) || false;
          if (!matchId && !matchName && !matchCond && !matchHosp && !matchMed) {
            return false;
          }
        }

        // Tier filter
        if (selectedTier !== 'all' && p.risk_tier !== selectedTier) {
          return false;
        }

        // Overrides toggle
        if (showOverridesOnly && !p.is_overridden) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'risk_desc') return b.risk_score - a.risk_score;
        if (sortBy === 'risk_asc') return a.risk_score - b.risk_score;
        if (sortBy === 'age_desc') return b.age - a.age;
        if (sortBy === 'date_desc') {
          return new Date(b.admission_date).getTime() - new Date(a.admission_date).getTime();
        }
        return 0;
      });
  }, [enrichedPatients, searchQuery, selectedTier, showOverridesOnly, sortBy]);

  // Aggregate KPI summary stats
  const stats = useMemo(() => {
    const total = enrichedPatients.length;
    const highRisk = enrichedPatients.filter((p) => p.risk_tier === 'high').length;
    const mediumRisk = enrichedPatients.filter((p) => p.risk_tier === 'medium').length;
    const lowRisk = enrichedPatients.filter((p) => p.risk_tier === 'low').length;
    const overridden = enrichedPatients.filter((p) => p.is_overridden).length;
    const actionsPending = enrichedPatients.filter((p) => p.assigned_action_status === 'pending').length;
    const inProgress = enrichedPatients.filter((p) => p.assigned_action_status === 'in_progress').length;

    return {
      total,
      highRisk,
      mediumRisk,
      lowRisk,
      overridden,
      actionsPending,
      inProgress,
    };
  }, [enrichedPatients]);

  return {
    patients: filteredPatients,
    allPatients: enrichedPatients,
    isLoading: isLoading || !isReady,
    isMock,
    error,
    searchQuery,
    setSearchQuery,
    selectedTier,
    setSelectedTier,
    showOverridesOnly,
    setShowOverridesOnly,
    sortBy,
    setSortBy,
    stats,
    refetch: fetchPatients,
  };
}
