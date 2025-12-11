import { useQuery } from '@tanstack/react-query';
import { createClient } from '@caterkingapp/supabase/client';

interface UseTasksOptions {
  eventId?: string;
}

export function useTasks({ eventId }: UseTasksOptions = {}) {
  return useQuery({
    queryKey: ['tasks', eventId],
    queryFn: async () => {
      const supabase = createClient();
      let query = supabase.from('tasks').select('*');
      if (eventId) {
        query = query.eq('event_id', eventId);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}
