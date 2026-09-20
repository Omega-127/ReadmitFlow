'use client';

import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
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
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-neutral-500" />
        <p className="text-sm text-neutral-500">Loading model metrics…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          Model
        </h1>
        <p className="max-w-2xl text-sm text-neutral-600 dark:text-neutral-400">
          How the synthetic readmission model scores, where it fails, and what
          it should not be used for.
        </p>
      </header>

      <section aria-label="Performance">
        <MetricCards metrics={modelData.metrics} demoOnly={modelData.demo_only} />
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <ConfusionMatrix
            matrix={modelData.metrics.confusion_matrix}
            totalSamples={modelData.metrics.total_samples}
          />
        </div>
        <div className="lg:col-span-6">
          <LimitationCard data={modelData} />
        </div>
      </div>
    </div>
  );
}
