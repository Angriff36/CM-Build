'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@codemachine/supabase';

interface Task {
  id: string;
  name: string;
  quantity: number;
  unit: string | null;
  status: 'available' | 'claimed' | 'in_progress' | 'completed';
  priority: 'low' | 'normal' | 'high' | 'urgent' | null;
  assigned_user_id: string | null;
  event_id: string | null;
  recipe_id: string | null;
  created_at: string;
  updated_at: string;
  assigned_user?: {
    id: string;
    display_name: string | null;
    avatar_url?: string | null;
  } | null;
  event?: { 
    id: string;
    name: string;
    scheduled_at?: string;
  } | null; 
  recipe?: { 
    id: string;
    name: string;
  } | null; 
}

interface TaskFilters {
  status?: Task['status'][];
  priority?: Task['priority'][];
  assigned_user_id?: string;
  event_id?: string;
  search?: string;
}

// Optimistic update type for tracking pending operations
interface OptimisticUpdate {
  taskId: string;
  previousStatus: string;
  newStatus: string;
  timestamp: number;
  retryCount: number;
}

export function useTasks(filters: TaskFilters = {}) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [optimisticUpdates, setOptimisticUpdates] = useState<Map<string, OptimisticUpdate>>(new Map());
  const supabase = createClient();

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('tasks')
        .select(`
          id,
          name,
          quantity,
          unit,
          status,
          priority,
          assigned_user_id,
          event_id,
          recipe_id,
          created_at,
          updated_at,
          assigned_user:assigned_user_id (id, display_name),
          event (id, name),
          recipe (id, name)
        `);

      if (filters.status && filters.status.length > 0) {
        query = query.in('status', filters.status as Task['status'][]);
      }
      if (filters.priority && filters.priority.length > 0) {
        query = query.in('priority', filters.priority as Task['priority'][]);
      }
      if (filters.assigned_user_id) {
        query = query.eq('assigned_user_id', filters.assigned_user_id);
      }
      if (filters.event_id) {
        query = query.eq('event_id', filters.event_id);
      }
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setTasks(data as unknown as Task[]);
    } catch (err: any) {
      setError(err.message);
      console.error("Supabase error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [JSON.stringify(filters)]);

  const claimTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'claimed', assigned_user_id: 'alice' })
        .eq('id', taskId);

      if (error) {
        throw error;
      }

      fetchTasks(); // Refresh tasks after update
    } catch (err: any) {
      setError(err.message);
      console.error("Supabase error:", err);
    }
  };

  const startTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'in_progress' })
        .eq('id', taskId);

      if (error) {
        throw error;
      }

      fetchTasks();
    } catch (err: any) {
      setError(err.message);
      console.error("Supabase error:", err);
    }
  };

  const completeTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ status: 'completed' })
        .eq('id', taskId);

      if (error) {
        throw error;
      }

      fetchTasks();
    } catch (err: any) {
      setError(err.message);
      console.error("Supabase error:", err);
    }
  };

  const refetch = () => {
    fetchTasks();
  };

  return {
    tasks,
    loading,
    error,
    refetch,
    claimTask,
    startTask,
    completeTask,
  };
}
