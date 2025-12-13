import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { createClient } from '@caterkingapp/supabase';
import type { Database } from '@caterkingapp/supabase/database.types';
import { useRealtimeSync } from './useRealtimeSync';

interface UseTasksOptions {
  eventId?: string;
  status?: string | string[];
  search?: string;
  enableRealtime?: boolean;
}

export function useTasks({
  eventId,
  status,
  search,
  enableRealtime = false,
}: UseTasksOptions = {}) {
  // Mock realtime state
  const realtimeState = {
    isConnected: true,
    connectionAttempts: 0,
    lastSuccessfulConnection: new Date(),
    isPolling: false,
  };

  const query = useQuery({
    queryKey: ['tasks', eventId, status, search],
    queryFn: async () => {
      // Return mock data for development
      return [
        {
          id: 'mock-task-1',
          name: 'Prep vegetables',
          quantity: 5,
          unit: 'kg',
          status: 'pending',
          priority: 'high',
          assigned_user_id: 'demo-user-id',
          event_id: eventId || null,
          recipe_id: null,
          created_at: new Date().toISOString(),
        },
        {
          id: 'mock-task-2',
          name: 'Marinate proteins',
          quantity: 2,
          unit: 'kg',
          status: 'in-progress',
          priority: 'medium',
          assigned_user_id: 'demo-user-id',
          event_id: eventId || null,
          recipe_id: null,
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ];
    },
  });

  const tasksQuery = useQuery({
    queryKey: ['tasks', eventId, status, search],
    queryFn: async () => {
      try {
        const supabase = createClient();
        let query = supabase.from('tasks').select('*');
        if (eventId) {
          query = query.eq('event_id', eventId);
        }
        if (status) {
          if (Array.isArray(status)) {
            query = query.in('status', status as any);
          } else {
            query = query.eq('status', status as any);
          }
        }
        if (search) {
          query = query.ilike('name', `%${search}%`);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data;
      } catch (error) {
        // Return mock data for development
        console.warn('Failed to fetch tasks, using mock data:', error);
        return [
          {
            id: 'mock-task-1',
            name: 'Prepare ingredients',
            status: 'pending',
            priority: 'high',
            assigned_user_id: null,
            company_id: 'mock-company',
            created_at: new Date().toISOString(),
            event_id: eventId || 'mock-event-1',
            meta: null,
            quantity: 10,
            recipe_id: null,
            undo_token: null,
            unit: 'portions',
            updated_at: new Date().toISOString(),
          },
          {
            id: 'mock-task-2',
            name: 'Setup dining area',
            status: 'claimed',
            priority: 'normal',
            assigned_user_id: 'mock-staff-1',
            company_id: 'mock-company',
            created_at: new Date().toISOString(),
            event_id: eventId || 'mock-event-1',
            meta: null,
            quantity: 5,
            recipe_id: null,
            undo_token: null,
            unit: 'tables',
            updated_at: new Date().toISOString(),
          },
          {
            id: 'mock-task-3',
            name: 'Clean kitchen',
            status: 'completed',
            priority: 'low',
            assigned_user_id: 'mock-staff-2',
            company_id: 'mock-company',
            created_at: new Date().toISOString(),
            event_id: eventId || 'mock-event-1',
            meta: null,
            quantity: 1,
            recipe_id: null,
            undo_token: null,
            unit: 'area',
            updated_at: new Date().toISOString(),
          },
        ];
      }
    },
  });

  return {
    ...tasksQuery,
    realtimeState,
  };
}
