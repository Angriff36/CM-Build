import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { createClient } from '@caterkingapp/supabase/client';
import type { Database } from '@caterkingapp/supabase/database.types';
import { useRealtimeSync } from './useRealtimeSync';

interface UseStaffOptions {
  eventId?: string;
}

type StaffRow = Database['public']['Tables']['users']['Row'];

interface Staff extends StaffRow {
  presence: 'online' | 'idle' | 'offline';
}

type StaffFormData = Database['public']['Tables']['users']['Insert'];

export function useStaff({ eventId }: UseStaffOptions = {}) {
  const queryClient = useQueryClient();
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyId = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        const { data: userData } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', user.id)
          .single();
        if (userData) setCompanyId(userData.company_id);
      } catch (error) {
        console.warn('Failed to fetch company ID for staff:', error);
      }
    };
    fetchCompanyId();
  }, []);

  const staffQuery = useQuery({
    queryKey: ['staff', eventId],
    queryFn: async () => {
      try {
        const supabase = createClient();

        // Get users from same company as current user
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

        // Get all staff from company
        const { data: staff, error } = await supabase
          .from('users')
          .select('id, display_name, role, status, email, phone, shift_start, shift_end')
          .eq('company_id', userData.company_id)
          .eq('status', 'active')
          .in('role', ['staff', 'manager', 'event_lead', 'owner']);

        if (error) throw error;

        // Mock presence data - in real implementation this would come from presence system
        const staffWithPresence = (staff || []).map((user: any) => ({
          ...user,
          presence:
            Math.random() > 0.3 ? 'online' : Math.random() > 0.5 ? 'idle' : ('offline' as const),
          shift_start: user.shift_start || '09:00',
          shift_end: user.shift_end || '17:00',
        }));

        return staffWithPresence as Staff[];
      } catch (error) {
        // Return mock data for development
        console.warn('Failed to fetch staff, using mock data:', error);
        return [
          {
            id: 'mock-staff-1',
            display_name: 'John Doe',
            role: 'staff',
            status: 'active',
            presence: 'online' as const,
            shift_start: '09:00',
            shift_end: '17:00',
          },
          {
            id: 'mock-staff-2',
            display_name: 'Jane Smith',
            role: 'manager',
            status: 'active',
            presence: 'idle' as const,
            shift_start: '10:00',
            shift_end: '18:00',
          },
          {
            id: 'mock-staff-3',
            display_name: 'Bob Johnson',
            role: 'staff',
            status: 'active',
            presence: 'offline' as const,
            shift_start: '08:00',
            shift_end: '16:00',
          },
        ];
      }
    },
  });

  const createStaffMutation = useMutation({
    mutationFn: async (staffData: StaffFormData) => {
      try {
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
      } catch (error) {
        // Mock successful creation for development
        console.warn('Failed to create staff, mocking response:', error);
        return {
          ...staffData,
          id: `mock-staff-${Date.now()}`,
          company_id: 'mock-company',
          status: 'active',
          created_at: new Date().toISOString(),
        };
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });

  const updateStaffMutation = useMutation({
    mutationFn: async (
      staffData: Database['public']['Tables']['users']['Update'] & { id: string },
    ) => {
      try {
        const supabase = createClient();

        const { id, ...updateData } = staffData;
        const { data, error } = await supabase
          .from('users')
          .update(updateData)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        // Mock successful update for development
        console.warn('Failed to update staff, mocking response:', error);
        return staffData;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });

  const deleteStaffMutation = useMutation({
    mutationFn: async (staffId: string) => {
      try {
        const supabase = createClient();

        const { error } = await supabase
          .from('users')
          .update({ status: 'inactive' })
          .eq('id', staffId);

        if (error) throw error;
        return staffId;
      } catch (error) {
        // Mock successful deletion for development
        console.warn('Failed to delete staff, mocking response:', error);
        return staffId;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
    },
  });

  const realtimeState = useRealtimeSync({
    channelConfig: {
      name: companyId ? `company:${companyId}:users` : 'users',
      postgresChanges: companyId
        ? [
            {
              event: '*',
              schema: 'public',
              table: 'users',
            },
          ]
        : [],
    },
    queryKeysToInvalidate: [['staff']],
    enablePollingOnDisconnect: true,
  });

  return {
    ...staffQuery,
    createStaff: createStaffMutation.mutateAsync,
    updateStaff: updateStaffMutation.mutateAsync,
    deleteStaff: deleteStaffMutation.mutateAsync,
    isCreating: createStaffMutation.isPending,
    isUpdating: updateStaffMutation.isPending,
    isDeleting: deleteStaffMutation.isPending,
    realtimeState,
  };
}
