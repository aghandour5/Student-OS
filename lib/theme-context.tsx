/**
 * ThemeContext — Provides dark/light theme toggle with AsyncStorage persistence.
 * The selected theme is stored so the user's preference survives app restarts.
 * Components access the current color palette via the `useTheme()` hook.
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Colors, { LightColors } from '@/constants/colors';

type Theme = 'dark' | 'light';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  colors: typeof Colors;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => { },
  isDark: true,
  colors: Colors,
});

// AsyncStorage key for persisting the user's theme preference
const THEME_KEY = '@uniflow_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then(stored => {
      if (stored === 'light' || stored === 'dark') {
        setTheme(stored);
      }
    });
  }, []);

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      AsyncStorage.setItem(THEME_KEY, next);
      return next;
    });
  };

  // Resolve the color palette based on the active theme
  const colors = theme === 'dark' ? Colors : LightColors;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark', colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
