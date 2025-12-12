import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@caterkingapp/supabase';
import { useRealtimeSync } from '@caterkingapp/shared/hooks/useRealtimeSync';

interface DisplaySummaryResponse {
  cards: Array<{
    type: string;
    count: number;
    urgent: boolean;
    event_id?: string;
    station_id?: string;
    avg_duration_ms?: number;
  }>;
  assignments: Array<{
    task_id: string;
    user_display_name: string;
    status: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    created_at?: string;
  }>;
  captured_at: string;
  staleness_ms: number;
  realtime_channel: string;
}

interface UseDisplayDataOptions {
  event_scope?: string;
  station_scope?: string;
  agg?: 'hourly' | 'live';
  since?: string;
}

export function useDisplayData(options: UseDisplayDataOptions = {}) {
  const queryClient = useQueryClient();
  const supabase = createClient();
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(true);
  const [offlineBanner, setOfflineBanner] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [lastSuccessfulFetch, setLastSuccessfulFetch] = useState<Date | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  useEffect(() => {
    const getCompanyId = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCompanyId(user?.user_metadata?.company_id || null);
    };
    getCompanyId();
  }, []);

  const query = useQuery({
    queryKey: ['display-summary', options],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (options.event_scope) params.append('event_scope', options.event_scope);
      if (options.station_scope) params.append('station_scope', options.station_scope);
      if (options.agg) params.append('agg', options.agg);
      if (options.since) params.append('since', options.since);

      try {
        const response = await fetch(`/api/display/summary?${params}`, {
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch display summary: ${response.status} ${response.statusText}`,
          );
        }

        const data = await response.json();
        const summaryData = data.data as DisplaySummaryResponse;

        // Update connection status on successful fetch
        setLastSuccessfulFetch(new Date());
        setConnectionAttempts(0);

        return summaryData;
      } catch (error) {
        setConnectionAttempts((prev) => prev + 1);
        throw error;
      }
    },
    refetchInterval: useCallback(() => {
      // If realtime is connected, don't poll
      if (isRealtimeConnected) return false;

      // If we've had multiple failed attempts, poll more frequently
      if (connectionAttempts > 3) return 10000; // 10 seconds

      // Default polling when realtime is disconnected
      return 30000; // 30 seconds
    }, [isRealtimeConnected, connectionAttempts]),
    staleTime: 15000, // Consider data stale after 15s
    retry: (failureCount, error) => {
      // Retry up to 3 times for network errors, but not for 4xx errors
      if (error instanceof Error && error.message.includes('4')) return false;
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const realtimeState =
    query.data?.realtime_channel && companyId
      ? useRealtimeSync({
          channelConfig: {
            name: `company:${companyId}:display_summary`,
            broadcasts: [{ event: 'summary_update', self: true }, { event: 'connection_status' }],
          },
          queryKeysToInvalidate: [],
          onBroadcast: (payload: any) => {
            if (payload.event === 'summary_update') {
              queryClient.setQueryData(['display-summary', options], payload.data);
              setIsRealtimeConnected(true);
              setOfflineBanner(false);
              setConnectionAttempts(0);
            } else if (payload.event === 'connection_status' && payload.status === 'connected') {
              setIsRealtimeConnected(true);
              setOfflineBanner(false);
            }
          },
          onConnectionStatusChange: (connected: boolean) => {
            setIsRealtimeConnected(connected);
            setOfflineBanner(!connected);
            if (connected) {
              setConnectionAttempts(0);
            } else {
              setConnectionAttempts((prev) => prev + 1);
            }
          },
          enablePollingOnDisconnect: true,
        })
      : {
          isConnected: false,
          connectionAttempts: 0,
          lastSuccessfulConnection: null,
          isPolling: false,
        };

  // Manual refresh function
  const refresh = useCallback(() => {
    return query.refetch();
  }, [query]);

  // Check if data is stale based on staleness_ms from API
  const isDataStale = query.data ? query.data.staleness_ms > 60000 : false;

  return {
    ...query,
    isRealtimeConnected,
    offlineBanner,
    isDataStale,
    connectionAttempts,
    lastSuccessfulFetch,
    refresh,
  };
}
