'use client';

import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
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

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id || null);
      setCompanyId(user?.user_metadata?.company_id || null);
    };
    getUser();
  }, [supabase]);

  // Realtime for suggestions
  const realtimeState = useRealtimeSync({
    channelConfig: {
      name: `company:${companyId}:task_similarity_suggestions`,
      postgresChanges: [
        {
          event: '*',
          schema: 'public',
          table: 'task_similarity_suggestions',
        },
      ],
    },
    queryKeysToInvalidate: [['combinationSuggestions']],
    enablePollingOnDisconnect: true,
  });

  const {
    data: tasks = [],
    isLoading,
    error,
    realtimeState: tasksRealtimeState,
  } = useTasks(filters);

  const claimMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase.rpc('claim_task', { task_id: taskId });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase.rpc('complete_task', { task_id: taskId });
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
              {tasks.map((task: Task) => (
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
