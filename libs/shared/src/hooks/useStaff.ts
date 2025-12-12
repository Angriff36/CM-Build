import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  email?: string;
  phone?: string;
}

interface StaffFormData {
  display_name: string;
  role: string;
  shift_start?: string;
  shift_end?: string;
  phone?: string;
}

export function useStaff({ eventId }: UseStaffOptions = {}) {
  const queryClient = useQueryClient();

  const staffQuery = useQuery({
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
        .select('id, display_name, role, status, email, phone, shift_start, shift_end')
        .eq('company_id', userData.company_id)
        .eq('status', 'active')
        .in('role', ['staff', 'manager', 'event_lead', 'owner']);

      if (error) throw error;

      // Mock presence data - in real implementation this would come from presence system
      const staffWithPresence = (staff || []).map((user) => ({
        ...user,
        presence:
          Math.random() > 0.3 ? 'online' : Math.random() > 0.5 ? 'idle' : ('offline' as const),
        shift_start: user.shift_start || '09:00',
        shift_end: user.shift_end || '17:00',
      }));

      return staffWithPresence as Staff[];
    },
  });

  const createStaffMutation = useMutation({
    mutationFn: async (staffData: StaffFormData) => {
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

      const { data, error } = await supabase
        .from('users')
        .insert({
          ...staffData,
          company_id: userData.company_id,
          status: 'active',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });

  const updateStaffMutation = useMutation({
    mutationFn: async (staffData: Staff & StaffFormData) => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('users')
        .update({
          display_name: staffData.display_name,
          role: staffData.role,
          shift_start: staffData.shift_start,
          shift_end: staffData.shift_end,
          phone: staffData.phone,
        })
        .eq('id', staffData.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (staffId: string) => {
      const supabase = createClient();

      const { error } = await supabase
        .from('users')
        .update({ status: 'inactive' })
        .eq('id', staffId);

      if (error) throw error;
      return staffId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });

  return {
    ...staffQuery,
    createStaff: createStaffMutation.mutateAsync,
    updateStaff: updateStaffMutation.mutateAsync,
    deleteStaff: deleteStaffMutation.mutateAsync,
    isCreating: createStaffMutation.isPending,
    isUpdating: updateStaffMutation.isPending,
    isDeleting: deleteStaffMutation.isPending,
  };
}
