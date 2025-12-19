import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { createClient } from '@codemachine/supabase/client';
import type { Database } from '@codemachine/supabase/database.types';
import { useRealtimeSync } from './useRealtimeSync';

type Event = Database['public']['Tables']['events']['Row'];

export function useEvents() {
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
        // Handle authentication errors gracefully in development
        console.warn('Authentication failed, using mock data:', error);
      }
    };
    fetchCompanyId();
  }, []);

  const eventsQuery = useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      // Return mock data for development/testing
      return [
        {
          id: 'mock-event-1',
          name: 'Sample Event',
          status: 'published',
          scheduled_at: new Date().toISOString(),
          company_id: 'mock-company',
          created_at: new Date().toISOString(),
        },
        {
          id: 'mock-event-2',
          name: 'Another Event',
          status: 'completed',
          scheduled_at: new Date(Date.now() - 86400000).toISOString(),
          company_id: 'mock-company',
          created_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ];
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: Database['public']['Tables']['events']['Insert']) => {
      // Mock successful creation for development
      console.warn('Creating event (mock):', eventData);
      return {
        id: `mock-event-${Date.now()}`,
        ...eventData,
        company_id: 'mock-company',
        created_at: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async (
      eventData: Database['public']['Tables']['events']['Update'] & { id: string },
    ) => {
      // Mock successful update for development
      console.warn('Updating event (mock):', eventData);
      return eventData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      // Mock successful deletion for development
      console.warn('Deleting event (mock):', eventId);
      return eventId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const realtimeState = useRealtimeSync({
    channelConfig: {
      name: companyId ? `company:${companyId}:events` : 'events',
      postgresChanges: companyId
        ? [
            {
              event: '*',
              schema: 'public',
              table: 'events',
            },
          ]
        : [],
    },
    queryKeysToInvalidate: [['events']],
    enablePollingOnDisconnect: true,
  });

  return {
    ...eventsQuery,
    createEvent: createEventMutation.mutateAsync,
    updateEvent: updateEventMutation.mutateAsync,
    deleteEvent: deleteEventMutation.mutateAsync,
    isCreating: createEventMutation.isPending,
    isUpdating: updateEventMutation.isPending,
    isDeleting: deleteEventMutation.isPending,
    realtimeState,
  };
}
