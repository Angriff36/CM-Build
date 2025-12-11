import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
          'h-9 px-4 py-2',
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
