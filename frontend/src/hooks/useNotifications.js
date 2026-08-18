// ============================================================================
// Notifications Hook
// ============================================================================

import { useContext } from 'react';
import { NotificationContext } from '../contexts/NotificationContext';

/**
 * Hook for accessing notification context
 */
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  
  return context;
};

export default useNotifications;