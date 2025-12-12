import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { createClient } from '@caterkingapp/supabase';
import { useRealtimeSync } from './useRealtimeSync';

interface UseTasksOptions {
  eventId?: string;
  status?: string | string[];
  search?: string;
  enableRealtime?: boolean;
}

export function useTasks({ eventId, status, search, enableRealtime = true }: UseTasksOptions = {}) {
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const getCompanyId = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCompanyId(user?.user_metadata?.company_id || null);
    };
    if (enableRealtime) {
      getCompanyId();
    }
  }, [enableRealtime]);

  // Realtime sync for tasks
  const realtimeState = useRealtimeSync({
    channelConfig: {
      name: companyId ? `company:${companyId}:tasks` : 'tasks',
      postgresChanges: companyId
        ? [
            {
              event: '*',
              schema: 'public',
              table: 'tasks',
            },
          ]
        : [],
    },
    queryKeysToInvalidate: [['tasks']],
    enablePollingOnDisconnect: true,
  });

  const tasksQuery = useQuery({
    queryKey: ['tasks', eventId, status, search],
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase.from('tasks').select('*');
      if (eventId) {
        query = query.eq('event_id', eventId);
      }
      if (status) {
        if (Array.isArray(status)) {
          query = query.in('status', status);
        } else {
          query = query.eq('status', status);
        }
      }
      if (search) {
        query = query.ilike('name', `%${search}%`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  return {
    ...tasksQuery,
    realtimeState,
  };
}
