'use client';

import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createClient } from '@codemachine/supabase';
import { useTasks } from '@codemachine/shared/hooks/useTasks';
import { useRealtimeSync } from '@codemachine/shared/hooks/useRealtimeSync';
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

  return (
    <main className="max-w-4xl mx-auto p-6" role="main">
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
      <header>
        <h1 className="text-2xl font-bold mb-6">Task Dashboard</h1>
      </header>

      <TaskFilters onFilterChange={setFilters} initialFilters={filters} />

      {companyId && <CombinationSuggestion companyId={companyId} />}

      {isLoading ? (
        <div className="text-center py-8" role="status" aria-live="polite">
          <p>Loading tasks...</p>
        </div>
      ) : (
        <section aria-label="Task list">
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No tasks found.</p>
              <p className="text-sm mt-2">Try adjusting your filters.</p>
            </div>
          ) : (
            <div role="list" aria-label={`Found ${tasks.length} tasks`}>
              {tasks.map((task: any) => (
                <TaskRow
                  key={task.id}
                  task={task}
                  userId={userId}
                  onClaim={handleClaim}
                  onComplete={handleComplete}
                  isLoading={claimMutation.isPending || completeMutation.isPending}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
