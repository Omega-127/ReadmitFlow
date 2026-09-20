'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  AlertCircle,
  ChevronRight,
  Menu,
  RotateCcw,
  ShieldAlert,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { Navigation } from './navigation';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDemoWorkflow } from '@/hooks/use-demo-workflow';
import { usePatients } from '@/hooks/use-patients';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const { resetDemo } = useDemoWorkflow();
  const { isMock, refetch } = usePatients();

  // Generate breadcrumb items
  const breadcrumbs = React.useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const items = [{ label: 'Command Center', href: '/' }];

    if (segments.length === 0) return items;

    if (segments[0] === 'capacity') {
      items.push({ label: 'Care Capacity Planner', href: '/capacity' });
    } else if (segments[0] === 'model-safety') {
      items.push({ label: 'Model Safety & Evaluation', href: '/model-safety' });
    } else if (segments[0] === 'patients' && segments[1]) {
      items.push({ label: 'Patients', href: '/' });
      items.push({ label: `Patient ${segments[1]}`, href: `/patients/${segments[1]}` });
    }

    return items;
  }, [pathname]);

  const handleReset = () => {
    resetDemo();
    refetch();
    setShowResetConfirm(false);
    setResetSuccess(true);
    setTimeout(() => setResetSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col antialiased text-slate-900 dark:text-slate-100">
      {/* Reset Confirmation Modal */}
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
                <RotateCcw className="h-5 w-5" />
              </span>
              <div>
                <DialogTitle>Reset Demo Workflow State?</DialogTitle>
                <DialogDescription className="mt-1">
                  This will restore all tier overrides, care actions, capacity adjustments, and audit events back to the clean seed dataset.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="rounded-lg bg-slate-100 dark:bg-slate-900 p-3 text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <p className="font-semibold text-slate-700 dark:text-slate-300">The following state will be re-initialized:</p>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Clinician priority overrides</li>
              <li>Care coordinator assigned follow-up actions</li>
              <li>Custom daily capacity limits</li>
              <li>Patient review audit timeline</li>
            </ul>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowResetConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReset}
              className="gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset to Clean Seed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex flex-1 w-full">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm shrink-0">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-md shadow-blue-500/20">
                <Activity className="h-5 w-5" />
              </div>
              <div>
                <span className="font-bold tracking-tight text-base text-slate-900 dark:text-white flex items-center gap-1.5">
                  Readmit<span className="text-blue-600 dark:text-blue-400 font-extrabold">Flow</span>
                </span>
                <span className="block text-[10px] font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Clinical Decision Support
                </span>
              </div>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div>
              <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Navigation
              </p>
              <Navigation />
            </div>

            <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 p-3.5 text-xs text-slate-600 dark:text-slate-400 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                <ShieldAlert className="h-4 w-4 text-amber-500" />
                <span>Accountable CDS</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Demonstrating transparent risk stratification, clinician override accountability, and capacity-aware action planning.
              </p>
              <div className="pt-1 text-[10px] text-slate-400">
                v1.0.0 • Synthetic Cohort
              </div>
            </div>
          </div>

          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              className="w-full justify-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
              Reset Demo State
            </Button>
          </div>
        </aside>

        {/* Mobile Header & Drawer */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/50 lg:hidden backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="w-72 h-full bg-white dark:bg-slate-900 p-4 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
                    <Activity className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-base">ReadmitFlow</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 py-4">
                <Navigation />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setMobileOpen(false);
                    setShowResetConfirm(true);
                  }}
                  className="w-full gap-2 text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset Demo State
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Top Bar */}
          <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-1.5 rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                aria-label="Open sidebar menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              {/* Breadcrumbs */}
              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {breadcrumbs.map((bc, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  return (
                    <React.Fragment key={bc.href + idx}>
                      {idx > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-400 shrink-0" />}
                      {isLast ? (
                        <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[200px] sm:max-w-none">
                          {bc.label}
                        </span>
                      ) : (
                        <Link
                          href={bc.href}
                          className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                          {bc.label}
                        </Link>
                      )}
                    </React.Fragment>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-3">
              {/* Reset Success Toast Pill */}
              {resetSuccess && (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-medium animate-in fade-in zoom-in-95">
                  <span>Demo state reset!</span>
                </span>
              )}

              {/* Backend Status Pill */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300"
                title={
                  isMock
                    ? 'Backend unreachable; running with self-contained synthetic mock data.'
                    : 'Connected to live FastAPI backend service.'
                }
              >
                {isMock ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                    <span className="hidden sm:inline">Mock Data Mode</span>
                    <span className="sm:hidden">Mock</span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="hidden sm:inline">API Connected</span>
                    <span className="sm:hidden">Live</span>
                  </>
                )}
              </div>

              {/* Quick Reset Demo button on header */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowResetConfirm(true)}
                className="hidden sm:inline-flex gap-1.5 text-xs text-slate-700 dark:text-slate-300 hover:text-slate-900"
                title="Reset all overrides, actions, and capacity to default seed"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Demo</span>
              </Button>
            </div>
          </header>

          {/* Page Body */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
