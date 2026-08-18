// ============================================================================
// Theme Hook
// ============================================================================

import { useContext } from 'react';
import { ThemeContext } from '../contexts/ThemeContext';

/**
 * Custom hook for accessing theme state and methods
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeContextProvider');
  }
  
  return context;
};

export default useTheme;