// ============================================================================
// Types Index - Export All Types
// ============================================================================

// parking-management-system/mobile/src/types/index.ts

// API Types
export * from './api.types';

// Route Types
export * from './route.types';

// Component Prop Types
export interface ComponentProps {
  className?: string;
  style?: any;
  testID?: string;
  accessibilityLabel?: string;
}

// Context Types
export interface ContextProviderProps {
  children: React.ReactNode;
}

// Hook Types
export interface HookResult<T = any> {
  data: T;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// Form Types
export interface FormField {
  name: string;
  value: any;
  error?: string;
  touched?: boolean;
}

export interface FormState {
  fields: FormField[];
  isValid: boolean;
  isSubmitting: boolean;
  submitCount: number;
}

// Modal Types
export interface ModalProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// Toast Types
export interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onDismiss?: () => void;
}

// Bottom Sheet Types
export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  snapPoints?: string[];
  children: React.ReactNode;
}

// Loading Types
export interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

// Empty State Types
export interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  image?: any;
  buttonTitle?: string;
  onButtonPress?: () => void;
}

export default {
  // API Types
  User,
  Vehicle,
  ParkingLot,
  ParkingSpot,
  Booking,
  Payment,
  Notification,
  
  // Route Types
  AuthStackParamList,
  MainStackParamList,
  TabParamList,
};