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

  const realtimeState = useRealtimeSync({
    channelConfig: {
      name: 'display-updates',
      postgresChanges: [
        {
          event: '*',
          schema: 'public',
          table: 'tasks',
        },
      ],
    },
    queryKeysToInvalidate: [],
  });

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
