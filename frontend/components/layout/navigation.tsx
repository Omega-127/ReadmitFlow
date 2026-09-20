'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Activity,
  LayoutDashboard,
  ShieldCheck,
  Sliders,
  Users,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePatients } from '@/hooks/use-patients';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
  badgeVariant?: 'default' | 'high' | 'clinical';
}

export function Navigation({ className }: { className?: string }) {
  const pathname = usePathname();
  const { stats } = usePatients();

  const navItems: NavItem[] = [
    {
      title: 'Command Center',
      href: '/',
      icon: LayoutDashboard,
      badge: stats.highRisk > 0 ? `${stats.highRisk} High` : undefined,
      badgeVariant: 'high',
    },
    {
      title: 'Care Capacity Planner',
      href: '/capacity',
      icon: Sliders,
    },
    {
      title: 'Model Safety & Eval',
      href: '/model-safety',
      icon: ShieldCheck,
      badge: 'Demo Model',
      badgeVariant: 'clinical',
    },
  ];

  return (
    <nav className={cn('space-y-1', className)} aria-label="Main Navigation">
      {navItems.map((item) => {
        const isActive =
          item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);

        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-150',
              isActive
                ? 'bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-950/60 dark:text-blue-300 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <div className="flex items-center gap-3">
              <Icon
                className={cn(
                  'h-4 w-4 transition-colors',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                )}
              />
              <span>{item.title}</span>
            </div>

            {item.badge && (
              <span
                className={cn(
                  'rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide',
                  item.badgeVariant === 'high'
                    ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                    : item.badgeVariant === 'clinical'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                )}
              >
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
