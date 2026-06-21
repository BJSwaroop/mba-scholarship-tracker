import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';
const THEME_KEY = 'mba-tracker:theme';

function getInitialTheme(): Theme {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* ignore */
  }
  // Default light, as requested (don't auto-follow the OS).
  return 'light';
}

export function useTheme(): [Theme, () => void] {
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));
  return [theme, toggle];
}
