import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { createClient } from '@caterkingapp/supabase/client';
import { useRealtimeSync } from './useRealtimeSync';

interface Event {
  id: string;
  name: string;
  date: string;
  location: string;
  status?: string;
  scheduled_at?: string;
  company_id?: string;
}

export function useEvents() {
  const queryClient = useQueryClient();
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanyId = async () => {
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
    };
    fetchCompanyId();
  }, []);

  const eventsQuery = useQuery({
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
        .in('status', ['published', 'completed', 'planned', 'active'])
        .order('scheduled_at', { ascending: false });

      if (error) throw error;

      return events || [];
    },
  });

  const createEventMutation = useMutation({
    mutationFn: async (eventData: Omit<Event, 'id'>) => {
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
        .from('events')
        .insert({
          ...eventData,
          company_id: userData.company_id,
          scheduled_at: eventData.date || eventData.scheduled_at,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: async (eventData: Event) => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from('events')
        .update({
          ...eventData,
          scheduled_at: eventData.date || eventData.scheduled_at,
        })
        .eq('id', eventData.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const supabase = createClient();

      const { error } = await supabase.from('events').delete().eq('id', eventId);

      if (error) throw error;
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
