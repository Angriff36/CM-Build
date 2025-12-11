import { useQuery } from '@tanstack/react-query';
import { createClient } from '@caterkingapp/supabase/client';

interface UseTasksOptions {
  eventId?: string;
  status?: string | string[];
  search?: string;
}

export function useTasks({ eventId, status, search }: UseTasksOptions = {}) {
  return useQuery({
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
}
