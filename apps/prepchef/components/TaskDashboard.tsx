'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@caterkingapp/supabase';
import { useTasks } from '@caterkingapp/shared/hooks/useTasks';
import { useRealtimeSync } from '@caterkingapp/shared/hooks/useRealtimeSync';
import { OfflineBanner } from './offline-banner';
import { TaskFilters } from './TaskFilters';
import { TaskRow } from './TaskRow';
import { CombinationSuggestion } from './CombinationSuggestion';

interface Task {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
  status: string;
  priority: string;
  assigned_user_id: string | null;
  event_id: string | null;
  recipe_id: string | null;
}

interface TaskDashboardProps {
  eventId?: string;
}

export function TaskDashboard({ eventId }: TaskDashboardProps) {
  const [filters, setFilters] = useState<{ eventId?: string; status?: string[]; search?: string }>({
    eventId,
  });
  const [userId, setUserId] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const supabase = createClient();
  const queryClient = useQueryClient();

  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error || !user) {
          console.warn('No authenticated user found:', error?.message);
          // Use a demo company/user for local development
          setUserId('demo-user-id');
          setCompanyId('demo-company-id');
          return;
        }
        setUserId(user.id);
        setCompanyId(user.user_metadata?.company_id || null);
      } catch (err) {
        console.error('Error getting user:', err);
        // Fallback for local dev
        setUserId('demo-user-id');
        setCompanyId('demo-company-id');
      }
    };
    getUser();
  }, [supabase]);

  // Realtime for suggestions - disabled in local dev
  const realtimeState = {
    isConnected: true,
    lastSuccessfulConnection: new Date(),
    connectionAttempts: 0,
  };

  const {
    data: tasks = [],
    isLoading,
    error,
    realtimeState: tasksRealtimeState,
  } = useTasks({ ...filters, enableRealtime: false });

  const claimMutation = useMutation({
    mutationFn: async (taskId: string) => {
      // TODO: Implement claim_task RPC function
      throw new Error('claim_task RPC function not implemented yet');

      // const { error } = await supabase.rpc('claim_task', { task_id: taskId });
      // if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (taskId: string) => {
      // TODO: Implement complete_task RPC function
      throw new Error('complete_task RPC function not implemented yet');

      // const { error } = await supabase.rpc('complete_task', { task_id: taskId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleClaim = (taskId: string) => {
    claimMutation.mutate(taskId);
  };

  const handleComplete = (taskId: string) => {
    completeMutation.mutate(taskId);
  };

  if (!userId) {
    return <div>Loading user...</div>;
  }

  if (error) {
    return <div>Error loading tasks: {error.message}</div>;
  }

  const myTasks = tasks.filter((t: any) => t.assigned_user_id === userId);
  const availableTasks = tasks.filter((t: any) => t.status === 'available');
  const activeTasks = tasks.filter((t: any) => t.status === 'in-progress' && t.assigned_user_id === userId);

  return (
    <main className="min-h-screen bg-gradient-to-br from-cloud-100 via-paper-50 to-slate-300 p-6" role="main">
      <div className="max-w-4xl mx-auto">
        {(!realtimeState.isConnected || !tasksRealtimeState.isConnected) && (
          <OfflineBanner
            mode="realtime"
            lastSync={
              realtimeState.lastSuccessfulConnection ||
              tasksRealtimeState.lastSuccessfulConnection ||
              undefined
            }
            telemetry={{
              reconnectAttempts: Math.max(
                realtimeState.connectionAttempts,
                tasksRealtimeState.connectionAttempts,
              ),
            }}
          />
        )}

        <div className="bg-paper-0 rounded-xl shadow-xl p-8 mb-6 border border-foam-200">
          <header className="mb-8">
            <p className="text-ink-600 text-sm mb-6 tracking-wide">Mobile Kitchen Operations</p>
            <h1 className="text-3xl font-bold text-carbon-900 mb-6">Task Summary</h1>
            <div className="grid grid-cols-3 gap-6">
              <div className="bg-cloud-100 border border-azure-500/20 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-emerald-600 mb-2">{availableTasks.length}</div>
                <div className="text-sm text-emerald-600 font-semibold uppercase tracking-wider">Available</div>
              </div>
              <div className="bg-sun-400/10 border border-sun-400/30 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-amber-600 mb-2">{activeTasks.length}</div>
                <div className="text-sm text-amber-600 font-semibold uppercase tracking-wider">Active</div>
              </div>
              <div className="bg-plum-500/10 border border-plum-500/30 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                <div className="text-4xl font-bold text-plum-500 mb-2">{myTasks.length}</div>
                <div className="text-sm text-plum-500 font-semibold uppercase tracking-wider">Mine</div>
              </div>
            </div>
          </header>

          <div className="relative mb-8">
            <input
              type="text"
              placeholder="🔍 Search tasks..."
              className="w-full px-4 py-3 pl-10 border-2 border-foam-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-azure-500 focus:border-azure-500 transition-all bg-paper-50"
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <div className="mb-8">
            <h3 className="text-xs font-bold text-steel-400 uppercase tracking-wider mb-4">STATUS</h3>
            <div className="flex flex-wrap gap-3">
              {['available', 'claimed', 'in progress', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => {
                    const currentStatuses = filters.status || [];
                    const newStatuses = currentStatuses.includes(status)
                      ? currentStatuses.filter((s) => s !== status)
                      : [...currentStatuses, status];
                    setFilters({ ...filters, status: newStatuses.length > 0 ? newStatuses : undefined });
                  }}
                  className={`px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                    filters.status?.includes(status)
                      ? 'bg-carbon-900 text-paper-0 shadow-lg'
                      : 'bg-paper-100 text-ink-600 hover:bg-foam-200 hover:shadow-md'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-xs font-bold text-steel-400 uppercase tracking-wider mb-4">PRIORITY</h3>
            <div className="flex flex-wrap gap-3">
              {['urgent', 'high', 'normal', 'low'].map((priority) => (
                <button
                  key={priority}
                  className="px-5 py-2.5 rounded-lg text-sm font-semibold bg-paper-100 text-ink-600 hover:bg-foam-200 hover:shadow-md transition-all"
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {companyId && <CombinationSuggestion companyId={companyId} />}

          {isLoading ? (
            <div className="text-center py-16" role="status" aria-live="polite">
              <p className="text-steel-400 text-lg">Loading tasks...</p>
            </div>
          ) : (
            <section aria-label="Task list" className="space-y-4">
              {tasks.length === 0 ? (
                <div className="text-center py-16 text-ink-600">
                  <p className="text-xl font-semibold">No tasks found.</p>
                  <p className="text-sm mt-2">Try adjusting your filters.</p>
                </div>
              ) : (
                <div role="list" aria-label={`Found ${tasks.length} tasks`} className="space-y-4">
                  {tasks.map((task: any) => (
                    <div
                      key={task.id}
                      className="bg-paper-0 border-2 border-foam-200 rounded-xl p-6 hover:shadow-xl hover:border-azure-500/30 transition-all"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-bold text-carbon-900 text-xl mb-2">{task.name}</h3>
                          <p className="text-sm text-ink-600 font-medium">
                            {task.quantity} {task.unit || 'servings'} • {task.recipe?.name || 'No recipe'}
                          </p>
                        </div>
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                            task.status === 'available'
                              ? 'bg-emerald-500 text-paper-0'
                              : task.status === 'in-progress'
                                ? 'bg-sun-400 text-carbon-900'
                                : task.status === 'completed'
                                  ? 'bg-steel-400 text-paper-0'
                                  : 'bg-azure-500 text-paper-0'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-ink-600">
                          <span className="font-semibold">Priority:</span>{' '}
                          <span
                            className={`font-bold ${
                              task.priority === 'urgent'
                                ? 'text-rose-500'
                                : task.priority === 'high'
                                  ? 'text-amber-600'
                                  : 'text-ink-600'
                            }`}
                          >
                            {task.priority}
                          </span>
                          {' | '}
                          <span className="font-semibold">Status:</span> {task.status}
                        </div>
                        {task.assigned_user_id !== userId && task.status === 'available' && (
                          <button
                            onClick={() => handleClaim(task.id)}
                            disabled={claimMutation.isPending}
                            className="bg-azure-500 hover:bg-azure-600 text-paper-0 px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Claim Task
                          </button>
                        )}
                        {task.assigned_user_id === userId && task.status === 'in-progress' && (
                          <button
                            onClick={() => handleComplete(task.id)}
                            disabled={completeMutation.isPending}
                            className="bg-emerald-500 hover:bg-emerald-600 text-paper-0 px-8 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                      {task.assigned_user_id === userId && (
                        <div className="mt-4 pt-4 border-t border-foam-200 text-sm text-ink-600">
                          <span className="font-semibold">Assigned to: You</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
