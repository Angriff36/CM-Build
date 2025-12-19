import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';
import { createClient } from '@codemachine/supabase';

interface DisplaySummaryResponse {
  cards: Array<{
    type: string;
    count: number;
    urgent: boolean;
    event_id?: string;
    station_id?: string;
    avg_duration_ms?: number;
  }>;
  assignments: Array<{
    task_id: string;
    user_display_name: string;
    status: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    created_at?: string;
  }>;
  captured_at: string;
  staleness_ms: number;
  realtime_channel: string;
}

interface UseDisplayDataOptions {
  event_scope?: string;
  station_scope?: string;
  agg?: 'hourly' | 'live';
  since?: string;
}

export function useDisplayData(options: UseDisplayDataOptions = {}) {
  const queryClient = useQueryClient();
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(true);
  const [offlineBanner, setOfflineBanner] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastSuccessfulFetch, setLastSuccessfulFetch] = useState<Date | null>(null);
  const supabase = createClient();

  const query = useQuery({
    queryKey: ['display-summary', options],
    queryFn: async () => {
      // Fetch real data from Supabase
      const [tasksResult, usersResult] = await Promise.all([
        supabase
          .from('tasks')
          .select(
            `
            *,
            assigned_user:users(id, display_name),
            event:events(id, name)
          `,
          )
          .in('status', ['claimed', 'in_progress'])
          .order('priority', { ascending: false }),

        supabase.from('users').select('id, display_name, status').eq('status', 'active'),
      ]);

      if (tasksResult.error) throw tasksResult.error;
      if (usersResult.error) throw usersResult.error;

      const tasks = tasksResult.data || [];
      const users = usersResult.data || [];

      const activeTasks = tasks.filter((t) => t.status === 'in_progress').length;
      const assignedTasks = tasks.filter((t) => t.status === 'claimed').length;
      const completedTasks = await supabase
        .from('tasks')
        .select('id')
        .eq('status', 'completed')
        .then(({ data }) => data?.length || 0);

      const assignments = tasks.map((task) => ({
        task_id: task.id,
        user_display_name: task.assigned_user?.display_name || 'Unassigned',
        status: task.status,
        priority: task.priority,
        task_name: task.name,
        event_name: task.event?.name,
      }));

      return {
        cards: [
          {
            type: 'active_tasks',
            count: activeTasks,
            urgent: tasks.some((t) => t.priority === 'urgent'),
          },
          {
            type: 'assigned_tasks',
            count: assignedTasks,
            urgent: tasks.some((t) => t.priority === 'urgent' && t.status === 'claimed'),
          },
          {
            type: 'completed_tasks',
            count: completedTasks,
            urgent: false,
          },
          {
            type: 'active_staff',
            count: users.length,
            urgent: false,
          },
        ],
        assignments,
        captured_at: new Date().toISOString(),
        staleness_ms: 0,
        realtime_channel: 'company:display_snapshots',
      };
    },
    refetchInterval: useCallback(() => {
      // If realtime is connected, don't poll
      if (isRealtimeConnected) return false;

      // If we've had multiple failed attempts, poll more frequently
      if (connectionAttempts > 3) return 10000; // 10 seconds

      // Default polling when realtime is disconnected
      return 30000; // 30 seconds
    }, [isRealtimeConnected, connectionAttempts]),
    staleTime: 15000, // Consider data stale after 15s
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors, but not for 4xx errors
      if (error instanceof Error && error.message.includes('4')) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const realtimeState = {
    isConnected: false,
    connectionAttempts: 0,
    lastSuccessfulConnection: null,
    isPolling: false,
  };

  // Manual refresh function
  const refresh = useCallback(() => {
    return query.refetch();
  }, [query]);

  // Check if data is stale based on staleness_ms from API
  const isDataStale = query.data ? query.data.staleness_ms > 60000 : false;

  return {
    ...query,
    isRealtimeConnected,
    offlineBanner,
    isDataStale,
    connectionAttempts,
    lastSuccessfulFetch,
    refresh,
  };
}
