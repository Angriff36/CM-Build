import { useQuery } from '@tanstack/react-query';
import { createClient } from '@caterkingapp/supabase/client';

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      const supabase = createClient();

      // Get user's company_id
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!userData) throw new Error('User company not found');

      // Get events from the company
      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('company_id', userData.company_id)
        .in('status', ['published', 'completed'])
        .order('scheduled_at', { ascending: false });

      if (error) throw error;

      return events || [];
    },
  });
}
