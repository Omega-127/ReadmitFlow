'use client';

import React from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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

  const chipClass = (active: boolean) =>
    `inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-sm transition-colors ${
      active
        ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
        : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800'
    }`;

  return (
    <div className="space-y-3 rounded-md border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            placeholder="Search MRN, diagnosis, hospital, medication…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 border-neutral-200 bg-white pl-9 pr-9 text-sm dark:border-neutral-700 dark:bg-neutral-900"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="sort-by" className="shrink-0 text-sm text-neutral-500">
            Sort
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="h-9 rounded-md border border-neutral-200 bg-white px-3 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200"
          >
            <option value="risk_desc">Highest risk first</option>
            <option value="risk_asc">Lowest risk first</option>
            <option value="age_desc">Oldest first</option>
            <option value="date_desc">Newest admission</option>
          </select>

          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleResetFilters}
              className="h-9 gap-1 text-sm text-neutral-500"
            >
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
        <span className="mr-1 text-sm text-neutral-500">Show</span>

        <button
          type="button"
          onClick={() => {
            setSelectedTier('all');
            setActionStatusFilter('all');
            setShowOverridesOnly(false);
          }}
          className={chipClass(
            selectedTier === 'all' && actionStatusFilter === 'all' && !showOverridesOnly
          )}
        >
          All
          <span className="tabular-nums opacity-70">{stats.total}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActionStatusFilter(actionStatusFilter === 'pending' ? 'all' : 'pending');
            setShowOverridesOnly(false);
          }}
          className={chipClass(actionStatusFilter === 'pending')}
        >
          Action needed
          <span className="tabular-nums opacity-70">{stats.actionsPending}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedTier(selectedTier === 'high' ? 'all' : 'high');
            setActionStatusFilter('all');
            setShowOverridesOnly(false);
          }}
          className={chipClass(selectedTier === 'high')}
        >
          High
          <span className="tabular-nums opacity-70">{stats.highRisk}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedTier(selectedTier === 'medium' ? 'all' : 'medium');
            setActionStatusFilter('all');
            setShowOverridesOnly(false);
          }}
          className={chipClass(selectedTier === 'medium')}
        >
          Medium
          <span className="tabular-nums opacity-70">{stats.mediumRisk}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedTier(selectedTier === 'low' ? 'all' : 'low');
            setActionStatusFilter('all');
            setShowOverridesOnly(false);
          }}
          className={chipClass(selectedTier === 'low')}
        >
          Low
          <span className="tabular-nums opacity-70">{stats.lowRisk}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setShowOverridesOnly(!showOverridesOnly);
            setSelectedTier('all');
            setActionStatusFilter('all');
          }}
          className={chipClass(showOverridesOnly)}
        >
          Overrides
          <span className="tabular-nums opacity-70">{stats.overridden}</span>
        </button>
      </div>
    </div>
  );
}
