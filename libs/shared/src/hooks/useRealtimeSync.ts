import { useEffect, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@caterkingapp/supabase/client';
import {
  createRealtimeChannel,
  subscribeToChannel,
  unsubscribeFromChannel,
  ChannelConfig,
} from '../utils/realtimeSubscriptions';

declare global {
  interface Window {
    analytics?: {
      track: (event: string, properties: Record<string, unknown>) => void;
    };
  }
}

export interface UseRealtimeSyncOptions {
  channelConfig: ChannelConfig;
  queryKeysToInvalidate?: string[][];
  onPostgresChange?: () => void;
  onBroadcast?: (payload: unknown) => void;
  enablePollingOnDisconnect?: boolean;
  pollingInterval?: number;
  onConnectionStatusChange?: (connected: boolean) => void;
}

export interface RealtimeSyncState {
  isConnected: boolean;
  connectionAttempts: number;
  lastSuccessfulConnection: Date | null;
  isPolling: boolean;
}

export function useRealtimeSync({
  channelConfig,
  queryKeysToInvalidate = [],
  onPostgresChange,
  onBroadcast,
  enablePollingOnDisconnect = true,
  pollingInterval = 30000,
  onConnectionStatusChange,
}: UseRealtimeSyncOptions) {
  const queryClient = useQueryClient();
  const supabase = createClient();

  const [state, setState] = useState<RealtimeSyncState>({
    isConnected: false,
    connectionAttempts: 0,
    lastSuccessfulConnection: null,
    isPolling: false,
  });

  const handlePostgresChange = useCallback(() => {
    // Invalidate specified query keys
    queryKeysToInvalidate.forEach((queryKey) => {
      queryClient.invalidateQueries({ queryKey });
    });
    // Call custom handler if provided
    onPostgresChange?.();
  }, [queryClient, queryKeysToInvalidate, onPostgresChange]);

  const handleBroadcast = useCallback(
    (payload: unknown) => {
      // Call custom handler if provided
      onBroadcast?.(payload);
    },
    [onBroadcast],
  );

  const handleConnectionStatus = useCallback(
    (status: string, err?: unknown) => {
      const isConnected = status === 'SUBSCRIBED';
      setState((prev) => ({
        ...prev,
        isConnected,
        connectionAttempts: isConnected ? 0 : prev.connectionAttempts + 1,
        lastSuccessfulConnection: isConnected ? new Date() : prev.lastSuccessfulConnection,
      }));
      onConnectionStatusChange?.(isConnected);

      // Track telemetry
      if (typeof window !== 'undefined' && window.analytics) {
        window.analytics.track('realtime_connection_status', {
          channel: channelConfig.name,
          status,
          error: err?.message,
          attempts: state.connectionAttempts + 1,
        });
      }
    },
    [channelConfig.name, onConnectionStatusChange, state.connectionAttempts],
  );

  useEffect(() => {
    const channel = createRealtimeChannel(
      supabase,
      channelConfig,
      handlePostgresChange,
      handleBroadcast,
    );

    subscribeToChannel(channel, handleConnectionStatus);

    // Track channel subscription
    if (typeof window !== 'undefined' && window.analytics) {
      window.analytics.track('realtime_channel_subscribed', {
        channel: channelConfig.name,
        postgresChanges: channelConfig.postgresChanges?.length || 0,
        broadcasts: channelConfig.broadcasts?.length || 0,
      });
    }

    return () => {
      unsubscribeFromChannel(supabase, channel);
    };
  }, [supabase, channelConfig, handlePostgresChange, handleBroadcast, handleConnectionStatus]);

  // Fallback polling when disconnected
  useEffect(() => {
    if (!enablePollingOnDisconnect || state.isConnected) {
      setState((prev) => ({ ...prev, isPolling: false }));
      return;
    }

    setState((prev) => ({ ...prev, isPolling: true }));

    const interval = setInterval(() => {
      queryKeysToInvalidate.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
    }, pollingInterval);

    return () => clearInterval(interval);
  }, [
    state.isConnected,
    enablePollingOnDisconnect,
    pollingInterval,
    queryClient,
    queryKeysToInvalidate,
  ]);

  return state;
}
