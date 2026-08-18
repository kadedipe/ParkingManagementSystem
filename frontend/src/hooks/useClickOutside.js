// ============================================================================
// Click Outside Hook
// ============================================================================

import { useEffect, useRef } from 'react';

/**
 * Hook that triggers a callback when clicking outside of a referenced element
 */
export const useClickOutside = (ref, callback) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (ref.current && !ref.current.contains(event.target)) {
        savedCallback.current(event);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [ref]);
};

export default useClickOutside;