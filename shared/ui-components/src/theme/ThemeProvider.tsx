// ============================================================================
// Theme Provider - Theme Context Provider
// ============================================================================

// parking-management-system/shared/ui-components/src/theme/ThemeProvider.tsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Theme, lightTheme, darkTheme } from './index';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setThemeState] = useState<Theme>(lightTheme);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setThemeState(darkTheme);
      setIsDark(true);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      setThemeState(lightTheme);
      setIsDark(false);
      localStorage.setItem('theme', 'light');
    } else {
      setThemeState(darkTheme);
      setIsDark(true);
      localStorage.setItem('theme', 'dark');
    }
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    setIsDark(newTheme === darkTheme);
    localStorage.setItem('theme', newTheme === darkTheme ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};