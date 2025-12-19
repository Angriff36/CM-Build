import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Button } from './Button';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastProps {
  id?: string;
  title?: React.ReactNode;
  message: React.ReactNode;
  type?: ToastType;
  actionLabel?: string;
  onAction?: () => Promise<void> | void;
  onClose?: () => void;
  durationMs?: number;
  isDismissible?: boolean;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  title,
  message,
  type = 'info',
  actionLabel,
  onAction,
  onClose,
  isDismissible = true,
  className,
}) => {
  const [isDoingAction, setIsDoingAction] = React.useState(false);

  // Use polite announcements for toasts (non-interruptive). Errors can still be conveyed via visuals.
  const role = 'status';
  const ariaLive = 'polite';

  const handleAction = async () => {
    if (!onAction || isDoingAction) return;
    try {
      setIsDoingAction(true);
      await onAction();
    } finally {
      setIsDoingAction(false);
      // on successful action we close the toast; the provider that created the toast
      // should also be responsible for any followup to reflect remote state.
      onClose?.();
    }
  };

  const typeBg =
    type === 'success'
      ? 'bg-green-600 text-paper-0'
      : type === 'error'
      ? 'bg-red-600 text-paper-0'
      : type === 'info'
      ? 'bg-blue-600 text-paper-0'
      : 'bg-ink-900 text-paper-0';

  return (
    <div
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      className={cn(
        'shadow-lg rounded-md w-full max-w-md',
        'transform transition-all duration-200 ease-out',
        typeBg,
        className,
      )}
    >
      <div
        className={cn(
          'flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3',
        )}
      >
        <div className="flex-1 min-w-0">
          {title && <div className="font-medium truncate">{title}</div>}
          <div className="text-sm mt-0.5 break-words">{message}</div>
        </div>

        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          {actionLabel && (
            <Button
              onClick={handleAction}
              size="md"
              minTouch
              variant="outline"
              className={cn(
                // make the outline button visible on colored backgrounds
                'border-paper-0 text-paper-0 hover:bg-white/10',
                isDoingAction && 'opacity-70 pointer-events-none',
              )}
              aria-label={actionLabel}
            >
              {isDoingAction ? 'Processing…' : actionLabel}
            </Button>
          )}

          {isDismissible && (
            <button
              onClick={() => onClose?.()}
              aria-label="Dismiss"
              className="p-2 rounded-md focus:outline-none focus-visible:ring-1 focus-visible:ring-paper-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                width="18"
                height="18"
                className="fill-current text-paper-0"
                aria-hidden
              >
                <path d="M18.3 5.71a1 1 0 0 0-1.41 0L12 10.59 7.11 5.7A1 1 0 0 0 5.7 7.11L10.59 12l-4.9 4.89a1 1 0 1 0 1.41 1.41L12 13.41l4.89 4.9a1 1 0 0 0 1.41-1.41L13.41 12l4.9-4.89a1 1 0 0 0 0-1.4z" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

Toast.displayName = 'Toast';
