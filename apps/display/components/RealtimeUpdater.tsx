'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@caterkingapp/supabase';
import { useRealtimeSync } from '@caterkingapp/shared/hooks/useRealtimeSync';

interface RealtimeUpdaterProps {
  onDataUpdate: (data: any) => void;
}

export function RealtimeUpdater({ onDataUpdate }: RealtimeUpdaterProps) {
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('connecting');
  const [retryCount, setRetryCount] = useState(0);

  const fetchFreshData = async () => {
    try {
      const response = await fetch('/api/display/summary?agg=live');
      if (response.ok) {
        const data = await response.json();
        onDataUpdate(data);
      }
    } catch (error) {
      console.error('Failed to fetch fresh data:', error);
    }
  };

  useEffect(() => {
    // Fallback polling when realtime is disconnected
    if (!realtimeState.isConnected) {
      const pollingInterval = setInterval(fetchFreshData, 15000);
      return () => clearInterval(pollingInterval);
    }
  }, [realtimeState.isConnected, onDataUpdate]);

  // Update connection status from realtime state
  useEffect(() => {
    setConnectionStatus(realtimeState.isConnected ? 'connected' : 'disconnected');
  }, [realtimeState.isConnected]);

  // Connection status indicator (hidden in production but useful for debugging)
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed top-0 right-0 p-2 text-xs bg-black text-white z-50">
        Realtime: {connectionStatus} {retryCount > 0 && `(Retries: ${retryCount})`}
      </div>
    );
  }

  return null;
}

export function RealtimeUpdater({ onDataUpdate }: RealtimeUpdaterProps) {
  const [connectionStatus, setConnectionStatus] = useState<
    'connecting' | 'connected' | 'disconnected'
  >('connecting');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // Initialize Supabase client for realtime updates
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase credentials not found, falling back to polling');
      setConnectionStatus('disconnected');
      startPollingFallback();
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Subscribe to realtime changes
    const channel = supabase
      .channel('display-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
        (payload) => {
          console.log('Realtime update received:', payload);
          // Fetch fresh data when changes occur
          fetchFreshData();
        },
      )
      .subscribe((status) => {
        console.log('Subscription status:', status);
        if (status === 'SUBSCRIBED') {
          setConnectionStatus('connected');
          setRetryCount(0);
        } else {
          setConnectionStatus('disconnected');
        }
      });

    // Fallback polling for when realtime is unavailable
    const pollingInterval = setInterval(() => {
      if (connectionStatus === 'disconnected') {
        fetchFreshData();
      }
    }, 15000); // 15 second polling as fallback

    const fetchFreshData = async () => {
      try {
        const response = await fetch('/api/display/summary?agg=live');
        if (response.ok) {
          const data = await response.json();
          onDataUpdate(data);
        }
      } catch (error) {
        console.error('Failed to fetch fresh data:', error);
      }
    };

    const startPollingFallback = () => {
      const fallbackInterval = setInterval(fetchFreshData, 15000);
      return () => clearInterval(fallbackInterval);
    };

    // Cleanup
    return () => {
      channel.unsubscribe();
      clearInterval(pollingInterval);
    };
  }, [connectionStatus, onDataUpdate]);

  // Connection status indicator (hidden in production but useful for debugging)
  if (process.env.NODE_ENV === 'development') {
    return (
      <div className="fixed top-0 right-0 p-2 text-xs bg-black text-white z-50">
        Realtime: {connectionStatus} {retryCount > 0 && `(Retries: ${retryCount})`}
      </div>
    );
  }

  return null;
}
