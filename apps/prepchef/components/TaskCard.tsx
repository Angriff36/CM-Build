'use client';

import { useRef, useState, useEffect } from 'react';
import { Button } from '@codemachine/ui';
import { useToast } from '@codemachine/shared/hooks/useToast';

interface Task {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
  status: string;
  priority: string | null;
  assigned_user_id: string | null;
  event_id: string | null;
  recipe_id: string | null;
  recipe?: {
    id: string;
    name: string;
  };
  event?: {
    id: string;
    name: string;
    scheduled_at: string;
  };
  assigned_user?: {
    id: string;
    display_name: string | null;
    avatar_url: string | null;
  };
}

interface TaskCardProps {
  task: Task;
  onClaim?: () => Promise<any>;
  onStart?: () => Promise<any>;
  onComplete?: () => Promise<any>;
}

export function TaskCard({ task, onClaim, onStart, onComplete }: TaskCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  // useToast may throw if ToastProvider isn't present; fall back to no-op to avoid crashing UI
  let addToast: (message: string, type: 'success' | 'error') => void = () => {};
  try {
    const toastCtx = useToast();
    addToast = toastCtx.addToast;
  } catch (e) {
    // No-op if ToastProvider missing (safe fallback)
  }

  // Map of status -> primary action. Short labels for tight mobile affordances.
  const primaryActionForStatus: Record<string, { label: string; loadingLabel: string; classes: string; aria: string }> = {
    available: {
      label: 'Claim',
      loadingLabel: 'Claiming...',
      classes: 'bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300',
      aria: `Claim task: ${task.name}`,
    },
    claimed: {
      label: 'Start',
      loadingLabel: 'Starting...',
      classes: 'bg-green-600 hover:bg-green-700 disabled:bg-green-300',
      aria: `Start task: ${task.name}`,
    },
    in_progress: {
      label: 'Complete',
      loadingLabel: 'Completing...',
      classes: 'bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300',
      aria: `Complete task: ${task.name}`,
    },
  };

  const currentAction = primaryActionForStatus[task.status];

  // Screen reader messages: polite for status updates, assertive for errors
  const [srPolite, setSrPolite] = useState<string | null>(null);
  const [srAlert, setSrAlert] = useState<string | null>(null);
  const previousStatusRef = useRef<string>(task.status);

  useEffect(() => {
    // Announce status transitions coming from parent updates
    if (previousStatusRef.current !== task.status) {
      let msg = '';
      switch (task.status) {
        case 'claimed':
          msg = `Task claimed: ${task.name}`;
          break;
        case 'in_progress':
          msg = `Task started: ${task.name}`;
          break;
        case 'completed':
          msg = `Task completed: ${task.name}`;
          break;
        case 'available':
          msg = `Task is available: ${task.name}`;
          break;
        default:
          msg = `Task status updated: ${task.name}`;
      }
      setSrPolite(msg);
      previousStatusRef.current = task.status;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.status]);

  // Clear polite messages after a short delay so SR doesn't keep repeating old messages
  useEffect(() => {
    if (!srPolite) return;
    const t = setTimeout(() => setSrPolite(null), 4000);
    return () => clearTimeout(t);
  }, [srPolite]);

  // Clear alerts (errors) after a moderate delay
  useEffect(() => {
    if (!srAlert) return;
    const t = setTimeout(() => setSrAlert(null), 6000);
    return () => clearTimeout(t);
  }, [srAlert]);

  const handlePrimaryAction = async () => {
    if (!currentAction) return;
    setIsLoading(true);
    // Announce the action started to screen reader
    setSrPolite(`${currentAction.loadingLabel} ${task.name}`);

    try {
      if (task.status === 'available') {
        if (onClaim) {
          await onClaim();
        } else {
          const message = 'Claim action is unavailable';
          addToast(message, 'error');
          setSrAlert(message);
          return;
        }
      } else if (task.status === 'claimed') {
        if (onStart) {
          await onStart();
        } else {
          const message = 'Start action is unavailable';
          addToast(message, 'error');
          setSrAlert(message);
          return;
        }
      } else if (task.status === 'in_progress') {
        if (onComplete) {
          await onComplete();
        } else {
          const message = 'Complete action is unavailable';
          addToast(message, 'error');
          setSrAlert(message);
          return;
        }
      }
    } catch (err: any) {
      const message = err?.message || 'Action failed. Please try again.';
      addToast(message, 'error');
      setSrAlert(message);
    } finally {
      setIsLoading(false);
      buttonRef.current?.focus();
    }
  };

  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'normal':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'claimed':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{task.name}</h3>
        <div className="flex gap-2">
          {task.priority && (
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}
            >
              {task.priority}
            </span>
          )}
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}
          >
            {task.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div className="flex justify-between">
          <span>Quantity:</span>
          <span>
            {task.quantity} {task.unit || ''}
          </span>
        </div>

        {task.recipe && (
          <div className="flex justify-between">
            <span>Recipe:</span>
            <span className="text-blue-600">{task.recipe.name}</span>
          </div>
        )}

        {task.event && (
          <div className="flex justify-between">
            <span>Event:</span>
            <span className="text-purple-600">{task.event.name}</span>
          </div>
        )}

        {task.assigned_user && (
          <div className="flex items-center gap-2">
            <span>Assigned to:</span>
            <div className="flex items-center gap-2">
              {task.assigned_user.avatar_url && (
                <img
                  src={task.assigned_user.avatar_url}
                  alt={task.assigned_user.display_name || 'User'}
                  className="w-5 h-5 rounded-full"
                />
              )}
              <span>{task.assigned_user.display_name || 'Unknown'}</span>
            </div>
          </div>
        )}
      </div>

      <div>
        {currentAction ? (
          <Button
            ref={buttonRef}
            size="lg"
            fullWidth
            minTouch
            onClick={handlePrimaryAction}
            disabled={isLoading}
            aria-label={currentAction.aria}
            aria-busy={isLoading}
            className={`${currentAction.classes} text-white`}
            type="button"
          >
            {isLoading ? currentAction.loadingLabel : currentAction.label}
          </Button>
        ) : null}

        {/* Screen reader live regions for status updates and errors. */}
        <div className="sr-only" aria-live="polite" aria-atomic="true">
          {srPolite}
        </div>
        <div className="sr-only" aria-live="assertive" aria-atomic="true">
          {srAlert}
        </div>
      </div>
    </div>
  );
}
