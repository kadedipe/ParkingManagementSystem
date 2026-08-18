// ============================================================================
// API Types - Common API Type Definitions
// ============================================================================

// parking-management-system/shared/types/src/api.types.ts

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  timestamp: string;
  path?: string;
  statusCode?: number;
}

/**
 * API Error Response
 */
export interface ApiError {
  code: string;
  message: string;
  status: number;
  details?: any;
  timestamp: string;
  path?: string;
}

/**
 * Pagination request parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Filter parameters
 */
export interface FilterParams {
  search?: string;
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
  [key: string]: any;
}

/**
 * Sort parameters
 */
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

/**
 * API Request options
 */
export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  retry?: number;
  cache?: boolean;
}