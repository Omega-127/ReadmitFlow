'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';
import { api } from '@/lib/api';
import { ModelEvaluationData } from '@/lib/types';
import { MetricCards } from '@/components/model/metric-cards';
import { ConfusionMatrix } from '@/components/model/confusion-matrix';
import { LimitationCard } from '@/components/model/limitation-card';
import { MOCK_MODEL_METRICS } from '@/lib/constants';

export default function ModelSafetyPage() {
  const [modelData, setModelData] = useState<ModelEvaluationData>(MOCK_MODEL_METRICS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadMetrics() {
      setIsLoading(true);
      try {
        const res = await api.getMetrics();
        setModelData(res.response);
      } catch (err) {
        console.error('Failed to load metrics, using mock:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadMetrics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-xs text-slate-500 font-medium">Loading model evaluation metrics and safety disclosures...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2">
            <span>Model Safety & Evaluation</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
              Audit & Governance
            </span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Discrimination benchmarks, confusion matrix trade-offs, and critical clinical boundary disclosures for the synthetic readmission model.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Transparent AI Compliance</span>
        </div>
      </div>

      {/* Metric Cards */}
      <section aria-label="Model Performance Metrics">
        <MetricCards metrics={modelData.metrics} demoOnly={modelData.demo_only} />
      </section>

      {/* Main Grid: Confusion Matrix & Limitations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-6">
          <ConfusionMatrix
            matrix={modelData.metrics.confusion_matrix}
            totalSamples={modelData.metrics.total_samples}
          />
        </div>

        <div className="lg:col-span-6 space-y-6">
          <LimitationCard data={modelData} />
        </div>
      </div>
    </div>
  );
}
