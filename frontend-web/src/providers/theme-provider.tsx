'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'theme';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  // Load saved preference from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setThemeState(stored);
      } else {
        // Default to light or system if matching
        setThemeState('light');
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Sync DOM classes and media listeners
  useEffect(() => {
    const isDark = theme === 'dark' || (theme === 'system' && getSystemTheme() === 'dark');
    const newResolved = isDark ? 'dark' : 'light';
    setResolvedTheme(newResolved);

    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        const dark = e.matches;
        setResolvedTheme(dark ? 'dark' : 'light');
        if (dark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch {
      // Ignore storage errors
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prevTheme) => {
      // Determine what the current resolved theme is
      const currentResolved = prevTheme === 'dark' || (prevTheme === 'system' && getSystemTheme() === 'dark') ? 'dark' : 'light';
      const nextTheme: Theme = currentResolved === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
      } catch {
        // Ignore storage errors
      }
      return nextTheme;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

const defaultThemeContext: ThemeContextType = {
  theme: 'light',
  resolvedTheme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  return context ?? defaultThemeContext;
}
