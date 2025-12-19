import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  /** Size controls height/padding. lg provides >=48px height for touch targets */
  size?: 'sm' | 'md' | 'lg';
  /** Make button take the full width of its container (responsive: full on mobile) */
  fullWidth?: boolean;
  /** Ensure minimum touch target of 44x44px for icon-only or small buttons */
  minTouch?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth = false, minTouch = false, ...props }, ref) => {
    const sizeClasses =
      size === 'sm'
        ? 'h-9 px-3'
        : size === 'md'
        ? 'h-10 px-4'
        : 'h-12 min-h-[48px] px-5'; // lg => h-12 (48px) with explicit min-height for touch

    const widthClass = fullWidth ? 'w-full sm:w-auto' : 'inline-flex';

    // Ensure minimum touch target meets 44-48px recommendations. For larger buttons we prefer 48px min height.
    const touchClasses = minTouch ? 'min-w-[44px] min-h-[48px] p-2' : '';

    return (
      <button
        ref={ref}
        className={cn(
          // base
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          // size & touch
          sizeClasses,
          widthClass,
          touchClasses,
          // variants
          variant === 'primary' && 'bg-ink-900 text-paper-0 hover:bg-ink-900/90',
          variant === 'secondary' && 'bg-graphite-800 text-paper-0 hover:bg-graphite-800/80',
          variant === 'outline' && 'border border-ink-900 bg-transparent hover:bg-ink-900/10',
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = 'Button';
