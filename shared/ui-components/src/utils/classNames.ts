// ============================================================================
// Class Names Utility - CSS Class Helpers
// ============================================================================

// parking-management-system/shared/ui-components/src/utils/classNames.ts

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge class names with tailwind-merge for deduplication
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Basic class name merger (without tailwind-merge)
 */
export function clsx(...classes: ClassValue[]) {
  return clsx(classes);
}

export default {
  cn,
  clsx,
};