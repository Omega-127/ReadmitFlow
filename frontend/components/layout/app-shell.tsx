'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Menu, RotateCcw, X } from 'lucide-react';
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

  const breadcrumbs = React.useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    const items = [{ label: 'Patients', href: '/' }];

    if (segments.length === 0) return items;

    if (segments[0] === 'capacity') {
      items.push({ label: 'Capacity', href: '/capacity' });
    } else if (segments[0] === 'model-safety') {
      items.push({ label: 'Model', href: '/model-safety' });
    } else if (segments[0] === 'patients' && segments[1]) {
      items.push({ label: segments[1], href: `/patients/${segments[1]}` });
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
    <div className="flex min-h-screen flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <Dialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset demo?</DialogTitle>
            <DialogDescription className="mt-2">
              Clears overrides, assigned actions, capacity changes, scored custom
              patients, and audit history. Seed patient data stays the same.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowResetConfirm(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex w-full flex-1">
        <aside className="hidden w-56 shrink-0 flex-col border-r border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 lg:flex">
          <div className="border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
            <Link href="/" className="block">
              <span className="text-base font-semibold tracking-wide text-neutral-900 dark:text-white">
                ReadmitFlow
              </span>
              <span className="mt-0.5 block text-xs text-neutral-500">
                Discharge follow-up
              </span>
            </Link>
          </div>

          <div className="flex-1 overflow-y-auto p-3">
            <Navigation />
          </div>

          <div className="border-t border-neutral-200 p-3 dark:border-neutral-800">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              className="w-full justify-center gap-2 text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset demo
            </Button>
          </div>
        </aside>

        {mobileOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="flex h-full w-64 flex-col bg-white p-4 dark:bg-neutral-900"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4 dark:border-neutral-800">
                <span className="font-semibold">ReadmitFlow</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 py-4" onClick={() => setMobileOpen(false)}>
                <Navigation />
              </div>

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
                Reset demo
              </Button>
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-neutral-200 bg-white px-4 dark:border-neutral-800 dark:bg-neutral-900 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="rounded p-1.5 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800 lg:hidden"
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>

              <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-neutral-500">
                {breadcrumbs.map((bc, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  return (
                    <React.Fragment key={bc.href + idx}>
                      {idx > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-neutral-400" />}
                      {isLast ? (
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {bc.label}
                        </span>
                      ) : (
                        <Link href={bc.href} className="hover:text-neutral-800 dark:hover:text-neutral-200">
                          {bc.label}
                        </Link>
                      )}
                    </React.Fragment>
                  );
                })}
              </nav>
            </div>

            <div className="flex items-center gap-3 text-xs text-neutral-500">
              {resetSuccess && (
                <span className="hidden text-emerald-700 dark:text-emerald-400 sm:inline">
                  Demo reset
                </span>
              )}

              <span
                className="flex items-center gap-1.5"
                title={
                  isMock
                    ? 'Backend unreachable; using local mock data.'
                    : 'Connected to API.'
                }
              >
                <span
                  className={`h-1.5 w-1.5 rounded-sm ${isMock ? 'bg-amber-500' : 'bg-emerald-600'}`}
                />
                {isMock ? 'Mock data' : 'API connected'}
              </span>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowResetConfirm(true)}
                className="hidden h-8 gap-1.5 text-xs sm:inline-flex"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </Button>
            </div>
          </header>

          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
