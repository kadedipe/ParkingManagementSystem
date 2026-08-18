// ============================================================================
// Array Utilities - Array Manipulation Functions
// ============================================================================

// parking-management-system/shared/utils/src/array.ts

import { isEqual, difference, intersection, union } from 'lodash';

/**
 * Chunk array into smaller arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
  if (!array.length || size < 1) return [];
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Group array by key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  if (!array.length) return {};
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Group array by function
 */
export function groupByFn<T>(array: T[], fn: (item: T) => string): Record<string, T[]> {
  if (!array.length) return {};
  return array.reduce((groups, item) => {
    const key = fn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Unique array (by value)
 */
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

/**
 * Unique array (by key)
 */
export function uniqueByKey<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const value = item[key];
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * Unique array (by function)
 */
export function uniqueByFn<T>(array: T[], fn: (item: T) => any): T[] {
  const seen = new Set();
  return array.filter((item) => {
    const value = fn(item);
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/**
 * Sort array by key
 */
export function sortByKey<T>(
  array: T[],
  key: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Sort array by function
 */
export function sortByFn<T>(
  array: T[],
  fn: (item: T) => any,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = fn(a);
    const bVal = fn(b);
    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Find duplicates in array
 */
export function findDuplicates<T>(array: T[]): T[] {
  const seen = new Set();
  const duplicates = new Set();
  array.forEach((item) => {
    if (seen.has(item)) {
      duplicates.add(item);
    } else {
      seen.add(item);
    }
  });
  return Array.from(duplicates);
}

/**
 * Find duplicates by key
 */
export function findDuplicatesByKey<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  const duplicates: T[] = [];
  array.forEach((item) => {
    const value = item[key];
    if (seen.has(value)) {
      duplicates.push(item);
    } else {
      seen.add(value);
    }
  });
  return duplicates;
}

/**
 * Intersection of arrays
 */
export function intersectionOf<T>(...arrays: T[][]): T[] {
  return intersection(...arrays);
}

/**
 * Union of arrays
 */
export function unionOf<T>(...arrays: T[][]): T[] {
  return union(...arrays);
}

/**
 * Difference of arrays
 */
export function differenceOf<T>(array1: T[], array2: T[]): T[] {
  return difference(array1, array2);
}

/**
 * Flatten nested array
 */
export function flatten<T>(array: T[][]): T[] {
  return array.reduce((flat, item) => flat.concat(item), []);
}

/**
 * Deep flatten nested array
 */
export function deepFlatten<T>(array: any[]): T[] {
  return array.reduce((flat, item) => {
    if (Array.isArray(item)) {
      return flat.concat(deepFlatten(item));
    }
    return flat.concat(item);
  }, []);
}

/**
 * Move item in array
 */
export function moveItem<T>(array: T[], from: number, to: number): T[] {
  const result = [...array];
  const [removed] = result.splice(from, 1);
  result.splice(to, 0, removed);
  return result;
}

/**
 * Remove item from array
 */
export function removeItem<T>(array: T[], item: T): T[] {
  const index = array.indexOf(item);
  if (index === -1) return array;
  return [...array.slice(0, index), ...array.slice(index + 1)];
}

/**
 * Remove items from array
 */
export function removeItems<T>(array: T[], items: T[]): T[] {
  return array.filter((item) => !items.includes(item));
}

/**
 * Remove item by key
 */
export function removeItemByKey<T>(array: T[], key: keyof T, value: any): T[] {
  return array.filter((item) => item[key] !== value);
}

/**
 * Replace item in array
 */
export function replaceItem<T>(array: T[], oldItem: T, newItem: T): T[] {
  const index = array.indexOf(oldItem);
  if (index === -1) return array;
  return [...array.slice(0, index), newItem, ...array.slice(index + 1)];
}

/**
 * Replace item by key
 */
export function replaceItemByKey<T>(array: T[], key: keyof T, value: any, newItem: T): T[] {
  const index = array.findIndex((item) => item[key] === value);
  if (index === -1) return array;
  return [...array.slice(0, index), newItem, ...array.slice(index + 1)];
}

/**
 * Get last item in array
 */
export function last<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

/**
 * Get first item in array
 */
export function first<T>(array: T[]): T | undefined {
  return array[0];
}

/**
 * Is array empty
 */
export function isEmptyArray<T>(array: T[]): boolean {
  return !array || array.length === 0;
}

/**
 * Is array not empty
 */
export function isNotEmptyArray<T>(array: T[]): boolean {
  return array && array.length > 0;
}

/**
 * Shuffle array
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Sample random item from array
 */
export function sample<T>(array: T[]): T | undefined {
  if (!array.length) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Sample multiple random items from array
 */
export function sampleSize<T>(array: T[], size: number): T[] {
  const shuffled = shuffle(array);
  return shuffled.slice(0, Math.min(size, shuffled.length));
}