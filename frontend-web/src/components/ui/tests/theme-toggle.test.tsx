import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@/providers/theme-provider';
import { ThemeToggle } from '@/components/ui/theme-toggle';

describe('ThemeToggle & ThemeProvider Component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    vi.restoreAllMocks();
  });

  it('renders theme toggle button with accessible label', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button', { name: /chuyển sang chế độ tối/i });
    expect(button).toBeInTheDocument();
  });

  it('toggles from light to dark mode and updates document class and localStorage', () => {
    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    const button = screen.getByRole('button');
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Click to switch to dark mode
    fireEvent.click(button);

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(screen.getByRole('button', { name: /chuyển sang chế độ sáng/i })).toBeInTheDocument();

    // Click to switch back to light mode
    fireEvent.click(button);

    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
    expect(screen.getByRole('button', { name: /chuyển sang chế độ tối/i })).toBeInTheDocument();
  });

  it('initializes dark mode from localStorage', () => {
    localStorage.setItem('theme', 'dark');

    render(
      <ThemeProvider>
        <ThemeToggle />
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(screen.getByRole('button', { name: /chuyển sang chế độ sáng/i })).toBeInTheDocument();
  });

  it('displays label when showLabel is true', () => {
    render(
      <ThemeProvider>
        <ThemeToggle showLabel />
      </ThemeProvider>
    );

    expect(screen.getByText('Chế độ tối')).toBeInTheDocument();
  });
});
