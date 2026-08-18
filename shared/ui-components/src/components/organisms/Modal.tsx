// ============================================================================
// Modal Component - Reusable Modal Dialog
// ============================================================================

// parking-management-system/shared/ui-components/src/components/organisms/Modal.tsx

import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../utils/classNames';
import { Button } from '../atoms/Button';
import { Icon } from '../atoms/Icon';
import useClickOutside from '../../hooks/useClickOutside';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  children,
  footer,
  className,
  overlayClassName,
  contentClassName,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useClickOutside(modalRef, () => {
    if (closeOnOverlayClick) {
      onClose();
    }
  });

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        'bg-black/50 backdrop-blur-sm',
        overlayClassName
      )}
    >
      <div
        ref={modalRef}
        className={cn(
          'relative w-full bg-white rounded-xl shadow-2xl',
          'max-h-[90vh] overflow-y-auto',
          sizeClasses[size],
          className
        )}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-4 border-b border-gray-200">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {description && (
                <p className="mt-1 text-sm text-gray-500">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Icon name="x" size={20} />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className={cn('p-4', contentClassName)}>{children}</div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;