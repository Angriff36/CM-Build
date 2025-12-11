import { useQuery } from '@tanstack/react-query';
import { createClient } from '@caterkingapp/supabase/client';

interface UseStaffOptions {
  eventId?: string;
}

interface Staff {
  id: string;
  display_name: string;
  role: string;
  status: string;
  presence: 'online' | 'idle' | 'offline';
  shift_start?: string;
  shift_end?: string;
}

export function useStaff({ eventId }: UseStaffOptions = {}) {
  return useQuery({
    queryKey: ['staff', eventId],
    queryFn: async () => {
      const supabase = createClient();

      // Get users from the same company as current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First get user's company_id
      const { data: userData } = await supabase
        .from('users')
        .select('company_id')
        .eq('id', user.id)
        .single();

      if (!userData) throw new Error('User company not found');

      // Get all staff from the company
      const { data: staff, error } = await supabase
        .from('users')
        .select('id, display_name, role, status')
        .eq('company_id', userData.company_id)
        .eq('status', 'active')
        .in('role', ['staff', 'manager', 'event_lead', 'owner']);

      if (error) throw error;

      // Mock presence data - in real implementation this would come from presence system
      const staffWithPresence = (staff || []).map((user) => ({
        ...user,
        presence:
          Math.random() > 0.3 ? 'online' : Math.random() > 0.5 ? 'idle' : ('offline' as const),
        shift_start: '09:00',
        shift_end: '17:00',
      }));

      return staffWithPresence as Staff[];
    },
  });
}
