// ============================================================================
// useNetwork Hook - Network Status Hook
// ============================================================================

// parking-management-system/mobile/src/hooks/useNetwork.ts

import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export const useNetwork = () => {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected || false);
      setIsInternetReachable(state.isInternetReachable || false);
      setConnectionType(state.type || null);
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return {
    isConnected,
    isInternetReachable,
    connectionType,
    isLoading,
  };
};

export default useNetwork;