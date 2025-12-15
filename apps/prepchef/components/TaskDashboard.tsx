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
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6" role="main">
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

        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <header className="mb-6">
            <p className="text-gray-600 mb-6">Mobile Kitchen Operations</p>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Task Summary</h1>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-600">{availableTasks.length}</div>
                <div className="text-sm text-green-800 font-medium mt-1">Available</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-orange-600">{activeTasks.length}</div>
                <div className="text-sm text-orange-800 font-medium mt-1">Active</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-purple-600">{myTasks.length}</div>
                <div className="text-sm text-purple-800 font-medium mt-1">Mine</div>
              </div>
            </div>
          </header>

          <div className="relative mb-6">
            <input
              type="text"
              placeholder="🔍 Search tasks..."
              className="w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Status</h3>
            <div className="flex flex-wrap gap-2">
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
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    filters.status?.includes(status)
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Priority</h3>
            <div className="flex flex-wrap gap-2">
              {['urgent', 'high', 'normal', 'low'].map((priority) => (
                <button
                  key={priority}
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          {companyId && <CombinationSuggestion companyId={companyId} />}

          {isLoading ? (
            <div className="text-center py-12" role="status" aria-live="polite">
              <p className="text-gray-500">Loading tasks...</p>
            </div>
          ) : (
            <section aria-label="Task list" className="space-y-4">
              {tasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p className="text-lg">No tasks found.</p>
                  <p className="text-sm mt-2">Try adjusting your filters.</p>
                </div>
              ) : (
                <div role="list" aria-label={`Found ${tasks.length} tasks`} className="space-y-3">
                  {tasks.map((task: any) => (
                    <div
                      key={task.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 text-lg">{task.name}</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {task.quantity} {task.unit || 'servings'} • {task.recipe?.name || 'No recipe'}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            task.status === 'available'
                              ? 'bg-green-100 text-green-800'
                              : task.status === 'in-progress'
                                ? 'bg-orange-100 text-orange-800'
                                : task.status === 'completed'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Priority:</span>{' '}
                          <span
                            className={`font-semibold ${
                              task.priority === 'urgent'
                                ? 'text-red-600'
                                : task.priority === 'high'
                                  ? 'text-orange-600'
                                  : 'text-gray-600'
                            }`}
                          >
                            {task.priority}
                          </span>
                          {' | '}
                          <span className="font-medium">Status:</span> {task.status}
                        </div>
                        {task.assigned_user_id !== userId && task.status === 'available' && (
                          <button
                            onClick={() => handleClaim(task.id)}
                            disabled={claimMutation.isPending}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Claim Task
                          </button>
                        )}
                        {task.assigned_user_id === userId && task.status === 'in-progress' && (
                          <button
                            onClick={() => handleComplete(task.id)}
                            disabled={completeMutation.isPending}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Complete
                          </button>
                        )}
                      </div>
                      {task.assigned_user_id === userId && (
                        <div className="mt-3 text-sm text-gray-600">
                          <span className="font-medium">Assigned to: You</span>
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
