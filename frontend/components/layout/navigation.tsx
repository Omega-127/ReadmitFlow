'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutList, Shield, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePatients } from '@/hooks/use-patients';

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  hint?: string;
}

export function Navigation({ className }: { className?: string }) {
  const pathname = usePathname();
  const { stats } = usePatients();

  const navItems: NavItem[] = [
    {
      title: 'Patients',
      href: '/',
      icon: LayoutList,
      hint: stats.highRisk > 0 ? `${stats.highRisk} high risk` : undefined,
    },
    {
      title: 'Capacity',
      href: '/capacity',
      icon: SlidersHorizontal,
    },
    {
      title: 'Model',
      href: '/model-safety',
      icon: Shield,
    },
  ];

  return (
    <nav className={cn('space-y-0.5', className)} aria-label="Main">
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
              'flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors',
              isActive
                ? 'bg-neutral-900 font-medium text-white dark:bg-neutral-100 dark:text-neutral-900'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100'
            )}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="flex items-center gap-2.5">
              <Icon className="h-4 w-4 opacity-70" />
              {item.title}
            </span>
            {item.hint && (
              <span
                className={cn(
                  'text-xs',
                  isActive
                    ? 'text-white/70 dark:text-neutral-600'
                    : 'text-neutral-400 dark:text-neutral-500'
                )}
              >
                {item.hint}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
