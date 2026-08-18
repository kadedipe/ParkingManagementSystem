// ============================================================================
// Card Component - Reusable Card Container
// ============================================================================

// parking-management-system/shared/ui-components/src/components/molecules/Card.tsx

import React from 'react';
import { cn } from '../../utils/classNames';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  hoverable?: boolean;
  clickable?: boolean;
  onClick?: () => void;
}

const variantClasses = {
  default: 'bg-white border border-gray-200',
  elevated: 'bg-white shadow-lg shadow-gray-200',
  outlined: 'bg-transparent border-2 border-gray-300',
  flat: 'bg-gray-50',
};

const paddingClasses = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8',
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      hoverable = false,
      clickable = false,
      onClick,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseClasses = `
      rounded-lg transition-all duration-200
      ${hoverable ? 'hover:shadow-lg hover:shadow-gray-200' : ''}
      ${clickable ? 'cursor-pointer hover:transform hover:scale-[1.02]' : ''}
    `;

    const classes = cn(
      baseClasses,
      variantClasses[variant],
      paddingClasses[padding],
      className
    );

    return (
      <div
        ref={ref}
        className={classes}
        onClick={clickable && onClick ? onClick : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;