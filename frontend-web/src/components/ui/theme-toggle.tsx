'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '@/providers/theme-provider';
import { cn } from '@/lib/utils';

export interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted && resolvedTheme === 'dark';
  const label = isDark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100',
        'dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800',
        'transition-all duration-200 cursor-pointer active:scale-95 inline-flex items-center gap-2',
        className
      )}
      title={label}
      aria-label={label}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-500 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400 transition-transform duration-300 hover:-rotate-12" />
      )}
      {showLabel && (
        <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
          {isDark ? 'Chế độ sáng' : 'Chế độ tối'}
        </span>
      )}
    </button>
  );
}
