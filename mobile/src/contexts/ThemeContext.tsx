// ============================================================================
// ThemeContext - Theme Context Provider
// ============================================================================

// parking-management-system/mobile/src/contexts/ThemeContext.tsx

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { THEME } from '../constants/theme';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  colors: typeof THEME.light.colors;
  typography: typeof THEME.light.typography;
  spacing: typeof THEME.light.spacing;
  borderRadius: typeof THEME.light.borderRadius;
  shadows: typeof THEME.light.shadows;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = '@theme_mode';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const systemColorScheme = useColorScheme();
  const [mode, setMode] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme preference
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedMode = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedMode === 'dark' || savedMode === 'light') {
          setMode(savedMode);
        } else {
          // Use system preference
          setMode(systemColorScheme === 'dark' ? 'dark' : 'light');
        }
      } catch (error) {
        console.error('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, [systemColorScheme]);

  // Save theme preference
  const setTheme = async (newMode: ThemeMode) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, newMode);
      setMode(newMode);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    setTheme(mode === 'light' ? 'dark' : 'light');
  };

  const theme = useMemo(() => {
    return mode === 'dark' ? THEME.dark : THEME.light;
  }, [mode]);

  const contextValue: ThemeContextType = useMemo(
    () => ({
      mode,
      ...theme,
      isDark: mode === 'dark',
      toggleTheme,
      setTheme,
    }),
    [mode, theme]
  );

  if (isLoading) {
    // You could return a loading screen here
    return null;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;