'use client';

import React from 'react';
import {
  ArrowUpDown,
  Filter,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RiskTier } from '@/lib/types';
import { usePatients } from '@/hooks/use-patients';

export function PatientFilters() {
  const {
    searchQuery,
    setSearchQuery,
    selectedTier,
    setSelectedTier,
    showOverridesOnly,
    setShowOverridesOnly,
    sortBy,
    setSortBy,
    stats,
  } = usePatients();

  const tierOptions: Array<{ id: RiskTier | 'all'; label: string; count: number; color?: string }> = [
    { id: 'all', label: 'All Patients', count: stats.total },
    { id: 'high', label: 'High Risk', count: stats.highRisk, color: 'text-rose-600 dark:text-rose-400' },
    { id: 'medium', label: 'Medium Risk', count: stats.mediumRisk, color: 'text-amber-600 dark:text-amber-400' },
    { id: 'low', label: 'Low Risk', count: stats.lowRisk, color: 'text-emerald-600 dark:text-emerald-400' },
  ];

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by patient ID, condition, hospital, or medication..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-10 text-sm bg-slate-50/50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sort:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-10 rounded-md border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 px-3 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="risk_desc">Highest Risk First</option>
            <option value="risk_asc">Lowest Risk First</option>
            <option value="age_desc">Oldest Patient First</option>
            <option value="date_desc">Recent Admission First</option>
          </select>

          {/* Overrides Only Toggle */}
          <Button
            variant={showOverridesOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowOverridesOnly(!showOverridesOnly)}
            className={`h-10 gap-1.5 text-xs ${
              showOverridesOnly
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Overrides Only</span>
            {stats.overridden > 0 && (
              <span
                className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  showOverridesOnly
                    ? 'bg-white/20 text-white'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                }`}
              >
                {stats.overridden}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Tier Filter Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mr-1">
          Tiers:
        </span>
        {tierOptions.map((tier) => {
          const isSelected = selectedTier === tier.id;
          return (
            <button
              key={tier.id}
              onClick={() => setSelectedTier(tier.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              <span>{tier.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isSelected
                    ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                    : 'bg-slate-200/80 text-slate-700 dark:bg-slate-700 dark:text-slate-300'
                }`}
              >
                {tier.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
