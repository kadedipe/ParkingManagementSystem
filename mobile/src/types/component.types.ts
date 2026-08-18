// ============================================================================
// Component Types - TypeScript Type Definitions for Components
// ============================================================================

// parking-management-system/mobile/src/types/component.types.ts

import { ReactNode } from 'react';
import { ViewStyle, TextStyle, ImageStyle } from 'react-native';

/**
 * Base Component Props
 */
export interface BaseComponentProps {
  style?: ViewStyle | TextStyle | ImageStyle | (ViewStyle | TextStyle | ImageStyle)[];
  testID?: string;
  accessibilityLabel?: string;
}

/**
 * Button Component Props
 */
export interface ButtonProps extends BaseComponentProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
}

/**
 * Input Component Props
 */
export interface InputProps extends BaseComponentProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  helper?: string;
  disabled?: boolean;
  required?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onFocus?: () => void;
  onBlur?: () => void;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  multiline?: boolean;
  numberOfLines?: number;
}

/**
 * Card Component Props
 */
export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'small' | 'medium' | 'large';
  pressable?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
  children: ReactNode;
  backgroundColor?: string;
  borderColor?: string;
}

/**
 * Modal Component Props
 */
export interface ModalProps extends BaseComponentProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  animationType?: 'none' | 'slide' | 'fade';
  transparent?: boolean;
  closeOnBackdropPress?: boolean;
  closeOnSwipe?: boolean;
}

/**
 * Toast Component Props
 */
export interface ToastProps extends BaseComponentProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onDismiss?: () => void;
  position?: 'top' | 'bottom';
}

/**
 * Loading Component Props
 */
export interface LoadingProps extends BaseComponentProps {
  size?: 'small' | 'large';
  color?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  message?: string;
}

/**
 * Empty State Component Props
 */
export interface EmptyStateProps extends BaseComponentProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  image?: any;
  buttonTitle?: string;
  onButtonPress?: () => void;
}

/**
 * Avatar Component Props
 */
export interface AvatarProps extends BaseComponentProps {
  source?: any;
  name?: string;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  variant?: 'circle' | 'square' | 'rounded';
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  showStatus?: boolean;
  statusColor?: string;
  onPress?: () => void;
}

/**
 * Badge Component Props
 */
export interface BadgeProps extends BaseComponentProps {
  text: string;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark';
  size?: 'small' | 'medium' | 'large';
  rounded?: boolean;
  dot?: boolean;
}

/**
 * Chip Component Props
 */
export interface ChipProps extends BaseComponentProps {
  label: string;
  icon?: ReactNode;
  onPress?: () => void;
  onClose?: () => void;
  selected?: boolean;
  disabled?: boolean;
  variant?: 'default' | 'outline' | 'filled';
  size?: 'small' | 'medium' | 'large';
}

/**
 * Rating Component Props
 */
export interface RatingProps extends BaseComponentProps {
  rating: number;
  maxStars?: number;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  showLabel?: boolean;
  interactive?: boolean;
  onRatingChange?: (rating: number) => void;
}

/**
 * Progress Bar Component Props
 */
export interface ProgressBarProps extends BaseComponentProps {
  progress: number;
  max?: number;
  height?: number;
  color?: string;
  backgroundColor?: string;
  showLabel?: boolean;
  labelPosition?: 'above' | 'below' | 'inside';
  labelFormat?: 'percentage' | 'fraction' | 'value';
  animated?: boolean;
}

/**
 * Price Tag Component Props
 */
export interface PriceTagProps extends BaseComponentProps {
  amount: number | string;
  currency?: string;
  period?: string;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'small' | 'medium' | 'large';
  color?: string;
  strikethrough?: boolean;
}

/**
 * Search Input Component Props
 */
export interface SearchInputProps extends BaseComponentProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onSearch?: (text: string) => void;
  onClear?: () => void;
  variant?: 'default' | 'outlined' | 'filled' | 'underlined';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  autoFocus?: boolean;
}

/**
 * Divider Component Props
 */
export interface DividerProps extends BaseComponentProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  color?: string;
  margin?: number;
  text?: string;
}

/**
 * Tab Component Props
 */
export interface TabProps extends BaseComponentProps {
  label: string;
  icon?: ReactNode;
  active?: boolean;
  onPress?: () => void;
  badge?: string | number;
}

/**
 * Section Component Props
 */
export interface SectionProps extends BaseComponentProps {
  title?: string;
  children: ReactNode;
  headerRight?: ReactNode;
  footer?: ReactNode;
}

/**
 * List Item Component Props
 */
export interface ListItemProps extends BaseComponentProps {
  title: string;
  subtitle?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  showArrow?: boolean;
  badge?: string | number;
  height?: number;
}

export default {
  BaseComponentProps,
  ButtonProps,
  InputProps,
  CardProps,
  ModalProps,
  ToastProps,
  LoadingProps,
  EmptyStateProps,
  AvatarProps,
  BadgeProps,
  ChipProps,
  RatingProps,
  ProgressBarProps,
  PriceTagProps,
  SearchInputProps,
  DividerProps,
  TabProps,
  SectionProps,
  ListItemProps,
};