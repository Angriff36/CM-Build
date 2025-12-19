'use client';

import React, { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { Toast as UITooltipToast } from '@codemachine/ui';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastOptions {
  id?: string;
  message: string;
  type?: ToastType;
  actionLabel?: string;
  onAction?: () => Promise<void> | void;
  durationMs?: number; // milliseconds, 0 = persistent
  isDismissible?: boolean;
}

interface ToastItem extends Required<Pick<ToastOptions, 'message'>> {
  id: string;
  type: ToastType;
  actionLabel?: string;
  onAction?: () => Promise<void> | void;
  durationMs: number;
  isDismissible: boolean;
  actionRunning?: boolean;
}

interface ToastContextType {
  toasts: ToastItem[];
  // Backwards compatible API
  addToast: (message: string, type: 'success' | 'error', durationMs?: number) => string;
  removeToast: (id: string) => void;
  // New API
  showToast: (opts: ToastOptions) => string;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

export function ToastProvider({ children }: { children: ReactNode }): JSX.Element {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    return () => {
      // Cleanup timers on unmount
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current.clear();
    };
  }, []);

  const removeToast = (id: string) => {
    // clear timer
    const t = timersRef.current.get(id);
    if (t) {
      clearTimeout(t);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const showToast = (opts: ToastOptions) => {
    const id = opts.id ?? Math.random().toString(36).substr(2, 9);
    const toast: ToastItem = {
      id,
      message: opts.message,
      type: opts.type ?? 'info',
      actionLabel: opts.actionLabel,
      onAction: opts.onAction,
      durationMs: typeof opts.durationMs === 'number' ? opts.durationMs : 5000,
      isDismissible: typeof opts.isDismissible === 'boolean' ? opts.isDismissible : true,
      actionRunning: false,
    };

    setToasts((prev) => {
      // keep a small cap on visible toasts (3). Replace oldest if full.
      if (prev.length >= 3) {
        return [...prev.slice(1), toast];
      }
      return [...prev, toast];
    });

    if (toast.durationMs > 0 && typeof window !== 'undefined') {
      const timer = window.setTimeout(() => {
        removeToast(id);
      }, toast.durationMs);
      timersRef.current.set(id, timer as unknown as number);
    }

    return id;
  };

  const addToast = (message: string, type: 'success' | 'error', durationMs = 3000) => {
    return showToast({ message, type, durationMs });
  };

  const runAction = async (id: string) => {
    // run the onAction for the toast with id
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, actionRunning: true } : t)));

    const toast = toasts.find((t) => t.id === id);
    // Note: because of closure, if toasts isn't up to date, we still want to use the latest state
    // we'll use a functional update to fetch the current toast
    let currentToast: ToastItem | undefined;
    setToasts((prev) => {
      currentToast = prev.find((t) => t.id === id);
      return prev;
    });

    try {
      if (currentToast && currentToast.onAction) {
        // cancel auto-dismiss while processing
        const timer = timersRef.current.get(id);
        if (timer) {
          clearTimeout(timer);
          timersRef.current.delete(id);
        }

        await currentToast.onAction();
        removeToast(id);
      }
    } catch (err: any) {
      const message = err?.message || 'Action failed';
      // show an error toast
      showToast({ message, type: 'error' });
      // reset actionRunning
      setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, actionRunning: false } : t)));
    }
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, showToast }}>
      {children}

      {/* Toast container: mobile-first bottom center, desktop top-right */}
      <div
        aria-hidden={toasts.length === 0}
        className="fixed inset-x-4 bottom-4 sm:top-4 sm:right-4 sm:inset-x-auto z-50 pointer-events-none"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)', maxWidth: '100%' }}
      >
        <div className="flex flex-col items-center sm:items-end gap-2">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto w-full sm:w-auto">
              <UITooltipToast
                id={t.id}
                message={t.message}
                type={t.type}
                actionLabel={t.actionLabel}
                onAction={t.onAction ? () => runAction(t.id) : undefined}
                onClose={() => removeToast(t.id)}
                isDismissible={t.isDismissible}
                className="mx-auto sm:mx-0"
              />
            </div>
          ))}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

