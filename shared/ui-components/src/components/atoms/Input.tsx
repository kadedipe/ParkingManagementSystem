// ============================================================================
// Input Component - Reusable Input Field
// ============================================================================

// parking-management-system/shared/ui-components/src/components/atoms/Input.tsx

import React, { forwardRef, useState } from 'react';
import { cn } from '../../utils/classNames';
import { Icon } from './Icon';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helper,
      leftIcon,
      rightIcon,
      containerClassName,
      labelClassName,
      inputClassName,
      errorClassName,
      helperClassName,
      className,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    const baseInputClasses = `
      w-full px-4 py-2
      border rounded-lg
      transition-all duration-200
      focus:outline-none focus:ring-2
      disabled:opacity-50 disabled:cursor-not-allowed
      ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}
      ${isFocused ? 'border-blue-500' : ''}
      ${leftIcon ? 'pl-10' : ''}
      ${rightIcon ? 'pr-10' : ''}
    `;

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label
            className={cn(
              'block text-sm font-medium text-gray-700 mb-1',
              error && 'text-red-500',
              labelClassName
            )}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(baseInputClasses, inputClassName, className)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p className={cn('mt-1 text-sm text-red-500', errorClassName)}>{error}</p>
        )}
        {helper && !error && (
          <p className={cn('mt-1 text-sm text-gray-500', helperClassName)}>{helper}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;