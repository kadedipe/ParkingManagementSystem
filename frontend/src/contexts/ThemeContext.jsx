import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';

export const ThemeContext = createContext(null);

const getInitialThemeMode = () => {
  if (typeof window === 'undefined') return 'light';

  const stored = window.localStorage.getItem('themeMode');
  if (stored === 'light' || stored === 'dark') return stored;

  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const ThemeContextProvider = ({ children }) => {
  const [themeMode, setThemeModeState] = useState(getInitialThemeMode);

  const setThemeMode = useCallback((mode) => {
    if (mode !== 'light' && mode !== 'dark') return;
    setThemeModeState(mode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeModeState((current) => (current === 'dark' ? 'light' : 'dark'));
  }, []);

  useEffect(() => {
    window.localStorage.setItem('themeMode', themeMode);
    document.documentElement.dataset.theme = themeMode;
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
  }, [themeMode]);

  const value = useMemo(
    () => ({ themeMode, toggleTheme, setThemeMode }),
    [themeMode, toggleTheme, setThemeMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export default ThemeContext;
