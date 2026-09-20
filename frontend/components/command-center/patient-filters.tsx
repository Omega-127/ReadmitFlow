'use client';

import React from 'react';
import {
  AlertCircle,
  ArrowUpDown,
  Filter,
  RotateCcw,
  Search,
  X,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RiskTier } from '@/lib/types';
import { usePatients } from '@/hooks/use-patients';

export function PatientFilters() {
  const {
    searchQuery,
    setSearchQuery,
    selectedTier,
    setSelectedTier,
    actionStatusFilter,
    setActionStatusFilter,
    showOverridesOnly,
    setShowOverridesOnly,
    sortBy,
    setSortBy,
    stats,
  } = usePatients();

  const isFiltered =
    searchQuery.trim() !== '' ||
    selectedTier !== 'all' ||
    actionStatusFilter !== 'all' ||
    showOverridesOnly;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedTier('all');
    setActionStatusFilter('all');
    setShowOverridesOnly(false);
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by patient MRN (e.g. PT-1001), diagnosis, hospital, or medication..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-9 h-10 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort Selector & Reset */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 shrink-0 font-medium">
            <ArrowUpDown className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Sort:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-10 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="risk_desc">Highest Risk Score (Urgent First)</option>
            <option value="risk_asc">Lowest Risk Score</option>
            <option value="age_desc">Oldest Patient First</option>
            <option value="date_desc">Recent Admission Date</option>
          </select>

          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-10 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 gap-1 font-medium"
            >
              <X className="h-3.5 w-3.5" />
              <span>Reset Filters</span>
            </Button>
          )}
        </div>
      </div>

      {/* Clinical Triage Tabs */}
      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mr-1">
          Quick Triage:
        </span>

        {/* All Patients */}
        <button
          onClick={() => {
            setSelectedTier('all');
            setActionStatusFilter('all');
            setShowOverridesOnly(false);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
            selectedTier === 'all' && actionStatusFilter === 'all' && !showOverridesOnly
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 border-slate-900 dark:border-slate-100'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
          }`}
        >
          <span>All Cohort</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-black/10 dark:bg-white/20">
            {stats.total}
          </span>
        </button>

        {/* Action Needed (Pending) */}
        <button
          onClick={() => {
            setActionStatusFilter(actionStatusFilter === 'pending' ? 'all' : 'pending');
            setShowOverridesOnly(false);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
            actionStatusFilter === 'pending'
              ? 'bg-rose-700 text-white border-rose-700'
              : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900'
          }`}
        >
          <AlertCircle className="h-3.5 w-3.5" />
          <span>Action Needed</span>
          <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
            actionStatusFilter === 'pending' ? 'bg-white/20 text-white' : 'bg-rose-200 text-rose-900 dark:bg-rose-900 dark:text-rose-200'
          }`}>
            {stats.actionsPending}
          </span>
        </button>

        {/* High Risk Tier */}
        <button
          onClick={() => {
            setSelectedTier(selectedTier === 'high' ? 'all' : 'high');
            setActionStatusFilter('all');
            setShowOverridesOnly(false);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
            selectedTier === 'high'
              ? 'bg-rose-600 text-white border-rose-600'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-rose-600"></span>
          <span>High Risk (&lt;24h)</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-black/10 dark:bg-white/20">
            {stats.highRisk}
          </span>
        </button>

        {/* Medium Risk Tier */}
        <button
          onClick={() => {
            setSelectedTier(selectedTier === 'medium' ? 'all' : 'medium');
            setActionStatusFilter('all');
            setShowOverridesOnly(false);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
            selectedTier === 'medium'
              ? 'bg-amber-600 text-white border-amber-600'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-amber-500"></span>
          <span>Medium Risk (48-72h)</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-black/10 dark:bg-white/20">
            {stats.mediumRisk}
          </span>
        </button>

        {/* Low Risk Tier */}
        <button
          onClick={() => {
            setSelectedTier(selectedTier === 'low' ? 'all' : 'low');
            setActionStatusFilter('all');
            setShowOverridesOnly(false);
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
            selectedTier === 'low'
              ? 'bg-emerald-600 text-white border-emerald-600'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-600"></span>
          <span>Low Risk (Routine)</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-black/10 dark:bg-white/20">
            {stats.lowRisk}
          </span>
        </button>

        {/* Overrides Only Toggle */}
        <button
          onClick={() => {
            setShowOverridesOnly(!showOverridesOnly);
            setSelectedTier('all');
            setActionStatusFilter('all');
          }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors ${
            showOverridesOnly
              ? 'bg-amber-700 text-white border-amber-700'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
          }`}
        >
          <RotateCcw className="h-3 w-3" />
          <span>Overrides Logged</span>
          <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-black/10 dark:bg-white/20">
            {stats.overridden}
          </span>
        </button>
      </div>
    </div>
  );
}
